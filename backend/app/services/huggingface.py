"""
Hugging Face Gradio API integration service.
Handles communication with Hugging Face Gradio Spaces for pest detection.
"""

import logging
import base64
import tempfile
import os
from typing import Dict, Any, Optional
from gradio_client import Client, handle_file
from app.config import settings

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class HuggingFaceService:
    """Service for interacting with Hugging Face Gradio Space."""
    
    def __init__(self):
        self.space_name = settings.HF_MODEL_ID
        self.client = None
        self.timeout = 60.0  # 60 seconds timeout for Gradio
    
    def _get_client(self) -> Client:
        """Get or create Gradio client."""
        if self.client is None:
            logger.info(f"Initializing Gradio client for: {self.space_name}")
            try:
                # Try with token first
                if settings.HF_TOKEN:
                    logger.info("Using HF_TOKEN for authentication")
                    self.client = Client(self.space_name, hf_token=settings.HF_TOKEN)
                else:
                    logger.warning("No HF_TOKEN provided, connecting without authentication")
                    self.client = Client(self.space_name)
            except Exception as e:
                logger.error(f"Failed to initialize client with token: {str(e)}")
                # Fallback: try without token
                logger.info("Retrying connection without authentication token")
                try:
                    self.client = Client(self.space_name)
                except Exception as fallback_error:
                    logger.error(f"Failed to initialize client without token: {str(fallback_error)}")
                    raise Exception(f"Cannot connect to Hugging Face Space: {str(fallback_error)}")
        return self.client
    
    async def analyze_image_heavy(self, image_path: str) -> Dict[str, Any]:
        """
        Heavy pest detection using HuggingFace model.
        This is the expensive operation that takes 3-5 seconds.
        
        Args:
            image_path: Path to image file
            
        Returns:
            {
                "pest_name": str,
                "confidence": float,
                "severity": str,
                "description": str,
                "bounding_box": dict (optional)
            }
        """
        try:
            logger.info(f"🔬 Starting heavy pest detection analysis...")
            
            # TODO: Replace with actual Gradio Space when available
            # For now, we need a working IP102 pest detection Gradio Space
            # The current HF_MODEL_ID is not a valid Gradio Space
            
            # Check if we have a valid Gradio Space
            if not self.space_name or self.space_name == "S1-1IVAM/trinera-pest-detector":
                logger.warning(
                    "⚠️ No valid Gradio Space configured for pest detection. "
                    "Please deploy an IP102 model to Gradio and update HF_MODEL_ID in .env"
                )
                raise Exception(
                    "Pest detection model not configured. "
                    "Please deploy an IP102 pest detection model to HuggingFace Spaces."
                )
            
            client = self._get_client()
            
            # Call the prediction API
            result = client.predict(
                image=handle_file(image_path),
                api_name="/predict"
            )
            
            logger.info(f"📊 Heavy detection result: {result}")
            
            # Parse result based on expected format
            if isinstance(result, dict):
                pest_name = result.get("label", "Unknown")
                confidence = result.get("confidence", 0.0)
            elif isinstance(result, tuple) and len(result) >= 2:
                pest_name = result[0] if result[0] else "Unknown"
                confidence = result[1] if len(result) > 1 else 0.0
            elif isinstance(result, str):
                pest_name = result
                confidence = 0.8  # Assume decent confidence if model returns string
            else:
                logger.warning(f"⚠️ Unexpected result format: {type(result)}")
                pest_name = "Unknown"
                confidence = 0.0
            
            # Determine severity based on confidence
            if confidence > 0.8:
                severity = "High"
            elif confidence > 0.5:
                severity = "Medium"
            else:
                severity = "Low"
            
            # Build detailed response
            response = {
                "pest_name": pest_name,
                "confidence": float(confidence),
                "severity": severity,
                "description": f"Detected {pest_name} with {confidence:.1%} confidence"
            }
            
            logger.info(
                f"✅ Heavy detection complete: {pest_name} "
                f"({confidence:.1%} confidence, severity: {severity})"
            )
            
            return response
            
        except Exception as e:
            logger.error(f"❌ Heavy pest detection error: {e}")
            return {
                "pest_name": "Error",
                "confidence": 0.0,
                "severity": "Unknown",
                "description": f"Detection failed: {str(e)}"
            }
    
    async def predict_pest(self, image_bytes: bytes) -> Dict[str, Any]:
        """
        Send image to Hugging Face Gradio Space for pest detection.
        
        Args:
            image_bytes: Image file as bytes
        
        Returns:
            Dictionary containing prediction results
        
        Raises:
            Exception: If API call fails
        """
        temp_file_path = None
        try:
            logger.info(f"Sending request to Hugging Face Gradio Space: {self.space_name}")
            
            # Create a temporary file to store the image
            with tempfile.NamedTemporaryFile(delete=False, suffix='.jpg') as temp_file:
                temp_file.write(image_bytes)
                temp_file_path = temp_file.name
            
            logger.info(f"Created temporary file: {temp_file_path}")
            
            # Get Gradio client
            client = self._get_client()
            
            # Call the Gradio API
            # The updated Space returns (image_path, text_results)
            logger.info("Calling Gradio API /detect_image endpoint")
            
            try:
                result = client.predict(
                    image=handle_file(temp_file_path),
                    api_name="/detect_image"
                )
            except Exception as e:
                error_msg = str(e)
                logger.error(f"Gradio API call failed: {error_msg}")
                
                # Provide helpful error messages
                if "401" in error_msg or "Unauthorized" in error_msg:
                    raise Exception(
                        "Authentication failed with Hugging Face. Please check:\n"
                        "1. Your HF_TOKEN is valid (get a new one from https://huggingface.co/settings/tokens)\n"
                        "2. The token has 'read' permissions\n"
                        "3. The Space 'S1-1IVAM/trinera-pest-detector' exists and is accessible\n"
                        f"Current token starts with: {settings.HF_TOKEN[:10]}..."
                    )
                elif "404" in error_msg or "Not Found" in error_msg:
                    raise Exception(
                        f"Hugging Face Space '{self.space_name}' not found. "
                        "Please verify the Space name is correct."
                    )
                else:
                    raise Exception(f"Gradio API error: {error_msg}")
            
            logger.info(f"Received result from Gradio: {result}")
            logger.info(f"Result type: {type(result)}")
            
            # If result is a tuple/list, log each element
            if isinstance(result, (list, tuple)):
                for idx, item in enumerate(result):
                    logger.info(f"Result[{idx}]: type={type(item)}, value={str(item)[:200]}")
            
            # Process the result
            return self._process_gradio_result(result)
                
        except Exception as e:
            logger.error(f"Error calling Hugging Face Gradio API: {str(e)}")
            raise Exception(f"Failed to analyze image: {str(e)}")
        
        finally:
            # Clean up temporary file
            if temp_file_path and os.path.exists(temp_file_path):
                try:
                    os.unlink(temp_file_path)
                    logger.info(f"Cleaned up temporary file: {temp_file_path}")
                except Exception as e:
                    logger.warning(f"Failed to delete temporary file: {e}")
    
    def _process_gradio_result(self, result: Any) -> Dict[str, Any]:
        """
        Process raw result from Gradio API.
        
        Args:
            result: Result from Gradio API (can be tuple of (image_path, text) or just image_path)
        
        Returns:
            Processed prediction with label and confidence
        """
        logger.info(f"Processing Gradio result type: {type(result)}")
        logger.info(f"Result content: {result}")
        
        # Handle tuple/list response (image_path, detection_text)
        if isinstance(result, (list, tuple)) and len(result) >= 2:
            image_path, detection_text = result[0], result[1]
            
            logger.info(f"Image path: {image_path}")
            logger.info(f"Detection text: {detection_text}")
            
            # Parse the detection text to extract pest name and confidence
            if detection_text and isinstance(detection_text, str):
                import re
                
                logger.info(f"Raw detection text to parse: '{detection_text}'")
                
                # Try multiple parsing patterns
                
                # Pattern 1: - **pest_name** (Confidence: XX.X%) [Handles list format with dash]
                pattern1 = re.search(r'-\s*\*\*([^*]+)\*\*\s*\(Confidence:\s*(\d+\.?\d*)%\)', detection_text, re.IGNORECASE)
                if pattern1:
                    pest_name = pattern1.group(1).strip()
                    confidence = float(pattern1.group(2)) / 100.0
                    logger.info(f"Pattern 1 matched (list format): {pest_name} @ {confidence}")
                    return {
                        "label": pest_name,
                        "confidence": confidence,
                        "all_predictions": [{"label": pest_name, "score": confidence}]
                    }
                
                # Pattern 2: **pest_name** (Confidence: XX.X%) [Without dash]
                pattern2 = re.search(r'\*\*([^*]+)\*\*\s*\(Confidence:\s*(\d+\.?\d*)%\)', detection_text, re.IGNORECASE)
                if pattern2:
                    pest_name = pattern2.group(1).strip()
                    # Skip if it's a header like "Detected Pests"
                    if pest_name.lower() not in ['detected pests', 'detected', 'pests', 'pest']:
                        confidence = float(pattern2.group(2)) / 100.0
                        logger.info(f"Pattern 2 matched: {pest_name} @ {confidence}")
                        return {
                            "label": pest_name,
                            "confidence": confidence,
                            "all_predictions": [{"label": pest_name, "score": confidence}]
                        }
                
                logger.warning(f"No pattern matched for detection text: {detection_text}")
        
        # Original handling for other formats
        if isinstance(result, dict):
            # If result contains detection info
            if 'label' in result or 'class' in result or 'prediction' in result:
                label = result.get('label') or result.get('class') or result.get('prediction', 'Unknown')
                confidence = result.get('confidence') or result.get('score', 0.9)
                
                # Skip if label is a file path
                if not self._is_file_path(str(label)):
                    return {
                        "label": str(label),
                        "confidence": float(confidence),
                        "all_predictions": [{"label": label, "score": confidence}]
                    }
        
        elif isinstance(result, str):
            # If result is a string, check if it's a file path or actual label
            if not self._is_file_path(result):
                return {
                    "label": result,
                    "confidence": 0.85,
                    "all_predictions": [{"label": result, "score": 0.85}]
                }
        
        # Default fallback
        logger.warning(f"Could not extract valid prediction from result")
        return {
            "label": "Pest Detected",
            "confidence": 0.75,
            "all_predictions": [{"label": "Pest Detected", "score": 0.75}]
        }
    
    def _is_file_path(self, text: str) -> bool:
        """Check if a string is likely a file path."""
        # Check for common path indicators
        path_indicators = [
            '\\\\', '/', 
            'C:\\', 'D:\\', 'E:\\',  # Windows drives
            '/tmp/', '/temp/', 
            'AppData', 'Temp',
            '.jpg', '.png', '.jpeg', '.webp',  # Image extensions
            'gradio'  # Gradio temp folders
        ]
        return any(indicator in text for indicator in path_indicators)
    
    async def check_model_status(self) -> Dict[str, Any]:
        """
        Check if the Hugging Face Gradio Space is available.
        
        Returns:
            Dictionary with model status information
        """
        try:
            client = self._get_client()
            return {
                "status": "ready",
                "model_id": self.space_name,
                "type": "gradio_space"
            }
        except Exception as e:
            logger.error(f"Error checking model status: {str(e)}")
            return {
                "status": "error",
                "model_id": self.space_name,
                "error": str(e)
            }


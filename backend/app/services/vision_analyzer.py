"""
Vision Analyzer Service
Lightweight vision analysis to determine if frame needs heavy pest detection.
Uses free HuggingFace inference API for quick object detection.
"""

import logging
from typing import Dict, Optional, List
import httpx
from app.config import settings

logger = logging.getLogger(__name__)


class VisionAnalyzer:
    """
    Lightweight vision analysis to determine if frame needs heavy pest detection.
    Uses free HuggingFace inference API for quick object detection.
    """
    
    def __init__(self):
        # Using a more reliable vision model for the free inference API
        # ViT (Vision Transformer) is better supported than DETR on the free tier
        self.quick_model = "google/vit-base-patch16-224"
        self.api_url = f"https://api-inference.huggingface.co/models/{self.quick_model}"
        
        # Get HF token from config
        hf_token = getattr(settings, 'HF_TOKEN', None) or getattr(settings, 'HUGGINGFACE_TOKEN', None)
        self.headers = {"Authorization": f"Bearer {hf_token}"} if hf_token else {}
        
        # Relevant objects that might indicate pest presence
        self.relevant_objects = {
            "plant", "leaf", "flower", "insect", "bug", 
            "beetle", "caterpillar", "aphid", "crop",
            "tree", "grass", "vegetation", "agriculture",
            "corn", "wheat", "rice", "potato", "tomato"
        }
        
        logger.info(f"🔍 Vision Analyzer initialized with model: {self.quick_model}")
        if not hf_token:
            logger.warning("⚠️ No HuggingFace token found - API may be rate limited")
    
    async def quick_analyze(self, image_bytes: bytes) -> Dict:
        """
        Quick analysis to detect if frame contains relevant objects.
        
        FOR NOW: Using fallback analysis since free HF inference API has issues.
        TODO: Replace with proper vision model once we have a working setup.
        
        Returns:
            {
                "has_relevant_content": bool,
                "objects_detected": list,
                "confidence": float,
                "description": str
            }
        """
        try:
            logger.info(f"🔍 Starting quick vision analysis (image size: {len(image_bytes)} bytes)")
            
            # TEMPORARY: Skip API call and use fallback directly
            # The HF Inference API has compatibility issues with free tier
            logger.info("⚡ Using direct fallback analysis (HF API disabled temporarily)")
            return self._fallback_analysis(image_bytes)
            
            # TODO: Re-enable once we have a working vision model
            # Prepare headers with content type for binary data
            request_headers = self.headers.copy()
            request_headers["Content-Type"] = "application/octet-stream"
            
            # Call HuggingFace API for quick object detection
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    self.api_url,
                    headers=request_headers,
                    content=image_bytes,  # Send as raw binary content
                    timeout=10.0  # Increased timeout
                )
            
            if response.status_code == 503:
                # Model is loading, use fallback
                logger.warning(f"⚠️ Model is loading (503), using fallback")
                return self._fallback_analysis(image_bytes)
            
            if response.status_code != 200:
                error_text = response.text[:500] if response.text else "No error message"
                logger.warning(f"⚠️ Quick vision API returned {response.status_code}: {error_text}")
                return self._fallback_analysis(image_bytes)
            
            results = response.json()
            logger.info(f"📊 API Response Type: {type(results)}, Length: {len(results) if isinstance(results, list) else 'N/A'}")
            if isinstance(results, list) and len(results) > 0:
                logger.info(f"📊 First result sample: {results[0]}")
            
            # Parse results
            detected_objects = []
            max_confidence = 0.0
            
            if isinstance(results, list):
                for item in results:
                    # Safely get label and convert to lowercase
                    label = item.get("label", "") if item.get("label") else ""
                    if label and isinstance(label, str):
                        label = label.lower()
                    else:
                        continue  # Skip items without valid labels
                    
                    score = item.get("score", 0.0)
                    
                    if score > 0.1:  # Lower threshold for classification models
                        detected_objects.append({
                            "label": label,
                            "confidence": score
                        })
                        max_confidence = max(max_confidence, score)
            
            # Check if any relevant objects detected
            has_relevant = any(
                any(rel in obj["label"] for rel in self.relevant_objects)
                for obj in detected_objects
            ) if detected_objects else False
            
            # Build description
            if has_relevant and detected_objects:
                labels = [obj["label"] for obj in detected_objects[:3]]
                description = f"Detected: {', '.join(labels)}"
            elif detected_objects:
                description = f"Scene detected: {detected_objects[0]['label']}"
            else:
                description = "No relevant agricultural objects detected"
            
            result = {
                "has_relevant_content": has_relevant,
                "objects_detected": detected_objects,
                "confidence": max_confidence,
                "description": description
            }
            
            logger.info(
                f"✅ Quick analysis complete: {description} "
                f"(relevant: {has_relevant}, confidence: {max_confidence:.2f})"
            )
            
            return result
            
        except httpx.TimeoutException:
            logger.warning("⏱️ Quick vision analysis timed out - using fallback")
            return self._fallback_analysis(image_bytes)
        except Exception as e:
            logger.error(f"❌ Quick vision analysis error: {e}")
            return self._fallback_analysis(image_bytes)
    
    def _fallback_analysis(self, image_bytes: bytes) -> Dict:
        """Fallback to basic image analysis if API fails"""
        try:
            from PIL import Image
            import io
            
            image = Image.open(io.BytesIO(image_bytes))
            
            logger.info(f"📸 Using fallback analysis (image: {image.width}x{image.height})")
            
            return {
                "has_relevant_content": True,  # Assume relevant to be safe
                "objects_detected": [],
                "confidence": 0.5,
                "description": f"Image captured ({image.width}x{image.height})"
            }
        except Exception as e:
            logger.error(f"❌ Fallback analysis error: {e}")
            return {
                "has_relevant_content": False,
                "objects_detected": [],
                "confidence": 0.0,
                "description": "Unable to analyze image"
            }
    
    def match_intent(
        self, 
        user_query: str, 
        vision_result: Dict
    ) -> Dict:
        """
        Determine if user's voice query matches what's in the frame.
        Returns decision on whether to call heavy pest detection model.
        
        Args:
            user_query: User's spoken question
            vision_result: Result from quick_analyze()
        
        Returns:
            {
                "should_call_heavy_model": bool,
                "match_score": float,
                "reason": str,
                "is_pest_query": bool,
                "has_visual_content": bool
            }
        """
        query_lower = user_query.lower()
        
        # Pest detection keywords (English & Hindi)
        pest_keywords = [
            # English
            "pest", "bug", "insect", "what is this", "identify", "this is",
            "attacking", "eating", "damage", "problem", "disease",
            "what pest", "which pest", "name this", "tell me about",
            "aphid", "whitefly", "beetle", "caterpillar", "worm",
            # Hindi
            "कीट", "रोग", "समस्या", "यह क्या है", "पहचान"
        ]
        
        # Check if user is asking about pests
        is_pest_query = any(keyword in query_lower for keyword in pest_keywords)
        
        # Check if frame has relevant content
        has_content = vision_result.get("has_relevant_content", False)
        confidence = vision_result.get("confidence", 0.0)
        
        # Decision logic
        should_detect = is_pest_query and has_content
        
        # Calculate match score
        match_score = 0.0
        if is_pest_query:
            match_score += 0.5
        if has_content:
            match_score += 0.3
        if confidence > 0.5:
            match_score += 0.2
        
        # Determine reason
        reason = ""
        if should_detect:
            reason = "Pest-related query with relevant objects detected"
        elif is_pest_query and not has_content:
            reason = "Pest query but no relevant objects in frame"
        elif not is_pest_query and has_content:
            reason = "General question, skipping heavy detection"
        else:
            reason = "No pest query and no relevant content"
        
        result = {
            "should_call_heavy_model": should_detect,
            "match_score": match_score,
            "reason": reason,
            "is_pest_query": is_pest_query,
            "has_visual_content": has_content
        }
        
        logger.info(
            f"🎯 Intent match: {should_detect} "
            f"(score: {match_score:.1%}, reason: {reason})"
        )
        
        return result


# Singleton instance
vision_analyzer = VisionAnalyzer()

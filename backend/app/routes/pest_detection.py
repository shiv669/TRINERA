"""
Pest detection API routes.
"""

import logging
from fastapi import APIRouter, UploadFile, File, HTTPException, Query
from fastapi.responses import JSONResponse
from typing import Optional

from app.models import PestDetectionResponse, PestPrediction, PestDetails
from app.services.huggingface import HuggingFaceService
from app.services.session_manager import session_store
from app.utils.validators import validate_image_file
from app.utils.pest_info import get_pest_info
import hashlib

# Configure logging
logger = logging.getLogger(__name__)

# Create router
router = APIRouter(prefix="/api", tags=["Pest Detection"])

# Initialize Hugging Face service
hf_service = HuggingFaceService()


@router.post("/detect-pest", response_model=PestDetectionResponse)
async def detect_pest(
    file: UploadFile = File(..., description="Image file of the pest"),
    language: Optional[str] = Query("english", description="Response language (english or hindi)"),
    session_id: Optional[str] = Query(None, description="Session ID for context continuity")
):
    """
    Detect pest from uploaded image.
    
    This endpoint accepts an image file and returns pest detection results
    including identification, harmfulness, and recommended precautions.
    
    Args:
        file: Uploaded image file (JPEG, PNG, or WebP)
        language: Preferred language for response (english or hindi)
        session_id: Optional session ID to maintain conversation context
    
    Returns:
        PestDetectionResponse containing prediction and detailed information
    """
    try:
        # Validate the uploaded file
        await validate_image_file(file)

        # Read image file
        image_bytes = await file.read()
        img_hash = hashlib.sha256(image_bytes).hexdigest()
        logger.info(f"Processing image: {file.filename}, size: {len(image_bytes)} bytes, sha256={img_hash}")

        # Get prediction from Hugging Face
        prediction_result = await hf_service.predict_pest(image_bytes)
        logger.info(f"Raw prediction result for image sha256={img_hash}: {prediction_result}")

        pest_label = prediction_result.get("label")
        confidence = prediction_result.get("confidence")

        logger.info(f"Prediction: {pest_label} (confidence: {confidence:.2f})")

        # Get detailed pest information
        pest_info = get_pest_info(pest_label, language)

        if not pest_info:
            raise HTTPException(
                status_code=500,
                detail="Failed to retrieve pest information"
            )

        # Store in session for AI chat context
        session = session_store.get_session(session_id)
        session.language = language.lower()
        session.add_detected_pest(
            pest_name=pest_label,
            pest_info={
                "label": pest_label,
                "confidence": confidence,
                "scientific_name": pest_info.get("scientific_name", "N/A"),
                "severity": pest_info.get("severity", "unknown"),
                "affected_crops": pest_info.get("affected_crops", []),
                "description": pest_info.get("description", ""),
                "spread_method": pest_info.get("spread_method", ""),
                "precautions": pest_info.get("precautions", [])
            }
        )
        session_store.update_session(session)
        logger.info(f"Stored pest detection in session: {session.id}")

        # Prepare response
        response = PestDetectionResponse(
            success=True,
            prediction=PestPrediction(
                label=pest_info["name"],
                confidence=round(confidence, 4),
                is_harmful=pest_info["is_harmful"]
            ),
            details=PestDetails(
                description=pest_info["description"],
                spread_method=pest_info["spread_method"],
                precautions=pest_info["precautions"]
            ),
            message=f"Successfully detected: {pest_info['name']}",
            session_id=session.id  # Return session ID for frontend
        )

        return response
    
    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    
    except Exception as e:
        logger.error(f"Error in pest detection: {str(e)}", exc_info=True)
        import traceback
        traceback.print_exc()
        return JSONResponse(
            status_code=500,
            content={
                "success": False,
                "error": "Failed to process image",
                "details": str(e),
                "traceback": traceback.format_exc()
            }
        )


@router.get("/model-status")
async def get_model_status():
    """
    Check the status of the Hugging Face model.
    
    Returns:
        Model status information including availability and loading state
    """
    try:
        status = await hf_service.check_model_status()
        return {
            "success": True,
            "status": status
        }
    except Exception as e:
        logger.error(f"Error checking model status: {str(e)}")
        return JSONResponse(
            status_code=500,
            content={
                "success": False,
                "error": "Failed to check model status",
                "details": str(e)
            }
        )

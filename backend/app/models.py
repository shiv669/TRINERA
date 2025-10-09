"""
Pydantic models for request/response validation.
"""

from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field


class PestPrediction(BaseModel):
    """Model for pest prediction results from Hugging Face."""
    label: str = Field(..., description="Predicted pest label")
    confidence: float = Field(..., description="Confidence score (0-1)")
    is_harmful: bool = Field(..., description="Whether the pest is harmful")


class PestDetails(BaseModel):
    """Detailed information about a detected pest."""
    description: str = Field(..., description="Description of the pest")
    spread_method: str = Field(..., description="How the pest spreads")
    precautions: List[str] = Field(..., description="Recommended precautions")


class PestDetectionResponse(BaseModel):
    """Response model for pest detection endpoint."""
    success: bool = Field(..., description="Whether the detection was successful")
    prediction: Optional[PestPrediction] = Field(None, description="Prediction results")
    details: Optional[PestDetails] = Field(None, description="Detailed pest information")
    error: Optional[str] = Field(None, description="Error message if failed")
    message: Optional[str] = Field(None, description="Additional message")
    session_id: Optional[str] = Field(None, description="Session ID for chat continuity")


class HealthResponse(BaseModel):
    """Response model for health check endpoint."""
    status: str = Field(..., description="Health status")
    timestamp: str = Field(..., description="Current timestamp")
    version: str = Field(..., description="API version")
    model_id: str = Field(..., description="Hugging Face model ID")


class ErrorResponse(BaseModel):
    """Response model for errors."""
    success: bool = Field(default=False, description="Always false for errors")
    error: str = Field(..., description="Error message")
    details: Optional[str] = Field(None, description="Additional error details")

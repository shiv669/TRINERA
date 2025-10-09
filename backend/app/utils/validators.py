"""
Validators for file uploads and input data.
"""

from typing import Tuple
from fastapi import UploadFile, HTTPException
from app.config import settings


async def validate_image_file(file: UploadFile) -> Tuple[bool, str]:
    """
    Validate uploaded image file.
    
    Args:
        file: Uploaded file from FastAPI
    
    Returns:
        Tuple of (is_valid, error_message)
    
    Raises:
        HTTPException: If validation fails
    """
    # Check if file exists
    if not file:
        raise HTTPException(status_code=400, detail="No file uploaded")
    
    # Check file content type
    if file.content_type not in settings.ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file type. Allowed types: {', '.join(settings.ALLOWED_EXTENSIONS)}"
        )
    
    # Read file to check size
    file_content = await file.read()
    file_size = len(file_content)
    
    # Reset file pointer for later use
    await file.seek(0)
    
    # Check file size
    if file_size > settings.MAX_FILE_SIZE:
        max_size_mb = settings.MAX_FILE_SIZE / (1024 * 1024)
        raise HTTPException(
            status_code=400,
            detail=f"File too large. Maximum size: {max_size_mb}MB"
        )
    
    # Check if file is empty
    if file_size == 0:
        raise HTTPException(status_code=400, detail="Uploaded file is empty")
    
    return True, ""


def sanitize_filename(filename: str) -> str:
    """
    Sanitize filename to prevent path traversal attacks.
    
    Args:
        filename: Original filename
    
    Returns:
        Sanitized filename
    """
    # Remove path components
    filename = filename.split("/")[-1].split("\\")[-1]
    
    # Remove any non-alphanumeric characters except dots, dashes, and underscores
    sanitized = "".join(c for c in filename if c.isalnum() or c in ".-_")
    
    return sanitized or "upload"

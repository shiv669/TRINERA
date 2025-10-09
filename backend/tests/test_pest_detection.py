"""
Tests for pest detection endpoints.
"""

import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_health_check():
    """Test health check endpoint."""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "timestamp" in data
    assert "version" in data


def test_root_endpoint():
    """Test root endpoint."""
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "online"
    assert "version" in data


def test_detect_pest_no_file():
    """Test pest detection without file."""
    response = client.post("/api/detect-pest")
    assert response.status_code == 422  # Validation error


def test_detect_pest_invalid_file_type():
    """Test pest detection with invalid file type."""
    files = {"file": ("test.txt", b"not an image", "text/plain")}
    response = client.post("/api/detect-pest", files=files)
    assert response.status_code == 400


@pytest.mark.asyncio
async def test_model_status():
    """Test model status endpoint."""
    response = client.get("/api/model-status")
    assert response.status_code == 200
    data = response.json()
    assert "success" in data
    assert "status" in data


# Note: To test with actual images, you would need to:
# 1. Create test image files
# 2. Mock the Hugging Face API responses
# 3. Test various scenarios (success, errors, timeouts)

# Example structure for image testing:
# def test_detect_pest_with_image():
#     """Test pest detection with valid image."""
#     with open("test_images/pest.jpg", "rb") as f:
#         files = {"file": ("pest.jpg", f, "image/jpeg")}
#         response = client.post("/api/detect-pest", files=files)
#         assert response.status_code == 200
#         data = response.json()
#         assert data["success"] is True
#         assert "prediction" in data

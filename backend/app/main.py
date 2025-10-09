"""
Main FastAPI application for Trinera Pest Detection.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from datetime import datetime
import logging

from app.config import settings
from app.models import HealthResponse
from app.routes import pest_detection_router
from app.routes import chat as chat_router
from app.routes import live_mode

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Create FastAPI application
app = FastAPI(
    title=settings.API_TITLE,
    description=settings.API_DESCRIPTION,
    version=settings.API_VERSION,
    docs_url="/docs" if not settings.is_production else None,
    redoc_url="/redoc" if not settings.is_production else None
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["*"]
)


@app.on_event("startup")
async def startup_event():
    """Execute on application startup."""
    logger.info("=" * 60)
    logger.info(f"Starting {settings.API_TITLE}")
    logger.info(f"Version: {settings.API_VERSION}")
    logger.info(f"Environment: {settings.ENVIRONMENT}")
    logger.info(f"Model: {settings.HF_MODEL_ID}")
    logger.info(f"LLM Model: {settings.OLLAMA_MODEL}")
    logger.info(f"CORS Origins: {settings.CORS_ORIGINS}")
    logger.info("=" * 60)
    
    # Validate configuration
    try:
        settings.validate()
        logger.info("✓ Configuration validated successfully")
    except ValueError as e:
        logger.error(f"✗ Configuration error: {e}")
        raise


@app.on_event("shutdown")
async def shutdown_event():
    """Execute on application shutdown."""
    logger.info("Shutting down application...")


@app.get("/", include_in_schema=False)
async def root():
    """Root endpoint - API information."""
    return {
        "message": "Trinera Pest Detection API",
        "version": settings.API_VERSION,
        "status": "online",
        "docs": "/docs",
        "health": "/health"
    }


@app.get("/health", response_model=HealthResponse, tags=["Health"])
async def health_check():
    """
    Health check endpoint.
    
    Returns the current status of the API service.
    """
    return HealthResponse(
        status="healthy",
        timestamp=datetime.utcnow().isoformat(),
        version=settings.API_VERSION,
        model_id=settings.HF_MODEL_ID
    )


# Include routers
app.include_router(pest_detection_router)
app.include_router(chat_router.router)
app.include_router(live_mode.router, prefix="/api", tags=["Live Mode"])
logger.info("✓ Routers registered: Pest Detection, AI Chat, Live Mode")


@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    """Global exception handler for unhandled errors."""
    logger.error(f"Unhandled exception: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "error": "An internal error occurred",
            "details": str(exc) if not settings.is_production else "Please contact support"
        }
    )


if __name__ == "__main__":
    import uvicorn
    
    uvicorn.run(
        "app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=not settings.is_production,
        log_level="info"
    )

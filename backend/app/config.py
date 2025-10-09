"""
Configuration management for the FastAPI application.
Loads environment variables and provides application settings.
"""

import os
from pathlib import Path
from typing import List
from dotenv import load_dotenv

# Get the backend directory path
BACKEND_DIR = Path(__file__).parent.parent

# Load environment variables from .env file in backend directory
load_dotenv(BACKEND_DIR / ".env")


class Settings:
    """Application settings loaded from environment variables."""
    
    # Hugging Face Configuration
    HF_TOKEN: str = os.getenv("HF_TOKEN", "")
    HF_MODEL_ID: str = os.getenv("HF_MODEL_ID", "S1-1IVAM/trinera-pest-detector")
    HF_API_URL: str = f"https://api-inference.huggingface.co/models/{HF_MODEL_ID}"
    
    # Server Configuration
    PORT: int = int(os.getenv("PORT", "8000"))
    HOST: str = os.getenv("HOST", "0.0.0.0")
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    
    # CORS Configuration
    CORS_ORIGINS: List[str] = os.getenv(
        "CORS_ORIGINS", 
        "http://localhost:3000,http://localhost:3001"
    ).split(",")
    
    # Groq/Ollama LLM Configuration
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")
    OLLAMA_MODEL: str = os.getenv("OLLAMA_MODEL", "llama-3.1-8b-instant")
    OLLAMA_BASE_URL: str = os.getenv("OLLAMA_BASE_URL", "https://api.groq.com/openai/v1")
    MAX_CONTEXT_MESSAGES: int = int(os.getenv("MAX_CONTEXT_MESSAGES", "10"))
    MAX_CONTEXT_TOKENS: int = int(os.getenv("MAX_CONTEXT_TOKENS", "6000"))
    SESSION_TTL: int = int(os.getenv("SESSION_TTL", "3600"))
    
    # File Upload Configuration
    MAX_FILE_SIZE: int = 10 * 1024 * 1024  # 10MB
    ALLOWED_EXTENSIONS: List[str] = ["image/jpeg", "image/png", "image/webp", "image/jpg"]
    
    # API Configuration
    API_TITLE: str = "Trinera Pest Detection API"
    API_DESCRIPTION: str = "FastAPI backend for pest detection using Hugging Face models"
    API_VERSION: str = "1.0.0"
    
    @property
    def is_production(self) -> bool:
        """Check if running in production environment."""
        return self.ENVIRONMENT.lower() == "production"
    
    def validate(self) -> None:
        """Validate critical configuration settings."""
        if not self.HF_TOKEN:
            raise ValueError(
                "HF_TOKEN is not set. Please set your Hugging Face token in .env file. "
                "Get your token from: https://huggingface.co/settings/tokens"
            )


# Create a global settings instance
settings = Settings()

"""
Application configuration settings
"""

import os
from typing import List, Optional
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field


class Settings(BaseSettings):
    """Application settings"""
    
    # API Settings
    API_TITLE: str = Field("Trinera Pest Detection API", env="API_TITLE")
    API_DESCRIPTION: str = Field("AI-powered pest detection and advisory system", env="API_DESCRIPTION")
    API_VERSION: str = Field("1.0.0", env="API_VERSION")
    ENVIRONMENT: str = Field("development", env="ENVIRONMENT")
    
    # Server Settings
    HOST: str = Field("0.0.0.0", env="HOST")
    PORT: int = Field(8000, env="PORT")
    
    # CORS Settings
    CORS_ORIGINS: str = Field(
        default="http://localhost:3000,http://localhost:3001",
        env="CORS_ORIGINS"
    )
    
    @property
    def cors_origins_list(self) -> List[str]:
        """Parse CORS origins from comma-separated string"""
        if isinstance(self.CORS_ORIGINS, str):
            return [origin.strip() for origin in self.CORS_ORIGINS.split(",")]
        return self.CORS_ORIGINS
    
    # Hugging Face settings
    HF_TOKEN: Optional[str] = Field(None, validation_alias="HUGGINGFACE_API_TOKEN")
    HF_MODEL_ID: str = Field("S1-1IVAM/trinera-pest-detector", validation_alias="HUGGINGFACE_MODEL_ID")
    
    # LLM Settings
    OLLAMA_MODEL: str = Field("llama-3.1-8b-instant", env="OLLAMA_MODEL")
    OLLAMA_BASE_URL: str = Field("https://api.groq.com/openai/v1", env="OLLAMA_BASE_URL")
    GROQ_API_KEY: Optional[str] = Field(None, env="GROQ_API_KEY")
    
    # MongoDB settings (optional)
    MONGODB_URI: Optional[str] = Field(None, env="MONGODB_URI")
    MONGODB_DB_NAME: str = Field("trinera", env="MONGODB_DB_NAME")
    
    # Session settings
    SESSION_TTL: int = Field(3600, env="SESSION_TTL")
    
    # File Upload Settings
    ALLOWED_EXTENSIONS: List[str] = Field(
        default=["image/jpeg", "image/jpg", "image/png", "image/webp"],
        env="ALLOWED_EXTENSIONS"
    )
    MAX_FILE_SIZE: int = Field(10 * 1024 * 1024, env="MAX_FILE_SIZE")  # 10MB default
    
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        populate_by_name=True,
        extra="ignore"
    )
    
    @property
    def is_production(self) -> bool:
        """Check if running in production environment"""
        return self.ENVIRONMENT.lower() == "production"
    
    def validate(self):
        """Validate critical settings"""
        warnings = []
        
        if not self.GROQ_API_KEY:
            warnings.append("GROQ_API_KEY not set - LLM chat will not work")
        
        if not self.HF_TOKEN:
            warnings.append("HF_TOKEN not set - Hugging Face features may not work")
        
        if warnings:
            for warning in warnings:
                print(f"⚠️  {warning}")


# Create settings instance
settings = Settings()

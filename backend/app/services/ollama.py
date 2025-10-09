"""
Ollama LLM Service using Groq Cloud API
Provides intelligent agricultural advice using Llama 3.1
"""

import httpx
import logging
from typing import List, Dict, Optional
from app.config import Settings

logger = logging.getLogger(__name__)
settings = Settings()


class OllamaService:
    """Service for interacting with Groq Cloud API (Ollama-style models)"""
    
    def __init__(self):
        self.api_key = settings.GROQ_API_KEY
        self.base_url = settings.OLLAMA_BASE_URL
        self.model = settings.OLLAMA_MODEL
        self.client = httpx.AsyncClient(timeout=30.0)
        
        if not self.api_key:
            logger.warning("GROQ_API_KEY not set in environment variables")
    
    async def chat(
        self,
        messages: List[Dict[str, str]],
        temperature: float = 0.7,
        max_tokens: int = 1000,
        stream: bool = False
    ) -> str:
        """
        Send chat request to Groq API
        
        Args:
            messages: List of message dicts with 'role' and 'content'
            temperature: Randomness (0.0 = deterministic, 1.0 = creative)
            max_tokens: Maximum response length
            stream: Whether to stream response (for future use)
        
        Returns:
            AI response text
        """
        try:
            headers = {
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json"
            }
            
            payload = {
                "model": self.model,
                "messages": messages,
                "temperature": temperature,
                "max_tokens": max_tokens,
                "stream": stream
            }
            
            logger.info(f"Sending request to Groq API with {len(messages)} messages")
            logger.debug(f"Model: {self.model}, Temperature: {temperature}")
            
            response = await self.client.post(
                f"{self.base_url}/chat/completions",
                headers=headers,
                json=payload
            )
            
            response.raise_for_status()
            data = response.json()
            
            ai_response = data["choices"][0]["message"]["content"]
            logger.info(f"Received response: {len(ai_response)} characters")
            
            return ai_response
            
        except httpx.HTTPStatusError as e:
            logger.error(f"Groq API HTTP error: {e.response.status_code} - {e.response.text}")
            raise Exception(f"LLM API error: {e.response.status_code}")
        except httpx.TimeoutException:
            logger.error("Groq API timeout")
            raise Exception("LLM API timeout - please try again")
        except Exception as e:
            logger.error(f"Error calling Groq API: {str(e)}")
            raise Exception(f"Failed to get AI response: {str(e)}")
    
    async def close(self):
        """Close the HTTP client"""
        await self.client.aclose()


# Dependency for FastAPI
async def get_ollama_service() -> OllamaService:
    """Dependency to get OllamaService instance"""
    return OllamaService()

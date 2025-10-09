"""
Chat endpoints for AI agricultural assistant
"""

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional, List, Dict
import logging

from app.services.ollama import OllamaService, get_ollama_service
from app.services.session_manager import session_store, Session
from app.services.context_manager import context_manager

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/chat", tags=["chat"])


# Request/Response Models
class ChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = None
    language: str = "english"
    crop_type: Optional[str] = None
    region: Optional[str] = None


class ChatResponse(BaseModel):
    success: bool
    response: str
    session_id: str
    detected_pests: List[str]


class ChatHistoryResponse(BaseModel):
    session_id: str
    messages: List[Dict[str, str]]
    detected_pests: List[str]
    created_at: str


@router.post("", response_model=ChatResponse)
async def chat(
    request: ChatRequest,
    ollama_service: OllamaService = Depends(get_ollama_service)
):
    """
    Main chat endpoint for AI agricultural assistant
    
    Process:
    1. Get/create session
    2. Update session metadata
    3. Build context with pest info + history
    4. Call Ollama LLM
    5. Save response to session
    6. Return to user
    """
    try:
        # 1. Get or create session
        session = session_store.get_session(request.session_id)
        logger.info(f"Processing chat for session: {session.id}")
        
        # 2. Update session metadata
        session.language = request.language.lower()
        if request.crop_type:
            session.crop_type = request.crop_type
        if request.region:
            session.region = request.region
        
        # 3. Build context
        logger.info(f"Building context for session {session.id}")
        messages = await context_manager.build_context(
            user_message=request.message,
            session=session
        )
        
        # 4. Call Ollama LLM
        logger.info(f"Calling Groq API for session {session.id}")
        ai_response = await ollama_service.chat(
            messages=messages,
            temperature=0.7,
            max_tokens=1000
        )
        
        # 5. Save to session
        session.add_message("user", request.message)
        session.add_message("assistant", ai_response)
        session_store.update_session(session)
        
        logger.info(f"Chat completed successfully for session {session.id}")
        
        # 6. Return response
        return ChatResponse(
            success=True,
            response=ai_response,
            session_id=session.id,
            detected_pests=session.detected_pests
        )
        
    except Exception as e:
        logger.error(f"Error in chat endpoint: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Failed to process chat: {str(e)}"
        )


@router.get("/history/{session_id}", response_model=ChatHistoryResponse)
async def get_chat_history(session_id: str):
    """Get conversation history for a session"""
    try:
        session = session_store.get_session(session_id)
        
        return ChatHistoryResponse(
            session_id=session.id,
            messages=session.messages,
            detected_pests=session.detected_pests,
            created_at=session.created_at.isoformat()
        )
        
    except Exception as e:
        logger.error(f"Error retrieving history: {str(e)}")
        raise HTTPException(
            status_code=404,
            detail=f"Session not found: {session_id}"
        )


@router.delete("/session/{session_id}")
async def clear_session(session_id: str):
    """Clear a chat session"""
    try:
        success = session_store.clear_session(session_id)
        
        if success:
            return {"success": True, "message": "Session cleared"}
        else:
            raise HTTPException(status_code=404, detail="Session not found")
            
    except Exception as e:
        logger.error(f"Error clearing session: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/test")
async def test_ollama(ollama_service: OllamaService = Depends(get_ollama_service)):
    """Test endpoint to verify Ollama API is working"""
    try:
        test_messages = [
            {"role": "system", "content": "You are a helpful assistant."},
            {"role": "user", "content": "Say 'Hello, I am working!' in one sentence."}
        ]
        
        response = await ollama_service.chat(test_messages)
        
        return {
            "success": True,
            "message": "Groq API is working!",
            "model": ollama_service.model,
            "response": response
        }
        
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }

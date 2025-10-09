"""
Session management for maintaining conversation context
"""

import uuid
from typing import Dict, List, Optional
from datetime import datetime, timedelta
from dataclasses import dataclass, field
import logging

logger = logging.getLogger(__name__)


@dataclass
class Session:
    """Represents a user chat session"""
    id: str = field(default_factory=lambda: str(uuid.uuid4()))
    created_at: datetime = field(default_factory=datetime.now)
    messages: List[Dict[str, str]] = field(default_factory=list)
    detected_pests: List[str] = field(default_factory=list)
    latest_pest_info: Optional[Dict] = None  # Store latest pest detection
    crop_type: Optional[str] = None
    region: Optional[str] = None
    language: str = "english"
    
    def add_message(self, role: str, content: str):
        """Add a message to the conversation history"""
        self.messages.append({
            "role": role,
            "content": content,
            "timestamp": datetime.now().isoformat()
        })
        logger.info(f"Added {role} message to session {self.id}")
    
    def add_detected_pest(self, pest_name: str, pest_info: Optional[Dict] = None):
        """Add a detected pest to the session"""
        if pest_name not in self.detected_pests:
            self.detected_pests.append(pest_name)
            logger.info(f"Added pest '{pest_name}' to session {self.id}")
        
        if pest_info:
            self.latest_pest_info = pest_info
            logger.info(f"Updated latest pest info for session {self.id}")
    
    def is_expired(self, ttl_seconds: int) -> bool:
        """Check if session has expired"""
        age = datetime.now() - self.created_at
        return age > timedelta(seconds=ttl_seconds)


class InMemorySessionStore:
    """In-memory storage for chat sessions"""
    
    def __init__(self, ttl_seconds: int = 3600):
        self.sessions: Dict[str, Session] = {}
        self.ttl = ttl_seconds
        logger.info(f"Initialized session store with TTL={ttl_seconds}s")
    
    def get_session(self, session_id: Optional[str] = None) -> Session:
        """
        Get existing session or create new one
        
        Args:
            session_id: Optional session ID. If None, creates new session.
        
        Returns:
            Session object
        """
        # Create new session if no ID provided
        if not session_id:
            session = Session()
            self.sessions[session.id] = session
            logger.info(f"Created new session: {session.id}")
            return session
        
        # Get existing session
        session = self.sessions.get(session_id)
        
        # Check if session exists and is not expired
        if session:
            if session.is_expired(self.ttl):
                logger.info(f"Session {session_id} expired, creating new")
                del self.sessions[session_id]
                session = Session()
                self.sessions[session.id] = session
            else:
                logger.info(f"Retrieved existing session: {session_id}")
        else:
            # Session not found, create new
            session = Session()
            self.sessions[session.id] = session
            logger.info(f"Session {session_id} not found, created new: {session.id}")
        
        return session
    
    def update_session(self, session: Session):
        """Update session in store"""
        self.sessions[session.id] = session
        logger.info(f"Updated session: {session.id}")
    
    def clear_session(self, session_id: str) -> bool:
        """Clear a specific session"""
        if session_id in self.sessions:
            del self.sessions[session_id]
            logger.info(f"Cleared session: {session_id}")
            return True
        return False
    
    def cleanup_expired(self):
        """Remove all expired sessions"""
        expired = [
            sid for sid, session in self.sessions.items()
            if session.is_expired(self.ttl)
        ]
        for sid in expired:
            del self.sessions[sid]
        
        if expired:
            logger.info(f"Cleaned up {len(expired)} expired sessions")


# Global session store instance
session_store = InMemorySessionStore(ttl_seconds=3600)

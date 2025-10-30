"""
Session management for maintaining conversation context
"""

import uuid
from typing import Dict, List, Optional, Any
from datetime import datetime, timedelta
from dataclasses import dataclass, field
import logging

from app.services.database import database_service

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


class MongoDBSessionStore(InMemorySessionStore):
    """MongoDB-backed session store that persists sessions to database"""
    
    def __init__(self, ttl_seconds: int = 3600):
        super().__init__(ttl_seconds)
        logger.info("Initialized MongoDB session store")
    
    def get_session(self, session_id: Optional[str] = None) -> Session:
        """Get session from MongoDB or create new one"""
        # If no session_id provided, create new session
        if not session_id:
            session = Session()
            self.sessions[session.id] = session
            
            # Save to MongoDB if connected
            if database_service.is_connected():
                db_session_id = database_service.create_session({
                    "id": session.id,
                    "created_at": session.created_at,
                    "crop_type": session.crop_type,
                    "region": session.region,
                    "language": session.language,
                    "detected_pests": session.detected_pests
                })
                logger.info(f"Created new session in MongoDB: {db_session_id}")
            
            return session
        
        # Try to get from in-memory cache first
        session = self.sessions.get(session_id)
        
        # If not in memory but MongoDB is connected, try to get from DB
        if not session and database_service.is_connected():
            db_session = database_service.get_session(session_id)
            if db_session:
                # Create session from DB data
                session = Session(
                    id=db_session.get("id", session_id),
                    created_at=db_session.get("created_at", datetime.now()),
                    crop_type=db_session.get("crop_type"),
                    region=db_session.get("region"),
                    language=db_session.get("language", "english"),
                    detected_pests=db_session.get("detected_pests", [])
                )
                
                # Load messages from DB
                if database_service.is_connected():
                    messages = database_service.get_messages(session_id)
                    for msg in messages:
                        session.messages.append({
                            "role": msg.get("role"),
                            "content": msg.get("content"),
                            "timestamp": msg.get("timestamp")
                        })
                
                # Add to in-memory cache
                self.sessions[session.id] = session
                logger.info(f"Loaded session {session_id} from MongoDB")
        
        # Check if session exists and is not expired
        if session:
            if session.is_expired(self.ttl):
                logger.info(f"Session {session_id} expired, creating new")
                del self.sessions[session_id]
                session = Session()
                self.sessions[session.id] = session
                
                # Save new session to MongoDB
                if database_service.is_connected():
                    database_service.create_session({
                        "id": session.id,
                        "created_at": session.created_at,
                        "language": session.language
                    })
            else:
                logger.info(f"Retrieved existing session: {session_id}")
        else:
            # Session not found, create new
            session = Session()
            self.sessions[session.id] = session
            logger.info(f"Session {session_id} not found, created new: {session.id}")
            
            # Save to MongoDB
            if database_service.is_connected():
                database_service.create_session({
                    "id": session.id,
                    "created_at": session.created_at,
                    "language": session.language
                })
        
        return session
    
    def update_session(self, session: Session):
        """Update session in store and MongoDB"""
        # Update in-memory cache
        self.sessions[session.id] = session
        
        # Update in MongoDB
        if database_service.is_connected():
            # Update session metadata
            database_service.update_session(session.id, {
                "crop_type": session.crop_type,
                "region": session.region,
                "language": session.language,
                "detected_pests": session.detected_pests
            })
            
            # Add latest messages to MongoDB
            # Track which messages are already in DB by checking for _id field
            for msg in session.messages:
                if "_id" in msg or msg.get("saved_to_db"):
                    # Message already saved to DB
                    continue
                    
                database_service.add_message(session.id, msg)
                # Mark as saved
                msg["saved_to_db"] = True
                
        logger.info(f"Updated session: {session.id}")
    
    def clear_session(self, session_id: str) -> bool:
        """Clear a specific session from memory and MongoDB"""
        if session_id in self.sessions:
            del self.sessions[session_id]
            
            # Delete from MongoDB
            if database_service.is_connected():
                database_service.delete_session(session_id)
                
            logger.info(f"Cleared session: {session_id}")
            return True
        return False


# Global session store instance
# Use MongoDB session store if MongoDB URI is configured, otherwise use in-memory store
from app.config import settings

if settings.MONGODB_URI:
    session_store = MongoDBSessionStore(ttl_seconds=settings.SESSION_TTL)
    logger.info("Using MongoDB-backed session store")
else:
    session_store = InMemorySessionStore(ttl_seconds=settings.SESSION_TTL)
    logger.info("Using in-memory session store (MongoDB not configured)")

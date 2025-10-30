"""MongoDB database service for storing chat history and user sessions."""

import logging
import os
from datetime import datetime
from typing import Dict, List, Optional, Any
from pymongo import MongoClient
from pymongo.collection import Collection
from pymongo.database import Database
from bson.objectid import ObjectId

from app.config import settings

logger = logging.getLogger(__name__)


class MongoDBService:
    """Service for MongoDB database operations"""
    
    def __init__(self):
        """Initialize MongoDB connection using connection string from environment"""
        self.client: Optional[MongoClient] = None
        self.db: Optional[Database] = None
        self.sessions_collection: Optional[Collection] = None
        self.messages_collection: Optional[Collection] = None
        self.pest_detections_collection: Optional[Collection] = None
        
        self.connect()
    
    def connect(self) -> None:
        """Connect to MongoDB database"""
        try:
            # Get MongoDB connection string from environment
            mongo_uri = settings.MONGODB_URI
            
            if not mongo_uri:
                logger.warning("MongoDB URI not set. Database features will be disabled.")
                return
            
            # Connect to MongoDB
            self.client = MongoClient(mongo_uri)
            self.db = self.client[settings.MONGODB_DB_NAME]
            
            # Initialize collections
            self.sessions_collection = self.db["sessions"]
            self.messages_collection = self.db["messages"]
            self.pest_detections_collection = self.db["pest_detections"]
            
            # Create indexes
            self.messages_collection.create_index("session_id")
            self.pest_detections_collection.create_index("session_id")
            
            logger.info(f"Connected to MongoDB database: {settings.MONGODB_DB_NAME}")
            
        except Exception as e:
            logger.error(f"Failed to connect to MongoDB: {str(e)}")
            self.client = None
            self.db = None
    
    def is_connected(self) -> bool:
        """Check if connected to MongoDB"""
        return self.client is not None and self.db is not None
    
    # Session operations
    def create_session(self, session_data: Dict[str, Any]) -> str:
        """Create a new session in MongoDB"""
        if not self.is_connected():
            logger.warning("MongoDB not connected. Session not saved.")
            return session_data.get("id")
        
        try:
            # Add created_at timestamp if not present
            if "created_at" not in session_data:
                session_data["created_at"] = datetime.now()
                
            result = self.sessions_collection.insert_one(session_data)
            session_id = str(result.inserted_id)
            logger.info(f"Created session in MongoDB: {session_id}")
            return session_id
            
        except Exception as e:
            logger.error(f"Failed to create session in MongoDB: {str(e)}")
            return session_data.get("id")
    
    def get_session(self, session_id: str) -> Optional[Dict[str, Any]]:
        """Get session by ID from MongoDB"""
        if not self.is_connected():
            logger.warning("MongoDB not connected. Cannot retrieve session.")
            return None
        
        try:
            # Try to find by MongoDB ObjectId first
            if ObjectId.is_valid(session_id):
                session = self.sessions_collection.find_one({"_id": ObjectId(session_id)})
                if session:
                    # Convert ObjectId to string for serialization
                    session["_id"] = str(session["_id"])
                    return session
            
            # If not found or not valid ObjectId, try with UUID string
            session = self.sessions_collection.find_one({"id": session_id})
            if session:
                session["_id"] = str(session["_id"])
                return session
                
            return None
            
        except Exception as e:
            logger.error(f"Failed to get session from MongoDB: {str(e)}")
            return None
    
    def update_session(self, session_id: str, update_data: Dict[str, Any]) -> bool:
        """Update session in MongoDB"""
        if not self.is_connected():
            logger.warning("MongoDB not connected. Session not updated.")
            return False
        
        try:
            # Add updated_at timestamp
            update_data["updated_at"] = datetime.now()
            
            # Try to update by MongoDB ObjectId first
            if ObjectId.is_valid(session_id):
                result = self.sessions_collection.update_one(
                    {"_id": ObjectId(session_id)},
                    {"$set": update_data}
                )
                if result.modified_count > 0:
                    return True
            
            # If not found or not valid ObjectId, try with UUID string
            result = self.sessions_collection.update_one(
                {"id": session_id},
                {"$set": update_data}
            )
            
            return result.modified_count > 0
            
        except Exception as e:
            logger.error(f"Failed to update session in MongoDB: {str(e)}")
            return False
    
    def delete_session(self, session_id: str) -> bool:
        """Delete session from MongoDB"""
        if not self.is_connected():
            logger.warning("MongoDB not connected. Session not deleted.")
            return False
        
        try:
            # Try to delete by MongoDB ObjectId first
            if ObjectId.is_valid(session_id):
                result = self.sessions_collection.delete_one({"_id": ObjectId(session_id)})
                if result.deleted_count > 0:
                    # Also delete related messages and pest detections
                    self.messages_collection.delete_many({"session_id": session_id})
                    self.pest_detections_collection.delete_many({"session_id": session_id})
                    return True
            
            # If not found or not valid ObjectId, try with UUID string
            result = self.sessions_collection.delete_one({"id": session_id})
            if result.deleted_count > 0:
                # Also delete related messages and pest detections
                self.messages_collection.delete_many({"session_id": session_id})
                self.pest_detections_collection.delete_many({"session_id": session_id})
                return True
                
            return False
            
        except Exception as e:
            logger.error(f"Failed to delete session from MongoDB: {str(e)}")
            return False
    
    # Message operations
    def add_message(self, session_id: str, message_data: Dict[str, Any]) -> str:
        """Add a message to a session in MongoDB"""
        if not self.is_connected():
            logger.warning("MongoDB not connected. Message not saved.")
            return ""
        
        try:
            # Add session_id and timestamp if not present
            message_data["session_id"] = session_id
            if "timestamp" not in message_data:
                message_data["timestamp"] = datetime.now()
                
            result = self.messages_collection.insert_one(message_data)
            message_id = str(result.inserted_id)
            
            # Update session's last_message_at
            self.sessions_collection.update_one(
                {"id": session_id},
                {"$set": {"last_message_at": datetime.now()}}
            )
            
            return message_id
            
        except Exception as e:
            logger.error(f"Failed to add message to MongoDB: {str(e)}")
            return ""
    
    def get_messages(self, session_id: str, limit: int = 50) -> List[Dict[str, Any]]:
        """Get messages for a session from MongoDB"""
        if not self.is_connected():
            logger.warning("MongoDB not connected. Cannot retrieve messages.")
            return []
        
        try:
            messages = list(self.messages_collection.find(
                {"session_id": session_id},
                sort=[("timestamp", 1)],
                limit=limit
            ))
            
            # Convert ObjectId to string for serialization
            for message in messages:
                message["_id"] = str(message["_id"])
                
            return messages
            
        except Exception as e:
            logger.error(f"Failed to get messages from MongoDB: {str(e)}")
            return []
    
    # Pest detection operations
    def add_pest_detection(self, session_id: str, pest_data: Dict[str, Any]) -> str:
        """Add pest detection to MongoDB"""
        if not self.is_connected():
            logger.warning("MongoDB not connected. Pest detection not saved.")
            return ""
        
        try:
            # Add session_id and timestamp if not present
            pest_data["session_id"] = session_id
            if "timestamp" not in pest_data:
                pest_data["timestamp"] = datetime.now()
                
            result = self.pest_detections_collection.insert_one(pest_data)
            detection_id = str(result.inserted_id)
            
            return detection_id
            
        except Exception as e:
            logger.error(f"Failed to add pest detection to MongoDB: {str(e)}")
            return ""
    
    def get_pest_detections(self, session_id: str) -> List[Dict[str, Any]]:
        """Get pest detections for a session from MongoDB"""
        if not self.is_connected():
            logger.warning("MongoDB not connected. Cannot retrieve pest detections.")
            return []
        
        try:
            detections = list(self.pest_detections_collection.find(
                {"session_id": session_id},
                sort=[("timestamp", 1)]
            ))
            
            # Convert ObjectId to string for serialization
            for detection in detections:
                detection["_id"] = str(detection["_id"])
                
            return detections
            
        except Exception as e:
            logger.error(f"Failed to get pest detections from MongoDB: {str(e)}")
            return []


# Global database service instance
database_service = MongoDBService()
"""
Live Mode WebSocket Service
Real-time camera + voice interaction for pest detection
"""

from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from typing import Dict, Optional
from fastapi.responses import FileResponse
import asyncio
import base64
import json
import logging
from datetime import datetime
import io
from PIL import Image

from app.services.edge_tts_service import edge_tts_service
from app.services.ollama import OllamaService
from app.services.vision_analyzer import vision_analyzer
from app.services.huggingface import HuggingFaceService
import time
import tempfile
import os as os_module

logger = logging.getLogger(__name__)

router = APIRouter()


class LiveSession:
    """Represents a single live mode session."""
    
    def __init__(self, session_id: str, language: str = "english"):
        self.session_id = session_id
        self.language = language
        self.created_at = datetime.now()
        self.last_frame = None
        self.last_frame_analysis = None
        self.messages = []  # Simple message history
        self.is_active = True
        
        logger.info(f"📱 Created live session: {session_id} | Language: {language}")
    
    def update_frame(self, frame_data: str):
        """Store the latest camera frame."""
        self.last_frame = frame_data
        logger.debug(f"🖼️  Frame updated for session {self.session_id}")
    
    def set_frame_analysis(self, analysis: dict):
        """Store frame analysis results."""
        self.last_frame_analysis = analysis
    
    def get_visual_context(self) -> str:
        """Get current visual context as text."""
        if not self.last_frame_analysis:
            return "No visual information available."
        
        analysis = self.last_frame_analysis
        context = f"Current view: {analysis.get('description', 'Unknown scene')}"
        
        if analysis.get('objects'):
            context += f"\nObjects detected: {', '.join(analysis['objects'][:5])}"
        
        if analysis.get('has_pest'):
            context += "\n⚠️ Possible pest or plant disease detected in view."
        
        return context


class LiveModeManager:
    """Manages all active live mode sessions."""
    
    def __init__(self):
        self.active_sessions: Dict[str, LiveSession] = {}
        self.active_connections: Dict[str, WebSocket] = {}
        self.ollama_service = OllamaService()
        self.hf_service = HuggingFaceService()
        
        # Store latest vision analysis per session
        self.latest_vision: Dict[str, Dict] = {}
        # Store latest generated TTS file path per session
        self.latest_audio: Dict[str, str] = {}
        
    logger.info("🎙️ Live Mode Manager initialized with 3-stage pest detection")
    
    async def connect(self, websocket: WebSocket, session_id: str, language: str = "english"):
        """Accept new WebSocket connection."""
        await websocket.accept()
        self.active_connections[session_id] = websocket
        self.active_sessions[session_id] = LiveSession(session_id, language)
        
        # Send welcome message
        await self.send_message(session_id, {
            "type": "connected",
            "message": "Live mode activated. I can see and hear you now!" if language == "english" 
                      else "लाइव मोड सक्रिय। अब मैं आपको देख और सुन सकता हूं!"
        })
        
        logger.info(f"✓ Connected: {session_id}")
    
    async def disconnect(self, session_id: str):
        """Handle disconnection."""
        if session_id in self.active_sessions:
            self.active_sessions[session_id].is_active = False
            del self.active_sessions[session_id]
        
        if session_id in self.active_connections:
            del self.active_connections[session_id]
        
        logger.info(f"🔌 Disconnected: {session_id}")
    
    async def send_message(self, session_id: str, data: dict):
        """Send message to client."""
        if session_id in self.active_connections:
            try:
                await self.active_connections[session_id].send_json(data)
            except Exception as e:
                logger.error(f"Error sending message: {e}")
    
    async def process_frame(self, session_id: str, frame_data: str):
        """
        STAGE 1: Process camera frame with lightweight vision analysis.
        Quick analysis (100ms) to determine if frame has relevant content.
        """
        try:
            session = self.active_sessions.get(session_id)
            if not session:
                return
            
            # Update frame in session
            session.update_frame(frame_data)
            
            # Decode base64 image
            try:
                # Remove data URL prefix if present
                if "," in frame_data:
                    frame_data = frame_data.split(",")[1]
                
                image_bytes = base64.b64decode(frame_data)
                
                # STAGE 1: Quick lightweight vision analysis (100ms)
                logger.info(f"🔍 STAGE 1: Quick vision analysis for {session_id}")
                vision_result = await vision_analyzer.quick_analyze(image_bytes)
                
                # Store latest analysis with timestamp
                self.latest_vision[session_id] = {
                    "vision_result": vision_result,
                    "image_bytes": image_bytes,
                    "timestamp": time.time()
                }
                
                # Update session context
                session.set_frame_analysis(vision_result)
                
                # Send acknowledgment to client
                await self.send_message(session_id, {
                    "type": "frame_processed",
                    "analysis": {
                        "description": vision_result["description"],
                        "has_relevant_content": vision_result["has_relevant_content"],
                        "confidence": vision_result["confidence"]
                    }
                })
                
                logger.info(
                    f"✅ STAGE 1 Complete: {vision_result['description']} "
                    f"(relevant: {vision_result['has_relevant_content']})"
                )
                
            except Exception as e:
                logger.error(f"❌ Error in frame analysis: {e}")
        
        except Exception as e:
            logger.error(f"❌ Error in process_frame: {e}")
    
    async def process_voice_input(self, session_id: str, transcript: str):
        """
        STAGE 2: Process voice input with smart pest detection triggering.
        Matches voice intent with vision to decide if heavy model is needed.
        """
        try:
            session = self.active_sessions.get(session_id)
            if not session:
                logger.warning(f"Session not found: {session_id}")
                return
            
            logger.info(f"🎤 Voice input: {session_id} | '{transcript}'")
            
            # Get latest vision analysis
            latest = self.latest_vision.get(session_id)
            
            if latest:
                vision_result = latest["vision_result"]
                
                # STAGE 2: Match voice intent with vision (50ms)
                logger.info(f"🎯 STAGE 2: Intent matching for '{transcript}'")
                intent_match = vision_analyzer.match_intent(
                    transcript, 
                    vision_result
                )
                
                logger.info(
                    f"✅ STAGE 2 Complete: Match score {intent_match['match_score']:.1%} "
                    f"({intent_match['reason']})"
                )
                
                # Should we call heavy pest detection?
                if intent_match["should_call_heavy_model"]:
                    # STAGE 3: Heavy pest detection (3-5 seconds)
                    await self._call_heavy_pest_detection(
                        session_id,
                        latest["image_bytes"],
                        transcript,
                        session.language
                    )
                    return  # Response sent in _call_heavy_pest_detection
            
            # Regular response without heavy detection
            await self._generate_regular_response(
                session_id,
                transcript,
                session.language
            )
            
        except Exception as e:
            logger.error(f"❌ Error processing voice input: {e}")
            await self.send_message(session_id, {
                "type": "error",
                "message": "Sorry, I encountered an error processing your request."
            })
    
    async def _call_heavy_pest_detection(
        self,
        session_id: str,
        image_bytes: bytes,
        user_query: str,
        language: str
    ):
        """
        STAGE 3: Call expensive HuggingFace pest detection model.
        Takes 3-5 seconds - notify user to wait.
        """
        session = self.active_sessions.get(session_id)
        
        if not session:
            return
        
        try:
            # Tell user to wait
            waiting_msg = (
                "🔬 Analyzing the pest, please wait a moment..." 
                if language == "english" 
                else "🔬 कीट का विश्लेषण कर रहे हैं, कृपया प्रतीक्षा करें..."
            )
            
            await self.send_message(session_id, {
                "type": "status",
                "message": waiting_msg,
                "is_analyzing": True
            })
            
            logger.info(f"🔬 STAGE 3: Calling heavy pest detection model...")
            
            # Save image to temporary file for HuggingFace API
            with tempfile.NamedTemporaryFile(suffix=".jpg", delete=False) as f:
                f.write(image_bytes)
                temp_path = f.name
            
            try:
                # Call HuggingFace pest detection (3-5 seconds)
                pest_result = await self.hf_service.analyze_image_heavy(temp_path)
                
                logger.info(
                    f"✅ STAGE 3 Complete: Detected {pest_result.get('pest_name', 'Unknown')} "
                    f"with {pest_result.get('confidence', 0):.1%} confidence"
                )
                
                # Build context with REAL pest detection data
                if pest_result and pest_result.get("pest_name") != "Error":
                    visual_context = f"""
⚠️ PEST IDENTIFIED: {pest_result['pest_name']}
Confidence: {pest_result['confidence']:.1%}
Severity: {pest_result.get('severity', 'unknown')}
Description: {pest_result.get('description', 'No description')}

The farmer is asking about this detected pest.
"""
                else:
                    visual_context = "Pest detection was attempted but no clear pest was identified in the image. Provide general pest management advice."
                
                # Generate AI response with real pest data
                system_prompt = (
                    "You are a helpful farming assistant specialized in pest detection and crop management. "
                    "You have access to pest detection results from the camera. "
                    "Provide clear, concise, and practical treatment advice based on the detected pest. "
                    "Respond in the same language as the user's query."
                )
                
                user_prompt = f"{visual_context}\n\nFarmer asks: {user_query}"
                
                # Add to message history
                session.messages.append({"role": "user", "content": user_prompt})
                
                # Get AI response
                messages = [{"role": "system", "content": system_prompt}]
                messages.extend(session.messages[-10:])
                
                response_text = await self.ollama_service.chat(messages)
                
                # Add response to history
                session.messages.append({"role": "assistant", "content": response_text})
                
                # Send response with pest detection data
                await self.send_message(session_id, {
                    "type": "response",
                    "text": response_text,
                    "pest_detection": pest_result  # Include pest data
                })
                
                logger.info(f"🤖 AI Response with pest data: '{response_text[:100]}...'")
                
                # Generate and send TTS
                await self._generate_and_send_tts(
                    session_id,
                    response_text,
                    language
                )
                
            finally:
                # Cleanup temporary file
                try:
                    os_module.unlink(temp_path)
                except:
                    pass
            
        except Exception as e:
            logger.error(f"❌ Heavy pest detection error: {e}")
            
            # Send error response with pest_detection showing the error
            error_pest_result = {
                "pest_name": "Configuration Error",
                "confidence": 0.0,
                "severity": "Unknown",
                "description": str(e)
            }
            
            error_msg = (
                "⚠️ Pest detection model is not configured yet. "
                "To enable pest detection, please deploy an IP102 pest detection model to HuggingFace Spaces "
                "and update the HF_MODEL_ID in your .env file.\n\n"
                "For now, I can provide general pest management advice based on your description."
            )
            
            await self.send_message(session_id, {
                "type": "response",
                "text": error_msg,
                "pest_detection": error_pest_result,
                "is_analyzing": False
            })
            
            # Generate TTS for the error message
            await self._generate_and_send_tts(
                session_id,
                error_msg,
                language
            )
    
    async def _generate_regular_response(
        self,
        session_id: str,
        user_query: str,
        language: str
    ):
        """Generate response without heavy pest detection (fast path)."""
        session = self.active_sessions.get(session_id)
        
        if not session:
            return
        
        try:
            # Get lightweight vision context
            latest = self.latest_vision.get(session_id)
            visual_context = ""
            
            if latest:
                visual_context = latest["vision_result"]["description"]
            else:
                visual_context = "No visual information available"
            
            # Build prompt
            system_prompt = (
                "You are a helpful farming assistant specialized in pest detection and crop management. "
                "Provide clear, concise, and practical advice. "
                "Respond in the same language as the user's query."
            )
            
            user_prompt = f"Visual context: {visual_context}\n\nFarmer asks: {user_query}"
            
            # Add to message history
            session.messages.append({"role": "user", "content": user_prompt})
            
            # Get AI response
            messages = [{"role": "system", "content": system_prompt}]
            messages.extend(session.messages[-10:])
            
            response_text = await self.ollama_service.chat(messages)
            
            # Add response to history
            session.messages.append({"role": "assistant", "content": response_text})
            
            # Send response
            await self.send_message(session_id, {
                "type": "response",
                "text": response_text
            })
            
            logger.info(f"🤖 Regular response: '{response_text[:100]}...'")
            
            # Generate and send TTS
            await self._generate_and_send_tts(
                session_id,
                response_text,
                language
            )
            
        except Exception as e:
            logger.error(f"❌ Response generation error: {e}")
            await self.send_message(session_id, {
                "type": "error",
                "message": "Sorry, I encountered an error generating a response."
            })
    
    async def _generate_and_send_tts(
        self,
        session_id: str,
        text: str,
        language: str
    ):
        """Generate TTS and send to client."""
        try:
            # Clean text for TTS (remove markdown formatting)
            tts_text = text.replace('*', '').replace('_', '').replace('#', '').strip()
            
            # Generate TTS audio
            lang_code = "hi" if language == "hindi" else "en"
            audio_bytes = await edge_tts_service.text_to_speech(
                tts_text,
                language=lang_code,
                gender="female"
            )
            
            # Log a short header of the audio bytes for debugging (first 16 bytes hex)
            try:
                header = audio_bytes[:16]
                header_hex = ' '.join(f"{b:02x}" for b in header)
            except Exception:
                header_hex = ""

            logger.info(f"🔊 TTS generated for session={session_id} | size={len(audio_bytes):,} bytes | header={header_hex}")

            # Save audio to a temporary file and register it for the session so the client can fetch via HTTP
            try:
                with tempfile.NamedTemporaryFile(delete=False, suffix='.mp3') as tf:
                    tf.write(audio_bytes)
                    tf_path = tf.name
                self.latest_audio[session_id] = tf_path
                tts_url = f"/api/live/tts/{session_id}?v={int(time.time())}"

                # Send a small message with the URL to fetch audio (avoids sending large base64 via websocket)
                await self.send_message(session_id, {
                    "type": "tts_audio",
                    "tts_url": tts_url,
                    "mime": "audio/mpeg",
                    "size": len(audio_bytes)
                })

                logger.info(f"🔊 TTS saved and URL sent: {session_id} | {len(audio_bytes):,} bytes | url={tts_url}")
            except Exception as e:
                logger.error(f"❌ Failed to save/send TTS file: {e}")
                # Fallback: still send base64 if file save failed
                try:
                    audio_base64 = base64.b64encode(audio_bytes).decode('utf-8')
                    await self.send_message(session_id, {
                        "type": "tts_audio",
                        "audio": audio_base64,
                        "mime": "audio/mpeg",
                        "size": len(audio_bytes)
                    })
                    logger.info(f"🔊 TTS sent as base64 fallback: {session_id} | {len(audio_bytes):,} bytes")
                except Exception as e2:
                    logger.error(f"❌ Failed fallback base64 send for TTS: {e2}")
            
        except Exception as e:
            logger.error(f"❌ TTS generation error: {e}")
            # Send text-only response as fallback when TTS fails
            await self.send_message(session_id, {
                "type": "text_only",
                "text": text,
                "error": "TTS temporarily unavailable - showing text only"
            })
            logger.warning(f"⚠️ Sent text-only fallback due to TTS error")
    
    async def handle_interruption(self, session_id: str):
        """Handle user interruption (stop TTS playback)."""
        logger.info(f"⏸️  Interruption detected: {session_id}")
        
        await self.send_message(session_id, {
            "type": "stop_tts",
            "message": "Listening..."
        })
    
    def get_session_info(self, session_id: str) -> Optional[dict]:
        """Get session information."""
        session = self.active_sessions.get(session_id)
        if not session:
            return None
        
        return {
            "session_id": session.session_id,
            "language": session.language,
            "created_at": session.created_at.isoformat(),
            "is_active": session.is_active,
            "has_frame": session.last_frame is not None,
            "message_count": len(session.messages)
        }


# Singleton manager
live_manager = LiveModeManager()


@router.websocket("/ws/live/{session_id}")
async def websocket_live_endpoint(websocket: WebSocket, session_id: str):
    """
    WebSocket endpoint for live mode.
    
    Message Types (Client → Server):
    - {"type": "init", "language": "english|hindi"} - Initialize session
    - {"type": "frame", "data": "base64_image"} - Send camera frame
    - {"type": "voice", "transcript": "user speech"} - Send voice input
    - {"type": "interrupt"} - User interrupted TTS
    - {"type": "ping"} - Heartbeat
    
    Message Types (Server → Client):
    - {"type": "connected"} - Connection established
    - {"type": "frame_processed", "analysis": {...}} - Frame analyzed
    - {"type": "ai_response", "text": "...", "has_audio": true} - AI text response
    - {"type": "tts_audio", "audio": "base64_mp3"} - TTS audio
    - {"type": "stop_tts"} - Stop current TTS playback
    - {"type": "error", "message": "..."} - Error occurred
    """
    
    await websocket.accept()
    logger.info(f"🔌 WebSocket accepted: {session_id}")
    
    language = "english"  # Default
    session_initialized = False
    
    try:
        # Main message loop
        while True:
            data = await websocket.receive_json()
            message_type = data.get("type")
            
            if message_type == "init":
                # Initialize session
                language = data.get("language", "english")
                live_manager.active_connections[session_id] = websocket
                live_manager.active_sessions[session_id] = LiveSession(session_id, language)
                session_initialized = True
                
                # Send welcome message
                await websocket.send_json({
                    "type": "welcome",  # Frontend expects "welcome"
                    "message": "Live mode activated. I can see and hear you now!" if language == "english" 
                              else "लाइव मोड सक्रिय। अब मैं आपको देख और सुन सकता हूं!"
                })
                logger.info(f"✓ Session initialized: {session_id} | Language: {language}")
            
            elif not session_initialized:
                # Must initialize first
                await websocket.send_json({
                    "type": "error",
                    "message": "Session not initialized. Send init message first."
                })
                continue
            
            elif message_type == "frame":
                # Process camera frame
                image_data = data.get("image", data.get("data", ""))
                if image_data:
                    await live_manager.process_frame(session_id, image_data)
                else:
                    logger.warning(f"No image data in frame message from {session_id}")
            
            elif message_type == "voice":
                # Process voice input (accept both 'text' and 'transcript')
                transcript = data.get("text", data.get("transcript", ""))
                if transcript.strip():
                    logger.info(f"🎤 Processing voice: '{transcript}'")
                    await live_manager.process_voice_input(session_id, transcript)
                else:
                    logger.warning(f"Empty voice input from {session_id}")
            
            elif message_type == "interrupt":
                # Handle interruption
                await live_manager.handle_interruption(session_id)
            
            elif message_type == "ping":
                # Heartbeat response
                await websocket.send_json({"type": "pong"})
            
            else:
                logger.warning(f"Unknown message type: {message_type}")
    
    except WebSocketDisconnect:
        logger.info(f"🔌 WebSocket disconnected: {session_id}")
        await live_manager.disconnect(session_id)
    
    except Exception as e:
        logger.error(f"❌ WebSocket error: {e}")
        await live_manager.disconnect(session_id)


@router.get("/live/status")
async def live_status():
    """Get live mode service status."""
    return {
        "service": "Live Mode",
        "status": "active",
        "active_sessions": len(live_manager.active_sessions),
        "tts_service": "Edge TTS (FREE)",
        "stt_service": "Browser (Web Speech API)",
        "uptime": "running"
    }


@router.get("/live/sessions")
async def list_live_sessions():
    """List all active live sessions."""
    sessions = []
    for session_id in live_manager.active_sessions.keys():
        info = live_manager.get_session_info(session_id)
        if info:
            sessions.append(info)
    
    return {
        "total": len(sessions),
        "sessions": sessions
    }


@router.get('/live/tts/{session_id}')
async def serve_tts(session_id: str):
    """Serve the latest generated TTS audio file for a session.

    The frontend should request this URL when it receives a `tts_audio` message
    with a `tts_url` field.
    """
    try:
        logger.info(f"Serving TTS for session: {session_id}")
        path = live_manager.latest_audio.get(session_id)
        logger.info(f"Lookup TTS path: {path}")
        if not path:
            logger.warning(f"No TTS path registered for session: {session_id}")
            return JSONResponse(status_code=404, content={"error": "No audio available"})

        if not os_module.path.exists(path):
            logger.warning(f"TTS file not found on disk for session: {session_id} path={path}")
            return JSONResponse(status_code=404, content={"error": "No audio file found"})

        logger.info(f"Serving TTS file for session {session_id}: {path}")
        return FileResponse(path, media_type='audio/mpeg', filename=f"{session_id}.mp3")
    except Exception as e:
        logger.error(f"Error serving TTS for session {session_id}: {e}")
        return JSONResponse(status_code=500, content={"error": "Internal error"})

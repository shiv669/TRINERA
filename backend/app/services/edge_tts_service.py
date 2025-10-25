"""
Edge TTS Service - FREE Text-to-Speech using Microsoft Edge
No API key required, unlimited usage!
"""

import edge_tts
import asyncio
from pathlib import Path
import tempfile
import logging
from typing import Optional, Literal
import os
import time

logger = logging.getLogger(__name__)

class EdgeTTSService:
    """
    Free TTS service using Microsoft Edge TTS.
    No API key required, unlimited usage.
    
    Voices:
    - English (Indian): en-IN-NeerjaNeural (Female), en-IN-PrabhatNeural (Male)
    - Hindi: hi-IN-SwaraNeural (Female), hi-IN-MadhurNeural (Male)
    """
    
    def __init__(self):
        self.voices = {
            "en": "en-IN-NeerjaNeural",     # Indian English Female (Default)
            "en-male": "en-IN-PrabhatNeural", # Indian English Male
            "hi": "hi-IN-SwaraNeural",      # Hindi Female (Default)
            "hi-male": "hi-IN-MadhurNeural"  # Hindi Male
        }
        self.max_retries = 3
        self.retry_delay = 1.0  # seconds
        logger.info("✓ Edge TTS Service initialized (FREE - No API key required)")
    
    async def text_to_speech(
        self, 
        text: str, 
        language: Literal["en", "hi"] = "en",
        gender: Literal["female", "male"] = "female"
    ) -> bytes:
        """
        Convert text to speech using Edge TTS with retry logic.
        
        Args:
            text: Text to convert to speech
            language: 'en' for English or 'hi' for Hindi
            gender: 'female' or 'male' voice
        
        Returns:
            Audio bytes (MP3 format)
        
        Example:
            audio = await edge_tts_service.text_to_speech(
                "Hello farmer!",
                language="en",
                gender="female"
            )
        """
        # Try with retries
        for attempt in range(self.max_retries):
            try:
                # Select voice based on language and gender
                voice_key = language
                if gender == "male":
                    voice_key = f"{language}-male"
                
                voice = self.voices.get(voice_key, self.voices["en"])
                
                if attempt > 0:
                    logger.info(f"🔄 Retry attempt {attempt + 1}/{self.max_retries}")
                    await asyncio.sleep(self.retry_delay * (attempt + 1))  # Exponential backoff
                
                logger.info(f"🎤 Converting to speech: '{text[:50]}...' | Voice: {voice}")
                
                # Create temporary file for audio
                with tempfile.NamedTemporaryFile(suffix=".mp3", delete=False) as temp_file:
                    temp_path = temp_file.name
                
                # Generate speech using Edge TTS
                communicate = edge_tts.Communicate(text, voice)
                await communicate.save(temp_path)
                
                # Read audio bytes
                with open(temp_path, "rb") as f:
                    audio_bytes = f.read()
                
                # Cleanup temporary file
                try:
                    Path(temp_path).unlink()
                except:
                    pass
                
                logger.info(f"✓ TTS generated: {len(audio_bytes):,} bytes")
                return audio_bytes
                
            except Exception as e:
                error_msg = str(e)
                logger.error(f"❌ Error in Edge TTS (attempt {attempt + 1}): {error_msg}")
                
                # If it's a 403 error and we have retries left, continue
                if "403" in error_msg and attempt < self.max_retries - 1:
                    logger.warning(f"⚠️ 403 error - Will retry in {self.retry_delay * (attempt + 1)}s")
                    continue
                
                # If we've exhausted retries or it's a different error, raise
                if attempt == self.max_retries - 1:
                    logger.error(f"❌ All {self.max_retries} retry attempts failed")
                raise
    
    async def text_to_speech_stream(
        self, 
        text: str, 
        language: Literal["en", "hi"] = "en",
        gender: Literal["female", "male"] = "female"
    ):
        """
        Stream TTS audio in chunks for real-time playback.
        
        Args:
            text: Text to convert
            language: 'en' or 'hi'
            gender: 'female' or 'male'
        
        Yields:
            Audio chunks (bytes)
        """
        try:
            voice_key = language
            if gender == "male":
                voice_key = f"{language}-male"
            
            voice = self.voices.get(voice_key, self.voices["en"])
            
            logger.info(f"🎤 Streaming TTS: '{text[:50]}...' | Voice: {voice}")
            
            communicate = edge_tts.Communicate(text, voice)
            
            async for chunk in communicate.stream():
                if chunk["type"] == "audio":
                    yield chunk["data"]
            
            logger.info("✓ TTS streaming complete")
            
        except Exception as e:
            logger.error(f"❌ Error in Edge TTS streaming: {e}")
            raise
    
    async def get_available_voices(self, language_filter: Optional[str] = None) -> list:
        """
        Get list of available voices from Edge TTS.
        
        Args:
            language_filter: Optional filter like 'hi-IN' or 'en-IN'
        
        Returns:
            List of voice dictionaries
        """
        try:
            voices = await edge_tts.list_voices()
            
            if language_filter:
                voices = [v for v in voices if v["Locale"].startswith(language_filter)]
            
            return voices
            
        except Exception as e:
            logger.error(f"❌ Error fetching voices: {e}")
            return []
    
    def get_voice_name(self, language: str, gender: str = "female") -> str:
        """
        Get voice name for given language and gender.
        
        Args:
            language: 'en' or 'hi'
            gender: 'female' or 'male'
        
        Returns:
            Voice name string
        """
        voice_key = language
        if gender == "male":
            voice_key = f"{language}-male"
        return self.voices.get(voice_key, self.voices["en"])
    
    async def save_audio_file(
        self,
        text: str,
        output_path: str,
        language: Literal["en", "hi"] = "en",
        gender: Literal["female", "male"] = "female"
    ) -> str:
        """
        Save TTS audio to a file.
        
        Args:
            text: Text to convert
            output_path: Path to save audio file
            language: 'en' or 'hi'
            gender: 'female' or 'male'
        
        Returns:
            Path to saved file
        """
        try:
            voice_key = language
            if gender == "male":
                voice_key = f"{language}-male"
            
            voice = self.voices.get(voice_key, self.voices["en"])
            
            # Ensure directory exists
            Path(output_path).parent.mkdir(parents=True, exist_ok=True)
            
            # Generate and save
            communicate = edge_tts.Communicate(text, voice)
            await communicate.save(output_path)
            
            logger.info(f"✓ Audio saved to: {output_path}")
            return output_path
            
        except Exception as e:
            logger.error(f"❌ Error saving audio: {e}")
            raise


# Singleton instance
edge_tts_service = EdgeTTSService()


# Test function
async def test_edge_tts():
    """Test Edge TTS service with English and Hindi."""
    print("\n" + "="*60)
    print("🎤 Testing Edge TTS Service")
    print("="*60 + "\n")
    
    # Test English
    print("1️⃣  Testing English (Female)...")
    audio_en = await edge_tts_service.text_to_speech(
        "Hello farmer! I can help you identify pests in your crops. Let me know how I can assist you today.",
        language="en",
        gender="female"
    )
    print(f"   ✓ Generated: {len(audio_en):,} bytes\n")
    
    # Test Hindi
    print("2️⃣  Testing Hindi (Female)...")
    audio_hi = await edge_tts_service.text_to_speech(
        "नमस्ते किसान भाई! मैं आपकी फसल में कीटों की पहचान करने में मदद कर सकता हूं। आज मैं आपकी कैसे मदद कर सकता हूं?",
        language="hi",
        gender="female"
    )
    print(f"   ✓ Generated: {len(audio_hi):,} bytes\n")
    
    # Test Male voices
    print("3️⃣  Testing English (Male)...")
    audio_en_male = await edge_tts_service.text_to_speech(
        "This is a test of the male English voice.",
        language="en",
        gender="male"
    )
    print(f"   ✓ Generated: {len(audio_en_male):,} bytes\n")
    
    # Save test files
    print("4️⃣  Saving test audio files...")
    with open("test_english.mp3", "wb") as f:
        f.write(audio_en)
    print("   ✓ Saved: test_english.mp3")
    
    with open("test_hindi.mp3", "wb") as f:
        f.write(audio_hi)
    print("   ✓ Saved: test_hindi.mp3")
    
    with open("test_english_male.mp3", "wb") as f:
        f.write(audio_en_male)
    print("   ✓ Saved: test_english_male.mp3")
    
    print("\n" + "="*60)
    print("✅ All tests passed! Play the MP3 files to hear the voices.")
    print("="*60 + "\n")


if __name__ == "__main__":
    # Run tests
    asyncio.run(test_edge_tts())

"""
Context management for building LLM prompts with relevant information
Uses Hybrid approach: Sliding Window + RAG
"""

import logging
from typing import List, Dict, Optional
from app.services.session_manager import Session
from app.utils.pest_info import get_pest_info

logger = logging.getLogger(__name__)


class HybridContextManager:
    """Manages conversation context using sliding window + pest knowledge"""
    
    def __init__(self, max_history: int = 8, max_tokens: int = 6000):
        self.max_history = max_history
        self.max_tokens = max_tokens
        logger.info(f"Initialized context manager: max_history={max_history}, max_tokens={max_tokens}")
    
    async def build_context(
        self,
        user_message: str,
        session: Session
    ) -> List[Dict[str, str]]:
        """
        Build conversation context with system prompt + pest info + history
        
        Args:
            user_message: Current user question
            session: Current session with history and detected pests
        
        Returns:
            List of messages ready for LLM API
        """
        # 1. Build system prompt
        system_prompt = self._get_system_prompt(session)
        
        # 2. Get pest-specific knowledge (RAG component)
        pest_context = await self._get_pest_context(session, user_message)
        
        # Combine system prompt with pest context
        full_system_prompt = f"{system_prompt}\n\n{pest_context}" if pest_context else system_prompt
        
        # 3. Get recent conversation history (Sliding window component)
        recent_messages = session.messages[-self.max_history:] if session.messages else []
        
        # 4. Build final message list
        messages = [
            {"role": "system", "content": full_system_prompt}
        ]
        
        # Add recent conversation
        for msg in recent_messages:
            messages.append({
                "role": msg["role"],
                "content": msg["content"]
            })
        
        # Add current user message
        messages.append({
            "role": "user",
            "content": user_message
        })
        
        logger.info(f"Built context with {len(messages)} messages for session {session.id}")
        return messages
    
    def _get_system_prompt(self, session: Session) -> str:
        """Build system prompt based on session context"""
        
        language = session.language.lower()
        
        if language == "hindi":
            base_prompt = """आप एक कृषि विशेषज्ञ AI सहायक हैं जो भारतीय किसानों के लिए कीट प्रबंधन में विशेषज्ञता रखते हैं।

आपकी भूमिका:
- कीट नियंत्रण और रोकथाम के लिए व्यावहारिक, कार्यान्वयन योग्य सलाह प्रदान करें
- सरल, किसान-अनुकूल भाषा में समाधान समझाएं
- लागत-प्रभावशीलता और स्थानीय उपलब्धता पर विचार करें
- उपयुक्त होने पर जैविक और रासायनिक दोनों विधियों का सुझाव दें
- किसान सुरक्षा और पर्यावरणीय स्थिरता को प्राथमिकता दें

दिशानिर्देश:
- संक्षिप्त लेकिन पूर्ण रहें (2-4 पैराग्राफ)
- कार्रवाई आइटम के लिए बुलेट पॉइंट का उपयोग करें
- तत्काल स्थितियों के लिए तात्कालिक कार्रवाइयों को प्राथमिकता दें
- पारंपरिक ज्ञान और आधुनिक तकनीकों दोनों को शामिल करें
- जब विशेषज्ञ मदद लेनी हो तो उल्लेख करें

**महत्वपूर्ण**: सभी उत्तर हिंदी (देवनागरी लिपि) में दें। सरल हिंदी शब्दों का उपयोग करें जो किसान समझ सकें।"""
        else:
            base_prompt = """You are an expert agricultural AI assistant specializing in pest management for Indian farmers.

Your Role:
- Provide practical, actionable advice for pest control and prevention
- Explain solutions in simple, farmer-friendly language
- Consider cost-effectiveness and local availability
- Suggest both organic and chemical methods when appropriate
- Prioritize farmer safety and environmental sustainability

Your Capabilities:
1. Analyze pest detection results from computer vision
2. Recommend specific treatment strategies
3. Explain pest life cycles and behavior
4. Suggest prevention techniques
5. Provide seasonal farming advice
6. Consider regional climate factors

Guidelines:
- Be concise but thorough (2-4 paragraphs)
- Use bullet points for action items
- Prioritize immediate actions for urgent situations
- Include both traditional knowledge and modern techniques
- Mention when to seek expert help
- Avoid overly technical jargon

**IMPORTANT**: Respond in clear, simple English that farmers can understand."""

        # Add detected pests context
        if session.detected_pests:
            if language == "hindi":
                base_prompt += f"\n\nवर्तमान में पता लगाए गए कीट: {', '.join(session.detected_pests)}"
            else:
                base_prompt += f"\n\nCurrently Detected Pests: {', '.join(session.detected_pests)}"
        
        # Add crop context if available
        if session.crop_type:
            if language == "hindi":
                base_prompt += f"\nफसल का प्रकार: {session.crop_type}"
            else:
                base_prompt += f"\nCrop Type: {session.crop_type}"
        
        # Add region context if available
        if session.region:
            if language == "hindi":
                base_prompt += f"\nक्षेत्र: {session.region}"
            else:
                base_prompt += f"\nRegion: {session.region}"
        
        return base_prompt
    
    async def _get_pest_context(self, session: Session, user_question: str) -> str:
        """
        Retrieve relevant pest information (RAG component)
        
        For MVP: Uses pest_info.py database
        For Production: Can integrate with vector database
        """
        if not session.detected_pests and not session.latest_pest_info:
            return ""
        
        pest_details = []
        
        # If we have latest pest detection info, use it
        if session.latest_pest_info:
            info = session.latest_pest_info
            context = f"""
**Recently Detected Pest Information:**
Pest: {info.get('label', 'Unknown')}
Confidence: {info.get('confidence', 0) * 100:.1f}%
Scientific Name: {info.get('scientific_name', 'N/A')}
Severity: {info.get('severity', 'unknown')}
Affected Crops: {', '.join(info.get('affected_crops', []))}
Description: {info.get('description', 'No description available')}
Spread Method: {info.get('spread_method', 'Unknown')}
Known Precautions: {', '.join(info.get('precautions', [])[:3])}
"""
            pest_details.append(context.strip())
        
        # Also get info for all detected pests
        for pest_name in session.detected_pests:
            try:
                # Get pest info from database
                info = get_pest_info(pest_name, "english")
                
                # Format pest information
                context = f"""
**{pest_name.title()}** ({info.get('scientific_name', 'N/A')}):
- Severity: {info.get('severity', 'unknown')}
- Affected Crops: {', '.join(info.get('affected_crops', []))}
- Description: {info.get('description', 'No description available')}
- Spread Method: {info.get('spread_method', 'Unknown')}
- Key Precautions: {', '.join(info.get('precautions', [])[:3])}
"""
                pest_details.append(context.strip())
                
            except Exception as e:
                logger.error(f"Error retrieving info for pest '{pest_name}': {e}")
        
        if pest_details:
            header = "=== PEST KNOWLEDGE BASE ===\nUse this information to provide specific, accurate advice:\n\n"
            return header + "\n\n".join(pest_details)
        
        return ""
    
    def estimate_tokens(self, messages: List[Dict[str, str]]) -> int:
        """
        Rough token estimation (1 token ≈ 4 characters)
        For production, use tiktoken library
        """
        total_chars = sum(len(msg["content"]) for msg in messages)
        return total_chars // 4


# Singleton instance
context_manager = HybridContextManager()

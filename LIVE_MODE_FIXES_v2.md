# Live Mode Fixes - Pest Detection & TTS Issues

## Issues Fixed

### 1. Pest Detection Not Working
**Problem:** 
- When saying "identify the pest", the analyzing popup appeared briefly but returned:
  - `🐛 Pest Detected: Error`
  - `Confidence: 0.0%`
  - `Severity: Unknown`
- The frame wasn't being sent to HuggingFace model

**Root Cause:**
- The code was checking if `space_name == "S1-1IVAM/trinera-pest-detector"` and throwing an error before even attempting to call the API
- This early return prevented the actual API call from happening

**Fix Applied:**
- Removed the blocking check that prevented API calls
- Changed the logic to only check if `space_name` is empty (not configured)
- Added detailed logging before and after the API call to track:
  - Image file path and size
  - Gradio client connection
  - API endpoint call
  - Response parsing
- Improved error messages to be more specific:
  - "Gradio Space is not responding" for JSON errors
  - "Cannot connect to Gradio Space" for connection errors
  - "Gradio Space not found" for 404 errors
- Changed error pest name from "Error" to "Detection Error" with detailed description

**Files Modified:**
- `backend/app/services/huggingface.py`

### 2. TTS Audio Not Playing
**Problem:**
- TTS response was generated but audio wasn't playing
- Frontend couldn't fetch the audio file

**Root Cause:**
- Backend was sending a relative URL: `/api/live/tts/{session_id}`
- Frontend (running on localhost:3000) couldn't fetch from a relative URL when WebSocket connects to localhost:8000
- Missing CORS headers or incorrect URL resolution

**Fix Applied:**
- Changed TTS URL from relative to absolute: `http://localhost:8000/api/live/tts/{session_id}`
- Added comprehensive logging to frontend audio playback:
  - Log when `playUrl()` is called with the URL
  - Log audio loading states (loadstart, canplay)
  - Log audio errors with detailed error object
  - Log when playback actually starts
  - Log blob creation for base64 audio
- Added error handlers for audio element events
- Set `preload='auto'` and `crossOrigin='anonymous'` on Audio elements

**Files Modified:**
- `backend/app/routes/live_mode.py` - Changed URL to absolute
- `src/hooks/useLiveMode.ts` - Added detailed logging and error handling

## How to Test

### 1. Start Backend
```powershell
cd backend
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 2. Start Frontend
```powershell
cd ..
npm run dev
```

### 3. Test Pest Detection
1. Open http://localhost:3000/interbot/live
2. Click "Connect" and allow camera/microphone
3. Point camera at a pest or crop image
4. Say "identify the pest" or "what pest is this?"
5. Watch the console logs for:
   - `🔬 STAGE 3: Calling heavy pest detection model...`
   - `📸 Image file: ... (bytes)`
   - `🔌 Calling Gradio API /predict endpoint`
   - `✅ Gradio API call completed`
   - `📊 Heavy detection result: ...`
6. The response should show actual pest detection data or a specific error message

### 4. Test TTS Audio
1. After asking any question, watch console logs:
   - Backend should log: `🔊 TTS generated for session=... | size=... bytes`
   - Backend should log: `🔊 TTS saved and URL sent: ... | url=http://localhost:8000/api/live/tts/...`
   - Frontend should log: `🔊 playUrl called with: http://localhost:8000/api/live/tts/...`
   - Frontend should log: `🔊 Audio loading started for URL: ...`
   - Frontend should log: `🔊 Audio can play (buffered enough)`
   - Frontend should log: `🔊 Playing TTS (url) - playback started`
2. Audio should play through speakers

## Debug Console Logs

### Expected Backend Logs (Pest Detection)
```
🔬 STAGE 3: Calling heavy pest detection model...
Using HuggingFace Space: S1-1IVAM/trinera-pest-detector
Creating new Gradio client instance for: S1-1IVAM/trinera-pest-detector
✅ Successfully created Gradio Client
📸 Image file: C:\Users\...\tmpxxx.jpg (45,234 bytes)
🔌 Calling Gradio API /predict endpoint on S1-1IVAM/trinera-pest-detector
✅ Gradio API call completed
📊 Heavy detection result: {'label': 'Aphids', 'confidence': 0.87}
✅ Heavy detection complete: Aphids (87.0% confidence, severity: High)
```

### Expected Backend Logs (TTS)
```
🔊 TTS generated for session=abc123 | size=24,567 bytes | header=49 44 33 04 00 00 ...
🔊 TTS saved and URL sent: abc123 | 24,567 bytes | url=http://localhost:8000/api/live/tts/abc123?v=1699999999
```

### Expected Frontend Logs (TTS)
```
🔊 playUrl called with: http://localhost:8000/api/live/tts/abc123?v=1699999999
🔊 Calling audio.load()
🔊 Audio loading started for URL: http://localhost:8000/api/live/tts/abc123?v=1699999999
🔊 Attempting to play audio from URL...
🔊 Audio can play (buffered enough)
🔊 Playing TTS (url) - playback started
🔊 TTS finished (url)
```

## Troubleshooting

### If Pest Detection Still Shows "Detection Error"
1. Check backend console for the specific error message
2. Verify HuggingFace Space is running: https://huggingface.co/spaces/S1-1IVAM/trinera-pest-detector
3. If Space is sleeping, visit the URL to wake it up
4. Check if HF_TOKEN in `.env` is valid (get new token from https://huggingface.co/settings/tokens)
5. Try without HF_TOKEN (comment it out) if Space is public

### If TTS Still Not Playing
1. Check browser console for audio errors
2. Look for CORS errors or 404 errors when fetching audio URL
3. Verify backend is serving at `http://localhost:8000`
4. Check if `/api/live/tts/{session_id}` endpoint returns audio file
5. Try opening the TTS URL directly in browser: `http://localhost:8000/api/live/tts/{your_session_id}`
6. Check browser autoplay policies - click "Connect" or "Start Listening" first to provide user gesture

### Common Browser Autoplay Issues
- Chrome/Edge: Requires user gesture before playing audio
- Safari: Very strict autoplay policies
- Firefox: Usually more permissive

**Solution:** Make sure user clicks a button (Connect, Start Listening) before expecting audio to play.

## Additional Improvements Made

1. **Better Error Messages**: Specific error messages for different failure modes
2. **Comprehensive Logging**: Every step of pest detection and TTS playback is logged
3. **Error Recovery**: Fallback to base64 audio if URL serving fails
4. **Audio Element Configuration**: Set proper preload and CORS attributes
5. **WebAudio Fallback**: If HTMLAudioElement fails, tries WebAudio API

## Files Changed

```
backend/app/services/huggingface.py
backend/app/routes/live_mode.py
src/hooks/useLiveMode.ts
```

## Next Steps

1. Test on actual mobile device (not just desktop browser)
2. If Gradio Space is slow/sleeping, consider:
   - Upgrading to persistent hardware on HuggingFace
   - Self-hosting the model on your own server
   - Using a different pest detection API
3. Consider adding a "Test Audio" button to help users troubleshoot
4. Add visual indicator when audio is playing (pulsing icon, etc.)

## Notes

- The fixes preserve backward compatibility with base64 audio (fallback)
- Both URL-based and base64-based TTS delivery work now
- Error messages are user-friendly and actionable
- All critical paths have logging for debugging

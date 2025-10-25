# Live Mode TTS and Speech Recognition Issues - Solutions

## Issues Identified

### 1. Mobile - Speech Recognition Not Working
**Problem**: Speech recognition not detecting voice input on mobile devices
**Root Causes**:
- Mobile browsers (especially iOS Safari) require user gesture to enable microphone
- Speech Recognition API may not be supported on some mobile browsers
- Permissions may not be properly requested

### 2. Laptop - TTS Audio Not Playing  
**Problem**: Text-to-Speech audio received but not playing
**Root Cause**:
- **Browser autoplay policy** blocks audio from playing without user interaction
- `AudioContext` starts in "suspended" state until user interacts with page
- The code does resume AudioContext, but timing might be off

## Solutions

### Fix 1: Add User Interaction to Unlock Audio (Both Issues)

**Problem**: Browsers block audio playback until user interacts with the page

**Solution**: Add a "Start Session" button that users must click before live mode activates. This user gesture will:
1. Unlock AudioContext for audio playback
2. Request microphone permissions
3. Start speech recognition

**Implementation**: Add an initial screen with "Start Live Mode" button that triggers all initialization.

### Fix 2: Improve Mobile Speech Recognition

**Problem**: Mobile browsers have limited speech recognition support

**Current Detection**:
```tsx
if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
  console.error("Speech recognition not supported")
  return
}
```

**Enhanced Solution**:
1. Check for mobile browser and show appropriate message
2. Use Media Recorder API as fallback for mobile (send audio to backend)
3. Add better error handling and user feedback

### Fix 3: Ensure AudioContext is Ready Before Playing

**Current Code**:
```tsx
if (audioContext.state === 'suspended') {
  await audioContext.resume()
  console.log("🔊 AudioContext resumed")
}
```

**Issue**: Sometimes AudioContext.resume() needs to be called from a user gesture

**Enhanced Solution**:
```tsx
// In the toggleMicrophone function (which IS a user gesture):
const unlockAudio = async () => {
  if (audioContextRef.current?.state === 'suspended') {
    await audioContextRef.current.resume()
    console.log("🔊 AudioContext unlocked via user gesture")
  }
}

// Call this when user enables mic (user gesture)
await unlockAudio()
```

## Recommended Changes

### Change 1: Add Audio Unlock on Mic Toggle

In `toggleMicrophone()` function, add:

```tsx
const toggleMicrophone = async () => {  // Make it async
  if (isMicOn) {
    // Turn off mic
    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }
    setIsMicOn(false)
    setIsListening(false)
  } else {
    // Turn on mic - THIS IS A USER GESTURE
    
    // UNLOCK AUDIOCONTEXT HERE
    if (audioContextRef.current?.state === 'suspended') {
      try {
        await audioContextRef.current.resume()
        console.log("🔊 AudioContext unlocked!")
      } catch (e) {
        console.error("Failed to unlock AudioContext:", e)
      }
    }
    
    setIsMicOn(true)
    initializeSpeechRecognition()
  }
}
```

### Change 2: Better Mobile Detection and Fallback

Add this helper function:

```tsx
const isMobileDevice = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
}

const initializeSpeechRecognition = useCallback(() => {
  // Check if mobile
  if (isMobileDevice()) {
    console.log("📱 Mobile device detected")
    
    // Check for speech recognition support
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert("Speech recognition is not supported on this mobile browser. Please use Chrome or Safari on desktop, or try the regular chat mode.")
      setIsMicOn(false)
      return
    }
  }
  
  // ... rest of the code
})
```

### Change 3: Add Visual Feedback

Add toast/notification when:
1. AudioContext is unlocked: "✅ Audio enabled"
2. Speech recognition starts: "🎤 Listening..."
3. TTS starts playing: "🔊 Speaking..."
4. No speech detected: "No speech detected, please try again"

## Testing Steps

### For Mobile:
1. Open live mode on mobile
2. Click microphone button (user gesture)
3. Grant microphone permission
4. Speak clearly
5. Check browser console for errors
6. Verify speech recognition events are firing

### For Laptop:
1. Open live mode
2. Click microphone button FIRST (user gesture to unlock audio)
3. Speak something
4. Wait for response text
5. Listen for TTS audio
6. Check console for "🔊 Audio playback started"

## Quick Test Command

Add this test button temporarily:

```tsx
<button onClick={async () => {
  console.log("Testing audio...")
  if (audioContextRef.current) {
    console.log("AudioContext state:", audioContextRef.current.state)
    if (audioContextRef.current.state === 'suspended') {
      await audioContextRef.current.resume()
      console.log("Resumed! New state:", audioContextRef.current.state)
    }
  }
  
  // Test with a beep
  const ctx = audioContextRef.current || new AudioContext()
  const osc = ctx.createOscillator()
  osc.connect(ctx.destination)
  osc.start()
  osc.stop(ctx.currentTime + 0.2)
  console.log("Beep should play!")
}}>
  Test Audio
</button>
```

## Browser Compatibility

| Feature | Chrome Desktop | Chrome Mobile | Safari Desktop | Safari iOS | Firefox |
|---------|---------------|---------------|----------------|------------|---------|
| Speech Recognition | ✅ | ✅ | ✅ (with prefix) | ⚠️ Limited | ❌ |
| AudioContext | ✅ | ✅ | ✅ | ✅ | ✅ |
| Autoplay Policy | Requires gesture | Requires gesture | Requires gesture | Strict | Requires gesture |

## Summary

**Main Issue**: Browser autoplay policies require user interaction before audio can play

**Solution**: Ensure AudioContext.resume() is called from a user gesture event (like clicking the microphone button)

**Implementation**: Add `await audioContextRef.current.resume()` inside the `toggleMicrophone()` function when turning the mic ON.

This will unlock audio playback for the entire session!

"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Mic, MicOff, Video, VideoOff, PhoneOff, SwitchCamera } from "lucide-react"
import config from "@/lib/config"

// Extend Window interface for Web Speech API
interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message?: string;
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  onstart: (() => void) | null;
  start: () => void;
  stop: () => void;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

interface Message {
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

export default function LiveModePage() {
  const router = useRouter()
  const [isConnected, setIsConnected] = useState(false)
  const [isCameraOn, setIsCameraOn] = useState(true)
  const [isMicOn, setIsMicOn] = useState(true)
  const [facingMode, setFacingMode] = useState<"user" | "environment">("environment")
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [messages, setMessages] = useState<Message[]>([])
  const [sessionId] = useState(() => `live_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisStatus, setAnalysisStatus] = useState("")

  // Refs
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const wsRef = useRef<WebSocket | null>(null)
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const frameIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const currentAudioSourceRef = useRef<AudioBufferSourceNode | null>(null)
  const isPlayingAudioRef = useRef<boolean>(false)

  /**
   * Initialize WebSocket connection
   */
  const initializeWebSocket = useCallback(() => {
    try {
      const wsUrl = config.endpoints.liveMode(sessionId)
      console.log("🌐 Connecting to WebSocket:", wsUrl)

      const ws = new WebSocket(wsUrl)
      wsRef.current = ws

      ws.onopen = () => {
        console.log("✅ WebSocket connected successfully")
        setIsConnected(true)
        
        // Send initialization message
        const initMessage = {
          type: "init",
          language: "english",
          session_id: sessionId
        }
        console.log("📤 Sending init:", initMessage)
        ws.send(JSON.stringify(initMessage))
      }

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          console.log("📨 Received message:", data.type, data)

          switch (data.type) {
            case "welcome":
              console.log("👋 Welcome:", data.message)
              break
            
            case "status":
              // Show "Analyzing pest..." message
              console.log("🔬 Status update:", data.message)
              setIsAnalyzing(data.is_analyzing || false)
              setAnalysisStatus(data.message)
              break

            case "response":
              console.log("💬 AI Response:", data.text)
              setIsAnalyzing(false)
              setAnalysisStatus("")
              
              // Check if pest detection result is included
              if (data.pest_detection) {
                const pest = data.pest_detection
                const pestInfo = `🐛 Pest Detected: ${pest.pest_name}\nConfidence: ${(pest.confidence * 100).toFixed(1)}%\nSeverity: ${pest.severity}\n\n${data.text}`
                
                setMessages(prev => [...prev, {
                  role: "assistant",
                  content: pestInfo,
                  timestamp: new Date()
                }])
                
                console.log("🐛 Pest detection:", pest)
              } else {
                setMessages(prev => [...prev, {
                  role: "assistant",
                  content: data.text,
                  timestamp: new Date()
                }])
              }
              break

            case "audio":
              console.log("🔊 Received audio, length:", data.audio?.length)
              if (data.audio) {
                playAudioChunk(data.audio)
              }
              break

            case "error":
              console.error("❌ Server error:", data.message)
              setIsAnalyzing(false)
              setAnalysisStatus("")
              alert(`Server Error: ${data.message}`)
              break

            default:
              console.warn("⚠️ Unknown message type:", data.type, data)
          }
        } catch (error) {
          console.error("❌ Error parsing message:", error, event.data)
        }
      }

      ws.onerror = (event) => {
        console.error("❌ WebSocket error event:", event)
        setIsConnected(false)
        alert("WebSocket connection error. Ensure backend is running on port 8000.")
      }

      ws.onclose = (event) => {
        console.log("🔌 WebSocket closed. Code:", event.code, "Reason:", event.reason)
        setIsConnected(false)
        
        // Auto-reconnect if not manually closed
        if (event.code !== 1000) {
          console.log("🔄 Will reconnect in 3 seconds...")
          setTimeout(() => {
            if (wsRef.current?.readyState !== WebSocket.OPEN) {
              initializeWebSocket()
            }
          }, 3000)
        }
      }
    } catch (error) {
      console.error("❌ Error creating WebSocket:", error)
      alert("Failed to connect. Make sure backend is running on port 8000.")
    }
  }, [sessionId])

  /**
   * Initialize camera
   */
  const initializeCamera = useCallback(async () => {
    try {
      console.log("📷 Requesting camera access...")
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facingMode,
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 16000
        }
      })

      streamRef.current = stream

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.muted = true
        
        await videoRef.current.play()
        console.log("✅ Camera started")
      }

      setIsCameraOn(true)
    } catch (error) {
      console.error("❌ Camera error:", error)
      alert("Unable to access camera. Please check permissions.")
    }
  }, [facingMode])

  /**
   * Initialize speech recognition
   */
  const initializeSpeechRecognition = useCallback(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      console.error("Speech recognition not supported")
      return
    }

    const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition
    const recognition = new SpeechRecognition()
    recognitionRef.current = recognition

    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = 'en-US'

    recognition.onstart = () => {
      console.log("🎤 Listening started...")
      setIsListening(true)
    }

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interimTranscript = ""
      let finalTranscript = ""

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript
        if (event.results[i].isFinal) {
          finalTranscript += transcript + " "
        } else {
          interimTranscript += transcript
        }
      }

      setTranscript(interimTranscript || finalTranscript)

      if (finalTranscript.trim()) {
        console.log("🎤 Final:", finalTranscript)
        sendVoiceInput(finalTranscript.trim())
        setMessages(prev => [...prev, {
          role: "user",
          content: finalTranscript.trim(),
          timestamp: new Date()
        }])
      }
    }

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error("🎤 Recognition error:", event.error)
      
      if (event.error === 'no-speech') {
        // Silently restart
        console.log("🎤 No speech, continuing...")
      } else if (event.error === 'audio-capture') {
        console.error("Microphone access error")
        setIsMicOn(false)
      }
    }

    recognition.onend = () => {
      console.log("🎤 Recognition ended")
      setIsListening(false)
      
      // Auto-restart if mic is on and connected
      if (isMicOn && isConnected) {
        setTimeout(() => {
          try {
            recognition.start()
          } catch (error) {
            console.log("Recognition already running", error)
          }
        }, 100)
      }
    }

    // Start recognition
    try {
      recognition.start()
      console.log("🎤 Recognition initialized")
    } catch (error) {
      console.error("Error starting recognition:", error)
    }
  }, [isMicOn, isConnected])

  /**
   * Send voice input to backend
   */
  const sendVoiceInput = (text: string) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      console.error("❌ WebSocket not connected, cannot send voice input")
      alert("Not connected to server. Please wait or refresh.")
      return
    }

    console.log("📤 Sending voice input to backend:", text)
    
    const message = {
      type: "voice",
      text: text,
      session_id: sessionId,
      language: "english"
    }
    
    console.log("📤 Voice message:", message)
    wsRef.current.send(JSON.stringify(message))
  }

  /**
   * Stop all audio playback
   */
  const stopAllAudio = useCallback(() => {
    console.log("🛑 Stopping all audio playback")
    
    // Stop current audio source
    if (currentAudioSourceRef.current) {
      try {
        currentAudioSourceRef.current.stop()
        currentAudioSourceRef.current.disconnect()
        console.log("🛑 Stopped current audio source")
      } catch {
        // Already stopped
      }
      currentAudioSourceRef.current = null
    }
    
    isPlayingAudioRef.current = false
    setIsSpeaking(false)
  }, [])

  /**
   * Play audio chunk from base64 MP3
   */
  const playAudioChunk = async (base64Audio: string) => {
    try {
      console.log("🔊 Attempting to play audio, length:", base64Audio?.length)
      
      if (!base64Audio) {
        console.error("❌ No audio data provided")
        return
      }

      // Stop any currently playing audio
      stopAllAudio()

      // Check if already playing
      if (isPlayingAudioRef.current) {
        console.log("⏸️ Audio already playing, stopping previous...")
      }

      // Initialize AudioContext if needed
      if (!audioContextRef.current) {
        const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext: typeof AudioContext }).webkitAudioContext
        audioContextRef.current = new AudioContextClass()
        console.log("🔊 AudioContext created")
      }

      const audioContext = audioContextRef.current

      // Resume if suspended (required by browsers)
      if (audioContext.state === 'suspended') {
        await audioContext.resume()
        console.log("🔊 AudioContext resumed")
      }

      isPlayingAudioRef.current = true
      setIsSpeaking(true)

      // Decode base64 to ArrayBuffer
      const binaryString = atob(base64Audio)
      const bytes = new Uint8Array(binaryString.length)
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i)
      }

      console.log("🔊 Decoding audio buffer, size:", bytes.length, "bytes")

      // Decode audio
      const audioBuffer = await audioContext.decodeAudioData(bytes.buffer.slice(0))
      console.log("🔊 Audio decoded successfully, duration:", audioBuffer.duration, "seconds")
      
      // Create and play audio source
      const source = audioContext.createBufferSource()
      source.buffer = audioBuffer
      source.connect(audioContext.destination)
      currentAudioSourceRef.current = source
      
      source.onended = () => {
        console.log("🔊 Audio playback finished")
        isPlayingAudioRef.current = false
        setIsSpeaking(false)
        currentAudioSourceRef.current = null
      }
      
      source.start(0)
      console.log("🔊 Audio playback started")
      
    } catch (error) {
      console.error("❌ Error playing audio:", error)
      isPlayingAudioRef.current = false
      setIsSpeaking(false)
      currentAudioSourceRef.current = null
    }
  }

  /**
   * Start frame capture
   */
  const startFrameCapture = useCallback(() => {
    if (frameIntervalRef.current) return

    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    frameIntervalRef.current = setInterval(() => {
      if (!videoRef.current || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
        return
      }

      if (!videoRef.current.videoWidth || !videoRef.current.videoHeight) {
        return
      }

      canvas.width = videoRef.current.videoWidth
      canvas.height = videoRef.current.videoHeight
      ctx?.drawImage(videoRef.current, 0, 0)

      const frameData = canvas.toDataURL('image/jpeg', 0.8).split(',')[1]
      
      wsRef.current.send(JSON.stringify({
        type: "frame",
        image: frameData,
        session_id: sessionId
      }))

      console.log("📸 Frame sent, size:", Math.round(frameData.length / 1024), "KB")
    }, 3000) // Every 3 seconds

    console.log("📸 Frame capture interval started")
  }, [sessionId])

  /**
   * Stop frame capture
   */
  const stopFrameCapture = useCallback(() => {
    if (frameIntervalRef.current) {
      clearInterval(frameIntervalRef.current)
      frameIntervalRef.current = null
      console.log("📸 Frame capture stopped")
    }
  }, [])

  /**
   * Toggle camera
   */
  const toggleCamera = async () => {
    if (isCameraOn) {
      // Turn off camera
      if (streamRef.current) {
        streamRef.current.getVideoTracks().forEach(track => track.stop())
      }
      setIsCameraOn(false)
      stopFrameCapture()
    } else {
      // Turn on camera
      await initializeCamera()
      startFrameCapture()
    }
  }

  /**
   * Toggle microphone
   */
  const toggleMicrophone = () => {
    if (isMicOn) {
      // Turn off mic
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
      setIsMicOn(false)
      setIsListening(false)
    } else {
      // Turn on mic
      setIsMicOn(true)
      initializeSpeechRecognition()
    }
  }

  /**
   * Switch camera (front/back)
   */
  const switchCamera = async () => {
    const newFacingMode = facingMode === "environment" ? "user" : "environment"
    setFacingMode(newFacingMode)
    
    // Stop current stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
    }
    
    // Restart with new camera
    await initializeCamera()
  }

  /**
   * End call and cleanup
   */
  const endCall = () => {
    console.log("📞 Ending live mode call...")
    
    // Stop all audio first
    stopAllAudio()
    
    // Stop all streams
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      console.log("🛑 All media tracks stopped")
    }

    // Stop recognition
    if (recognitionRef.current) {
      recognitionRef.current.stop()
      recognitionRef.current = null
      console.log("🛑 Speech recognition stopped")
    }

    // Close WebSocket
    if (wsRef.current) {
      wsRef.current.close(1000, "User ended call")
      console.log("🛑 WebSocket closed")
    }

    // Stop frame capture
    stopFrameCapture()

    // Navigate back
    router.push("/interbot")
  }

  /**
   * Initialize on mount
   */
  useEffect(() => {
    console.log("🚀 Live Mode initializing...")
    console.log("Session ID:", sessionId)
    
    initializeWebSocket()
    initializeCamera()
    
    // Small delay before starting recognition
    setTimeout(() => {
      initializeSpeechRecognition()
    }, 1000)

    return () => {
      console.log("🧹 Cleaning up Live Mode...")
      
      // Stop audio
      stopAllAudio()
      
      // Cleanup media
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
      if (wsRef.current) {
        wsRef.current.close()
      }
      stopFrameCapture()
    }
  }, [])

  /**
   * Start frame capture when camera is on
   */
  useEffect(() => {
    if (isCameraOn && isConnected) {
      startFrameCapture()
    } else {
      stopFrameCapture()
    }
  }, [isCameraOn, isConnected, startFrameCapture, stopFrameCapture])

  return (
    <div className="fixed inset-0 bg-black flex flex-col">
      {/* Video Background */}
      <div className="relative flex-1 overflow-hidden">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="absolute inset-0 w-full h-full object-cover"
        />
        
        {/* Analysis Status Overlay */}
        {isAnalyzing && (
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-gradient-to-br from-blue-600/90 to-purple-600/90 backdrop-blur-md px-10 py-8 rounded-3xl border border-blue-400/30 shadow-2xl max-w-md mx-4">
              <div className="flex flex-col items-center gap-6">
                {/* Animated spinner */}
                <div className="relative">
                  <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200/30 border-t-white"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-3xl">🔬</div>
                  </div>
                </div>
                
                {/* Status text */}
                <div className="text-center">
                  <div className="text-white font-bold text-xl mb-2">
                    Analyzing Pest...
                  </div>
                  <div className="text-blue-100 text-sm">
                    {analysisStatus}
                  </div>
                  <div className="text-blue-200 text-xs mt-2 animate-pulse">
                    This may take a few seconds
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Connection Status */}
        <div className="absolute top-4 left-4 flex items-center gap-2 bg-black/50 backdrop-blur-sm px-3 py-2 rounded-full">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
          <span className="text-white text-sm font-medium">
            {isConnected ? 'Live' : 'Connecting...'}
          </span>
        </div>

        {/* Listening Indicator */}
        {isListening && (
          <div className="absolute top-4 right-4 bg-red-500 backdrop-blur-sm px-4 py-2 rounded-full">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
              <span className="text-white text-sm font-medium">Listening...</span>
            </div>
          </div>
        )}

        {/* Speaking Indicator */}
        {isSpeaking && (
          <div className="absolute top-16 right-4 bg-blue-500 backdrop-blur-sm px-4 py-2 rounded-full">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
              <span className="text-white text-sm font-medium">Speaking...</span>
            </div>
          </div>
        )}

        {/* Transcript Display */}
        {transcript && (
          <div className="absolute bottom-32 left-4 right-4 bg-black/70 backdrop-blur-md px-4 py-3 rounded-2xl">
            <p className="text-white text-center">{transcript}</p>
          </div>
        )}

        {/* Recent Messages */}
        <div className="absolute bottom-48 left-4 right-4 max-h-40 overflow-y-auto space-y-2">
          {messages.slice(-3).map((msg, idx) => (
            <div
              key={idx}
              className={`px-4 py-2 rounded-2xl backdrop-blur-md ${
                msg.role === "user"
                  ? "bg-blue-500/70 ml-auto max-w-[80%]"
                  : "bg-gray-800/70 mr-auto max-w-[80%]"
              }`}
            >
              <p className="text-white text-sm">{msg.content}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Control Panel */}
      <div className="bg-gradient-to-t from-black via-black/95 to-transparent p-6 pb-8">
        <div className="flex items-center justify-center gap-6">
          {/* Microphone Toggle */}
          <button
            onClick={toggleMicrophone}
            className={`p-4 rounded-full transition-all ${
              isMicOn
                ? "bg-gray-800 hover:bg-gray-700"
                : "bg-red-600 hover:bg-red-700"
            }`}
          >
            {isMicOn ? (
              <Mic className="w-6 h-6 text-white" />
            ) : (
              <MicOff className="w-6 h-6 text-white" />
            )}
          </button>

          {/* End Call */}
          <button
            onClick={endCall}
            className="p-6 rounded-full bg-red-600 hover:bg-red-700 transition-all"
          >
            <PhoneOff className="w-8 h-8 text-white" />
          </button>

          {/* Camera Toggle */}
          <button
            onClick={toggleCamera}
            className={`p-4 rounded-full transition-all ${
              isCameraOn
                ? "bg-gray-800 hover:bg-gray-700"
                : "bg-red-600 hover:bg-red-700"
            }`}
          >
            {isCameraOn ? (
              <Video className="w-6 h-6 text-white" />
            ) : (
              <VideoOff className="w-6 h-6 text-white" />
            )}
          </button>

          {/* Switch Camera */}
          {isCameraOn && (
            <button
              onClick={switchCamera}
              className="p-4 rounded-full bg-gray-800 hover:bg-gray-700 transition-all"
            >
              <SwitchCamera className="w-6 h-6 text-white" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

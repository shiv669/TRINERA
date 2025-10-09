/**
 * Live Mode Hook - WebSocket + STT + TTS
 * Handles real-time communication with backend for live pest detection
 */

import { useState, useEffect, useRef, useCallback } from 'react'

// SpeechRecognition type definitions
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

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message?: string;
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

// WebSocket message types
interface WebSocketMessage {
  type: string;
  [key: string]: unknown;
}

interface LiveModeConfig {
  sessionId: string
  language: 'english' | 'hindi'
  onConnected?: () => void
  onDisconnected?: () => void
  onAIResponse?: (text: string) => void
  onError?: (error: string) => void
}

interface FrameAnalysis {
  description: string
  size: string
  format?: string
  timestamp: string
  objects: string[]
  has_pest: boolean
}

export function useLiveMode(config: LiveModeConfig) {
  const [isConnected, setIsConnected] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [lastAnalysis, setLastAnalysis] = useState<FrameAnalysis | null>(null)
  
  const wsRef = useRef<WebSocket | null>(null)
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const frameIntervalRef = useRef<NodeJS.Timeout | null>(null)

  /**
   * Connect to WebSocket server
   */
  const connect = useCallback((videoElement: HTMLVideoElement | null) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      console.log('Already connected')
      return
    }

    const wsUrl = `ws://localhost:8000/api/ws/live/${config.sessionId}`
    console.log('🔌 Connecting to:', wsUrl)

    try {
      const ws = new WebSocket(wsUrl)
      wsRef.current = ws

      ws.onopen = () => {
        console.log('✅ WebSocket connected')
        setIsConnected(true)
        
        // Send init message
        const initMsg = {
          type: 'init',
          language: config.language
        }
        console.log('📤 Sending init:', initMsg)
        ws.send(JSON.stringify(initMsg))
        
        config.onConnected?.()
        
        // Start sending frames
        if (videoElement) {
          startFrameCapture(videoElement)
        }
      }

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          console.log('📥 Received:', data)
          handleServerMessage(data)
        } catch (error) {
          console.error('Error parsing message:', error)
        }
      }

      ws.onerror = (error) => {
        console.error('❌ WebSocket error:', error)
        console.error('WebSocket URL was:', wsUrl)
        console.error('WebSocket state:', ws.readyState)
        config.onError?.('WebSocket connection error. Check if backend is running on port 8000.')
      }

      ws.onclose = (event) => {
        console.log('🔌 WebSocket disconnected')
        console.log('Close code:', event.code, 'Reason:', event.reason)
        setIsConnected(false)
        config.onDisconnected?.()
        stopFrameCapture()
      }
    } catch (error) {
      console.error('❌ Failed to create WebSocket:', error)
      config.onError?.(`Failed to create WebSocket: ${error}`)
    }
  }, [config])

  /**
   * Disconnect from WebSocket
   */
  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close()
      wsRef.current = null
    }
    stopFrameCapture()
    stopListening()
    stopSpeaking()
    setIsConnected(false)
  }, [])

  /**
   * Handle messages from server
   */
  const handleServerMessage = (data: WebSocketMessage) => {
    console.log('📥 Received:', data.type)

    switch (data.type) {
      case 'connected':
        console.log('✓ Session initialized')
        break

      case 'frame_processed':
        setLastAnalysis(data.analysis as FrameAnalysis)
        break

      case 'ai_response':
        if (typeof data.text === 'string') {
          config.onAIResponse?.(data.text)
        }
        break

      case 'tts_audio':
        if (typeof data.audio === 'string') {
          playAudio(data.audio)
        }
        break

      case 'stop_tts':
        stopSpeaking()
        break

      case 'error':
        console.error('Server error:', data.message)
        if (typeof data.message === 'string') {
          config.onError?.(data.message)
        }
        break

      case 'pong':
        // Heartbeat response
        break

      default:
        console.warn('Unknown message type:', data.type)
    }
  }

  /**
   * Start capturing and sending frames
   */
  const startFrameCapture = (videoElement: HTMLVideoElement) => {
    if (frameIntervalRef.current) return

    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    
    frameIntervalRef.current = setInterval(() => {
      if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
        return
      }

      if (!videoElement.videoWidth || !videoElement.videoHeight) {
        return
      }

      canvas.width = videoElement.videoWidth
      canvas.height = videoElement.videoHeight
      ctx?.drawImage(videoElement, 0, 0)
      
      const frameData = canvas.toDataURL('image/jpeg', 0.7)
      
      wsRef.current.send(JSON.stringify({
        type: 'frame',
        data: frameData
      }))
    }, 2000) // Send frame every 2 seconds

    console.log('📸 Frame capture started')
  }

  /**
   * Stop frame capture
   */
  const stopFrameCapture = () => {
    if (frameIntervalRef.current) {
      clearInterval(frameIntervalRef.current)
      frameIntervalRef.current = null
      console.log('📸 Frame capture stopped')
    }
  }

  /**
   * Start listening for voice input (STT)
   */
  const startListening = useCallback(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      config.onError?.('Speech recognition not supported in this browser')
      return
    }

    const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition
    const recognition = new SpeechRecognition()
    recognitionRef.current = recognition

    recognition.continuous = true // Keep listening for multiple utterances
    recognition.interimResults = true
    recognition.lang = config.language === 'hindi' ? 'hi-IN' : 'en-US'

    recognition.onstart = () => {
      console.log('🎤 Speech recognition started')
      setIsListening(true)
      setTranscript('')
    }

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const current = event.resultIndex
      const transcriptText = event.results[current][0].transcript
      
      console.log(`🎤 Transcript (interim=${!event.results[current].isFinal}):`, transcriptText)
      setTranscript(transcriptText)

      // If final result, send to server
      if (event.results[current].isFinal) {
        console.log('🎤 Final transcript:', transcriptText)
        sendVoiceInput(transcriptText)
      }
    }

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('🎤 Speech recognition error:', event.error)
      if (event.error === 'no-speech') {
        console.log('🎤 No speech detected, restarting...')
        // Automatically restart on no-speech
        setTimeout(() => {
          if (recognitionRef.current) {
            try {
              recognitionRef.current.start()
            } catch (error) {
              console.error('Error restarting recognition:', error)
            }
          }
        }, 1000)
      } else {
        config.onError?.(`Speech recognition error: ${event.error}`)
        setIsListening(false)
      }
    }

    recognition.onend = () => {
      console.log('🎤 Speech recognition ended')
      setIsListening(false)
      
      // Auto-restart if still in live mode
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        console.log('🎤 Auto-restarting recognition...')
        setTimeout(() => {
          if (recognitionRef.current) {
            try {
              recognitionRef.current.start()
            } catch (err) {
              console.error('Error restarting recognition:', err)
            }
          }
        }, 500)
      }
    }

    // Stop TTS if speaking
    if (isSpeaking) {
      sendInterruption()
    }

    try {
      recognition.start()
      console.log('🎤 Recognition start() called')
    } catch (error) {
      console.error('🎤 Error starting recognition:', error)
      config.onError?.('Failed to start speech recognition')
    }
  }, [config, isSpeaking])

  /**
   * Stop listening
   */
  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
      recognitionRef.current = null
    }
    setIsListening(false)
  }, [])

  /**
   * Send voice input to server
   */
  const sendVoiceInput = (text: string) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      console.warn('WebSocket not connected')
      return
    }

    wsRef.current.send(JSON.stringify({
      type: 'voice',
      transcript: text
    }))

    console.log('📤 Sent voice input:', text)
  }

  /**
   * Send interruption signal
   */
  const sendInterruption = () => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      return
    }

    wsRef.current.send(JSON.stringify({
      type: 'interrupt'
    }))

    stopSpeaking()
  }

  /**
   * Play TTS audio
   */
  const playAudio = (base64Audio: string) => {
    try {
      const audioBlob = base64ToBlob(base64Audio, 'audio/mp3')
      const audioUrl = URL.createObjectURL(audioBlob)

      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.src = audioUrl
      } else {
        audioRef.current = new Audio(audioUrl)
      }

      audioRef.current.onplay = () => {
        console.log('🔊 Playing TTS')
        setIsSpeaking(true)
      }

      audioRef.current.onended = () => {
        console.log('🔊 TTS finished')
        setIsSpeaking(false)
        URL.revokeObjectURL(audioUrl)
      }

      audioRef.current.onerror = (error) => {
        console.error('Audio playback error:', error)
        setIsSpeaking(false)
      }

      audioRef.current.play()
    } catch (error) {
      console.error('Error playing audio:', error)
      config.onError?.('Error playing audio')
    }
  }

  /**
   * Stop TTS playback
   */
  const stopSpeaking = () => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }
    setIsSpeaking(false)
  }

  /**
   * Convert base64 to Blob
   */
  const base64ToBlob = (base64: string, mimeType: string): Blob => {
    const byteCharacters = atob(base64)
    const byteNumbers = new Array(byteCharacters.length)
    
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i)
    }
    
    const byteArray = new Uint8Array(byteNumbers)
    return new Blob([byteArray], { type: mimeType })
  }

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      disconnect()
    }
  }, [disconnect])

  return {
    // State
    isConnected,
    isListening,
    isSpeaking,
    transcript,
    lastAnalysis,
    
    // Actions
    connect,
    disconnect,
    startListening,
    stopListening,
    sendInterruption
  }
}

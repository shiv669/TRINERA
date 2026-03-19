"use client"

import React, { useState, useRef, useEffect, useCallback } from "react"
import { cn } from "@/lib/utils"
import { ArrowUpIcon, Upload, Loader2, MessageSquare, Plus, Trash2, Menu, X, Pencil, Check } from "lucide-react"
import { Button } from "@/components/button"
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip"
import ReactMarkdown from "react-markdown"
import config from "@/lib/config"
import remarkGfm from "remark-gfm"

// Message type definition
type Message = {
  role: "user" | "assistant" | "system"
  content: string
  imageUrl?: string
  videoUrl?: string
  heatmapUrl?: string
}

// Session metadata type
type SessionMetadata = {
  id: string
  title: string
  timestamp: number
  language: "english" | "hindi"
  messageCount: number
  lastMessage?: string
}

// Chat state types
type ChatState =
  | "initial"
  | "language_selected"
  | "main_menu"
  | "pest_identification"
  | "awaiting_image"
  | "analyzing_image"
  | "pest_result"
  | "live_mode"  // NEW: Live mode for real-time interaction

// Auto-resize textarea component (defined outside to prevent re-creation)
const AutoResizeTextarea = React.forwardRef<
  HTMLTextAreaElement,
  Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'onChange'> & {
    onChange: (value: string) => void
  }
>(({ value, onChange, ...props }, _ref) => {
  const textareaRef = React.useRef<HTMLTextAreaElement>(null)

  const resizeTextarea = React.useCallback(() => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = "auto"
      textarea.style.height = `${textarea.scrollHeight}px`
    }
  }, [])

  React.useEffect(() => {
    resizeTextarea()
  }, [value, resizeTextarea])

  return (
    <textarea
      {...props}
      value={value}
      ref={textareaRef}
      rows={1}
      onChange={(e) => onChange(e.target.value)}
      className={cn("resize-none min-h-4 max-h-80", props.className)}
    />
  )
})

AutoResizeTextarea.displayName = "AutoResizeTextarea"

export default function Page() {
  // State management
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "नमस्ते! Welcome to Trinera - Your AI farming assistant. Which language do you prefer?\n\nकृपया अपनी पसंदीदा भाषा चुनें:",
    },
  ])
  const [input, setInput] = useState("")
  const [language, setLanguage] = useState<"english" | "hindi">("english")
  const [chatState, setChatState] = useState<ChatState>("initial")
  const [isProcessing, setIsProcessing] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  
  // Sidebar state
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [sessions, setSessions] = useState<SessionMetadata[]>([])
  const [renamingSessionId, setRenamingSessionId] = useState<string | null>(null)
  const [renameValue, setRenameValue] = useState("")

  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Input change handler
  const handleInputChange = (value: string) => {
    setInput(value)
  }

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Load all sessions from localStorage
  const loadAllSessions = useCallback(() => {
    try {
      const sessionsData = localStorage.getItem("trinera_sessions")
      if (sessionsData) {
        const parsedSessions: SessionMetadata[] = JSON.parse(sessionsData)
        setSessions(parsedSessions.sort((a, b) => b.timestamp - a.timestamp))
      }
    } catch (error) {
      console.error("Failed to load sessions:", error)
    }
  }, [])

  // Save current session metadata
  const saveSessionMetadata = useCallback(() => {
    if (!sessionId || messages.length === 0) return
    
    try {
      const sessionsData = localStorage.getItem("trinera_sessions")
      const existingSessions: SessionMetadata[] = sessionsData ? JSON.parse(sessionsData) : []
      
      // Get first user message as title
      const firstUserMessage = messages.find(m => m.role === "user")?.content
      const title = firstUserMessage 
        ? firstUserMessage.substring(0, 50) + (firstUserMessage.length > 50 ? "..." : "")
        : "New Chat"
      
      const lastMessage = messages[messages.length - 1]?.content.substring(0, 100)
      
      const sessionIndex = existingSessions.findIndex(s => s.id === sessionId)
      
      const sessionMeta: SessionMetadata = {
        id: sessionId,
        title,
        timestamp: Date.now(),
        language,
        messageCount: messages.length,
        lastMessage
      }
      
      if (sessionIndex >= 0) {
        existingSessions[sessionIndex] = sessionMeta
      } else {
        existingSessions.push(sessionMeta)
      }
      
      localStorage.setItem("trinera_sessions", JSON.stringify(existingSessions))
      
      // Also save full messages including images to a separate key for this session
      const sessionMessagesKey = `trinera_messages_${sessionId}`
      localStorage.setItem(sessionMessagesKey, JSON.stringify(messages))
      
      loadAllSessions()
    } catch (error) {
      console.error("Failed to save session metadata:", error)
    }
  }, [sessionId, messages, language, loadAllSessions])

  // Load chat history from backend on mount if session exists
  useEffect(() => {
    const loadChatHistory = async () => {
      try {
        // Load all sessions list
        loadAllSessions()
        
        // Try to get session_id from localStorage
        const storedSessionId = localStorage.getItem("trinera_session_id")
        const storedLanguage = localStorage.getItem("trinera_language") as "english" | "hindi" | null
        
        if (storedSessionId) {
          // First try localStorage (has images)
          const sessionMessagesKey = `trinera_messages_${storedSessionId}`
          const storedMessages = localStorage.getItem(sessionMessagesKey)
          
          if (storedMessages) {
            // Load from localStorage (includes images)
            const parsedMessages: Message[] = JSON.parse(storedMessages)
            
            setSessionId(storedSessionId)
            if (storedLanguage) {
              setLanguage(storedLanguage)
            }
            
            if (parsedMessages.length > 0) {
              setMessages(parsedMessages)
              setChatState("pest_result")
            }
            
            console.log("✓ Chat history restored from localStorage:", parsedMessages.length, "messages")
          } else {
            // Fallback to backend
            const response = await fetch(`${config.endpoints.chat}/history/${storedSessionId}`)
            
            if (response.ok) {
              const history = await response.json()
              
              setSessionId(history.session_id)
              if (storedLanguage) {
                setLanguage(storedLanguage)
              }
              
              // Convert backend messages to frontend format
              const restoredMessages: Message[] = history.messages.map((msg: any) => ({
                role: msg.role as "user" | "assistant" | "system",
                content: msg.content
              }))
              
              if (restoredMessages.length > 0) {
                setMessages(restoredMessages)
                setChatState("pest_result")
              }
              
              console.log("✓ Chat history restored from backend:", history.messages.length, "messages")
            }
          }
        }
      } catch (error) {
        console.log("No previous session to restore")
      }
    }
    
    loadChatHistory()
  }, [loadAllSessions])

  // Save session_id and language to localStorage when they change
  useEffect(() => {
    if (sessionId) {
      localStorage.setItem("trinera_session_id", sessionId)
    }
  }, [sessionId])

  useEffect(() => {
    if (language) {
      localStorage.setItem("trinera_language", language)
    }
  }, [language])

  // Auto-save session metadata when messages change
  useEffect(() => {
    if (sessionId && messages.length > 1) {
      saveSessionMetadata()
    }
  }, [messages, sessionId, saveSessionMetadata])

  // Clean up media stream when component unmounts (for live mode)
  useEffect(() => {
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream
        stream.getTracks().forEach((track: MediaStreamTrack) => track.stop())
      }
    }
  }, [])

  // Handle language selection
  const selectLanguage = (lang: "english" | "hindi") => {
    setLanguage(lang)
    setChatState("language_selected")

    const welcomeMessage =
      lang === "english"
        ? "Thank you for choosing English. Trinera is a pest detection system that helps farmers identify and manage pests in their farmland. How can I help you today?"
        : "हिंदी चुनने के लिए धन्यवाद। त्रिनेरा एक कीट पहचान प्रणाली है जो किसानों को उनके खेत में कीटों की पहचान और प्रबंधन में मदद करती है। आज मैं आपकी कैसे सहायता कर सकता हूँ?"

    setMessages((prev) => [
      ...prev,
      { role: "user", content: lang === "english" ? "English" : "हिंदी" },
      { role: "assistant", content: welcomeMessage },
    ])

    setTimeout(() => {
      showMainMenu()
    }, 1000)
  }

  // Show main menu options
  const showMainMenu = () => {
    setChatState("main_menu")

    const menuMessage =
      language === "english"
        ? "Please select what you'd like to do:\n\n1. Identify if a specific pest is harmful\n2. Scan my farmland for harmful pests"
        : "कृपया चुनें कि आप क्या करना चाहते हैं:\n\n1. पहचानें कि क्या कोई विशिष्ट कीट हानिकारक है\n2. हानिकारक कीटों के लिए मेरे खेत को स्कैन करें"

    setMessages((prev) => [...prev, { role: "assistant", content: menuMessage }])
  }

  // Handle main menu selection
  const handleMenuSelection = (option: number) => {
    if (option === 1) {
      setChatState("pest_identification")
      const message =
        language === "english"
          ? "Please upload a clear photo of the pest you want to identify."
          : "कृपया उस कीट की एक स्पष्ट तस्वीर अपलोड करें जिसे आप पहचानना चाहते हैं।"

      setMessages((prev) => [
        ...prev,
        {
          role: "user",
          content:
            language === "english"
              ? "I want to identify if a specific pest is harmful"
              : "मैं पहचानना चाहता हूं कि क्या कोई विशिष्ट कीट हानिकारक है",
        },
        { role: "assistant", content: message },
      ])
      setChatState("awaiting_image")
    } else if (option === 2) {
      // Option 2 is now Live Mode - handled by toggleLiveMode button
      // This is kept for backward compatibility but won't be called
      const message =
        language === "english"
          ? "Please use the Live Mode button to start real-time pest detection."
          : "कृपया रीयल-टाइम कीट पहचान शुरू करने के लिए लाइव मोड बटन का उपयोग करें।"

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: message,
        },
      ])
    }
  }

  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setImageFile(file)
    const imageUrl = URL.createObjectURL(file)

    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        content: language === "english" ? "I've uploaded an image of the pest." : "मैंने कीट की एक छवि अपलोड की है।",
        imageUrl,
      },
    ])

    // Pass the file directly to avoid async state issues
    analyzePestImage(imageUrl, file)
  }

  // Analyze pest image using FastAPI backend
  const analyzePestImage = async (imageUrl: string, file?: File) => {
    setChatState("analyzing_image")
    setIsProcessing(true)

    const analysisMessage =
      language === "english"
        ? "Analyzing your image... Please wait while I identify the pest."
        : "आपकी छवि का विश्लेषण किया जा रहा है... कृपया प्रतीक्षा करें जबकि मैं कीट की पहचान करता हूं।"

    setMessages((prev) => [...prev, { role: "assistant", content: analysisMessage }])

    try {
      // Use the file parameter if provided, otherwise fall back to imageFile state
      const fileToUpload = file || imageFile
      
      if (!fileToUpload) {
        throw new Error("No image file available")
      }

      // Prepare form data for API request
      const formData = new FormData()
      formData.append("file", fileToUpload)

      // Build URL with query parameters
      const url = new URL(config.endpoints.pestDetection)
      url.searchParams.append("language", language)
      if (sessionId) {
        url.searchParams.append("session_id", sessionId)
      }

      // Create abort controller with 150 second timeout (HF Space needs ~40s for inference)
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 150000) // 150 seconds

      // Call FastAPI backend
      const response = await fetch(url.toString(), {
        method: "POST",
        body: formData,
        signal: controller.signal,
      })
      clearTimeout(timeoutId)

      if (!response.ok) {
        const errorData = await response.json()
        console.error("Backend error response:", errorData)
        const errorMsg = errorData.details || errorData.error || "Failed to analyze image"
        throw new Error(errorMsg)
      }

      const result = await response.json()

      if (!result.success) {
        console.error("Analysis failed:", result)
        const errorMsg = result.details || result.error || "Analysis failed"
        throw new Error(errorMsg)
      }

      // Store session_id for AI chat context
      if (result.session_id) {
        setSessionId(result.session_id)
      }

      // Format the result message
      const pestData = result.prediction
      const pestDetails = result.details

      const resultMessage =
        language === "english"
          ? `## 🐛 Pest Identified: ${pestData.label}

**Status:** ${pestData.is_harmful ? "⚠️ Harmful to crops" : "✅ Generally not harmful"}

**Detection Confidence:** ${(pestData.confidence * 100).toFixed(1)}%

---

### 📋 Description
${pestDetails.description}

### 🌾 How It Spreads
${pestDetails.spread_method}

### ✅ Recommended Precautions

${pestDetails.precautions.map((p: string, i: number) => `${i + 1}. ${p}`).join("\n")}

---

### 💬 Ask Me Anything!

You can now ask questions like:
- "How do I control this pest?"
- "What organic solutions are available?"
- "How long does treatment take?"
- "What's the estimated cost?"

*Type "menu" to return to the main menu*`
          : `## 🐛 कीट की पहचान: ${pestData.label}

**स्थिति:** ${pestData.is_harmful ? "⚠️ फसलों के लिए हानिकारक" : "✅ आमतौर पर हानिकारक नहीं"}

**पहचान विश्वास:** ${(pestData.confidence * 100).toFixed(1)}%

---

### 📋 विवरण
${pestDetails.description}

### 🌾 कैसे फैलता है
${pestDetails.spread_method}

### ✅ अनुशंसित सावधानियां

${pestDetails.precautions.map((p: string, i: number) => `${i + 1}. ${p}`).join("\n")}

---

### 💬 मुझसे कुछ भी पूछें!

आप इस तरह के प्रश्न पूछ सकते हैं:
- "मैं इस कीट को कैसे नियंत्रित करूं?"
- "जैविक समाधान क्या उपलब्ध हैं?"
- "उपचार में कितना समय लगता है?"
- "अनुमानित लागत क्या है?"

*मुख्य मेनू पर लौटने के लिए "मेनू" टाइप करें*`

      setMessages((prev) => [...prev.slice(0, -1), { role: "assistant", content: resultMessage }])
      setIsProcessing(false)
      setChatState("pest_result")
    } catch (error) {
      console.error("Error analyzing image:", error)
      
      let errorMessage = ""
      
      if (error instanceof Error) {
        // Check for timeout/abort error
        if (error.name === 'AbortError') {
          errorMessage = language === "english"
            ? "⏱️ Request Timeout: The pest detection is taking longer than expected (>150 seconds). The AI model might be processing other requests. Please try again in a moment."
            : "⏱️ समय समाप्त: कीट पहचान अपेक्षा से अधिक समय ले रही है (>150 सेकंड)। AI मॉडल अन्य अनुरोधों को संसाधित कर रहा हो सकता है। कृपया कुछ देर बाद पुनः प्रयास करें।"
        }
        // Check for specific error types
        else if (error.message.includes("Failed to process image") || error.message.includes("500")) {
          errorMessage = language === "english"
            ? "⚠️ Backend Error: The pest detection service encountered an issue. This is usually due to:\n\n1. Invalid HuggingFace token\n2. Service temporarily unavailable\n\nPlease check the backend logs or try again in a moment."
            : "⚠️ बैकएंड त्रुटि: कीट पहचान सेवा में समस्या आई। यह आमतौर पर इन कारणों से होता है:\n\n1. अमान्य HuggingFace टोकन\n2. सेवा अस्थायी रूप से अनुपलब्ध\n\nकृपया बैकएंड लॉग जांचें या कुछ देर बाद पुनः प्रयास करें।"
        } else {
          errorMessage = language === "english"
            ? `Sorry, I encountered an error: ${error.message}\n\nPlease try again or upload a different image.`
            : `क्षमा करें, एक त्रुटि हुई: ${error.message}\n\nकृपया पुनः प्रयास करें या एक अलग छवि अपलोड करें।`
        }
      } else {
        errorMessage = language === "english"
          ? "An unexpected error occurred. Please try again."
          : "एक अप्रत्याशित त्रुटि हुई। कृपया पुनः प्रयास करें।"
      }

      setMessages((prev) => [...prev.slice(0, -1), { role: "assistant", content: errorMessage }])
      setIsProcessing(false)
      setChatState("awaiting_image")  // Reset to allow retry
    }
  }

  // Send message to AI chat (Groq LLM)
  const sendChatMessage = async (message: string) => {
    try {
      setIsProcessing(true)

      const response = await fetch(config.endpoints.chat, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message,
          session_id: sessionId,
          language: language || "english",
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || "Failed to get AI response")
      }

      const result = await response.json()

      // Update or set session_id
      if (result.session_id) {
        setSessionId(result.session_id)
      }

      // Add AI response to messages
      setMessages((prev) => [...prev, { role: "assistant", content: result.response }])
      setIsProcessing(false)
    } catch (error) {
      console.error("Error sending chat message:", error)

      const errorMessage =
        language === "english"
          ? `Sorry, I encountered an error: ${error instanceof Error ? error.message : "Unknown error"}. Please try again.`
          : `क्षमा करें, एक त्रुटि हुई: ${error instanceof Error ? error.message : "अज्ञात त्रुटि"}। कृपया पुनः प्रयास करें।`

      setMessages((prev) => [...prev, { role: "assistant", content: errorMessage }])
      setIsProcessing(false)
    }
  }

  // Navigate to Live Mode page
  const toggleLiveMode = () => {
    window.location.href = "/interbot/live"
  }

  // Clear chat and start fresh session
  const clearChat = async () => {
    try {
      // Clear backend session if exists
      if (sessionId) {
        try {
          await fetch(`${config.apiUrl}/api/chat/session/${sessionId}`, {
            method: "DELETE"
          })
        } catch (deleteError) {
          console.log("Could not delete backend session (may not exist):", deleteError)
          // Continue anyway - backend session might not exist
        }
      }
      
      // Clear localStorage
      localStorage.removeItem("trinera_session_id")
      localStorage.removeItem("trinera_language")
      
      // Reset state
      setSessionId(null)
      setMessages([
        {
          role: "assistant",
          content:
            "नमस्ते! Welcome to Trinera - Your AI farming assistant. Which language do you prefer?\n\nकृपया अपनी पसंदीदा भाषा चुनें:",
        },
      ])
      setChatState("initial")
      setLanguage("english")
      setImageFile(null)
      
      console.log("✓ Chat cleared and session reset")
    } catch (error) {
      console.error("Error clearing chat:", error)
      // Still reset the UI even if backend fails
      setSessionId(null)
      setMessages([
        {
          role: "assistant",
          content:
            "नमस्ते! Welcome to Trinera - Your AI farming assistant. Which language do you prefer?\n\nकृपया अपनी पसंदीदा भाषा चुनें:",
        },
      ])
      setChatState("initial")
      setLanguage("english")
      setImageFile(null)
    }
  }

  // Start a new chat session
  const startNewChat = () => {
    clearChat()
  }

  // Load a specific session
  const loadSession = async (sessionMeta: SessionMetadata) => {
    try {
      // First, try to load from localStorage (includes images and full context)
      const sessionMessagesKey = `trinera_messages_${sessionMeta.id}`
      const storedMessages = localStorage.getItem(sessionMessagesKey)
      
      if (storedMessages) {
        // Load from localStorage (has images)
        const parsedMessages: Message[] = JSON.parse(storedMessages)
        
        setSessionId(sessionMeta.id)
        setLanguage(sessionMeta.language)
        localStorage.setItem("trinera_session_id", sessionMeta.id)
        localStorage.setItem("trinera_language", sessionMeta.language)
        
        setMessages(parsedMessages)
        setChatState("pest_result")
        
        console.log("✓ Session loaded from localStorage:", sessionMeta.id, parsedMessages.length, "messages")
      } else {
        // Fallback: Load from backend (no images but has text)
        const response = await fetch(`${config.endpoints.chat}/history/${sessionMeta.id}`)
        
        if (response.ok) {
          const history = await response.json()
          
          setSessionId(sessionMeta.id)
          setLanguage(sessionMeta.language)
          localStorage.setItem("trinera_session_id", sessionMeta.id)
          localStorage.setItem("trinera_language", sessionMeta.language)
          
          // Convert backend messages to frontend format
          const restoredMessages: Message[] = history.messages.map((msg: any) => ({
            role: msg.role as "user" | "assistant" | "system",
            content: msg.content
          }))
          
          setMessages(restoredMessages)
          setChatState("pest_result")
          
          console.log("✓ Session loaded from backend:", sessionMeta.id)
        }
      }
    } catch (error) {
      console.error("Failed to load session:", error)
    }
  }

  // Rename a session
  const renameSession = (id: string, newTitle: string) => {
    const trimmed = newTitle.trim()
    if (!trimmed) {
      setRenamingSessionId(null)
      return
    }
    try {
      const sessionsData = localStorage.getItem("trinera_sessions")
      if (sessionsData) {
        const existingSessions: SessionMetadata[] = JSON.parse(sessionsData)
        const updated = existingSessions.map(s =>
          s.id === id ? { ...s, title: trimmed } : s
        )
        localStorage.setItem("trinera_sessions", JSON.stringify(updated))
        loadAllSessions()
      }
      setRenamingSessionId(null)
      console.log("✓ Session renamed:", id, "→", trimmed)
    } catch (error) {
      console.error("Failed to rename session:", error)
    }
  }

  // Delete a session
  const deleteSession = async (sessionMeta: SessionMetadata) => {
    try {
      // Delete from backend
      try {
        await fetch(`${config.apiUrl}/api/chat/session/${sessionMeta.id}`, {
          method: "DELETE"
        })
      } catch (backendError) {
        console.log("Could not delete from backend (may not exist):", backendError)
      }
      
      // Remove from localStorage sessions list
      const sessionsData = localStorage.getItem("trinera_sessions")
      if (sessionsData) {
        const existingSessions: SessionMetadata[] = JSON.parse(sessionsData)
        const updatedSessions = existingSessions.filter(s => s.id !== sessionMeta.id)
        localStorage.setItem("trinera_sessions", JSON.stringify(updatedSessions))
        loadAllSessions()
      }
      
      // Delete the session messages from localStorage
      const sessionMessagesKey = `trinera_messages_${sessionMeta.id}`
      localStorage.removeItem(sessionMessagesKey)
      
      // If this is the current session, clear it
      if (sessionId === sessionMeta.id) {
        clearChat()
      }
      
      console.log("✓ Session deleted:", sessionMeta.id)
    } catch (error) {
      console.error("Failed to delete session:", error)
    }
  }

  // Handle form submission
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!input.trim()) return

    const userMessage = input.trim()
    setInput("")

    // Add user message
    setMessages((prev) => [...prev, { role: "user", content: userMessage }])

    // Process based on current state
    if (chatState === "initial") {
      if (userMessage.toLowerCase().includes("english")) {
        selectLanguage("english")
      } else if (userMessage.toLowerCase().includes("hindi") || userMessage.toLowerCase().includes("हिंदी")) {
        selectLanguage("hindi")
      } else {
        // If language not detected, ask again
        const promptMessage = "I didn't understand your language preference. Please type 'English' or 'हिंदी'."
        setMessages((prev) => [...prev, { role: "assistant", content: promptMessage }])
      }
    } else if (chatState === "main_menu") {
      if (userMessage.includes("1") || userMessage.toLowerCase().includes("identify") || userMessage.toLowerCase().includes("pest")) {
        handleMenuSelection(1)
      } else if (
        userMessage.includes("2") ||
        userMessage.toLowerCase().includes("scan") ||
        userMessage.toLowerCase().includes("farmland")
      ) {
        handleMenuSelection(2)
      } else {
        // For any other question in main menu, use AI chat
        sendChatMessage(userMessage)
      }
    } else if (chatState === "pest_result") {
      // After pest detection, allow follow-up questions to AI
      // Check if user wants to return to menu
      if (
        userMessage.toLowerCase().includes("menu") ||
        userMessage.toLowerCase().includes("back") ||
        userMessage.toLowerCase().includes("मेनू") ||
        userMessage.toLowerCase().includes("वापस")
      ) {
        showMainMenu()
      } else {
        // Send question to AI with pest context
        sendChatMessage(userMessage)
      }
    } else if (chatState === "live_mode") {
      // In live mode, all text input goes through AI with visual context
      sendChatMessage(userMessage)
    }
  }

  // Handle key press in textarea
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      const form = e.currentTarget.form
      if (form) form.requestSubmit()
    }
  }

  // Render message content with images/videos/heatmaps
  const renderMessageContent = (message: Message) => {
    return (
      <div className="flex flex-col gap-2">
        <div className="prose prose-sm max-w-none">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              // Headings
              h1: ({ ...props }) => <h1 className="text-xl font-bold mb-2 mt-3" {...props} />,
              h2: ({ ...props }) => <h2 className="text-lg font-bold mb-2 mt-3" {...props} />,
              h3: ({ ...props }) => <h3 className="text-base font-bold mb-1 mt-2" {...props} />,
              
              // Paragraphs
              p: ({ ...props }) => <p className="mb-2 leading-relaxed" {...props} />,
              
              // Bold text
              strong: ({ ...props }) => <strong className="font-bold text-gray-900" {...props} />,
              
              // Lists
              ul: ({ ...props }) => <ul className="list-disc list-inside mb-2 space-y-1" {...props} />,
              ol: ({ ...props }) => <ol className="list-decimal list-inside mb-2 space-y-1" {...props} />,
              li: ({ ...props }) => <li className="ml-2" {...props} />,
              
              // Code blocks
              code: ({ ...props }) => <code className="bg-gray-100 px-1 py-0.5 rounded text-sm" {...props} />,
              
              // Horizontal rule
              hr: ({ ...props }) => <hr className="my-3 border-gray-300" {...props} />,
              
              // Links
              a: ({ ...props }) => (
                <a className="text-blue-500 hover:text-blue-600 underline" target="_blank" rel="noopener noreferrer" {...props} />
              ),
            }}
          >
            {message.content}
          </ReactMarkdown>
        </div>

        {message.imageUrl && (
          <div className="mt-2 relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={message.imageUrl || "/placeholder.svg"}
              alt="Uploaded pest"
              className="rounded-md max-w-full max-h-60 object-contain"
            />
            {chatState === "analyzing_image" && (
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center rounded-md">
                <div className="text-white text-center">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                  <p>{language === "english" ? "Analyzing image..." : "छवि का विश्लेषण किया जा रहा है..."}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {message.videoUrl && (
          <div className="mt-2">
            <video src={message.videoUrl} controls className="rounded-md max-w-full max-h-60 object-contain" />
          </div>
        )}

        {message.heatmapUrl && (
          <div className="mt-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={message.heatmapUrl || "/placeholder.svg"}
              alt="Pest heatmap"
              className="rounded-md max-w-full max-h-80 object-contain border border-gray-200"
            />
            <div className="flex justify-between text-xs mt-1 text-gray-500">
              <span>🟢 {language === "english" ? "Low pest activity" : "कम कीट गतिविधि"}</span>
              <span>🟡 {language === "english" ? "Moderate" : "मध्यम"}</span>
              <span>🔴 {language === "english" ? "High pest activity" : "उच्च कीट गतिविधि"}</span>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <TooltipProvider delayDuration={0}>
      <div className="flex h-svh max-h-svh w-full">
        {/* Sidebar */}
        <div 
          className={cn(
            "flex flex-col bg-gray-900 text-white transition-all duration-300 border-r border-gray-700",
            isSidebarOpen ? "w-64" : "w-0"
          )}
        >
          {isSidebarOpen && (
            <>
              {/* Sidebar Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-700">
                <h2 className="text-lg font-semibold">Chat History</h2>
                <Button
                  onClick={() => setIsSidebarOpen(false)}
                  variant="ghost"
                  size="sm"
                  className="text-gray-400 hover:text-white hover:bg-gray-800"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* New Chat Button */}
              <div className="p-3 border-b border-gray-700">
                <Button
                  onClick={startNewChat}
                  className="w-full bg-gray-800 hover:bg-gray-700 text-white border border-gray-600"
                  variant="outline"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  New Chat
                </Button>
              </div>

              {/* Sessions List */}
              <div className="flex-1 overflow-y-auto">
                {sessions.length === 0 ? (
                  <div className="p-4 text-center text-gray-400 text-sm">
                    No chat history yet
                  </div>
                ) : (
                  <div className="flex flex-col gap-1 p-2">
                    {sessions.map((session) => (
                      <div
                        key={session.id}
                        className={cn(
                          "group flex items-center gap-2 p-3 rounded-lg cursor-pointer transition-colors hover:bg-gray-800",
                          sessionId === session.id ? "bg-gray-800" : ""
                        )}
                        onClick={() => renamingSessionId !== session.id && loadSession(session)}
                      >
                        <MessageSquare className="h-4 w-4 flex-shrink-0 text-gray-400" />
                        <div className="flex-1 min-w-0">
                          {renamingSessionId === session.id ? (
                            <input
                              type="text"
                              value={renameValue}
                              onChange={(e) => setRenameValue(e.target.value)}
                              onBlur={() => renameSession(session.id, renameValue)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") renameSession(session.id, renameValue)
                                if (e.key === "Escape") setRenamingSessionId(null)
                              }}
                              onClick={(e) => e.stopPropagation()}
                              autoFocus
                              className="w-full bg-gray-700 text-white text-sm px-2 py-1 rounded border border-gray-500 focus:border-blue-400 focus:outline-none"
                            />
                          ) : (
                            <>
                              <p className="text-sm font-medium truncate">{session.title}</p>
                              <p className="text-xs text-gray-400">
                                {new Date(session.timestamp).toLocaleDateString()} • {session.messageCount} msgs
                              </p>
                            </>
                          )}
                        </div>
                        <div className="flex items-center gap-0.5">
                          {renamingSessionId === session.id ? (
                            <Button
                              onClick={(e) => {
                                e.stopPropagation()
                                renameSession(session.id, renameValue)
                              }}
                              variant="ghost"
                              size="sm"
                              className="text-green-400 hover:text-green-300 hover:bg-gray-700 p-1 h-auto"
                            >
                              <Check className="h-3 w-3" />
                            </Button>
                          ) : (
                            <Button
                              onClick={(e) => {
                                e.stopPropagation()
                                setRenamingSessionId(session.id)
                                setRenameValue(session.title)
                              }}
                              variant="ghost"
                              size="sm"
                              className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-blue-400 hover:bg-gray-700 p-1 h-auto"
                            >
                              <Pencil className="h-3 w-3" />
                            </Button>
                          )}
                          <Button
                            onClick={(e) => {
                              e.stopPropagation()
                              deleteSession(session)
                            }}
                            variant="ghost"
                            size="sm"
                            className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-400 hover:bg-gray-700 p-1 h-auto"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Main Chat Area */}
        <main className="flex-1 flex flex-col items-stretch max-w-[50rem] mx-auto w-full">
          {/* Header with Menu and Clear Chat buttons */}
          <div className="flex items-center justify-between px-6 py-3 border-b border-gray-200">
            <div className="flex items-center gap-2">
              {!isSidebarOpen && (
                <Button
                  onClick={() => setIsSidebarOpen(true)}
                  variant="ghost"
                  size="sm"
                  className="text-gray-600 hover:text-gray-900"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              )}
              <h1 className="text-lg font-semibold">Trinera Chat</h1>
            </div>
            {chatState !== "initial" && messages.length > 1 && (
              <Button 
                onClick={clearChat} 
                variant="ghost" 
                size="sm"
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                Clear Chat
              </Button>
            )}
          </div>
          
          <div className="flex-1 content-center overflow-y-auto px-6">
          <div className="my-4 flex h-fit min-h-full flex-col gap-4">
            {messages.map((message, index) => (
              <div
                key={index}
                data-role={message.role}
                className="max-w-[90%] rounded-xl px-4 py-3 text-sm data-[role=assistant]:self-start data-[role=user]:self-end data-[role=assistant]:bg-gray-50 data-[role=user]:bg-blue-500 data-[role=assistant]:text-black data-[role=user]:text-white data-[role=assistant]:border data-[role=assistant]:border-gray-200"
              >
                {renderMessageContent(message)}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Hidden file input for image upload */}
        <input type="file" ref={fileInputRef} accept="image/*" className="hidden" onChange={handleImageUpload} />

        {/* Hidden canvas for frame capture */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Action buttons for specific states */}
        {chatState === "initial" && (
          <div className="mx-6 mb-2 flex gap-2">
            <Button onClick={() => selectLanguage("english")} className="flex-1" variant="outline">
              English
            </Button>
            <Button onClick={() => selectLanguage("hindi")} className="flex-1" variant="outline">
              हिंदी
            </Button>
          </div>
        )}

        {chatState === "main_menu" && (
          <div className="mx-6 mb-2 flex gap-2">
            <Button onClick={() => handleMenuSelection(1)} className="flex-1" variant="outline">
              {language === "english" ? "Identify Pest" : "कीट पहचानें"}
            </Button>
            <Button onClick={toggleLiveMode} className="flex-1" variant="outline">
              {language === "english" ? "🎙️ Live Mode" : "🎙️ लाइव मोड"}
            </Button>
          </div>
        )}

        {chatState === "awaiting_image" && (
          <div className="mx-6 mb-2">
            <Button
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex items-center gap-2"
              variant="outline"
            >
              <Upload size={16} />
              {language === "english" ? "Upload Pest Image" : "कीट की छवि अपलोड करें"}
            </Button>
          </div>
        )}

        {/* Chat input form */}
        <form
          onSubmit={handleSubmit}
          className="border-input bg-background focus-within:ring-ring/10 relative mx-6 mb-6 flex items-center gap-2 rounded-[16px] border px-3 py-1.5 text-sm focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-0"
        >
          {/* Upload button (left side) */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="size-8 rounded-full bg-gray-200 hover:bg-gray-300 text-gray-700 p-0 flex items-center justify-center shrink-0"
                disabled={isProcessing || chatState === "awaiting_image"}
              >
                <Upload size={16} />
              </Button>
              </TooltipTrigger>
              <TooltipContent sideOffset={12}>
                {language === "english" ? "Upload image" : "छवि अपलोड करें"}
              </TooltipContent>
            </Tooltip>

          <AutoResizeTextarea
            onKeyDown={handleKeyDown}
            onChange={handleInputChange}
            value={input}
            placeholder={language === "english" ? "Type a message..." : "संदेश टाइप करें..."}
            className="placeholder:text-muted-foreground flex-1 bg-transparent focus:outline-none"
            disabled={isProcessing || chatState === "awaiting_image"}
          />

          {/* Live mode button (right side when not in live mode) */}
          {chatState !== "awaiting_image" && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  size="sm"
                  onClick={toggleLiveMode}
                  className="size-8 rounded-full bg-green-500 hover:bg-green-600 text-white p-0 flex items-center justify-center shrink-0"
                  disabled={isProcessing}
                >
                  🎙️
                </Button>
              </TooltipTrigger>
              <TooltipContent sideOffset={12}>
                {language === "english" ? "Start Live Mode" : "लाइव मोड शुरू करें"}
              </TooltipContent>
            </Tooltip>
          )}

          {/* Send button (always present) */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="submit"
                size="sm"
                className="size-8 rounded-full bg-blue-500 hover:bg-blue-600 text-white p-0 flex items-center justify-center shrink-0"
                disabled={isProcessing || chatState === "awaiting_image" || !input.trim()}
              >
                {isProcessing ? <Loader2 size={16} className="animate-spin" /> : <ArrowUpIcon size={16} />}
              </Button>
            </TooltipTrigger>
            <TooltipContent sideOffset={12}>
              {language === "english" ? "Send message" : "संदेश भेजें"}
            </TooltipContent>
          </Tooltip>
        </form>
        </main>
      </div>
    </TooltipProvider>
  )
}


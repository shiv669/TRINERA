"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { cn } from "@/lib/utils"
import { ArrowUpIcon, Upload, Camera, Loader2 } from "lucide-react"
import { Button } from "@/components/button"
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip"

// Message type definition
type Message = {
  role: "user" | "assistant" | "system"
  content: string
  imageUrl?: string
  videoUrl?: string
  heatmapUrl?: string
}

// Chat state types
type ChatState =
  | "initial"
  | "language_selected"
  | "main_menu"
  | "pest_identification"
  | "farmland_scan"
  | "awaiting_image"
  | "analyzing_image"
  | "pest_result"
  | "awaiting_video"
  | "recording_video"
  | "analyzing_video"
  | "heatmap_result"

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
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [isRecording, setIsRecording] = useState(false)
  const [stream, setStream] = useState<MediaStream | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Clean up media stream when component unmounts
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop())
      }
    }
  }, [stream])

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
      setChatState("farmland_scan")
      const message =
        language === "english"
          ? "To scan your farmland for pests, I'll need you to record a short video of your crops. Please click the 'Record Video' button when you're ready."
          : "कीटों के लिए अपने खेत को स्कैन करने के लिए, मुझे आपकी फसलों का एक छोटा वीडियो रिकॉर्ड करने की आवश्यकता होगी। जब आप तैयार हों तो कृपया 'वीडियो रिकॉर्ड करें' बटन पर क्लिक करें।"

      setMessages((prev) => [
        ...prev,
        {
          role: "user",
          content:
            language === "english"
              ? "I want to scan my farmland for harmful pests"
              : "मैं अपने खेत को हानिकारक कीटों के लिए स्कैन करना चाहता हूं",
        },
        { role: "assistant", content: message },
      ])
      setChatState("awaiting_video")
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

    analyzePestImage(imageUrl)
  }

  // Simulate pest image analysis
  const analyzePestImage = (imageUrl: string) => {
    setChatState("analyzing_image")
    setIsProcessing(true)

    const analysisMessage =
      language === "english"
        ? "Analyzing your image... Please wait while I identify the pest."
        : "आपकी छवि का विश्लेषण किया जा रहा है... कृपया प्रतीक्षा करें जबकि मैं कीट की पहचान करता हूं।"

    setMessages((prev) => [...prev, { role: "assistant", content: analysisMessage }])

    // Simulate analysis time
    setTimeout(() => {
      const pestResults = {
        name: "Fall Armyworm (Spodoptera frugiperda)",
        harmful: true,
        description:
          language === "english"
            ? "This is a Fall Armyworm, a highly destructive pest that affects crops like maize, rice, and vegetables."
            : "यह फॉल आर्मीवर्म है, एक अत्यधिक विनाशकारी कीट जो मक्का, चावल और सब्जियों जैसी फसलों को प्रभावित करता है।",
        spread:
          language === "english"
            ? "It spreads rapidly through adult moth flight and can travel long distances. Female moths lay eggs in masses on plant leaves."
            : "यह वयस्क पतंगे की उड़ान के माध्यम से तेजी से फैलता है और लंबी दूरी तय कर सकता है। मादा पतंगे पौधों की पत्तियों पर समूह में अंडे देती हैं।",
        precautions:
          language === "english"
            ? "1. Apply neem-based pesticides early morning or evening\n2. Introduce natural predators like ladybugs\n3. Implement crop rotation\n4. Monitor your fields regularly for early detection"
            : "1. सुबह या शाम को नीम आधारित कीटनाशकों का प्रयोग करें\n2. लेडीबग जैसे प्राकृतिक शिकारियों को शामिल करें\n3. फसल चक्र लागू करें\n4. प्रारंभिक पहचान के लिए नियमित रूप से अपने खेतों की निगरानी करें",
      }

      const resultMessage =
        language === "english"
          ? `**Pest Identified**: ${pestResults.name}\n\n**Is it harmful?** ${pestResults.harmful ? "Yes, this pest is harmful to crops." : "No, this pest is generally not harmful."}\n\n**Description**: ${pestResults.description}\n\n**How it spreads**: ${pestResults.spread}\n\n**Precautions**:\n${pestResults.precautions}`
          : `**कीट की पहचान**: ${pestResults.name}\n\n**क्या यह हानिकारक है?** ${pestResults.harmful ? "हां, यह कीट फसलों के लिए हानिकारक है।" : "नहीं, यह कीट आमतौर पर हानिकारक नहीं है।"}\n\n**विवरण**: ${pestResults.description}\n\n**कैसे फैलता है**: ${pestResults.spread}\n\n**सावधानियां**:\n${pestResults.precautions}`

      setMessages((prev) => [...prev.slice(0, -1), { role: "assistant", content: resultMessage }])
      setIsProcessing(false)
      setChatState("pest_result")
    }, 3000)
  }

  // Start video recording
  const startVideoRecording = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true })
      setStream(mediaStream)

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
      }

      const mediaRecorder = new MediaRecorder(mediaStream)
      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data)
        }
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "video/mp4" })
        const videoUrl = URL.createObjectURL(blob)
        setVideoFile(new File([blob], "farmland-video.mp4", { type: "video/mp4" }))

        setMessages((prev) => [
          ...prev,
          {
            role: "user",
            content:
              language === "english" ? "I've recorded a video of my farmland." : "मैंने अपने खेत का वीडियो रिकॉर्ड किया है।",
            videoUrl,
          },
        ])

        analyzeVideo(videoUrl)
      }

      mediaRecorder.start()
      setIsRecording(true)
      setChatState("recording_video")

      // Auto-stop after 10 seconds
      setTimeout(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
          stopVideoRecording()
        }
      }, 10000)
    } catch (error) {
      console.error("Error accessing camera:", error)
      const errorMessage =
        language === "english"
          ? "Unable to access your camera. Please check your camera permissions and try again."
          : "आपके कैमरे तक पहुंचने में असमर्थ। कृपया अपने कैमरा अनुमतियों की जांच करें और पुनः प्रयास करें।"

      setMessages((prev) => [...prev, { role: "assistant", content: errorMessage }])
    }
  }

  // Stop video recording
  const stopVideoRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop()
      setIsRecording(false)

      if (stream) {
        stream.getTracks().forEach((track) => track.stop())
      }

      if (videoRef.current) {
        videoRef.current.srcObject = null
      }

      setStream(null)
    }
  }

  // Simulate video analysis
  const analyzeVideo = (videoUrl: string) => {
    setChatState("analyzing_video")
    setIsProcessing(true)

    const analysisMessage =
      language === "english"
        ? "Analyzing your farmland video... Creating a pest heatmap for your field."
        : "आपके खेत के वीडियो का विश्लेषण किया जा रहा है... आपके खेत के लिए एक कीट हीटमैप बनाया जा रहा है।"

    setMessages((prev) => [...prev, { role: "assistant", content: analysisMessage }])

    // Simulate analysis time
    setTimeout(() => {
      // Simulated heatmap image URL (using placeholder)
      const heatmapUrl = "/placeholder.svg?height=400&width=600"

      const resultMessage =
        language === "english"
          ? "**Farmland Analysis Complete**\n\nI've generated a heatmap of your farmland showing pest concentration:\n\n- **Red areas**: High concentration of harmful pests (Fall Armyworm)\n- **Yellow areas**: Moderate pest activity (Aphids)\n- **Green areas**: Low or no harmful pest activity\n\n**Recommendation**: Focus treatment on the red areas first using neem-based pesticides. Monitor yellow areas closely over the next week."
          : "**खेत विश्लेषण पूर्ण**\n\nमैंने आपके खेत का एक हीटमैप तैयार किया है जो कीट सांद्रता दिखाता है:\n\n- **लाल क्षेत्र**: हानिकारक कीटों की उच्च सांद्रता (फॉल आर्मीवर्म)\n- **पीले क्षेत्र**: मध्यम कीट गतिविधि (एफिड्स)\n- **हरे क्षेत्र**: कम या कोई हानिकारक कीट गतिविधि नहीं\n\n**अनुशंसा**: नीम-आधारित कीटनाशकों का उपयोग करके पहले लाल क्षेत्रों पर उपचार पर ध्यान केंद्रित करें। अगले सप्ताह पीले क्षेत्रों की बारीकी से निगरानी करें।"

      setMessages((prev) => [
        ...prev.slice(0, -1),
        {
          role: "assistant",
          content: resultMessage,
          heatmapUrl,
        },
      ])

      setIsProcessing(false)
      setChatState("heatmap_result")
    }, 4000)
  }

  // Handle form submission
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!input.trim()) return

    // Add user message
    setMessages((prev) => [...prev, { role: "user", content: input }])

    // Process based on current state
    if (chatState === "initial") {
      if (input.toLowerCase().includes("english")) {
        selectLanguage("english")
      } else if (input.toLowerCase().includes("hindi") || input.toLowerCase().includes("हिंदी")) {
        selectLanguage("hindi")
      } else {
        // If language not detected, ask again
        const promptMessage = "I didn't understand your language preference. Please type 'English' or 'हिंदी'."
        setMessages((prev) => [...prev, { role: "assistant", content: promptMessage }])
      }
    } else if (chatState === "main_menu") {
      if (input.includes("1") || input.toLowerCase().includes("identify") || input.toLowerCase().includes("pest")) {
        handleMenuSelection(1)
      } else if (
        input.includes("2") ||
        input.toLowerCase().includes("scan") ||
        input.toLowerCase().includes("farmland")
      ) {
        handleMenuSelection(2)
      } else {
        // If option not detected, show menu again
        showMainMenu()
      }
    } else if (chatState === "pest_result" || chatState === "heatmap_result") {
      // Return to main menu after results
      showMainMenu()
    }

    setInput("")
  }

  // Handle key press in textarea
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      const form = e.currentTarget.form
      if (form) form.requestSubmit()
    }
  }

  // Auto-resize textarea
  const AutoResizeTextarea = ({
    value,
    onChange,
    ...props
  }: {
    value: string
    onChange: (value: string) => void
    [key: string]: any
  }) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null)

    const resizeTextarea = () => {
      const textarea = textareaRef.current
      if (textarea) {
        textarea.style.height = "auto"
        textarea.style.height = `${textarea.scrollHeight}px`
      }
    }

    useEffect(() => {
      resizeTextarea()
    }, [value])

    return (
      <textarea
        {...props}
        value={value}
        ref={textareaRef}
        rows={1}
        onChange={(e) => {
          onChange(e.target.value)
          resizeTextarea()
        }}
        className={cn("resize-none min-h-4 max-h-80", props.className)}
      />
    )
  }

  // Render message content with images/videos/heatmaps
  const renderMessageContent = (message: Message) => {
    return (
      <div className="flex flex-col gap-2">
        <div>{message.content}</div>

        {message.imageUrl && (
          <div className="mt-2 relative">
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
      <main className="mx-auto flex h-svh max-h-svh w-full max-w-[35rem] flex-col items-stretch border-none">
        <div className="flex-1 content-center overflow-y-auto px-6">
          <div className="my-4 flex h-fit min-h-full flex-col gap-4">
            {messages.map((message, index) => (
              <div
                key={index}
                data-role={message.role}
                className="max-w-[80%] rounded-xl px-3 py-2 text-sm data-[role=assistant]:self-start data-[role=user]:self-end data-[role=assistant]:bg-gray-100 data-[role=user]:bg-blue-500 data-[role=assistant]:text-black data-[role=user]:text-white"
              >
                {renderMessageContent(message)}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Hidden file input for image upload */}
        <input type="file" ref={fileInputRef} accept="image/*" className="hidden" onChange={handleImageUpload} />

        {/* Video recording preview */}
        {chatState === "recording_video" && (
          <div className="mx-6 mb-2 rounded-lg overflow-hidden border border-gray-200 bg-black relative">
            <video ref={videoRef} autoPlay muted className="w-full h-40 object-cover" />
            <div className="absolute bottom-2 right-2 flex gap-2">
              <div className="bg-red-500 rounded-full h-3 w-3 animate-pulse" />
              <span className="text-white text-xs">{language === "english" ? "Recording..." : "रिकॉर्डिंग..."}</span>
            </div>
            <Button
              onClick={stopVideoRecording}
              className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full h-8 w-8 p-0 flex items-center justify-center"
            >
              <span className="h-3 w-3 bg-white rounded-sm" />
            </Button>
          </div>
        )}

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
            <Button onClick={() => handleMenuSelection(2)} className="flex-1" variant="outline">
              {language === "english" ? "Scan Farmland" : "खेत स्कैन करें"}
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

        {chatState === "awaiting_video" && (
          <div className="mx-6 mb-2">
            <Button onClick={startVideoRecording} className="w-full flex items-center gap-2" variant="outline">
              <Camera size={16} />
              {language === "english" ? "Record Video" : "वीडियो रिकॉर्ड करें"}
            </Button>
          </div>
        )}

        {/* Chat input form */}
        <form
          onSubmit={handleSubmit}
          className="border-input bg-background focus-within:ring-ring/10 relative mx-6 mb-6 flex items-center rounded-[16px] border px-3 py-1.5 pr-8 text-sm focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-0"
        >
          <AutoResizeTextarea
            onKeyDown={handleKeyDown}
            onChange={(v) => setInput(v)}
            value={input}
            placeholder={language === "english" ? "Type a message..." : "संदेश टाइप करें..."}
            className="placeholder:text-muted-foreground flex-1 bg-transparent focus:outline-none"
            disabled={isProcessing || isRecording || ["awaiting_image", "awaiting_video"].includes(chatState)}
          />
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="submit"
                variant="ghost"
                size="sm"
                className="absolute bottom-1 right-1 size-6 rounded-full"
                disabled={isProcessing || isRecording || ["awaiting_image", "awaiting_video"].includes(chatState)}
              >
                {isProcessing ? <Loader2 size={16} className="animate-spin" /> : <ArrowUpIcon size={16} />}
              </Button>
            </TooltipTrigger>
            <TooltipContent sideOffset={12}>Submit</TooltipContent>
          </Tooltip>
        </form>
      </main>
    </TooltipProvider>
  )
}


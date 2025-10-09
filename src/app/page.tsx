import { CpuArchitecture } from "@/components/cpu-architecture";
import { Boxes } from "@/components/boxes";
import { MorphingText } from "@/components/MorphingText";
import DisplayCards from "@/components/DisplayCards";
import { TextShimmer } from "@/components/TextShimmer";
import { Timeline } from "@/components/Timeline";
import Footer from "@/components/Footer";
import { Sparkles, Cpu, Bug } from "lucide-react";
import Image from "next/image";

export default function CpuPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <MorphingText texts={["Project - Trinera", "AI-Powered", "Pest Detection"]} className="text-xl font-bold" />
      <div className="w-full max-w-3xl h-[500px] border border-gray-200 dark:border-gray-800 rounded-lg p-6 bg-white dark:bg-transparent relative overflow-hidden">
        <Boxes className="opacity-30" />
        <CpuArchitecture 
          width="100%" 
          height="70%" 
          text="TRI" 
          showCpuConnections={true}
          animateText={true}
          animateLines={true}
          animateMarkers={true}
        />
        <div className="flex gap-4 justify-center mt-4 relative z-10">
          <a href="/interbot" className="relative z-20">
            <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Get Started
            </button>
          </a>
          <a href="https://github.com/shiv669/TRINERA" target="_blank" rel="noopener noreferrer" className="relative z-20">
            <button className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2">
              <svg height="20" viewBox="0 0 16 16" width="20" className="fill-current">
                <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"></path>
              </svg>
              GitHub
            </button>
          </a>
        </div>
      </div>
      <div className="max-w-4xl text-center px-4 py-8 relative overflow-visible">
        <TextShimmer className="text-gray-600 dark:text-gray-400 mb-6">
          TRINERA is an AI-powered live farming assistant with real-time pest detection capabilities. 
          Interact through voice and camera using our Live Mode to get instant pest identification, treatment recommendations, 
          and farming guidance powered by advanced AI models and computer vision.
        </TextShimmer>
        
        <DisplayCards 
          cards={[
            {
              icon: <Cpu className="size-4 text-green-300" />,
              title: "Live Mode",
              description: "Real-time voice & camera interaction",
              date: "Gemini Live-style interface",
              iconClassName: "text-green-500",
              titleClassName: "text-green-500",
              className: "[grid-area:stack] -translate-x-4 translate-y-2 hover:-translate-y-6 before:absolute before:w-[100%] before:outline-1 before:rounded-xl before:outline-border before:h-[100%] before:content-[''] before:bg-blend-overlay before:bg-background/50 grayscale-[100%] hover:before:opacity-0 before:transition-opacity before:duration:700 hover:grayscale-0 before:left-0 before:top-0"
            },
            {
              icon: <Bug className="size-4 text-purple-300" />,
              title: "Pest Detection",
              description: "AI-powered image analysis",
              date: "HuggingFace models",
              iconClassName: "text-purple-500",
              titleClassName: "text-purple-500",
              className: "[grid-area:stack] translate-x-6 translate-y-10 hover:translate-y-2 before:absolute before:w-[100%] before:outline-1 before:rounded-xl before:outline-border before:h-[100%] before:content-[''] before:bg-blend-overlay before:bg-background/50 grayscale-[100%] hover:before:opacity-0 before:transition-opacity before:duration:700 hover:grayscale-0 before:left-0 before:top-0"
            },
            {
              icon: <Sparkles className="size-4 text-blue-300" />,
              title: "Multi-Language",
              description: "English & Hindi support",
              date: "Edge TTS voice output",
              iconClassName: "text-blue-500",
              titleClassName: "text-blue-500",
              className: "[grid-area:stack] translate-x-16 translate-y-18 hover:translate-y-10"
            }
          ]}
        />
      </div>
      <div className="mt-12 mb-16">
        <Timeline data={[
          {
            title: "Live Voice Interaction",
            content: (
              <div className="space-y-4">
                <Image 
                  src="https://images.unsplash.com/photo-1625246333195-78d9c38ad449?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&h=600&q=80" 
                  alt="Live Voice Interaction" 
                  width={800} 
                  height={600} 
                  className="w-full h-auto rounded-lg shadow-md" 
                />
                <div className="prose dark:prose-invert">
                  <p>TRINERA features a Gemini Live-style interface where farmers can interact naturally using their voice. Simply speak your questions while showing your crops to the camera, and get instant responses with voice feedback.</p>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>Continuous speech recognition using Web Speech API</li>
                    <li>Real-time voice responses powered by Microsoft Edge TTS</li>
                    <li>Support for English and Hindi languages</li>
                    <li>Natural conversation flow with context awareness</li>
                    <li>Hands-free operation ideal for fieldwork</li>
                  </ul>
                </div>
              </div>
            ),
          },
          {
            title: "AI-Powered Analysis",
            content: (
              <div className="space-y-4">
                <Image 
                  src="https://images.unsplash.com/photo-1580584126903-c17d41830450?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&h=600&q=80" 
                  alt="AI Analysis" 
                  width={800} 
                  height={600} 
                  className="w-full h-auto rounded-lg shadow-md" 
                />
                <div className="prose dark:prose-invert">
                  <p>Our system leverages cutting-edge AI technologies to provide intelligent farming assistance. Powered by Ollama for local AI inference and HuggingFace models for specialized tasks, TRINERA delivers accurate and contextual responses.</p>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>Ollama AI models running locally for fast, private inference</li>
                    <li>HuggingFace Transformers for advanced image analysis</li>
                    <li>Context-aware conversations maintaining chat history</li>
                    <li>Visual + voice context fusion for comprehensive understanding</li>
                    <li>Trained on agricultural and pest detection datasets</li>
                  </ul>
                </div>
              </div>
            ),
          },
          {
            title: "Real-Time Pest Detection",
            content: (
              <div className="space-y-4">
                <Image 
                  src="https://plus.unsplash.com/premium_photo-1692817057887-8965903cc713?q=80&w=1374&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" 
                  alt="Pest Detection" 
                  width={800} 
                  height={600} 
                  className="w-full h-auto rounded-lg shadow-md" 
                />
                <div className="prose dark:prose-invert">
                  <p>Using computer vision and deep learning, TRINERA can identify various pests from camera images. The system continuously captures frames while you interact, providing real-time visual context to the AI assistant.</p>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>Automatic frame capture every 3 seconds during Live Mode</li>
                    <li>Computer vision models trained on IP102 pest dataset</li>
                    <li>Identification of common agricultural pests and diseases</li>
                    <li>Visual context integrated with conversational AI responses</li>
                    <li>Support for both front and rear camera switching</li>
                  </ul>
                </div>
              </div>
            ),
          },
          {
            title: "Smart Recommendations",
            content: (
              <div className="space-y-4">
                <Image 
                  src="https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&h=600&q=80" 
                  alt="Smart Recommendations" 
                  width={800} 
                  height={600} 
                  className="w-full h-auto rounded-lg shadow-md" 
                />
                <div className="prose dark:prose-invert">
                  <p>Beyond pest detection, TRINERA provides comprehensive farming guidance including treatment options, preventive measures, and best practices tailored to your specific situation and local context.</p>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>Personalized treatment recommendations based on detected pests</li>
                    <li>Eco-friendly and organic pest control suggestions</li>
                    <li>Preventive measures to protect crops before infestation</li>
                    <li>Multi-language support for wider accessibility (English & Hindi)</li>
                    <li>Session-based conversation history for context continuity</li>
                  </ul>
                </div>
              </div>
            ),
          }
        ]} />
      </div>
      <div className="mt-auto py-8 w-full">
        <Footer />
      </div>
    </div>
  );
}
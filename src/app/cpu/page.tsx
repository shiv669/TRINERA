import { CpuArchitecture } from "@/components/cpu-architecture";

export default function CpuPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 gap-8">
      <h1 className="text-3xl font-bold">TRINERA Architecture</h1>
      <div className="w-full max-w-3xl h-[400px] border border-gray-200 dark:border-gray-800 rounded-lg p-6 bg-white dark:bg-black">
        <CpuArchitecture 
          width="100%" 
          height="100%" 
          text="TRI" 
          showCpuConnections={true}
          animateText={true}
          animateLines={true}
          animateMarkers={true}
        />
      </div>
      <div className="max-w-3xl text-center">
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          TRINERA is built on a modern tech stack combining Next.js frontend with FastAPI backend, 
          leveraging Ollama for local AI inference, HuggingFace for computer vision, and Edge TTS for voice synthesis.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
          <div className="p-4 border border-gray-200 dark:border-gray-800 rounded-lg">
            <h3 className="font-medium mb-2">Core Technologies</h3>
            <ul className="list-disc list-inside text-sm space-y-1 text-gray-600 dark:text-gray-400">
              <li>Next.js 15 with TypeScript</li>
              <li>FastAPI backend with WebSockets</li>
              <li>Ollama for local AI models</li>
              <li>HuggingFace Transformers</li>
              <li>Microsoft Edge TTS</li>
            </ul>
          </div>
          <div className="p-4 border border-gray-200 dark:border-gray-800 rounded-lg">
            <h3 className="font-medium mb-2">Key Features</h3>
            <ul className="list-disc list-inside text-sm space-y-1 text-gray-600 dark:text-gray-400">
              <li>Real-time voice interaction</li>
              <li>Live camera pest detection</li>
              <li>Multi-language support (EN/HI)</li>
              <li>Session-based conversations</li>
              <li>IP102 pest dataset trained</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
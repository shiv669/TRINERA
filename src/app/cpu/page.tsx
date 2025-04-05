import { CpuArchitecture } from "@/components/cpu-architecture";

export default function CpuPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 gap-8">
      <h1 className="text-3xl font-bold">CPU Architecture</h1>
      <div className="w-full max-w-3xl h-[400px] border border-gray-200 dark:border-gray-800 rounded-lg p-6 bg-white dark:bg-black">
        <CpuArchitecture 
          width="100%" 
          height="100%" 
          text="CPU" 
          showCpuConnections={true}
          animateText={true}
          animateLines={true}
          animateMarkers={true}
        />
      </div>
      <div className="max-w-3xl text-center">
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          This visualization demonstrates a CPU architecture with animated connections and light effects.
          The component is highly customizable through various props.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
          <div className="p-4 border border-gray-200 dark:border-gray-800 rounded-lg">
            <h3 className="font-medium mb-2">Features</h3>
            <ul className="list-disc list-inside text-sm space-y-1 text-gray-600 dark:text-gray-400">
              <li>Animated connection lines</li>
              <li>Glowing markers</li>
              <li>Customizable text</li>
              <li>Responsive design</li>
            </ul>
          </div>
          <div className="p-4 border border-gray-200 dark:border-gray-800 rounded-lg">
            <h3 className="font-medium mb-2">Customization</h3>
            <ul className="list-disc list-inside text-sm space-y-1 text-gray-600 dark:text-gray-400">
              <li>Change CPU text</li>
              <li>Toggle animations</li>
              <li>Adjust marker size</li>
              <li>Show/hide connections</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
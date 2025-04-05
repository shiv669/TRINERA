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
          <button className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2">
            <svg height="20" viewBox="0 0 16 16" width="20" className="fill-current">
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"></path>
            </svg>
            GitHub
          </button>
        </div>
      </div>
      <div className="max-w-4xl text-center px-4 py-8 relative overflow-visible">
        <TextShimmer className="text-gray-600 dark:text-gray-400 mb-6">
          Trinera is an advanced AI-powered pest detection system that helps farmers identify harmful pests and protect their crops.
          Take photos of pests or scan your entire farmland to get real-time analysis and prevention recommendations.
        </TextShimmer>
        
        <DisplayCards 
          cards={[
            {
              icon: <Cpu className="size-4 text-green-300" />,
              title: "Features",
              description: "Advanced pest detection capabilities",
              date: "Latest update",
              iconClassName: "text-green-500",
              titleClassName: "text-green-500",
              className: "[grid-area:stack] -translate-x-4 translate-y-2 hover:-translate-y-6 before:absolute before:w-[100%] before:outline-1 before:rounded-xl before:outline-border before:h-[100%] before:content-[''] before:bg-blend-overlay before:bg-background/50 grayscale-[100%] hover:before:opacity-0 before:transition-opacity before:duration:700 hover:grayscale-0 before:left-0 before:top-0"
            },
            {
              icon: <Bug className="size-4 text-purple-300" />,
              title: "Pest Detection",
              description: "AI-powered identification system",
              date: "Real-time analysis",
              iconClassName: "text-purple-500",
              titleClassName: "text-purple-500",
              className: "[grid-area:stack] translate-x-6 translate-y-10 hover:translate-y-2 before:absolute before:w-[100%] before:outline-1 before:rounded-xl before:outline-border before:h-[100%] before:content-[''] before:bg-blend-overlay before:bg-background/50 grayscale-[100%] hover:before:opacity-0 before:transition-opacity before:duration:700 hover:grayscale-0 before:left-0 before:top-0"
            },
            {
              icon: <Sparkles className="size-4 text-blue-300" />,
              title: "Customization",
              description: "Fully adaptable to your needs",
              date: "Flexible options",
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
            title: "Farm Monitoring",
            content: (
              <div className="space-y-4">
                <Image 
                  src="https://images.unsplash.com/photo-1625246333195-78d9c38ad449?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&h=600&q=80" 
                  alt="Farm Monitoring" 
                  width={800} 
                  height={600} 
                  className="w-full h-auto rounded-lg shadow-md" 
                />
                <div className="prose dark:prose-invert">
                  <p>The first step in our pest detection process involves comprehensive monitoring of your farmland. Using advanced drones equipped with high-resolution cameras, we capture detailed imagery of your entire agricultural area.</p>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>Automated drone flights cover up to 100 acres per hour</li>
                    <li>Multi-spectral imaging captures both visible and non-visible light spectrums</li>
                    <li>GPS-tagged imagery for precise location mapping</li>
                    <li>Regular monitoring schedules to track changes over time</li>
                  </ul>
                </div>
              </div>
            ),
          },
          {
            title: "AI Analysis",
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
                  <p>Our proprietary AI algorithms process the captured imagery to identify potential pest infestations with remarkable accuracy. The system has been trained on millions of images to recognize over 500 different pest species and their damage patterns.</p>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>Deep learning models identify pest presence with 98.7% accuracy</li>
                    <li>Pattern recognition detects early signs of infestation before visible damage occurs</li>
                    <li>Species classification helps determine appropriate treatment methods</li>
                    <li>Population density estimation to assess infestation severity</li>
                  </ul>
                </div>
              </div>
            ),
          },
          {
            title: "Heat Map Generation",
            content: (
              <div className="space-y-4">
                <Image 
                  src="https://plus.unsplash.com/premium_photo-1692817057887-8965903cc713?q=80&w=1374&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" 
                  alt="Heat Map Generation" 
                  width={800} 
                  height={600} 
                  className="w-full h-auto rounded-lg shadow-md" 
                />
                <div className="prose dark:prose-invert">
                  <p>Based on the AI analysis, we generate detailed heat maps of your farmland showing pest activity hotspots. These visual representations help you understand the spatial distribution of infestations and prioritize treatment areas.</p>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>Color-coded visualization indicates infestation severity levels</li>
                    <li>Interactive maps allow zooming into specific problem areas</li>
                    <li>Historical comparison tracks the spread or containment of pests over time</li>
                    <li>Predictive modeling forecasts potential spread patterns based on environmental factors</li>
                  </ul>
                </div>
              </div>
            ),
          },
          {
            title: "Prevention Recommendations",
            content: (
              <div className="space-y-4">
                <Image 
                  src="https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&h=600&q=80" 
                  alt="Prevention Recommendations" 
                  width={800} 
                  height={600} 
                  className="w-full h-auto rounded-lg shadow-md" 
                />
                <div className="prose dark:prose-invert">
                  <p>Finally, our system provides customized prevention and treatment recommendations based on the specific pests identified, their distribution, and your crop types. We prioritize environmentally friendly and cost-effective solutions.</p>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>Targeted treatment plans minimize pesticide use and environmental impact</li>
                    <li>Biological control options when appropriate</li>
                    <li>Crop rotation and companion planting strategies</li>
                    <li>Ongoing monitoring schedule to evaluate treatment effectiveness</li>
                    <li>Integration with farm management systems for streamlined implementation</li>
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
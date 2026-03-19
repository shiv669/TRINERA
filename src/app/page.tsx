import Hero from "@/components/Hero";
import Link from "next/link";
import { CloudSun, TrendingUp, Newspaper, FileText, ArrowRight, Sprout } from "lucide-react";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow">
        <Hero />
        
        {/* Dashboard Quick Actions */}
        <section className="py-20 bg-gradient-to-b from-gray-50 to-white relative">
          {/* Decorative top border */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#2D5A27] via-[#4a8c3f] to-[#2D5A27]" />
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 bg-[#F4F9F1] text-[#2D5A27] px-4 py-2 rounded-full text-sm font-semibold mb-4 border border-green-200">
                <Sprout className="w-4 h-4" />
                Your Farming Hub
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
                Quick Actions Dashboard
              </h2>
              <p className="text-gray-500 max-w-lg mx-auto">
                Access all essential farming tools and information at a glance.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              
              {/* Weather Summary Tile */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg hover:border-blue-200 transition-all duration-300 flex flex-col h-full group">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-blue-50 text-blue-600 rounded-xl shadow-sm shadow-blue-100 group-hover:scale-110 transition-transform">
                    <CloudSun className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Weather</h3>
                </div>
                <div className="flex-grow">
                  <p className="text-3xl font-bold text-[#2D5A27] mb-1">32°C</p>
                  <p className="text-gray-500 text-sm">Sunny • 65% Humidity</p>
                  <p className="text-gray-600 text-sm mt-3 border-t pt-3">
                    Optimal conditions for harvesting.
                  </p>
                </div>
                <Link href="/weather" className="mt-6 flex items-center justify-between text-[#2D5A27] font-medium group/link">
                  Detailed Forecast <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                </Link>
              </div>

              {/* Trending Mandi Rates Tile */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg hover:border-green-200 transition-all duration-300 flex flex-col h-full group">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-green-50 text-green-600 rounded-xl shadow-sm shadow-green-100 group-hover:scale-110 transition-transform">
                    <TrendingUp className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Mandi Trends</h3>
                </div>
                <div className="flex-grow space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-medium text-gray-700">Wheat (MP)</span>
                    <span className="text-green-600 font-bold">₹2400 <span className="text-xs">▲</span></span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-medium text-gray-700">Soybean (MH)</span>
                    <span className="text-red-500 font-bold">₹4800 <span className="text-xs">▼</span></span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-medium text-gray-700">Mustard (UP)</span>
                    <span className="text-green-600 font-bold">₹5200 <span className="text-xs">▲</span></span>
                  </div>
                </div>
                <Link href="/mandi" className="mt-6 flex items-center justify-between text-[#2D5A27] font-medium group/link">
                  All Market Rates <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                </Link>
              </div>

              {/* Agri-News Headline Tile */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg hover:border-orange-200 transition-all duration-300 flex flex-col h-full group">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-orange-50 text-orange-600 rounded-xl shadow-sm shadow-orange-100 group-hover:scale-110 transition-transform">
                    <Newspaper className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Latest News</h3>
                </div>
                <div className="flex-grow">
                  <p className="font-bold text-gray-900 line-clamp-2 mb-2">
                    Government announces new MSP for Rabi crops
                  </p>
                  <p className="text-xs text-gray-500 mb-2">AgriNews India • Today</p>
                  <p className="text-sm text-gray-600 line-clamp-2">
                    In a major relief to farmers, the central government has hiked the Minimum Support Price...
                  </p>
                </div>
                <Link href="/news" className="mt-4 flex items-center justify-between text-[#2D5A27] font-medium group/link">
                  Read More News <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                </Link>
              </div>

              {/* Gov Schemes Tile */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg hover:border-purple-200 transition-all duration-300 flex flex-col h-full group border-t-4 border-t-[#2D5A27]">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-purple-50 text-purple-600 rounded-xl shadow-sm shadow-purple-100 group-hover:scale-110 transition-transform">
                    <FileText className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Gov Schemes</h3>
                </div>
                <div className="flex-grow">
                  <p className="text-gray-600 text-sm mb-4">
                    Discover and apply for financial assistance, insurance, and resources provided by the government.
                  </p>
                  <div className="bg-[#F4F9F1] p-3 rounded-lg text-sm text-[#2D5A27] font-semibold border border-green-100">
                    8 Schemes Available
                  </div>
                </div>
                <Link href="/schemes" className="mt-6 flex items-center justify-between text-[#2D5A27] font-medium group/link">
                  Browse Schemes <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                </Link>
              </div>

            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
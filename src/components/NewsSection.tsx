"use client";

import Image from "next/image";
import { Calendar, Building, ArrowRight, Search } from "lucide-react";
import { useState, useEffect } from "react";
import { useLanguage } from "@/context/LanguageContext";

interface NewsItem {
  id: string;
  title: string;
  source: { name: string };
  published_at: string;
  image_url: string;
  description: string | null;
  url: string;
}

export default function NewsSection() {
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [totalResults, setTotalResults] = useState(0);
  const { language } = useLanguage();

  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(9);

  useEffect(() => {
    const fetchNews = async () => {
      setLoading(true);
      setError("");
      try {
        const url = searchQuery
          ? `/api/news?lang=${language}&q=${encodeURIComponent(searchQuery)}`
          : `/api/news?lang=${language}`;
        const res = await fetch(url);
        const data = await res.json();
        
        if (!res.ok) throw new Error(data.error || "Failed to fetch news");
        setNewsItems(data.results || []);
        setTotalResults(data.totalResults || data.results?.length || 0);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "An unknown error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, [language, searchQuery]);

  return (
    <section id="news" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-12">
          <div className="max-w-2xl">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Latest Agriculture News
            </h2>
            <p className="text-lg text-gray-600 mb-6">
              Stay updated with the latest trends, government policies, and technological advancements in farming. 
              <span className="ml-2 inline-block px-2 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                Viewing in: {language}
              </span>
            </p>
            <form 
              onSubmit={(e) => { e.preventDefault(); setSearchQuery(searchInput); setVisibleCount(9); }}
              className="relative max-w-md"
            >
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search agriculture news..."
                className="block w-full pl-10 pr-20 py-3 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-[#2D5A27] focus:border-[#2D5A27] sm:text-sm"
              />
              <button 
                type="submit" 
                className="absolute inset-y-0 right-0 px-4 text-sm font-medium text-white bg-[#2D5A27] hover:bg-[#224A1D] rounded-r-lg transition-colors"
              >
                Search
              </button>
            </form>
            {searchQuery && (
              <div className="flex items-center gap-3 mt-3">
                <span className="text-sm text-gray-600">
                  Showing <strong>{newsItems.length}</strong> results for &quot;<strong>{searchQuery}</strong>&quot;
                  {totalResults > newsItems.length && ` (${totalResults} total found)`}
                </span>
                <button
                  onClick={() => { setSearchInput(""); setSearchQuery(""); setVisibleCount(9); }}
                  className="text-sm text-red-600 hover:text-red-800 font-medium underline"
                >
                  Clear search
                </button>
              </div>
            )}
          </div>
          {newsItems.length > visibleCount && (
            <button 
              onClick={() => setVisibleCount((prev) => prev + 9)}
              className="hidden md:flex items-center gap-2 text-[#2D5A27] font-semibold hover:gap-3 transition-all"
            >
              View More News <ArrowRight className="w-5 h-5" />
            </button>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2D5A27]"></div>
          </div>
        ) : error ? (
          <div className="text-center p-8 bg-red-50 text-red-600 rounded-xl border border-red-200">
            <p className="font-medium">⚠️ Error loading news</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
        ) : newsItems.length === 0 ? (
          <div className="text-center p-8 text-gray-500">
            {searchQuery 
              ? `No news articles found for "${searchQuery}". Try a different search term.`
              : "No news articles found for this language at the moment."
            }
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {newsItems.slice(0, visibleCount).map((news) => (
              <div 
                key={news.id} 
                className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-xl transition-all group flex flex-col h-full"
              >
                <div className="h-48 overflow-hidden relative bg-gray-100 flex items-center justify-center">
                  {news.image_url ? (
                    <Image 
                      src={news.image_url} 
                      alt={news.title}
                      fill
                      unoptimized
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <span className="text-gray-400">No image available</span>
                  )}
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold text-[#2D5A27] flex items-center gap-1.5 shadow-sm">
                    <Building className="w-3.5 h-3.5" />
                    <span className="truncate max-w-[150px]">{news.source?.name || 'News'}</span>
                  </div>
                </div>
                
                <div className="p-6 flex flex-col flex-grow">
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                    <Calendar className="w-4 h-4" />
                    {new Date(news.published_at).toLocaleDateString()}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-[#2D5A27] transition-colors">
                    {news.title}
                  </h3>
                  <p className="text-gray-600 mb-6 line-clamp-3 flex-grow">
                    {news.description || "No description available for this article."}
                  </p>
                  <div className="mt-auto">
                    <a href={news.url} target="_blank" rel="noopener noreferrer" className="text-[#2D5A27] font-medium flex items-center gap-1 hover:gap-2 transition-all w-full">
                      Read Full Story
                      <ArrowRight className="w-4 h-4 transition-transform text-[#2D5A27]" />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {newsItems.length > visibleCount && !loading && !error && (
          <button 
            onClick={() => setVisibleCount((prev) => prev + 9)}
            className="md:hidden mt-8 w-full flex justify-center items-center gap-2 border-2 border-[#2D5A27] text-[#2D5A27] font-semibold py-3 rounded-lg hover:bg-[#2D5A27] hover:text-white transition-colors"
          >
            View More News <ArrowRight className="w-5 h-5" />
          </button>
        )}
      </div>
    </section>
  );
}

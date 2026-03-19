"use client";

import { 
  Search, 
  Thermometer, 
  Droplets, 
  Wind, 
  Sun, 
  Eye, 
  Gauge,
  CloudSun,
  CloudRain,
  CloudLightning,
  Cloud
} from "lucide-react";
import { useState, useEffect } from "react";

interface HourForecast {
  time: string;
  temp_c: number;
  humidity: number;
  condition: { text: string };
}

interface WeatherData {
  location: { name: string; region: string };
  current: {
    temp_c: number;
    humidity: number;
    wind_kph: number;
    uv: number;
    vis_km: number;
    pressure_mb: number;
    condition: { text: string };
  };
  forecast: {
    forecastday: { hour: HourForecast[] }[];
  };
}

export default function WeatherForecast() {
  const [searchQuery, setSearchQuery] = useState("New Delhi");
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchWeather = async (query: string) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/weather?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch weather data");
      setWeatherData(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An unknown error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather("New Delhi"); // Initial default fetch
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      fetchWeather(searchQuery);
    }
  };

  const getMetricIcon = (conditionText: string) => {
    const text = conditionText.toLowerCase();
    if (text.includes("rain")) return CloudRain;
    if (text.includes("lightning") || text.includes("thunder")) return CloudLightning;
    if (text.includes("cloud") || text.includes("overcast")) return Cloud;
    if (text.includes("partly")) return CloudSun;
    return Sun;
  };

  return (
    <section id="weather" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Detailed Weather Forecast
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
            Get accurate and real-time agricultural weather updates to plan your farming activities better.
          </p>
          
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto flex items-center bg-white border border-gray-300 rounded-full shadow-sm overflow-hidden focus-within:ring-2 focus-within:ring-[#2D5A27] focus-within:border-transparent transition-all">
            <div className="pl-4 text-gray-400">
              <Search className="w-5 h-5" />
            </div>
            <input
              type="text"
              placeholder="Search by city, district, or pin code..."
              className="w-full px-4 py-3 outline-none text-gray-700 bg-transparent"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button 
              type="submit"
              className="bg-[#2D5A27] text-white px-8 py-3 font-medium hover:bg-[#1e3c1a] transition-colors h-full"
            >
              Search
            </button>
          </form>
          {error && <p className="text-red-500 mt-4 text-sm">{error}</p>}
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2D5A27]"></div>
          </div>
        ) : weatherData ? (
          <>
            <div className="mb-4 text-center">
              <h3 className="text-2xl font-bold text-[#2D5A27]">{weatherData.location.name}, {weatherData.location.region}</h3>
              <p className="text-gray-500">{weatherData.current.condition.text}</p>
            </div>
          
            {/* Dashboard Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-12">
              <div className="bg-[#F4F9F1] rounded-2xl p-6 text-center shadow-sm border border-green-50 flex flex-col items-center justify-center hover:shadow-md transition-shadow">
                <Thermometer className="w-8 h-8 text-[#2D5A27] mb-3" />
                <p className="text-gray-500 text-sm mb-1">Temperature</p>
                <p className="text-2xl font-bold text-gray-900">{weatherData.current.temp_c}°C</p>
              </div>
              <div className="bg-[#F4F9F1] rounded-2xl p-6 text-center shadow-sm border border-green-50 flex flex-col items-center justify-center hover:shadow-md transition-shadow">
                <Droplets className="w-8 h-8 text-[#2D5A27] mb-3" />
                <p className="text-gray-500 text-sm mb-1">Humidity</p>
                <p className="text-2xl font-bold text-gray-900">{weatherData.current.humidity}%</p>
              </div>
              <div className="bg-[#F4F9F1] rounded-2xl p-6 text-center shadow-sm border border-green-50 flex flex-col items-center justify-center hover:shadow-md transition-shadow">
                <Wind className="w-8 h-8 text-[#2D5A27] mb-3" />
                <p className="text-gray-500 text-sm mb-1">Wind</p>
                <p className="text-2xl font-bold text-gray-900">{weatherData.current.wind_kph} km/h</p>
              </div>
              <div className="bg-[#F4F9F1] rounded-2xl p-6 text-center shadow-sm border border-green-50 flex flex-col items-center justify-center hover:shadow-md transition-shadow">
                <Sun className="w-8 h-8 text-[#2D5A27] mb-3" />
                <p className="text-gray-500 text-sm mb-1">UV Index</p>
                <p className="text-2xl font-bold text-gray-900">{weatherData.current.uv}</p>
              </div>
              <div className="bg-[#F4F9F1] rounded-2xl p-6 text-center shadow-sm border border-green-50 flex flex-col items-center justify-center hover:shadow-md transition-shadow">
                <Eye className="w-8 h-8 text-[#2D5A27] mb-3" />
                <p className="text-gray-500 text-sm mb-1">Visibility</p>
                <p className="text-2xl font-bold text-gray-900">{weatherData.current.vis_km} km</p>
              </div>
              <div className="bg-[#F4F9F1] rounded-2xl p-6 text-center shadow-sm border border-green-50 flex flex-col items-center justify-center hover:shadow-md transition-shadow">
                <Gauge className="w-8 h-8 text-[#2D5A27] mb-3" />
                <p className="text-gray-500 text-sm mb-1">Air Pressure</p>
                <p className="text-2xl font-bold text-gray-900">{weatherData.current.pressure_mb} hPa</p>
              </div>
            </div>

            {/* Hourly Forecast */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <span className="w-2 h-6 bg-[#2D5A27] rounded-full inline-block"></span>
                Hourly Forecast (Next 24h)
              </h3>
              <div className="overflow-x-auto pb-6 -mx-4 px-4 sm:mx-0 sm:px-0 hide-scrollbar">
                <div className="flex gap-4 min-w-max">
                  {weatherData.forecast.forecastday[0].hour
                    .filter((hour: HourForecast) => new Date(hour.time).getTime() >= new Date().getTime() - 3600000)
                    .map((hour: HourForecast, idx: number) => {
                      const WeatherIcon = getMetricIcon(hour.condition.text);
                      return (
                        <div key={idx} className="bg-white border border-gray-200 rounded-2xl p-5 min-w-[140px] flex flex-col items-center shadow-sm hover:border-[#2D5A27] hover:shadow-md transition-all">
                          <p className="text-gray-600 font-medium mb-3">
                            {new Date(hour.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                          <WeatherIcon className={`w-10 h-10 mb-3 text-amber-500`} />
                          <p className="text-2xl font-bold text-gray-900 mb-1">{hour.temp_c}°C</p>
                          <div className="flex items-center gap-1 text-blue-600 text-sm font-medium">
                            <Droplets className="w-3 h-3" />
                            {hour.humidity}%
                          </div>
                        </div>
                      );
                  })}
                </div>
              </div>
            </div>
          </>
        ) : null}
      </div>

      <style jsx global>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </section>
  );
}

"use client";

import { useState } from "react";
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Area,
  AreaChart
} from "recharts";
import { IndianRupee, MapPin, Store, Leaf } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

interface MandiData {
  state: string;
  district: string;
  market: string;
  commodity: string;
  variety: string;
  grade?: string;
  arrival_date: string;
  min_price: number;
  max_price: number;
  modal_price: number;
}

export default function MandiRates() {
  const [showData, setShowData] = useState(false);
  const [selectedState, setSelectedState] = useState("");
  const [selectedMarket, setSelectedMarket] = useState("");
  const [selectedCommodity, setSelectedCommodity] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [tableData, setTableData] = useState<MandiData[]>([]);
  const { language } = useLanguage();

  const handleGetRates = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedState && selectedCommodity) {
      setLoading(true);
      setError("");
      try {
        let url = `/api/mandi?state=${encodeURIComponent(selectedState)}&commodity=${encodeURIComponent(selectedCommodity)}`;
        if (selectedMarket) url += `&market=${encodeURIComponent(selectedMarket)}`;
        
        const res = await fetch(url);
        const data = await res.json();
        
        if (!res.ok) throw new Error(data.error || "Failed to fetch Mandi rates");
        
        // Ensure data exists
        if (data.records && data.records.length > 0) {
           setTableData(data.records);
           setShowData(true);
        } else {
           setTableData([]);
           setError("No data found for the selected combination.");
           setShowData(true);
        }
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "An unknown error occurred");
        setShowData(false);
      } finally {
        setLoading(false);
      }
    }
  };

  // Generate mock trend data based on the latest modal price to simulate historical data
  // The Data.gov daily API typically only returns the current day's data per query
  const generateTrendData = (basePrice: number) => {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    return days.map(day => ({
      name: day,
      price: Math.round(basePrice + (Math.random() * 200 - 100))
    }));
  };

  const chartData = tableData.length > 0 
    ? generateTrendData(tableData[0].modal_price) 
    : [];

  return (
    <section id="mandi-rates" className="py-20 bg-[#F4F9F1]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Daily Mandi Rates
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
            Check the latest crop prices across various agricultural markets to make informed selling decisions.
            <span className="ml-2 inline-block px-2 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
              Region: {language} Interface
            </span>
          </p>
        </div>

        {/* Selection Flow Container */}
        <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100 mb-12">
          <form onSubmit={handleGetRates} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#2D5A27]" /> Select State
              </label>
              <select 
                className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-white focus:ring-2 focus:ring-[#2D5A27] focus:outline-none"
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                required
              >
                <option value="" disabled>Choose State</option>
                <option value="Gujarat">Gujarat</option>
                <option value="Haryana">Haryana</option>
                <option value="Karnataka">Karnataka</option>
                <option value="Madhya Pradesh">Madhya Pradesh</option>
                <option value="Maharashtra">Maharashtra</option>
                <option value="Odisha">Odisha</option>
                <option value="Punjab">Punjab</option>
                <option value="Rajasthan">Rajasthan</option>
                <option value="Tamil Nadu">Tamil Nadu</option>
                <option value="Uttar Pradesh">Uttar Pradesh</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Store className="w-4 h-4 text-[#2D5A27]" /> Select Market (Optional)
              </label>
              <input 
                type="text"
                placeholder="e.g. Indore"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-white focus:ring-2 focus:ring-[#2D5A27] focus:outline-none"
                value={selectedMarket}
                onChange={(e) => setSelectedMarket(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Leaf className="w-4 h-4 text-[#2D5A27]" /> Select Commodity
              </label>
              <select 
                className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-white focus:ring-2 focus:ring-[#2D5A27] focus:outline-none"
                value={selectedCommodity}
                onChange={(e) => setSelectedCommodity(e.target.value)}
                required
              >
                <option value="" disabled>Choose Commodity</option>
                <optgroup label="Grains & Oilseeds">
                  <option value="Wheat">Wheat</option>
                  <option value="Paddy(Dhan)">Paddy (Dhan)</option>
                  <option value="Maize">Maize</option>
                  <option value="Soyabean">Soyabean</option>
                  <option value="Mustard">Mustard</option>
                  <option value="Cotton">Cotton</option>
                </optgroup>
                <optgroup label="Vegetables">
                  <option value="Bhindi(Ladies Finger)">Bhendi (Lady Finger)</option>
                  <option value="Bitter gourd">Bitter Gourd</option>
                  <option value="Brinjal">Brinjal</option>
                  <option value="Cabbage">Cabbage</option>
                  <option value="Capsicum">Capsicum</option>
                  <option value="Cauliflower">Cauliflower</option>
                  <option value="Green Chilli">Green Chilli</option>
                  <option value="Onion">Onion</option>
                  <option value="Peas(Green)">Peas (Green)</option>
                  <option value="Potato">Potato</option>
                  <option value="Raddish">Radish</option>
                  <option value="Tomato">Tomato</option>
                </optgroup>
              </select>
            </div>
            <button 
              type="submit" 
              disabled={loading}
              className="bg-[#2D5A27] hover:bg-[#1e3c1a] disabled:bg-gray-400 text-white font-medium py-3 px-6 rounded-lg transition-colors h-[46px] flex items-center justify-center"
            >
              {loading ? "Fetching..." : "Get Rates"}
            </button>
          </form>
          {error && <p className="text-red-500 mt-4 text-sm text-center">{error}</p>}
        </div>

        {/* Data Display */}
        {showData && !loading && !error && tableData.length > 0 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#F4F9F1] border-b border-gray-200 whitespace-nowrap">
                      <th className="p-4 font-semibold text-gray-700">Commodity</th>
                      <th className="p-4 font-semibold text-gray-700">Variety</th>
                      <th className="p-4 font-semibold text-gray-700">Market</th>
                      <th className="p-4 font-semibold text-gray-700">District/State</th>
                      <th className="p-4 font-semibold text-gray-700">Min/Max (₹/q)</th>
                      <th className="p-4 font-semibold text-gray-900 bg-green-50">Modal Price</th>
                      <th className="p-4 font-semibold text-gray-700">Arrival Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tableData.slice(0, 10).map((row, idx) => (
                      <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="p-4 font-medium text-gray-900 flex items-center gap-2">
                          <Leaf className="w-4 h-4 text-[#2D5A27]" /> {row.commodity}
                        </td>
                        <td className="p-4 text-gray-600">{row.variety}</td>
                        <td className="p-4 text-gray-600">{row.market}</td>
                        <td className="p-4 text-gray-600">{row.district}, {row.state}</td>
                        <td className="p-4 text-gray-600">₹{row.min_price} - ₹{row.max_price}</td>
                        <td className="p-4 font-bold text-[#2D5A27] bg-green-50/50 flex flex-items-center"><IndianRupee className="w-4 h-4 mr-0.5 mt-0.5" />{row.modal_price}</td>
                        <td className="p-4 text-gray-500 text-sm">{row.arrival_date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Price Trend Graph */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <span className="w-2 h-6 bg-[#2D5A27] rounded-full inline-block"></span>
                Estimated Price Trend - Last 7 Days (₹/Quintal)
              </h3>
              <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <defs>
                      <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2D5A27" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#2D5A27" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6B7280'}} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#6B7280'}} tickFormatter={(value) => `₹${value}`} dx={-10} domain={['dataMin - 100', 'dataMax + 100']} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      formatter={(value) => [`₹${value}`, 'Modal Price']}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="price" 
                      stroke="#2D5A27" 
                      strokeWidth={3}
                      fillOpacity={1} 
                      fill="url(#colorPrice)" 
                      activeDot={{ r: 8, fill: '#2D5A27', stroke: '#fff', strokeWidth: 2 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

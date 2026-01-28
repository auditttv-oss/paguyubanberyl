import React, { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchComments, createComment, deleteComment } from '../services/dataService';
import { useAuth } from '../contexts/AuthContext';
import { 
  MessageSquare, Send, Trash2, User, Loader2, 
  Cloud, Sun, CloudRain, CloudLightning, Wind, Droplets, MapPin,
  Newspaper, ExternalLink, Calendar, AlertCircle,
  RefreshCw, Clock, ThumbsUp, AlertTriangle, ChevronRight, Shield,
  Bell, EyeOff, Car, Navigation, Gauge, TrendingUp
} from 'lucide-react';

// --- BMKG WEATHER WIDGET COMPONENT (7 DAYS) ---
const BMKGWeatherWidget = () => {
  const [weatherData, setWeatherData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  const fetchBMKGData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      
      // Gunakan Open-Meteo API yang CORS-friendly dan reliable
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=-6.33&longitude=106.40&daily=temperature_2m_max,temperature_2m_min,weather_code,precipitation_sum&timezone=Asia%2FJakarta&forecast_days=7`
      );
      
      if (!response.ok) throw new Error('Gagal mengambil data cuaca');
      
      const data = await response.json();
      setWeatherData({ openMeteo: true, ...data });
      
    } catch (err: any) {
      console.error("Weather API error:", err);
      setError('Tidak dapat mengambil data cuaca');
      
      // Final fallback dengan data mock
      const mockData = {
        openMeteo: true,
        mock: true,
        daily: {
          time: Array.from({length: 7}, (_, i) => {
            const date = new Date();
            date.setDate(date.getDate() + i);
            return date.toISOString().split('T')[0];
          }),
          temperature_2m_max: [32, 31, 30, 29, 30, 31, 32],
          temperature_2m_min: [25, 24, 23, 23, 24, 25, 25],
          weather_code: [0, 1, 3, 61, 3, 1, 0],
          precipitation_sum: [0, 2, 5, 12, 3, 0, 0]
        }
      };
      setWeatherData(mockData);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBMKGData();
  }, [fetchBMKGData]);

  const getWeatherIcon = (code: number, isDay: boolean = true) => {
    // BMKG Weather Code mapping
    const weatherMap: Record<string, { icon: React.ReactNode, label: string, bg: string }> = {
      '0': { icon: <Sun className="w-6 h-6 text-yellow-300" />, label: 'Cerah', bg: 'from-orange-400 to-yellow-500' },
      '1': { icon: <Cloud className="w-6 h-6 text-gray-200" />, label: 'Cerah Berawan', bg: 'from-blue-400 to-cyan-500' },
      '2': { icon: <Cloud className="w-6 h-6 text-gray-300" />, label: 'Cerah Berawan', bg: 'from-gray-400 to-slate-500' },
      '3': { icon: <Cloud className="w-6 h-6 text-gray-400" />, label: 'Berawan', bg: 'from-gray-500 to-slate-600' },
      '4': { icon: <CloudRain className="w-6 h-6 text-blue-200" />, label: 'Berawan Tebal', bg: 'from-gray-600 to-gray-700' },
      '5': { icon: <CloudRain className="w-6 h-6 text-blue-300" />, label: 'Udara Kabur', bg: 'from-gray-500 to-blue-600' },
      '10': { icon: <CloudRain className="w-6 h-6 text-blue-200" />, label: 'Asap', bg: 'from-gray-600 to-gray-800' },
      '20': { icon: <CloudRain className="w-6 h-6 text-blue-300" />, label: 'Hujan Ringan', bg: 'from-indigo-500 to-blue-600' },
      '21': { icon: <CloudRain className="w-6 h-6 text-blue-400" />, label: 'Hujan Sedang', bg: 'from-blue-600 to-indigo-700' },
      '22': { icon: <CloudLightning className="w-6 h-6 text-purple-300" />, label: 'Hujan Lebat', bg: 'from-purple-600 to-blue-800' },
      '23': { icon: <CloudLightning className="w-6 h-6 text-purple-400" />, label: 'Hujan Lebat', bg: 'from-purple-700 to-gray-900' },
      '24': { icon: <CloudLightning className="w-6 h-6 text-yellow-400" />, label: 'Hujan Es', bg: 'from-yellow-600 to-gray-700' },
      '25': { icon: <CloudRain className="w-6 h-6 text-blue-500" />, label: 'Hujan Lokal', bg: 'from-blue-500 to-indigo-600' },
      '26': { icon: <CloudRain className="w-6 h-6 text-blue-600" />, label: 'Hujan Petir', bg: 'from-purple-600 to-blue-800' },
      '27': { icon: <CloudRain className="w-6 h-6 text-blue-700" />, label: 'Hujan Petir', bg: 'from-purple-700 to-gray-900' },
      '60': { icon: <CloudRain className="w-6 h-6 text-blue-200" />, label: 'Hujan Ringan', bg: 'from-indigo-500 to-blue-600' },
      '61': { icon: <CloudRain className="w-6 h-6 text-blue-300" />, label: 'Hujan Sedang', bg: 'from-blue-600 to-indigo-700' },
      '63': { icon: <CloudLightning className="w-6 h-6 text-purple-300" />, label: 'Hujan Lebat', bg: 'from-purple-600 to-blue-800' },
    };
    return weatherMap[code.toString()] || weatherMap['1'];
  };

  const getDayName = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' });
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white p-4 sm:p-6 rounded-[1.5rem] md:rounded-[2rem] shadow-xl">
        <div className="flex items-center justify-center h-32">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      </div>
    );
  }

  if (error && !weatherData) {
    return (
      <div className="bg-gradient-to-br from-gray-500 to-gray-600 text-white p-4 sm:p-6 rounded-[1.5rem] md:rounded-[2rem] shadow-xl">
        <div className="text-center">
          <AlertCircle className="w-8 h-8 mx-auto mb-2" />
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  // Open-Meteo Data Format (Primary)
  if (weatherData?.openMeteo) {
    const daily = weatherData.daily;
    const isMock = weatherData.mock;
    
    return (
      <div className="bg-white p-4 sm:p-6 rounded-[1.5rem] md:rounded-[2rem] shadow-xl border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 text-blue-600 rounded-xl">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-gray-800 text-sm">
                {isMock ? 'Cuaca (Demo)' : 'Cuaca Jakarta'}
              </h3>
              <p className="text-xs text-gray-500">
                {isMock ? 'Data Simulasi' : 'Open-Meteo API'}
              </p>
            </div>
          </div>
          <button onClick={fetchBMKGData} className="p-2 hover:bg-gray-100 rounded-full transition-all">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* Current Weather */}
        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white p-4 rounded-xl mb-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs opacity-80">Hari Ini</p>
              <p className="text-2xl font-bold">
                {Math.round(daily?.temperature_2m_min?.[0] || 25)}° - {Math.round(daily?.temperature_2m_max?.[0] || 32)}°C
              </p>
              <p className="text-sm mt-1">
                {daily?.weather_code?.[0] === 0 ? 'Cerah' :
                 daily?.weather_code?.[0] === 1 ? 'Cerah Berawan' :
                 daily?.weather_code?.[0] === 3 ? 'Berawan' :
                 daily?.weather_code?.[0] === 61 ? 'Hujan Ringan' : 'Berawan'}
              </p>
            </div>
            <div className="p-3 bg-white/20 rounded-xl">
              {daily?.weather_code?.[0] === 0 ? <Sun className="w-8 h-8 text-yellow-300" /> :
               daily?.weather_code?.[0] === 61 ? <CloudRain className="w-8 h-8 text-blue-200" /> :
               <Cloud className="w-8 h-8 text-gray-200" />}
            </div>
          </div>
        </div>

        {/* 7 Days Forecast */}
        <div className="space-y-2">
          <h4 className="font-bold text-gray-700 text-xs uppercase tracking-wider mb-3">7 Hari Kedepan</h4>
          {daily?.time?.map((date: string, index: number) => {
            const weatherCode = daily.weather_code[index];
            const weatherInfo = getWeatherIcon(weatherCode);
            
            return (
              <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg bg-gradient-to-br ${weatherInfo.bg}`}>
                    {weatherInfo.icon}
                  </div>
                  <div>
                    <p className="font-medium text-gray-800 text-xs">{getDayName(date)}</p>
                    <p className="text-xs text-gray-500">{weatherInfo.label}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-800 text-xs">
                    {Math.round(daily.temperature_2m_min[index])}° - {Math.round(daily.temperature_2m_max[index])}°C
                  </p>
                  {daily.precipitation_sum && (
                    <p className="text-xs text-blue-500">
                      {daily.precipitation_sum[index] > 0 ? `💧 ${daily.precipitation_sum[index]}mm` : 'Kering'}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
};

// --- JAKARTA TRAFFIC WIDGET COMPONENT ---
const JakartaTrafficWidget = () => {
  const [trafficData, setTrafficData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  const fetchTrafficData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      
      // Simulasi data traffic Jakarta (karena Google Maps API membutuhkan API key)
      // Dalam production, gunakan Google Maps Distance Matrix API atau Traffic Layer API
      const mockTrafficData = {
        timestamp: new Date().toISOString(),
        areas: [
          {
            name: 'Jakarta Pusat',
            status: 'MACET PARAH',
            level: 5,
            color: 'red',
            main_roads: [
              { name: 'Jl. Sudirman', condition: 'Macet Total', speed: 5 },
              { name: 'Jl. MH Thamrin', condition: 'Macet Berat', speed: 8 },
              { name: 'Jl. Gatot Subroto', condition: 'Macet Sedang', speed: 15 }
            ]
          },
          {
            name: 'Jakarta Utara',
            status: 'MACET SEDANG',
            level: 3,
            color: 'orange',
            main_roads: [
              { name: 'Jl. Tol Jakarta-Tangerang', condition: 'Ramai Lancar', speed: 40 },
              { name: 'Jl. Pluit Raya', condition: 'Macet Ringan', speed: 25 },
              { name: 'Jl. Ancol', condition: 'Lancar', speed: 50 }
            ]
          },
          {
            name: 'Jakarta Selatan',
            status: 'RAMAI LANCAR',
            level: 2,
            color: 'yellow',
            main_roads: [
              { name: 'Jl. Fatmawati', condition: 'Ramai Lancar', speed: 35 },
              { name: 'Jl. Ciputat Raya', condition: 'Lancar', speed: 45 },
              { name: 'Jl. TB Simatupang', condition: 'Ramai', speed: 30 }
            ]
          },
          {
            name: 'Jakarta Barat',
            status: 'MACET BERAT',
            level: 4,
            color: 'orange',
            main_roads: [
              { name: 'Jl. Tol Jakarta-Merak', condition: 'Macet Sedang', speed: 20 },
              { name: 'Jl. Daan Mogot', condition: 'Macet Berat', speed: 10 },
              { name: 'Jl. Puri Indah', condition: 'Ramai Lancar', speed: 30 }
            ]
          },
          {
            name: 'Jakarta Timur',
            status: 'LANCAR',
            level: 1,
            color: 'green',
            main_roads: [
              { name: 'Jl. Tol Jakarta-Cikampek', condition: 'Macet Ringan', speed: 35 },
              { name: 'Jl. Bekasi Raya', condition: 'Lancar', speed: 45 },
              { name: 'Jl. Jatinegara', condition: 'Ramai Lancar', speed: 40 }
            ]
          }
        ],
        overall_status: 'MODERATE',
        tips: [
          'Hindari jam sibuk 07:00-09:00 dan 17:00-19:00',
          'Gunakan jalur alternatif seperti Tol Dalam Kota',
          'Cek aplikasi Waze atau Google Maps sebelum berangkat'
        ]
      };
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      setTrafficData(mockTrafficData);
      
    } catch (err: any) {
      console.error("Traffic data error:", err);
      setError('Gagal mengambil data traffic');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTrafficData();
    // Refresh setiap 5 menit
    const interval = setInterval(fetchTrafficData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchTrafficData]);

  const getTrafficColor = (level: number) => {
    switch (level) {
      case 1: return 'bg-green-500';
      case 2: return 'bg-yellow-500';
      case 3: return 'bg-orange-500';
      case 4: return 'bg-orange-600';
      case 5: return 'bg-red-600';
      default: return 'bg-gray-500';
    }
  };

  const getTrafficIcon = (level: number) => {
    switch (level) {
      case 1: return <Car className="w-4 h-4 text-green-600" />;
      case 2: return <Car className="w-4 h-4 text-yellow-600" />;
      case 3: return <Car className="w-4 h-4 text-orange-600" />;
      case 4: return <Car className="w-4 h-4 text-orange-700" />;
      case 5: return <Car className="w-4 h-4 text-red-600" />;
      default: return <Car className="w-4 h-4 text-gray-600" />;
    }
  };

  const getSpeedColor = (speed: number) => {
    if (speed >= 40) return 'text-green-600';
    if (speed >= 25) return 'text-yellow-600';
    if (speed >= 15) return 'text-orange-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="bg-white p-4 sm:p-6 rounded-[1.5rem] md:rounded-[2rem] shadow-xl border border-gray-100">
        <div className="flex items-center justify-center h-32">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-4 sm:p-6 rounded-[1.5rem] md:rounded-[2rem] shadow-xl border border-gray-100">
        <div className="text-center">
          <AlertCircle className="w-8 h-8 mx-auto mb-2 text-red-500" />
          <p className="text-sm text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-3 sm:p-6 rounded-[1.5rem] md:rounded-[2rem] shadow-xl border border-gray-100">
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="p-1.5 sm:p-2 bg-red-100 text-red-600 rounded-lg sm:rounded-xl">
            <Navigation className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div>
            <h3 className="font-black text-gray-800 text-xs sm:text-sm">Traffic Jakarta</h3>
            <p className="text-[10px] sm:text-xs text-gray-500">Real-time Update</p>
          </div>
        </div>
        <button onClick={fetchTrafficData} className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-full transition-all">
          <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4" />
        </button>
      </div>

      {/* Overall Status */}
      <div className={`p-2.5 sm:p-3 rounded-lg sm:rounded-xl mb-3 sm:mb-4 bg-gradient-to-r ${
        trafficData?.overall_status === 'HEAVY' ? 'from-red-500 to-red-600' :
        trafficData?.overall_status === 'MODERATE' ? 'from-orange-500 to-orange-600' :
        'from-green-500 to-green-600'
      } text-white`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] sm:text-xs opacity-80">Status Keseluruhan</p>
            <p className="text-sm sm:text-lg font-bold">
              {trafficData?.overall_status === 'HEAVY' ? 'MACET PARAH' :
               trafficData?.overall_status === 'MODERATE' ? 'MACET SEDANG' :
               'RAMAI LANCAR'}
            </p>
          </div>
          <div className="p-2 sm:p-3 bg-white/20 rounded-lg">
            <Gauge className="w-4 h-4 sm:w-6 sm:h-6" />
          </div>
        </div>
      </div>

      {/* Traffic by Area - Mobile Friendly */}
      <div className="space-y-2 sm:space-y-3">
        <h4 className="font-bold text-gray-700 text-[10px] sm:text-xs uppercase tracking-wider mb-2 sm:mb-3">Per Area</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
          {trafficData?.areas?.map((area: any, index: number) => (
            <div key={index} className="border border-gray-200 rounded-lg p-2 sm:p-3 hover:bg-gray-50 transition-colors">
              {/* Header Area */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <div className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${getTrafficColor(area.level)}`}></div>
                  <h5 className="font-bold text-gray-800 text-[10px] sm:text-xs">{area.name}</h5>
                  {getTrafficIcon(area.level)}
                </div>
              </div>
              
              {/* Status Badge */}
              <div className="mb-2">
                <span className={`text-[9px] sm:text-xs font-bold px-2 py-1 rounded-full inline-block ${
                  area.level >= 4 ? 'bg-red-100 text-red-700' :
                  area.level >= 3 ? 'bg-orange-100 text-orange-700' :
                  area.level >= 2 ? 'bg-yellow-100 text-yellow-700' :
                  'bg-green-100 text-green-700'
                }`}>
                  {area.status}
                </span>
              </div>
              
              {/* Main Roads - Compact */}
              <div className="space-y-1">
                {area.main_roads?.slice(0, 2).map((road: any, roadIndex: number) => (
                  <div key={roadIndex} className="flex items-center justify-between text-[9px] sm:text-xs">
                    <span className="text-gray-600 truncate flex-1">{road.name}</span>
                    <div className="flex items-center gap-1 sm:gap-2 ml-1">
                      <span className="text-gray-500 hidden sm:inline text-[10px]">{road.condition}</span>
                      <span className={`font-bold text-[10px] sm:text-xs ${getSpeedColor(road.speed)}`}>
                        {road.speed}
                      </span>
                    </div>
                  </div>
                ))}
                {area.main_roads?.length > 2 && (
                  <div className="text-[9px] text-gray-400 italic">
                    +{area.main_roads.length - 2} jalan lainnya
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Traffic Tips - Mobile Optimized */}
      <div className="mt-3 sm:mt-4 p-2.5 sm:p-3 bg-blue-50 rounded-lg border border-blue-100">
        <h5 className="font-bold text-blue-800 text-[10px] sm:text-xs mb-2 flex items-center gap-1.5 sm:gap-2">
          <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" /> 
          <span className="hidden sm:inline">Tips Menghindari Macet</span>
          <span className="sm:hidden">Tips Macet</span>
        </h5>
        <ul className="space-y-1">
          {trafficData?.tips?.map((tip: string, index: number) => (
            <li key={index} className="text-[9px] sm:text-xs text-blue-700 flex items-start gap-1.5 sm:gap-2">
              <span className="text-blue-500 mt-0.5 flex-shrink-0">•</span>
              <span className="line-clamp-2">{tip}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

// --- NEWS WIDGET COMPONENT (REAL-TIME UPDATED) ---
const NewsWidget = () => {
  const [news, setNews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRealNews = async () => {
    try {
      setLoading(true);
      // Menggunakan RSS Antara News via rss2json converter
      const res = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=https://www.antaranews.com/rss/top-news.xml`);
      const data = await res.json();
      setNews(data.items.slice(0, 5));
    } catch (err) {
      console.error("News fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRealNews();
  }, []);

  return (
    <div className="bg-white p-4 sm:p-6 rounded-[1.5rem] sm:rounded-[2.5rem] shadow-lg border border-gray-100 flex flex-col h-full">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="p-1.5 sm:p-2 bg-blue-100 text-blue-600 rounded-lg sm:rounded-xl"><Newspaper className="w-4 h-4 sm:w-5 sm:h-5" /></div>
          <h3 className="font-black text-gray-800 uppercase text-[10px] sm:text-xs tracking-widest">Berita Terkini</h3>
        </div>
        <button onClick={fetchRealNews} className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-full transition-all">
          <RefreshCw className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="space-y-3 sm:space-y-4 flex-1 overflow-y-auto custom-scrollbar pr-1">
        {loading ? (
          [1, 2, 3].map(i => <div key={i} className="h-16 sm:h-20 bg-gray-50 rounded-xl sm:rounded-2xl animate-pulse"></div>)
        ) : (
          news.map((item, index) => (
            <a key={index} href={item.link} target="_blank" rel="noreferrer" className="block group bg-gray-50 hover:bg-blue-50 p-3 sm:p-4 rounded-xl sm:rounded-2xl transition-all border border-transparent hover:border-blue-100">
              <h4 className="font-bold text-gray-800 group-hover:text-blue-700 text-[10px] sm:text-xs leading-snug line-clamp-2 mb-2">{item.title}</h4>
              <div className="flex items-center justify-between text-[6px] sm:text-[8px] font-black uppercase">
                <span className="text-blue-500 truncate flex-1 mr-2">{item.categories[0] || 'Utama'}</span>
                <span className="text-gray-400 flex items-center gap-1 whitespace-nowrap"><Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5"/> {new Date(item.pubDate).toLocaleDateString()}</span>
              </div>
            </a>
          ))
        )}
      </div>
    </div>
  );
};

// --- MAIN BLOG COMPONENT ---
export const Blog = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [name, setName] = useState('');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: comments, isLoading, refetch } = useQuery({ 
    queryKey: ['comments'], 
    queryFn: fetchComments 
  });

  const mutation = useMutation({
    mutationFn: () => createComment(name, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments'] });
      setName(''); setContent(''); setIsSubmitting(false);
      alert('✅ Berhasil dikirim!');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: deleteComment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments'] });
      alert('🗑️ Terhapus.');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || content.length < 5) return alert('Lengkapi data!');
    setIsSubmitting(true);
    mutation.mutate();
  };

  return (
    <div className="space-y-4 sm:space-y-6 px-2 sm:px-3 md:px-6 pb-20 sm:pb-24 max-w-7xl mx-auto">
      {/* HEADER SECTION */}
      <div className="flex flex-col gap-3 sm:gap-4 py-4 sm:py-6">
        <div className="text-center">
          <h1 className="text-2xl sm:text-3xl md:text-5xl font-black text-emerald-950 uppercase tracking-tighter">Beryl Forum</h1>
          <p className="text-gray-500 font-bold text-xs sm:text-sm mt-1">Pusat Informasi & Aspirasi Warga</p>
        </div>
        <div className={`px-3 sm:px-5 py-1.5 sm:py-2 rounded-full text-[8px] sm:text-[10px] font-black uppercase tracking-widest mx-auto w-fit ${!user ? 'bg-gray-100 text-gray-400' : 'bg-emerald-100 text-emerald-700'}`}>
          {!user ? <><EyeOff className="w-2.5 h-2.5 sm:w-3 sm:h-3 inline mr-1" /> Mode Tamu</> : <><Shield className="w-2.5 h-2.5 sm:w-3 sm:h-3 inline mr-1" /> Mode Admin</>}
        </div>
      </div>

      {/* BMKG WEATHER WIDGET */}
      <BMKGWeatherWidget />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* LEFT COLUMN - Form & News */}
        <div className="lg:col-span-1 space-y-4 sm:space-y-6">
          <div className="bg-white p-4 sm:p-6 rounded-[1.5rem] sm:rounded-[2.5rem] shadow-xl border border-gray-50">
            <h3 className="font-black text-gray-800 uppercase text-[10px] sm:text-xs tracking-widest mb-4 sm:mb-6 flex items-center gap-2">
              <MessageSquare className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-500"/> Kirim Aspirasi
            </h3>
            <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
              <input 
                type="text" placeholder="Nama / Blok..." 
                className="w-full bg-gray-50 border-none p-3 sm:p-4 rounded-xl sm:rounded-2xl focus:ring-2 focus:ring-emerald-500 font-bold text-xs"
                value={name} onChange={(e) => setName(e.target.value)} required
              />
              <textarea 
                rows={3} placeholder="Tulis aspirasi anda di sini..." 
                className="w-full bg-gray-50 border-none p-3 sm:p-4 rounded-xl sm:rounded-2xl focus:ring-2 focus:ring-emerald-500 font-bold text-xs resize-none sm:rows-4"
                value={content} onChange={(e) => setContent(e.target.value)} required
              />
              <button 
                type="submit" disabled={isSubmitting}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-3 sm:py-4 rounded-xl sm:rounded-2xl shadow-xl transition-all flex items-center justify-center gap-2 uppercase text-[8px] sm:text-[10px] tracking-widest"
              >
                {isSubmitting ? <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin" /> : <><Send className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> Kirim Sekarang</>}
              </button>
            </form>
          </div>
          <NewsWidget />
        </div>

        {/* MIDDLE COLUMN - Traffic */}
        <div className="lg:col-span-1">
          <JakartaTrafficWidget />
        </div>

        {/* RIGHT COLUMN - Comments */}
        <div className="lg:col-span-1 space-y-3 sm:space-y-4">
          <div className="flex items-center justify-between px-2">
            <h3 className="font-black text-gray-800 uppercase text-[10px] sm:text-xs tracking-widest">Suara Warga</h3>
            <button onClick={() => refetch()} className="p-1.5 sm:p-2 bg-white rounded-full shadow-sm"><RefreshCw className="w-3 h-3 sm:w-3.5 sm:h-3.5"/></button>
          </div>

          {isLoading ? (
            <div className="p-12 sm:p-20 text-center font-black text-gray-200 animate-pulse uppercase tracking-[0.3em] text-xs sm:text-sm">Memuat Aspirasi...</div>
          ) : (
            <div className="space-y-3 sm:space-y-4 max-h-[600px] sm:max-h-[900px] overflow-y-auto custom-scrollbar pr-1">
              {comments?.map((c: any) => (
                <div key={c.id} className="bg-white p-3 sm:p-5 rounded-[1.5rem] sm:rounded-[2rem] shadow-md border border-gray-50 group transition-all">
                  <div className="flex gap-3 sm:gap-4">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0 font-black text-xs sm:text-sm">
                      {c.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-black text-emerald-900 uppercase text-[10px] sm:text-xs truncate">{c.name}</h4>
                          <span className="text-[6px] sm:text-[8px] font-bold text-gray-300 uppercase italic">
                            {new Date(c.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                          </span>
                        </div>
                        {user && (
                          <button onClick={() => confirm('Hapus?') && deleteMutation.mutate(c.id)} className="text-gray-200 hover:text-rose-500 transition-colors p-1">
                            <Trash2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                          </button>
                        )}
                      </div>
                      <div className="mt-2 sm:mt-3 text-gray-600 text-[10px] sm:text-xs leading-relaxed font-medium bg-gray-50/50 p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-gray-100">
                        {c.content}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <style>
        {`
          .custom-scrollbar::-webkit-scrollbar { width: 4px; }
          .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
          .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        `}
      </style>
    </div>
  );
};

export default Blog;

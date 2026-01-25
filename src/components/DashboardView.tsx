import React, { useMemo, useState, useCallback } from 'react';
import { 
  Wallet, TrendingDown, PiggyBank, PartyPopper, CheckCircle2, 
  AlertCircle, Calendar, ArrowRight, TrendingUp, Users, Home,
  BrainCircuit, Loader2
} from 'lucide-react';
import { SummaryCard } from './SummaryCard';
import { FinancialSummary, ResidentWithPayment, OccupancyStatus } from '../types';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  Legend, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import * as geminiService from '../services/geminiService';

interface DashboardViewProps {
  summary: FinancialSummary;
  residents: ResidentWithPayment[];
  monthName: string;
  year: number;
  monthlyData: { income: number; expense: number; balance: number };
  yearlyData: { income: number; expense: number; balance: number };
}

interface PaymentChartData {
  name: string;
  'Sudah Bayar': number;
  'Belum Bayar': number;
}

interface OccupancyData {
  name: string;
  value: number;
  color: string;
}

// Perbaikan OCCUPANCY_CONFIG sesuai dengan type OccupancyStatus
const OCCUPANCY_CONFIG: Record<string, { color: string; label: string }> = {
  'Menetap': { color: '#10b981', label: 'Menetap' },
  'Penyewa': { color: '#f59e0b', label: 'Penyewa' },
  'Kunjungan': { color: '#8b5cf6', label: 'Kunjungan' },
  'Ditempati': { color: '#64748b', label: 'Ditempati' },
  'Ditempati 2026': { color: '#64748b', label: 'Ditempati 2026' },
  'Kontrak': { color: '#8b5cf6', label: 'Kontrak' },
  'Kosong': { color: '#ef4444', label: 'Kosong' },
  'Tetap': { color: '#10b981', label: 'Tetap' }
} as const;

const PAYMENT_COLORS = {
  PAID: '#10b981',
  UNPAID: '#f43f5e'
} as const;

// Custom Tooltip untuk chart
const CustomTooltip = ({ active, payload, label, total }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
        <p className="font-bold text-gray-800 mb-1">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-gray-600">{entry.name}:</span>
            <span className="font-bold">{entry.value}</span>
            {total && (
              <span className="text-gray-400">
                ({Math.round((entry.value / total) * 100)}%)
              </span>
            )}
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export const DashboardView: React.FC<DashboardViewProps> = ({ 
  summary, 
  residents, 
  monthName, 
  year,
  monthlyData,
  yearlyData
}) => {
  // State untuk AI Analysis
  const [aiAnalysis, setAiAnalysis] = useState<string>('');
  const [loadingAi, setLoadingAi] = useState(false);

  const handleAnalyzeAi = useCallback(async () => {
    if (loadingAi) return;
    
    try {
      setLoadingAi(true);
      // Perbaikan: tambahkan parameter ketiga (payments)
      const result = await geminiService.analyzeFinances(residents, [], []);
      // Perbaikan: pastikan result adalah string
      setAiAnalysis(typeof result === 'string' ? result : JSON.stringify(result));
    } catch (error) {
      console.error('AI analysis failed:', error);
      setAiAnalysis('Gagal memuat analisis. Silakan coba lagi.');
    } finally {
      setLoadingAi(false);
    }
  }, [residents, loadingAi]);

  // ==========================================
  // 1. MEMOIZED CALCULATIONS
  // ==========================================
  
  const { 
    totalWarga, 
    paidMonthlyCount, 
    paidEventCount, 
    occupancyData, 
    paymentChartData,
    monthlyComplianceRate,
    eventParticipationRate
  } = useMemo(() => {
    const totalWarga = residents.length;
    
    const paidMonthlyCount = residents.filter(r => r.isPaidCurrentMonth).length;
    const paidEventCount = residents.filter(r => (r.eventDuesAmount || 0) > 0).length;
    
    const monthlyComplianceRate = totalWarga > 0 
      ? Math.round((paidMonthlyCount / totalWarga) * 100) 
      : 0;
    
    const eventParticipationRate = totalWarga > 0 
      ? Math.round((paidEventCount / totalWarga) * 100) 
      : 0;
    
    const occupancyCounts: Record<string, number> = {
      'Menetap': 0,
      'Penyewa': 0,
      'Kunjungan': 0,
      'Ditempati': 0,
      'Ditempati 2026': 0,
      'Kontrak': 0,
      'Kosong': 0,
      'Tetap': 0
    };
    
    residents.forEach(r => {
      const status = r.occupancyStatus as OccupancyStatus;
      if (status in occupancyCounts) {
        occupancyCounts[status] += 1;
      } else {
        // Fallback untuk status yang tidak terdaftar
        occupancyCounts['Menetap'] += 1;
      }
    });
    
    const occupancyData: OccupancyData[] = Object.entries(occupancyCounts)
      .filter(([, value]) => value > 0)
      .map(([name, value]) => ({
        name: OCCUPANCY_CONFIG[name]?.label || name,
        value,
        color: OCCUPANCY_CONFIG[name]?.color || '#64748b'
      }));
    
    const paymentChartData: PaymentChartData[] = [
      {
        name: 'Iuran Wajib',
        'Sudah Bayar': paidMonthlyCount,
        'Belum Bayar': totalWarga - paidMonthlyCount,
      },
      {
        name: 'Iuran Acara',
        'Sudah Bayar': paidEventCount,
        'Belum Bayar': totalWarga - paidEventCount,
      }
    ];
    
    return {
      totalWarga,
      paidMonthlyCount,
      paidEventCount,
      occupancyData,
      paymentChartData,
      monthlyComplianceRate,
      eventParticipationRate
    };
  }, [residents]);

  // ==========================================
  // 2. RENDER FUNCTIONS
  // ==========================================
  
  const formatCurrency = (amount: number): string => {
    return `Rp ${amount.toLocaleString('id-ID')}`;
  };

  // ==========================================
  // 3. AI WIDGET COMPONENT
  // ==========================================
  
  const AiWidget = (
    <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-xl border border-indigo-100 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
            <BrainCircuit size={20} className="text-indigo-600" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900">Analisis AI</h3>
            <p className="text-sm text-gray-500">Insight dan rekomendasi</p>
          </div>
        </div>
        <button 
          onClick={handleAnalyzeAi}
          disabled={loadingAi}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          {loadingAi ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Menganalisa...
            </>
          ) : (
            <>
              <BrainCircuit size={16} />
              Analisa
            </>
          )}
        </button>
      </div>
      
      {aiAnalysis ? (
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div 
            className="prose prose-sm max-w-none text-gray-700"
            dangerouslySetInnerHTML={{ 
              __html: aiAnalysis
                .replace(/\n/g, '<br/>')
                .replace(/\*\*(.*?)\*\*/g, '<strong class="text-gray-900">$1</strong>')
                .replace(/\*(.*?)\*/g, '<em>$1</em>')
            }} 
          />
        </div>
      ) : (
        <div className="text-center py-6">
          <BrainCircuit size={48} className="mx-auto text-indigo-300 mb-3" />
          <p className="text-gray-500 mb-2">Belum ada analisis</p>
          <p className="text-sm text-gray-400">Klik tombol Analisa untuk mendapatkan insight</p>
        </div>
      )}
    </div>
  );

  // ==========================================
  // 4. COMPONENT RENDER
  // ==========================================
  
  return (
    <div className="space-y-6 animate-fade-in pb-10">
      {/* SECTION 1: SALDO UTAMA */}
      <div className="bg-gradient-to-r from-beryl-600 to-teal-600 p-6 rounded-2xl shadow-xl text-white">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="mb-6 md:mb-0">
            <div className="flex items-center gap-2 text-beryl-100 font-medium mb-2">
              <Wallet size={20} />
              <span>TOTAL SALDO SAAT INI</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-2">
              {formatCurrency(summary.balanceTotal)}
            </h2>
            <p className="text-sm text-beryl-200">
              Saldo Kas Wajib + Saldo Kas Acara
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-4 min-w-[280px]">
            <div className="bg-white/20 p-4 rounded-xl backdrop-blur-sm border border-white/10">
              <p className="text-xs text-beryl-100 uppercase tracking-wider mb-1">
                Kas Wajib
              </p>
              <p className="font-bold text-xl">
                {formatCurrency(summary.balanceMonthly)}
              </p>
            </div>
            <div className="bg-white/20 p-4 rounded-xl backdrop-blur-sm border border-white/10">
              <p className="text-xs text-beryl-100 uppercase tracking-wider mb-1">
                Kas Acara
              </p>
              <p className="font-bold text-xl">
                {formatCurrency(summary.balanceEvent)}
              </p>
            </div>
          </div>
        </div>
        
        {/* Progress indicators */}
        <div className="mt-6 pt-6 border-t border-white/10 grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="flex justify-between mb-1">
              <span>Kepatuhan Iuran Wajib</span>
              <span className="font-semibold">{monthlyComplianceRate}%</span>
            </div>
            <div className="h-2 bg-white/20 rounded-full overflow-hidden">
              <div 
                className="h-full bg-emerald-300 rounded-full transition-all duration-500"
                style={{ width: `${monthlyComplianceRate}%` }}
              />
            </div>
          </div>
          <div>
            <div className="flex justify-between mb-1">
              <span>Partisipasi Iuran Acara</span>
              <span className="font-semibold">{eventParticipationRate}%</span>
            </div>
            <div className="h-2 bg-white/20 rounded-full overflow-hidden">
              <div 
                className="h-full bg-amber-300 rounded-full transition-all duration-500"
                style={{ width: `${eventParticipationRate}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: LAPORAN KEUANGAN */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* KOLOM KIRI: LAPORAN BULAN INI */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-gray-700 font-bold flex items-center gap-2">
              <Calendar size={20} className="text-beryl-600" />
              Periode: {monthName} {year}
            </h3>
            <span className="text-xs font-medium px-3 py-1 bg-beryl-50 text-beryl-700 rounded-full">
              Bulanan
            </span>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            {/* PERBAIKAN: Hapus property trend dari SummaryCard */}
            <SummaryCard 
              title="Total Pemasukan"
              value={formatCurrency(monthlyData.income)}
              icon={<ArrowRight className="text-emerald-600" size={20} />}
              colorClass="green"
            />
            <SummaryCard 
              title="Total Pengeluaran"
              value={formatCurrency(monthlyData.expense)}
              icon={<TrendingDown className="text-rose-600" size={20} />}
              colorClass="red"
            />
            <SummaryCard 
              title="Saldo Bersih"
              value={formatCurrency(monthlyData.balance)}
              icon={<Wallet className={
                monthlyData.balance >= 0 ? "text-emerald-600" : "text-amber-600"
              } size={20} />}
              colorClass={monthlyData.balance >= 0 ? "blue" : "orange"}
            />
          </div>
        </div>

        {/* KOLOM KANAN: LAPORAN TAHUNAN */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-gray-700 font-bold flex items-center gap-2">
              <TrendingUp size={20} className="text-blue-600" />
              Akumulasi Tahun {year}
            </h3>
            <span className="text-xs font-medium px-3 py-1 bg-blue-50 text-blue-700 rounded-full">
              Jan - Des {year}
            </span>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            {/* PERBAIKAN: Hapus property trend dari SummaryCard */}
            <SummaryCard 
              title="Total Pemasukan Tahunan"
              value={formatCurrency(yearlyData.income)}
              icon={<PiggyBank className="text-blue-600" size={20} />}
              colorClass="blue"
            />
            <SummaryCard 
              title="Total Pengeluaran Tahunan"
              value={formatCurrency(yearlyData.expense)}
              icon={<TrendingDown className="text-purple-600" size={20} />}
              colorClass="purple"
            />
            <SummaryCard 
              title="Sisa Kas Tahunan"
              value={formatCurrency(yearlyData.balance)}
              icon={<Wallet className={
                yearlyData.balance >= 0 ? "text-emerald-600" : "text-rose-600"
              } size={20} />}
              colorClass={yearlyData.balance >= 0 ? "green" : "red"}
            />
          </div>
        </div>
      </div>

      {/* SECTION 3: GRAFIK & ANALISA */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart 1: Grafik Perbandingan Pembayaran */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 lg:col-span-2">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-1">
                Partisipasi Warga
              </h3>
              <p className="text-sm text-gray-500">
                Perbandingan kepatuhan pembayaran iuran
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <div className="flex items-center gap-1 bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-full border border-emerald-100 text-xs font-medium">
                <CheckCircle2 size={12} />
                <span>Sudah Bayar</span>
              </div>
              <div className="flex items-center gap-1 bg-rose-50 text-rose-700 px-3 py-1.5 rounded-full border border-rose-100 text-xs font-medium">
                <AlertCircle size={12} />
                <span>Belum Bayar</span>
              </div>
            </div>
          </div>
          
          {/* PERBAIKAN: Container chart dengan tinggi tetap */}
          <div style={{ width: '100%', height: 320 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={paymentChartData} 
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                barGap={8}
                barCategoryGap="20%"
              >
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  vertical={false} 
                  stroke="#e5e7eb" 
                />
                <XAxis 
                  dataKey="name" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#6b7280', fontSize: 12, fontWeight: 600 }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#9ca3af', fontSize: 12 }}
                  allowDecimals={false}
                />
                <Tooltip 
                  content={<CustomTooltip total={totalWarga} />}
                  cursor={{ fill: '#f3f4f6' }}
                />
                <Legend 
                  wrapperStyle={{ 
                    paddingTop: '10px',
                    fontSize: '12px'
                  }}
                  iconType="circle"
                  iconSize={8}
                />
                
                <Bar 
                  name="Sudah Bayar"
                  dataKey="Sudah Bayar"
                  fill={PAYMENT_COLORS.PAID}
                  radius={[4, 4, 0, 0]}
                  barSize={35}
                  animationDuration={1500}
                />
                
                <Bar 
                  name="Belum Bayar"
                  dataKey="Belum Bayar"
                  fill={PAYMENT_COLORS.UNPAID}
                  radius={[4, 4, 0, 0]}
                  barSize={35}
                  animationDuration={1500}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Donut Chart Hunian */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-1">
                Status Hunian
              </h3>
              <p className="text-sm text-gray-500">
                Distribusi warga cluster
              </p>
            </div>
            <Users size={20} className="text-gray-400" />
          </div>
          
          {/* PERBAIKAN: Container pie chart dengan tinggi tetap */}
          <div style={{ width: '100%', height: 320, position: 'relative' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={occupancyData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                  stroke="white"
                  strokeWidth={2}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {occupancyData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.color}
                      stroke="white"
                      strokeWidth={2}
                    />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => [`${value} KK`, 'Jumlah']}
                  contentStyle={{ 
                    borderRadius: '8px',
                    border: '1px solid #e5e7eb'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            
            {/* Center Text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-3xl font-bold text-gray-800">
                {totalWarga}
              </span>
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wider mt-1">
                Total KK
              </span>
            </div>
          </div>
          
          {/* Legend */}
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="grid grid-cols-2 gap-2">
              {occupancyData.map((item, index) => (
                <div key={index} className="flex items-center gap-2 text-xs">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="font-medium text-gray-700">{item.name}</span>
                  <span className="text-gray-500 ml-auto">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 4: AI ANALYSIS WIDGET */}
      <div className="grid grid-cols-1 gap-6">
        {AiWidget}
      </div>
    </div>
  );
};
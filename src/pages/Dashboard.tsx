import React, { useMemo, useState } from 'react';
import { 
  LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, Cell, Legend
} from 'recharts';
import { 
  TrendingUp, TrendingDown, Wallet, Users, AlertCircle, 
  Calendar, ArrowUpRight, ArrowDownRight, Info, ChevronRight,
  Calculator, LucideIcon
} from 'lucide-react';
import { Resident, Expense, Payment } from '../types';

// --- INTERNAL COMPONENTS (Inlined to fix resolution errors) ---

interface SummaryCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  color: 'blue' | 'green' | 'red' | 'indigo' | 'orange' | 'purple';
  subtitle?: string;
}

const SummaryCard: React.FC<SummaryCardProps> = ({ 
  title, value, icon: Icon, trend, color, subtitle 
}) => {
  const colors = {
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    green: 'bg-green-50 text-green-600 border-green-100',
    red: 'bg-red-50 text-red-600 border-red-100',
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    orange: 'bg-orange-50 text-orange-600 border-orange-100',
    purple: 'bg-purple-50 text-purple-600 border-purple-100',
  };

  return (
    <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-xl ${colors[color]} border`}>
          <Icon className="h-6 w-6" />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
            trend.isPositive ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
          }`}>
            {trend.isPositive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
            {trend.value}
          </div>
        )}
      </div>
      <div>
        <h3 className="text-sm font-medium text-slate-500 mb-1">{title}</h3>
        <div className="text-2xl font-bold text-slate-800 tracking-tight">{value}</div>
        {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
      </div>
    </div>
  );
};

const CustomChartTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-4 shadow-xl border border-slate-100 rounded-xl">
        <p className="text-sm font-bold text-slate-800 mb-2">{label}</p>
        <div className="space-y-1">
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center justify-between gap-8">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                <span className="text-xs text-slate-500">{entry.name}:</span>
              </div>
              <span className="text-xs font-bold text-slate-800">
                {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(entry.value)}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

// --- MAIN DASHBOARD VIEW ---

interface DashboardViewProps {
  residents: Resident[];
  expenses: Expense[];
}

const DashboardView: React.FC<DashboardViewProps> = ({ residents, expenses }) => {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);

  // Fungsi helper untuk parsing tanggal yang aman
  const parseSafeDate = (dateInput: any) => {
    const d = new Date(dateInput);
    return isNaN(d.getTime()) ? new Date(0) : d;
  };

  // Mendapatkan semua data pembayaran yang telah diflatkan
  const allPayments = useMemo(() => {
    return residents.flatMap(r => (r.payments || []).map(p => ({
      ...p,
      residentId: r.id,
      residentName: r.name
    })));
  }, [residents]);

  const stats = useMemo(() => {
    const startOfCurrentMonth = new Date(selectedYear, selectedMonth - 1, 1);
    
    // 1. Saldo Awal: Benar-benar dari seluruh sejarah sebelum bulan ini
    const priorIn = allPayments
      .filter(p => parseSafeDate(p.date) < startOfCurrentMonth)
      .reduce((sum, p) => sum + p.amount, 0);

    const priorOut = expenses
      .filter(e => parseSafeDate(e.date) < startOfCurrentMonth)
      .reduce((sum, e) => sum + e.amount, 0);

    const saldoAwal = priorIn - priorOut;

    // 2. Data Bulan Berjalan
    const currentMonthPayments = allPayments.filter(p => {
      const d = parseSafeDate(p.date);
      return d.getMonth() === (selectedMonth - 1) && d.getFullYear() === selectedYear;
    });

    const currentMonthExpenses = expenses.filter(e => {
      const d = parseSafeDate(e.date);
      return d.getMonth() === (selectedMonth - 1) && d.getFullYear() === selectedYear;
    });

    const totalIncome = currentMonthPayments.reduce((sum, p) => sum + p.amount, 0);
    const totalExpenses = currentMonthExpenses.reduce((sum, e) => sum + e.amount, 0);
    
    // Perbaikan kategori: mencakup p.type atau p.category
    const incomeKas = currentMonthPayments
      .filter(p => (p as any).type === 'kas' || (p as any).category === 'kas')
      .reduce((sum, p) => sum + p.amount, 0);
    
    const incomeLainnya = totalIncome - incomeKas;

    const saldoAkhir = saldoAwal + totalIncome - totalExpenses;

    // 3. Persentase Kepatuhan (Berdasarkan warga UNIK yang bayar)
    const activeResidents = residents.filter(r => r.status === 'owner' || r.status === 'renter');
    const uniquePayeesCount = new Set(currentMonthPayments.map(p => p.residentId)).size;
    const collectionRate = activeResidents.length > 0 
      ? (uniquePayeesCount / activeResidents.length) * 100 
      : 0;

    return {
      saldoAwal,
      totalIncome,
      incomeKas,
      incomeLainnya,
      totalExpenses,
      saldoAkhir,
      collectionRate,
      activeCount: activeResidents.length,
      transactionCount: currentMonthPayments.length + currentMonthExpenses.length
    };
  }, [allPayments, expenses, selectedMonth, selectedYear, residents]);

  const chartData = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    
    // Hitung saldo penutup tahun lalu sebagai modal awal grafik tahun ini
    const priorYearsIn = allPayments.filter(p => parseSafeDate(p.date).getFullYear() < selectedYear)
      .reduce((sum, p) => sum + p.amount, 0);
    const priorYearsOut = expenses.filter(e => parseSafeDate(e.date).getFullYear() < selectedYear)
      .reduce((sum, e) => sum + e.amount, 0);
    
    let runningBalance = priorYearsIn - priorYearsOut;

    return months.map((month, index) => {
      const mIncome = allPayments
        .filter(p => {
          const d = parseSafeDate(p.date);
          return d.getMonth() === index && d.getFullYear() === selectedYear;
        })
        .reduce((sum, p) => sum + p.amount, 0);

      const mExpense = expenses
        .filter(e => {
          const d = parseSafeDate(e.date);
          return d.getMonth() === index && d.getFullYear() === selectedYear;
        })
        .reduce((sum, e) => sum + e.amount, 0);

      runningBalance += (mIncome - mExpense);

      return {
        name: month,
        pemasukan: mIncome,
        pengeluaran: mExpense,
        saldo: runningBalance
      };
    });
  }, [allPayments, expenses, selectedYear]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(value);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header & Filter */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-xl shadow-sm border border-slate-100">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Calculator className="text-indigo-600 h-5 w-5" />
            Laporan Keuangan Terpadu
          </h2>
          <p className="text-sm text-slate-500">Saldo berjalan terakumulasi otomatis per periode</p>
        </div>
        
        <div className="flex items-center gap-2">
          <select 
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer"
          >
            {['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'].map((m, i) => (
              <option key={i} value={i + 1}>{m}</option>
            ))}
          </select>
          <select 
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer"
          >
            {[2024, 2025, 2026].map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Statistik Utama */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard
          title="Saldo Awal Bulan"
          value={formatCurrency(stats.saldoAwal)}
          icon={Wallet}
          trend={{ value: "Saldo Carry-over", isPositive: true }}
          color="blue"
          subtitle="Sisa kas periode sebelumnya"
        />
        <SummaryCard
          title="Total Pemasukan"
          value={formatCurrency(stats.totalIncome)}
          icon={TrendingUp}
          trend={{ value: `+${formatCurrency(stats.totalIncome)}`, isPositive: true }}
          color="green"
          subtitle={`Kas: ${formatCurrency(stats.incomeKas)}`}
        />
        <SummaryCard
          title="Total Pengeluaran"
          value={formatCurrency(stats.totalExpenses)}
          icon={TrendingDown}
          trend={{ value: `-${formatCurrency(stats.totalExpenses)}`, isPositive: false }}
          color="red"
          subtitle={`${stats.transactionCount} Transaksi keluar`}
        />
        <SummaryCard
          title="Saldo Akhir Bulan"
          value={formatCurrency(stats.saldoAkhir)}
          icon={Calculator}
          trend={{ 
            value: stats.saldoAkhir >= stats.saldoAwal ? "Surplus" : "Defisit", 
            isPositive: stats.saldoAkhir >= stats.saldoAwal 
          }}
          color="indigo"
          subtitle="Akan menjadi saldo awal bulan depan"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Grafik Area & Bar */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-slate-800">Visualisasi Arus Kas {selectedYear}</h3>
            <p className="text-sm text-slate-500">Perbandingan pemasukan bulanan vs akumulasi saldo riil</p>
          </div>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorPemasukan" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorSaldo" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                <YAxis hide={true} />
                <Tooltip content={<CustomChartTooltip />} />
                <Legend verticalAlign="top" height={36}/>
                <Area name="Pemasukan" type="monotone" dataKey="pemasukan" stroke="#22c55e" strokeWidth={2} fillOpacity={1} fill="url(#colorPemasukan)" />
                <Area name="Saldo Berjalan" type="monotone" dataKey="saldo" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorSaldo)" />
                <Bar name="Pengeluaran" dataKey="pengeluaran" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={20} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Panel Rincian */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Info className="h-5 w-5 text-indigo-500" />
              Detail Mutasi Periode
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                <span className="text-sm text-slate-600 font-medium">Iuran Kas (Pokok)</span>
                <span className="font-semibold text-slate-800">{formatCurrency(stats.incomeKas)}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                <span className="text-sm text-slate-600 font-medium">Iuran Acara/Lainnya</span>
                <span className="font-semibold text-slate-800">{formatCurrency(stats.incomeLainnya)}</span>
              </div>
              <div className="h-px bg-slate-100 my-2" />
              <div className="flex justify-between items-center px-1">
                <span className="text-sm font-bold text-slate-700">Total Arus Masuk</span>
                <span className="font-bold text-green-600">+{formatCurrency(stats.totalIncome)}</span>
              </div>
              <div className="flex justify-between items-center px-1">
                <span className="text-sm font-bold text-slate-700">Total Arus Keluar</span>
                <span className="font-bold text-red-600">-{formatCurrency(stats.totalExpenses)}</span>
              </div>
              <div className="bg-indigo-600 p-4 rounded-xl text-white mt-4 shadow-sm shadow-indigo-200">
                <div className="flex justify-between items-center opacity-80 text-[10px] uppercase tracking-wider font-bold mb-1">
                  <span>Sisa Dana Bersih Bulan Ini</span>
                </div>
                <div className="text-2xl font-bold">
                  {formatCurrency(stats.totalIncome - stats.totalExpenses)}
                </div>
              </div>
            </div>
          </div>

          {/* Kepatuhan */}
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-2xl shadow-md text-white">
            <h3 className="text-lg font-bold mb-1">Partisipasi Iuran</h3>
            <p className="text-slate-400 text-xs mb-4">Warga yang telah membayar iuran bulan ini</p>
            <div className="flex items-end gap-2 mb-3">
              <span className="text-4xl font-bold">{stats.collectionRate.toFixed(1)}%</span>
              <span className="text-slate-400 text-sm mb-1">Terbayar</span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-3">
              <div 
                className="bg-indigo-500 h-3 rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(99,102,241,0.5)]" 
                style={{ width: `${Math.min(stats.collectionRate, 100)}%` }}
              ></div>
            </div>
            <p className="mt-4 text-[10px] text-slate-400 leading-relaxed italic">
              * Dihitung dari {stats.activeCount} warga aktif.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardView;

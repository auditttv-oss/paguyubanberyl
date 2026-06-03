import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchResidentsWithStatus, fetchExpenses, fetchAllPayments, deserializeExtendedFields } from '../services/dataService';
import { 
  Users,
  Home,
  Wallet,
  TrendingUp,
  TrendingDown,
  Gift,
  BarChart3,
  Users as UsersIcon,
  CreditCard
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  Cell, Legend, CartesianGrid 
} from 'recharts';

const getMonthName = (monthNumber: number) => {
  const date = new Date();
  date.setMonth(monthNumber - 1);
  return date.toLocaleString('id-ID', { month: 'long' });
};

const formatCurrency = (amount: number) => {
  return `Rp ${amount.toLocaleString('id-ID')}`;
};

// Algoritme Ekstraksi Tahun Lahir (Regex)
const parseAgeFromDob = (dobStr: string | null): number | null => {
  if (!dobStr) return null;
  // Ekstrak tahun 4 digit antara 1900 dan 2099
  const match = dobStr.match(/\b(19\d\d|20\d\d)\b/);
  if (match) {
    const birthYear = parseInt(match[0], 10);
    const currentYear = 2026; // Mengikuti tahun sistem berjalan (2026)
    const age = currentYear - birthYear;
    if (age >= 0 && age < 120) return age;
  }
  return null;
};

export const Dashboard = () => {
  const { user } = useAuth();
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  
  // Data fetching
  const { 
    data: residents = [], 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['residents', selectedMonth, selectedYear],
    queryFn: () => fetchResidentsWithStatus(selectedMonth, selectedYear),
  });

  const { 
    data: expenses = [], 
    isLoading: expensesLoading 
  } = useQuery({
    queryKey: ['expenses'],
    queryFn: fetchExpenses,
  });

  const { 
    data: payments = [], 
    isLoading: paymentsLoading 
  } = useQuery({
    queryKey: ['payments'],
    queryFn: fetchAllPayments,
  });

  // Perhitungan Keuangan Kumulatif Lintas Tahun (All-Time Math)
  const financialAllTime = useMemo(() => {
    const totalWajibInAllTime = payments?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0;
    const totalWajibOutAllTime = expenses?.filter(e => e.category === 'Operasional').reduce((sum, e) => sum + (e.amount || 0), 0) || 0;
    const totalSukarelaInAllTime = residents.reduce((sum, r) => sum + (r.eventDuesAmount || 0), 0);
    const totalSukarelaOutAllTime = expenses?.filter(e => e.category === 'Acara').reduce((sum, e) => sum + (e.amount || 0), 0) || 0;

    const wajibSaldoAkhir = totalWajibInAllTime - totalWajibOutAllTime;
    const sukarelaSaldoTersedia = totalSukarelaInAllTime - totalSukarelaOutAllTime;
    const balanceTotalAllTime = wajibSaldoAkhir + sukarelaSaldoTersedia;

    return {
      wajibSaldoAkhir,
      sukarelaSaldoTersedia,
      balanceTotalAllTime,
      totalWajibInAllTime,
      totalWajibOutAllTime,
      totalSukarelaInAllTime,
      totalSukarelaOutAllTime
    };
  }, [payments, expenses, residents]);

  // ALGORITME REKAPITULASI DEMOGRAFI USIA WARGA (Kolektif Kepala Keluarga + Anggota Serumah)
  const ageStats = useMemo(() => {
    let child = 0;      // 0 - 12 Tahun
    let teen = 0;       // 13 - 18 Tahun
    let youngAdult = 0; // 19 - 35 Tahun
    let adult = 0;      // 36 - 55 Tahun
    let senior = 0;     // 56 Tahun Keatas
    let totalAgeSum = 0;
    let totalParsedCount = 0;

    residents.forEach(r => {
      // Memakai opsi isAuthenticated=true agar kueri tidak tersensor demi akurasi grafik
      const { fields } = deserializeExtendedFields(r.notes, true);
      
      // 1. Hitung Usia KK Utama
      const ageKK = parseAgeFromDob(fields.tempat_tgl_lahir || null);
      if (ageKK !== null) {
        totalAgeSum += ageKK;
        totalParsedCount++;
        if (ageKK <= 12) child++;
        else if (ageKK <= 18) teen++;
        else if (ageKK <= 35) youngAdult++;
        else if (ageKK <= 55) adult++;
        else senior++;
      }

      // 2. Hitung Usia Anggota Keluarga Serumah
      const familyList: any[] = (fields as any).family_members_list || [];
      familyList.forEach(f => {
        const ageMember = parseAgeFromDob(f.birth_place || null);
        if (ageMember !== null) {
          totalAgeSum += ageMember;
          totalParsedCount++;
          if (ageMember <= 12) child++;
          else if (ageMember <= 18) teen++;
          else if (ageMember <= 35) youngAdult++;
          else if (ageMember <= 55) adult++;
          else senior++;
        }
      });
    });

    const averageAge = totalParsedCount > 0 ? Math.round(totalAgeSum / totalParsedCount) : 0;

    return {
      averageAge,
      totalParsedCount,
      chartData: [
        { name: 'Balita / Anak (0-12)', value: child, color: '#10b981' },
        { name: 'Remaja (13-18)', value: teen, color: '#3b82f6' },
        { name: 'Dewasa Muda (19-35)', value: youngAdult, color: '#8b5cf6' },
        { name: 'Dewasa (36-55)', value: adult, color: '#f59e0b' },
        { name: 'Lansia (56+)', value: senior, color: '#ef4444' }
      ].filter(item => item.value > 0) // Singkirkan data kosong agar grafik presisi
    };
  }, [residents]);

  // Statistics
  const stats = useMemo(() => {
    const total = residents.length;
    
    // Status hunian
    const menetap = residents.filter(r => r.occupancyStatus === 'Menetap').length;
    const penyewa = residents.filter(r => r.occupancyStatus === 'Penyewa').length;
    const kunjungan = residents.filter(r => r.occupancyStatus === 'Kunjungan').length;
    const ditempati2026 = residents.filter(r => r.occupancyStatus === 'Ditempati 2026').length;
    
    // Kas wajib (bulanan)
    const paidKas = residents.filter(r => r.isPaidCurrentMonth).length;
    const unpaidKas = total - paidKas;
    
    // Kas sukarela (acara)
    const donatedSukarela = residents.filter(r => (r.eventDuesAmount || 0) > 0).length;
    const notDonatedSukarela = total - donatedSukarela;
    const totalSukarela = residents.reduce((sum, r) => sum + (r.eventDuesAmount || 0), 0);
    const avgSukarela = donatedSukarela > 0 ? Math.round(totalSukarela / donatedSukarela) : 0;

    return {
      total,
      menetap,
      penyewa,
      kunjungan,
      ditempati2026,
      menetapPercentage: total > 0 ? Math.round((menetap / total) * 100) : 0,
      penyewaPercentage: total > 0 ? Math.round((penyewa / total) * 100) : 0,
      kunjunganPercentage: total > 0 ? Math.round((kunjungan / total) * 100) : 0,
      ditempati2026Percentage: total > 0 ? Math.round((ditempati2026 / total) * 100) : 0,
      paidKas,
      unpaidKas,
      paidPercentage: total > 0 ? Math.round((paidKas / total) * 100) : 0,
      unpaidPercentage: total > 0 ? Math.round((unpaidKas / total) * 100) : 0,
      donatedSukarela,
      notDonatedSukarela,
      totalSukarela,
      avgSukarela,
      sukarelaPercentage: total > 0 ? Math.round((donatedSukarela / total) * 100) : 0,
      notSukarelaPercentage: total > 0 ? Math.round((notDonatedSukarela / total) * 100) : 0,
    };
  }, [residents]);

  // Perhitungan Keuangan Periode Terpilih
  const currentMonthWajibIn = useMemo(() => {
    return payments?.filter(p => 
      p.month === selectedMonth && p.year === selectedYear
    ).reduce((sum, p) => sum + (p.amount || 0), 0) || 0;
  }, [payments, selectedMonth, selectedYear]);
  
  const currentMonthWajibOut = useMemo(() => {
    return expenses?.filter(e => {
      const expenseDate = new Date(e.date);
      return (expenseDate.getMonth() + 1) === selectedMonth && expenseDate.getFullYear() === selectedYear && e.category === 'Operasional';
    }).reduce((sum, e) => sum + (e.amount || 0), 0) || 0;
  }, [expenses, selectedMonth, selectedYear]);
  
  const currentMonthSukarelaIn = residents.reduce((sum, r) => sum + (r.eventDuesAmount || 0), 0);
  const currentMonthSukarelaOut = expenses?.filter(e => {
    const expenseDate = new Date(e.date);
    return expenseDate.getMonth() === selectedMonth - 1 && expenseDate.getFullYear() === selectedYear && e.category === 'Acara';
  }).reduce((sum, e) => sum + (e.amount || 0), 0) || 0;
  
  // Akumulasi Tahunan Terpilih
  const yearlyTotalIn = payments?.filter(p => p.year === selectedYear).reduce((sum, p) => sum + (p.amount || 0), 0) || 0;
  const yearlyTotalOut = expenses?.filter(e => {
    const expenseDate = new Date(e.date);
    return expenseDate.getFullYear() === selectedYear && e.category === 'Operasional';
  }).reduce((sum, e) => sum + (e.amount || 0), 0) || 0;
  
  // Data kumulatif bulanan tahun terpilih
  const monthlyCumulativeData = useMemo(() => {
    const data = [];
    let cumulativeBalance = 0;
    
    for (let month = 1; month <= 12; month++) {
      const monthPayments = payments?.filter(p => p.month === month && p.year === selectedYear) || [];
      const monthExpenses = expenses?.filter(e => {
        const expenseDate = new Date(e.date);
        return expenseDate.getMonth() + 1 === month && 
               expenseDate.getFullYear() === selectedYear && 
               e.category === 'Operasional';
      }) || [];
      
      const income = monthPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
      const expense = monthExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
      
      cumulativeBalance += (income - expense);
      
      data.push({
        month,
        income,
        expense,
        cumulativeBalance,
        status: cumulativeBalance > 0 ? 'Sehat' : cumulativeBalance === 0 ? 'Aman' : 'Kritis'
      });
    }
    
    return data;
  }, [payments, expenses, selectedYear]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-6 md:py-8">
        
        {/* Header */}
        <header className="mb-6 md:mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 md:gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white">
                  <BarChart3 size={24} />
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Dashboard Keuangan Paguyuban Cluster Beryl</h1>
                  <p className="text-gray-600 text-sm">
                    Laporan keuangan terverifikasi kumulatif dan berkala.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
              <div className="flex gap-2">
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(Number(e.target.value))}
                  className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none font-bold"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(m => (
                    <option key={m} value={m}>{getMonthName(m)}</option>
                  ))}
                </select>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none font-bold"
                >
                  <option value={2024}>2024</option>
                  <option value={2025}>2025</option>
                  <option value={2026}>2026</option>
                  <option value={2027}>2027</option>
                </select>
              </div>
            </div>
          </div>
        </header>

        {/* Realtime Overview - Kumulatif Semua Waktu */}
        <section className="mb-6 md:mb-8">
          <div className="grid grid-cols-1 gap-4 mb-4">
            <div className="bg-gradient-to-br from-emerald-800 to-teal-950 text-white p-6 rounded-3xl shadow-xl">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 divide-y md:divide-y-0 md:divide-x divide-white/10">
                
                {/* Total Balance */}
                <div className="pb-4 md:pb-0">
                  <div className="flex items-center gap-2 mb-2 text-emerald-300">
                    <Wallet size={20} />
                    <span className="text-xs font-black uppercase tracking-widest">Saldo Riil Saat Ini</span>
                  </div>
                  <h2 className="text-3xl md:text-4xl font-black">
                    {formatCurrency(financialAllTime.balanceTotalAllTime)}
                  </h2>
                  <p className="text-xs text-emerald-200/80 mt-1">Akumulasi Kas Wajib + Kas Sukarela (Seluruh Waktu)</p>
                </div>

                {/* Kas Wajib Card */}
                <div className="py-4 md:py-0 md:pl-6">
                  <p className="text-xs font-bold text-emerald-300 uppercase mb-1">Kas Wajib (Kumulatif)</p>
                  <p className="text-2xl font-bold">{formatCurrency(financialAllTime.wajibSaldoAkhir)}</p>
                  <div className="text-[10px] text-emerald-200/70 mt-1 space-y-0.5">
                    <p>Total Masuk: {formatCurrency(financialAllTime.totalWajibInAllTime)}</p>
                    <p>Total Keluar: {formatCurrency(financialAllTime.totalWajibOutAllTime)}</p>
                  </div>
                </div>

                {/* Kas Acara Card */}
                <div className="pt-4 md:pt-0 md:pl-6">
                  <p className="text-xs font-bold text-emerald-300 uppercase mb-1">Kas Acara (Kumulatif)</p>
                  <p className="text-2xl font-bold">{formatCurrency(financialAllTime.sukarelaSaldoTersedia)}</p>
                  <div className="text-[10px] text-emerald-200/70 mt-1 space-y-0.5">
                    <p>Total Sukarela: {formatCurrency(financialAllTime.totalSukarelaInAllTime)}</p>
                    <p>Total Keluar: {formatCurrency(financialAllTime.totalSukarelaOutAllTime)}</p>
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* Baris Berjalan Bulanan & Tahunan */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Bulan Berjalan */}
            <div className="bg-white p-5 rounded-2xl border shadow-sm animate-in fade-in duration-300">
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-bold text-gray-400 uppercase">Periode Bulanan</span>
                <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg">
                  {getMonthName(selectedMonth)}
                </span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-500">Pemasukan Kas:</span>
                  <span className="font-bold text-emerald-600">{formatCurrency(currentMonthWajibIn)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Pengeluaran Kas:</span>
                  <span className="font-bold text-red-600">{formatCurrency(currentMonthWajibOut)}</span>
                </div>
                <div className="border-t pt-2 flex justify-between font-bold text-gray-800">
                  <span>Sisa Bulan Ini:</span>
                  <span>{formatCurrency(currentMonthWajibIn - currentMonthWajibOut)}</span>
                </div>
              </div>
            </div>

            {/* Kas Acara Aktif */}
            <div className="bg-white p-5 rounded-2xl border shadow-sm">
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-bold text-gray-400 uppercase">Kas Acara Terkumpul</span>
                <span className="text-xs font-black text-purple-600 bg-purple-50 px-2.5 py-1 rounded-lg">Sukarela</span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-500">Sumbangan Warga:</span>
                  <span className="font-bold text-purple-600">{formatCurrency(currentMonthSukarelaIn)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Belanja Acara:</span>
                  <span className="font-bold text-red-600">{formatCurrency(currentMonthSukarelaOut)}</span>
                </div>
                <div className="border-t pt-2 flex justify-between font-bold text-gray-800">
                  <span>Saldo Acara Aktif:</span>
                  <span>{formatCurrency(currentMonthSukarelaIn - currentMonthSukarelaOut)}</span>
                </div>
              </div>
            </div>

            {/* Rekap Tahunan */}
            <div className="bg-white p-5 rounded-2xl border shadow-sm">
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-bold text-gray-400 uppercase">Akumulasi Tahunan</span>
                <span className="text-xs font-black text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg">Tahun {selectedYear}</span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-500">Pemasukan {selectedYear}:</span>
                  <span className="font-bold text-emerald-600">{formatCurrency(yearlyTotalIn)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Pengeluaran {selectedYear}:</span>
                  <span className="font-bold text-red-600">{formatCurrency(yearlyTotalOut)}</span>
                </div>
                <div className="border-t pt-2 flex justify-between font-bold text-gray-800">
                  <span>Sisa Saldo {selectedYear}:</span>
                  <span>{formatCurrency(yearlyTotalIn - yearlyTotalOut)}</span>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* GRAFIK DEMOGRAFI RATA-RATA USIA WARGA BERYL */}
        <section className="mb-6 md:mb-8 grid grid-cols-1 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3">
              <div>
                <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  <UsersIcon size={20} className="text-emerald-600" />
                  Grafik Demografi & Rata-rata Usia Warga Beryl
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  Kalkulasi riil dari Kepala Keluarga serumah beserta seluruh anggota keluarga terdaftar.
                </p>
              </div>
              <div className="bg-emerald-50 px-4 py-2 border border-emerald-100 rounded-xl text-center">
                <span className="text-[10px] font-bold text-emerald-600 uppercase block tracking-wider">Rata-rata Usia</span>
                <span className="text-lg font-black text-emerald-800">{ageStats.averageAge} Tahun</span>
              </div>
            </div>

            {ageStats.chartData.length > 0 ? (
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={ageStats.chartData} margin={{ top: 10, right: 10, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                    <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#6b7280', fontWeight: 'bold' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} allowDecimals={false} />
                    <Tooltip 
                      cursor={{ fill: '#f9fafb' }}
                      contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                      formatter={(value) => [`${value} Orang`, 'Jumlah']}
                    />
                    <Bar dataKey="value" fill="#10b981" radius={[8, 8, 0, 0]} barSize={40}>
                      {ageStats.chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-400">
                <UsersIcon size={32} className="mx-auto mb-2 text-gray-300" />
                <p className="text-xs">Sensus tanggal lahir warga belum mencukupi untuk memvisualisasikan grafik usia.</p>
              </div>
            )}
          </div>
        </section>

        {/* Bottom Section - Status Hunian & Payment Statistics */}
        <section className="mb-6 md:mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Status Hunian Infografis */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-emerald-100 text-emerald-600">
                  <Home size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-800">Status Hunian Warga</h3>
                  <p className="text-gray-600 text-sm">Distribusi berdasarkan status tempat tinggal</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="text-center p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                  <p className="text-2xl font-bold text-emerald-700">{stats.menetap}</p>
                  <p className="text-sm font-medium text-emerald-700 mb-1">Menetap</p>
                  <p className="text-xs text-emerald-600">{stats.menetapPercentage}%</p>
                  <div className="mt-2 w-full bg-emerald-200 rounded-full h-2">
                    <div className="bg-emerald-500 h-2 rounded-full" style={{width: `${stats.menetapPercentage}%`}} />
                  </div>
                </div>
                
                <div className="text-center p-4 bg-blue-50 rounded-xl border border-blue-200">
                  <p className="text-2xl font-bold text-blue-700">{stats.penyewa}</p>
                  <p className="text-sm font-medium text-blue-700 mb-1">Penyewa</p>
                  <p className="text-xs text-blue-600">{stats.penyewaPercentage}%</p>
                  <div className="mt-2 w-full bg-blue-200 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{width: `${stats.penyewaPercentage}%`}} />
                  </div>
                </div>
                
                <div className="text-center p-4 bg-amber-50 rounded-xl border border-amber-200">
                  <p className="text-2xl font-bold text-amber-700">{stats.kunjungan}</p>
                  <p className="text-sm font-medium text-amber-700 mb-1">Kunjungan</p>
                  <p className="text-xs text-amber-600">{stats.kunjunganPercentage}%</p>
                  <div className="mt-2 w-full bg-amber-200 rounded-full h-2">
                    <div className="bg-amber-500 h-2 rounded-full" style={{width: `${stats.kunjunganPercentage}%`}} />
                  </div>
                </div>
                
                <div className="text-center p-4 bg-purple-50 rounded-xl border border-purple-200">
                  <p className="text-2xl font-bold text-purple-700">{stats.ditempati2026}</p>
                  <p className="text-sm font-medium text-purple-700 mb-1">2026</p>
                  <p className="text-xs text-purple-600">{stats.ditempati2026Percentage}%</p>
                  <div className="mt-2 w-full bg-purple-200 rounded-full h-2">
                    <div className="bg-purple-500 h-2 rounded-full" style={{width: `${stats.ditempati2026Percentage}%`}} />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Payment Statistics */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                  <CreditCard size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-800">Statistik Pembayaran</h3>
                  <p className="text-gray-600 text-sm">Status iuran warga bulan ini</p>
                </div>
              </div>
              
              <div className="mb-6">
                <h4 className="text-sm font-bold text-gray-700 mb-3">Kas Bulanan (Wajib)</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-emerald-700">Sudah Bayar</span>
                      <span className="text-2xl font-bold text-emerald-600">{stats.paidKas}</span>
                    </div>
                    <p className="text-xs text-emerald-600 mb-2">{stats.paidPercentage}% dari total warga</p>
                    <div className="w-full bg-emerald-200 rounded-full h-3">
                      <div className="bg-emerald-500 h-3 rounded-full transition-all duration-500" style={{width: `${stats.paidPercentage}%`}} />
                    </div>
                  </div>
                  
                  <div className="bg-red-50 p-4 rounded-xl border border-red-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-red-700">Belum Bayar</span>
                      <span className="text-2xl font-bold text-red-600">{stats.unpaidKas}</span>
                    </div>
                    <p className="text-xs text-red-600 mb-2">{stats.unpaidPercentage}% dari total warga</p>
                    <div className="w-full bg-red-200 rounded-full h-3">
                      <div className="bg-red-500 h-3 rounded-full transition-all duration-500" style={{width: `${stats.unpaidPercentage}%`}} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Monthly Statistics Table */}
        <section className="mb-6 md:mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Monthly Statistics Table */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-amber-100 text-amber-600">
                  <BarChart3 size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-800">Statistik Kas Bulanan {selectedYear}</h3>
                  <p className="text-gray-600 text-sm">Rekapitulasi pemasukan dan pengeluaran per bulan</p>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2 px-1 font-medium text-gray-700">Bulan</th>
                      <th className="text-right py-2 px-1 font-medium text-gray-700">Pemasukan</th>
                      <th className="text-right py-2 px-1 font-medium text-gray-700">Pengeluaran</th>
                      <th className="text-right py-2 px-1 font-medium text-gray-700">Saldo</th>
                      <th className="text-center py-2 px-1 font-medium text-gray-700">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {monthlyCumulativeData.map((data, i) => {
                      const statusColor = data.cumulativeBalance > 0 ? 'text-emerald-600 bg-emerald-50' : data.cumulativeBalance === 0 ? 'text-blue-600 bg-blue-50' : 'text-red-600 bg-red-50';
                      const isActive = data.income > 0;
                      
                      return (
                        <tr key={data.month} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-1 px-1">
                            <div className="flex items-center gap-1">
                              <span className="font-medium text-gray-800 text-xs">{['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'][i]}</span>
                              {isActive && <span className="text-[10px] font-medium text-emerald-600 bg-emerald-100 px-1 py-0.2 rounded-full">Aktif</span>}
                            </div>
                          </td>
                          <td className="text-right py-1 px-1 text-xs">{data.income > 0 ? formatCurrency(data.income) : '-'}</td>
                          <td className="text-right py-1 px-1 text-xs">{data.expense > 0 ? formatCurrency(data.expense) : '-'}</td>
                          <td className="text-right py-1 px-1 font-medium text-xs">{formatCurrency(data.cumulativeBalance)}</td>
                          <td className="text-center py-1 px-1">
                            <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-medium ${statusColor}`}>
                              {data.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
            
            {/* Pengeluaran Kas Acara */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-red-100 text-red-600">
                  <TrendingDown size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-800">Pengeluaran Kas Acara {selectedYear}</h3>
                  <p className="text-gray-600 text-sm">Rincian pengeluaran untuk kegiatan acara</p>
                </div>
              </div>
              
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {expenses
                  ?.filter(e => {
                    const expenseDate = new Date(e.date);
                    return expenseDate.getFullYear() === selectedYear && e.category === 'Acara';
                  })
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .slice(0, 10)
                  .map((expense, index) => (
                    <div key={expense.id} className="flex items-center justify-between p-3 bg-gradient-to-r from-red-50 to-orange-50 rounded-lg border border-red-200 hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 bg-gradient-to-r from-red-400 to-red-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-gray-800">{expense.description}</p>
                          <p className="text-[10px] text-gray-500">{new Date(expense.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-red-600">{formatCurrency(expense.amount || 0)}</p>
                        <p className="text-[10px] text-red-500">pengeluaran</p>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

          </div>
        </section>
      </div>
    </div>
  );
};
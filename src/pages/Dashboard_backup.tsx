import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchResidentsWithStatus, fetchExpenses, fetchAllPayments } from '../services/dataService';
import { 
  Users,
  Home,
  Wallet,
  DollarSign,
  TrendingUp,
  Gift,
  Heart,
  Percent,
  Users as UsersIcon,
  BarChart3,
  PieChart,
  Activity,
  CreditCard,
  Building,
  Calendar,
  ArrowUp,
  ArrowDown,
  Eye,
  Settings,
  FileText,
  Download,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Resident } from '../types';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart as RechartsPieChart, Pie, Cell, Legend,
  CartesianGrid, LineChart, Line, Area, AreaChart
} from 'recharts';

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
    
    // Pengeluaran
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    const thisMonthExpenses = expenses
      .filter(e => {
        const expenseDate = new Date(e.date);
        return expenseDate.getMonth() + 1 === selectedMonth && expenseDate.getFullYear() === selectedYear;
      })
      .reduce((sum, e) => sum + e.amount, 0);
    
    // Pembayaran bulanan untuk periode ini
    const thisMonthPayments = payments
      .filter(p => p.month === selectedMonth && p.year === selectedYear)
      .reduce((sum, p) => sum + p.amount, 0);
    
    // Saldo kas
    const totalKasMasuk = payments.reduce((sum, p) => sum + p.amount, 0);
    const totalKasKeluar = expenses.reduce((sum, e) => sum + e.amount, 0);
    const saldoKas = totalKasMasuk - totalKasKeluar;
    
    // Kategori donasi
    const smallDonors = residents.filter(r => (r.eventDuesAmount || 0) > 0 && (r.eventDuesAmount || 0) <= 50000).length;
    const mediumDonors = residents.filter(r => (r.eventDuesAmount || 0) > 50000 && (r.eventDuesAmount || 0) <= 200000).length;
    const largeDonors = residents.filter(r => (r.eventDuesAmount || 0) > 200000).length;

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
      totalKas: paidKas * 10000,
      paidPercentage: total > 0 ? Math.round((paidKas / total) * 100) : 0,
      unpaidPercentage: total > 0 ? Math.round((unpaidKas / total) * 100) : 0,
      donatedSukarela,
      notDonatedSukarela,
      totalSukarela,
      avgSukarela,
      sukarelaPercentage: total > 0 ? Math.round((donatedSukarela / total) * 100) : 0,
      notSukarelaPercentage: total > 0 ? Math.round((notDonatedSukarela / total) * 100) : 0,
      smallDonors,
      mediumDonors,
      largeDonors,
      // Financial data
      totalExpenses,
      thisMonthExpenses,
      thisMonthPayments,
      totalKasMasuk,
      totalKasKeluar,
      saldoKas,
    };
  }, [residents, expenses, payments, selectedMonth, selectedYear]);

  // Chart data
  const occupancyChartData = useMemo(() => [
    { name: 'Menetap', value: stats.menetap, color: '#10b981' },
    { name: 'Penyewa', value: stats.penyewa, color: '#3b82f6' },
    { name: 'Kunjungan', value: stats.kunjungan, color: '#f59e0b' },
    { name: '2026', value: stats.ditempati2026, color: '#8b5cf6' }
  ].filter(item => item.value > 0), [stats]);

  const paymentChartData = useMemo(() => [
    { name: 'Sudah Bayar', value: stats.paidKas, color: '#10b981' },
    { name: 'Belum Bayar', value: stats.unpaidKas, color: '#ef4444' }
  ], [stats]);

  const donationChartData = useMemo(() => [
    { name: 'Sudah Donasi', value: stats.donatedSukarela, color: '#8b5cf6' },
    { name: 'Belum Donasi', value: stats.notDonatedSukarela, color: '#d1d5db' }
  ], [stats]);

  const donationCategoryData = useMemo(() => [
    { name: 'Kecil (≤50k)', value: stats.smallDonors, color: '#60a5fa' },
    { name: 'Sedang (50k-200k)', value: stats.mediumDonors, color: '#8b5cf6' },
    { name: 'Besar (>200k)', value: stats.largeDonors, color: '#f59e0b' }
  ].filter(item => item.value > 0), [stats]);

  // Format currency
  const formatCurrency = (amount: number) => {
    return `Rp ${amount.toLocaleString('id-ID')}`;
  };

  // Loading state
  if (isLoading || expensesLoading || paymentsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="animate-spin mx-auto text-emerald-600 mb-4" size={48} />
          <h2 className="text-xl font-bold text-gray-800">Memuat Dashboard</h2>
          <p className="text-gray-500 mt-2">Mohon tunggu sebentar...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="mx-auto w-12 h-12 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mb-4">
            <Activity size={24} />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Terjadi Kesalahan</h2>
          <p className="text-gray-600 mb-6">
            Gagal memuat data dashboard. Silakan periksa koneksi internet Anda.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white px-6 py-3 rounded-xl font-medium shadow-md transition-all duration-200"
          >
            Muat Ulang Halaman
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 md:py-6">
        
        {/* Header */}
        <header className="mb-6 md:mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 md:gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white">
                  <BarChart3 size={24} />
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Dashboard Cluster Beryl</h1>
                  <p className="text-gray-600 text-sm md:text-base">
                    Overview statistik dan keuangan warga
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
              <div className="flex gap-2">
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(Number(e.target.value))}
                  className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none"
                >
                  <option value={1}>Januari</option>
                  <option value={2}>Februari</option>
                  <option value={3}>Maret</option>
                  <option value={4}>April</option>
                  <option value={5}>Mei</option>
                  <option value={6}>Juni</option>
                  <option value={7}>Juli</option>
                  <option value={8}>Agustus</option>
                  <option value={9}>September</option>
                  <option value={10}>Oktober</option>
                  <option value={11}>November</option>
                  <option value={12}>Desember</option>
                </select>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none"
                >
                  <option value={2024}>2024</option>
                  <option value={2025}>2025</option>
                  <option value={2026}>2026</option>
                  <option value={2027}>2027</option>
                  <option value={2028}>2028</option>
                </select>
              </div>
              <button
                onClick={() => window.location.reload()}
                className="bg-white hover:bg-gray-50 text-gray-700 px-5 py-3.5 rounded-xl font-medium shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 border border-gray-200"
              >
                <RefreshCw size={20} />
                <span>Refresh Data</span>
              </button>
            </div>
          </div>
        </header>

        {/* Period Info */}
        <div className="mb-6">
          <div className="bg-white rounded-xl shadow-sm border p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Calendar className="text-emerald-600" size={20} />
                <div>
                  <h3 className="font-semibold text-gray-800">
                    Periode: {new Date(selectedYear, selectedMonth - 1).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
                  </h3>
                  <p className="text-sm text-gray-600">Data pembayaran dan statistik untuk periode ini</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-emerald-600">{stats.paidPercentage}%</p>
                <p className="text-xs text-gray-600">Tingkat Kepatuhan</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Overview Cards */}
        <section className="mb-6 md:mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6">
            {/* Total Warga */}
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-5 md:p-6 rounded-2xl shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm font-medium opacity-90">Total Warga</p>
                  <p className="text-2xl md:text-3xl font-bold">{stats.total}</p>
                  <p className="text-sm opacity-80 mt-1">Kepala Keluarga</p>
                </div>
                <div className="p-3 bg-white/20 rounded-xl">
                  <UsersIcon size={24} />
                </div>
              </div>
            </div>

            {/* Kas Bulanan */}
            <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white p-5 md:p-6 rounded-2xl shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm font-medium opacity-90">Kas Bulanan</p>
                  <p className="text-2xl md:text-3xl font-bold">{formatCurrency(stats.thisMonthPayments)}</p>
                  <p className="text-sm opacity-80 mt-1">{stats.paidKas} warga lunas</p>
                </div>
                <div className="p-3 bg-white/20 rounded-xl">
                  <Wallet size={24} />
                </div>
              </div>
            </div>

            {/* Kas Acara */}
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-5 md:p-6 rounded-2xl shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm font-medium opacity-90">Kas Acara</p>
                  <p className="text-2xl md:text-3xl font-bold">{formatCurrency(stats.totalSukarela)}</p>
                  <p className="text-sm opacity-80 mt-1">{stats.donatedSukarela} warga ikut</p>
                </div>
                <div className="p-3 bg-white/20 rounded-xl">
                  <Gift size={24} />
                </div>
              </div>
            </div>

            {/* Pengeluaran */}
            <div className="bg-gradient-to-br from-red-500 to-red-600 text-white p-5 md:p-6 rounded-2xl shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm font-medium opacity-90">Pengeluaran</p>
                  <p className="text-2xl md:text-3xl font-bold">{formatCurrency(stats.thisMonthExpenses)}</p>
                  <p className="text-sm opacity-80 mt-1">Bulan ini</p>
                </div>
                <div className="p-3 bg-white/20 rounded-xl">
                  <TrendingUp size={24} />
                </div>
              </div>
            </div>

            {/* Saldo Kas */}
            <div className="bg-gradient-to-br from-amber-500 to-amber-600 text-white p-5 md:p-6 rounded-2xl shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm font-medium opacity-90">Saldo Kas</p>
                  <p className="text-2xl md:text-3xl font-bold">{formatCurrency(stats.saldoKas)}</p>
                  <p className="text-sm opacity-80 mt-1">Total keseluruhan</p>
                </div>
                <div className="p-3 bg-white/20 rounded-xl">
                  <DollarSign size={24} />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Charts Section */}
        <section className="mb-6 md:mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
            {/* Status Hunian Chart */}
            <div className="bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-gray-200">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-emerald-100 text-emerald-600">
                  <Home size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-800">Status Hunian Warga</h3>
                  <p className="text-gray-600 text-sm">Distribusi berdasarkan status tempat tinggal</p>
                </div>
              </div>
              
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      data={occupancyChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {occupancyChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value) => [`${value} warga`, 'Jumlah']}
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                    />
                    <Legend />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
                <div className="text-center p-3 bg-emerald-50 rounded-xl">
                  <p className="text-sm font-medium text-emerald-700 mb-1">Menetap</p>
                  <p className="text-lg font-bold text-gray-800">{stats.menetap}</p>
                  <p className="text-xs text-emerald-600">{stats.menetapPercentage}%</p>
                </div>
                <div className="text-center p-3 bg-blue-50 rounded-xl">
                  <p className="text-sm font-medium text-blue-700 mb-1">Penyewa</p>
                  <p className="text-lg font-bold text-gray-800">{stats.penyewa}</p>
                  <p className="text-xs text-blue-600">{stats.penyewaPercentage}%</p>
                </div>
                <div className="text-center p-3 bg-amber-50 rounded-xl">
                  <p className="text-sm font-medium text-amber-700 mb-1">Kunjungan</p>
                  <p className="text-lg font-bold text-gray-800">{stats.kunjungan}</p>
                  <p className="text-xs text-amber-600">{stats.kunjunganPercentage}%</p>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-xl">
                  <p className="text-sm font-medium text-purple-700 mb-1">2026</p>
                  <p className="text-lg font-bold text-gray-800">{stats.ditempati2026}</p>
                  <p className="text-xs text-purple-600">{stats.ditempati2026Percentage}%</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Donasi Detail Section */}
        <section className="mb-6 md:mb-8">
          <div className="bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-gray-200">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-pink-100 text-pink-600">
                <Gift size={20} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800">Statistik Donasi Sukarela</h3>
                <p className="text-gray-600 text-sm">Detail partisipasi iuran sukarela</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-purple-50 rounded-xl">
                <p className="text-sm font-medium text-purple-700 mb-1">Total Donatur</p>
                <p className="text-2xl font-bold text-gray-800">{stats.donatedSukarela}</p>
                <p className="text-xs text-purple-600">{stats.sukarelaPercentage}% dari total</p>
              </div>
              
              <div className="text-center p-4 bg-emerald-50 rounded-xl">
                <p className="text-sm font-medium text-emerald-700 mb-1">Total Terkumpul</p>
                <p className="text-2xl font-bold text-gray-800">
                  {formatCurrency(stats.totalSukarela)}
                </p>
                <p className="text-xs text-emerald-600">Dari semua donasi</p>
              </div>
              
              <div className="text-center p-4 bg-blue-50 rounded-xl">
                <p className="text-sm font-medium text-blue-700 mb-1">Rata-rata Donasi</p>
                <p className="text-2xl font-bold text-gray-800">
                  {formatCurrency(stats.avgSukarela)}
                </p>
                <p className="text-xs text-blue-600">Per donatur aktif</p>
              </div>
              
              <div className="text-center p-4 bg-amber-50 rounded-xl">
                <p className="text-sm font-medium text-amber-700 mb-1">Belum Donasi</p>
                <p className="text-2xl font-bold text-gray-800">{stats.notDonatedSukarela}</p>
                <p className="text-xs text-amber-600">{stats.notSukarelaPercentage}% dari total</p>
              </div>
            </div>
            
            {/* Kategori Donasi */}
            <div className="mt-6">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Distribusi Berdasarkan Besaran Donasi:</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium text-blue-700">Kecil (≤ 50rb)</p>
                    <span className="text-lg font-bold text-blue-800">{stats.smallDonors}</span>
                  </div>
                  <p className="text-xs text-blue-600">Donatur dengan donasi kecil</p>
                </div>
                
                <div className="p-3 bg-purple-50 rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium text-purple-700">Sedang (50rb-200rb)</p>
                    <span className="text-lg font-bold text-purple-800">{stats.mediumDonors}</span>
                  </div>
                  <p className="text-xs text-purple-600">Donatur dengan donasi sedang</p>
                </div>
                
                <div className="p-3 bg-amber-50 rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium text-amber-700">Besar (&gt; 200rb)</p>
                    <span className="text-lg font-bold text-amber-800">{stats.largeDonors}</span>
                  </div>
                  <p className="text-xs text-amber-600">Donatur dengan donasi besar</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Actions */}
        <section className="mb-6 md:mb-8">
          <div className="bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-gray-200">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                <Settings size={20} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800">Quick Actions</h3>
                <p className="text-gray-600 text-sm">Akses cepat ke fitur-fitur utama</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <button
                onClick={() => window.location.href = '/residents'}
                className="p-4 bg-gradient-to-r from-emerald-50 to-emerald-100 hover:from-emerald-100 hover:to-emerald-200 rounded-xl transition-all duration-200 group"
              >
                <Users className="text-emerald-600 mb-2 group-hover:scale-110 transition-transform" size={24} />
                <p className="text-sm font-medium text-gray-800">Data Warga</p>
                <p className="text-xs text-gray-600">Kelola warga</p>
              </button>
              
              <button
                onClick={() => window.location.href = '/expenses'}
                className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 rounded-xl transition-all duration-200 group"
              >
                <FileText className="text-blue-600 mb-2 group-hover:scale-110 transition-transform" size={24} />
                <p className="text-sm font-medium text-gray-800">Pengeluaran</p>
                <p className="text-xs text-gray-600">Kelola kas</p>
              </button>
              
              <button
                onClick={() => window.location.href = '/blog'}
                className="p-4 bg-gradient-to-r from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 rounded-xl transition-all duration-200 group"
              >
                <FileText className="text-purple-600 mb-2 group-hover:scale-110 transition-transform" size={24} />
                <p className="text-sm font-medium text-gray-800">Blog</p>
                <p className="text-xs text-gray-600">Aspirasi</p>
              </button>
              
              <button
                onClick={() => window.location.href = '/settings'}
                className="p-4 bg-gradient-to-r from-amber-50 to-amber-100 hover:from-amber-100 hover:to-amber-200 rounded-xl transition-all duration-200 group"
              >
                <Settings className="text-amber-600 mb-2 group-hover:scale-110 transition-transform" size={24} />
                <p className="text-sm font-medium text-gray-800">Pengaturan</p>
                <p className="text-xs text-gray-600">Konfigurasi</p>
              </button>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="text-center text-gray-500 text-sm">
          <p>Sistem Manajemen Warga Cluster Beryl • Dashboard • Total {stats.total} KK</p>
        </footer>
      </div>
    </div>
  );
};

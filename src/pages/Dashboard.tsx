import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchResidents, fetchExpenses, fetchAllPayments, fetchPaymentsByMonth } from '../services/dataService';
import { useAuth } from '../contexts/AuthContext';
import { Users, Wallet, BarChart3, DollarSign, Calendar, CreditCard, Filter, PiggyBank, Gift, Home, RefreshCw } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, CartesianGrid } from 'recharts';

const getMonthName = (monthNumber: number): string => {
  const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
  return months[monthNumber - 1] || 'Tidak Valid';
};

const formatCurrency = (amount: number) => {
  return `Rp ${amount.toLocaleString('id-ID')}`;
};

export const Dashboard = () => {
  const { user } = useAuth();
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [activeTab, setActiveTab] = useState<'overview' | 'kas-bulanan' | 'kas-acara'>('overview');

  const { data: residents = [], isLoading: loadingResidents } = useQuery({ 
    queryKey: ['residents'], queryFn: fetchResidents, retry: 2
  });
  
  const { data: allExpenses = [], isLoading: loadingExpenses } = useQuery({ 
    queryKey: ['expenses'], queryFn: fetchExpenses, retry: 2
  });
  
  const { data: allPayments = [], isLoading: loadingAllPayments } = useQuery({ 
    queryKey: ['allPayments'], queryFn: fetchAllPayments, retry: 2
  });

  const { data: monthlyPayments = [], isLoading: loadingMonthlyPayments } = useQuery({ 
    queryKey: ['payments', selectedMonth, selectedYear], 
    queryFn: () => fetchPaymentsByMonth(selectedMonth, selectedYear),
    retry: 2
  });

  const isLoading = loadingResidents || loadingExpenses || loadingAllPayments || loadingMonthlyPayments;

  const filteredData = useMemo(() => {
    const filteredExpenses = allExpenses?.filter(expense => {
      if (!expense.date) return false;
      const expenseDate = new Date(expense.date);
      return expenseDate.getMonth() + 1 === selectedMonth && expenseDate.getFullYear() === selectedYear;
    }) || [];

    const paymentsForSelectedMonth = monthlyPayments || [];
    const paidIds = new Set(paymentsForSelectedMonth.map(p => p.resident_id));
    const residentsWithPaymentStatus = residents?.map(resident => ({
      ...resident,
      isPaidSelectedMonth: paidIds.has(resident.id)
    })) || [];

    const selectedMonthExpenses = filteredExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
    const selectedMonthIncome = paymentsForSelectedMonth.reduce((sum, p) => sum + (p.amount || 10000), 0);
    const selectedMonthPaidCount = paymentsForSelectedMonth.length;
    const selectedMonthUnpaidCount = Math.max(0, residents.length - selectedMonthPaidCount);
    const selectedMonthPaymentRate = residents.length > 0 ? Math.round((selectedMonthPaidCount / residents.length) * 100) : 0;

    const menetap = residents?.filter(r => r.occupancyStatus === 'Menetap').length || 0;
    const penyewa = residents?.filter(r => r.occupancyStatus === 'Penyewa').length || 0;
    const kunjungan = residents?.filter(r => r.occupancyStatus === 'Kunjungan').length || 0;
    const ditempati2026 = residents?.filter(r => r.occupancyStatus === 'Ditempati 2026').length || 0;

    const totalSukarela = residents?.reduce((sum, r) => sum + (r.eventDuesAmount || 0), 0) || 0;
    const totalAcaraExpenses = allExpenses?.filter(e => e.category === 'Acara').reduce((sum, e) => sum + (e.amount || 0), 0) || 0;

    const monthlyData = Array.from({ length: 12 }, (_, i) => {
      const month = i + 1;
      const monthPayments = allPayments?.filter(p => p.month === month && p.year === selectedYear) || [];
      const monthExpenses = allExpenses?.filter(e => {
        const expenseDate = new Date(e.date);
        return expenseDate.getMonth() + 1 === month && expenseDate.getFullYear() === selectedYear;
      }) || [];
      
      const income = monthPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
      const expense = monthExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
      
      return {
        month: getMonthName(month).substring(0, 3),
        income,
        expense,
        balance: income - expense
      };
    });

    return {
      allResidents: residents,
      filteredExpenses,
      paymentsForSelectedMonth,
      residentsWithPaymentStatus,
      selectedMonthExpenses,
      selectedMonthIncome,
      selectedMonthPaidCount,
      selectedMonthUnpaidCount,
      selectedMonthPaymentRate,
      menetap,
      penyewa,
      kunjungan,
      ditempati2026,
      totalSukarela,
      totalAcaraExpenses,
      monthlyData,
      monthName: getMonthName(selectedMonth)
    };
  }, [residents, allExpenses, allPayments, monthlyPayments, selectedMonth, selectedYear]);

  const occupancyChartData = useMemo(() => [
    { name: 'Menetap', value: filteredData.menetap, color: '#10b981' },
    { name: 'Penyewa', value: filteredData.penyewa, color: '#3b82f6' },
    { name: 'Kunjungan', value: filteredData.kunjungan, color: '#f59e0b' },
    { name: '2026', value: filteredData.ditempati2026, color: '#8b5cf6' }
  ].filter(item => item.value > 0), [filteredData]);

  const paymentChartData = useMemo(() => [
    { name: 'Sudah Bayar', value: filteredData.selectedMonthPaidCount, color: '#10b981' },
    { name: 'Belum Bayar', value: filteredData.selectedMonthUnpaidCount, color: '#ef4444' }
  ], [filteredData]);

  if (isLoading) {
    return (
      <div className="p-8 flex flex-col justify-center items-center gap-4 min-h-[400px]">
        <RefreshCw className="animate-spin text-emerald-600" size={32} />
        <p className="text-gray-600">Memuat data dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black text-gray-800">Dashboard Keuangan</h2>
          <p className="text-gray-500">Ringkasan {filteredData.monthName} {selectedYear}</p>
        </div>
        
        <div className="flex gap-2">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm"
          >
            {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
              <option key={month} value={month}>{getMonthName(month)}</option>
            ))}
          </select>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm"
          >
            {Array.from({ length: 5 }, (_, i) => 2024 + i).map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
      </div>

      {/* TABS */}
      <div className="bg-white rounded-xl border border-gray-200 p-1">
        <div className="flex">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex-1 py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 ${
              activeTab === 'overview' ? 'bg-emerald-600 text-white' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <BarChart3 size={18} />
            <span className="font-medium">Overview</span>
          </button>
          <button
            onClick={() => setActiveTab('kas-bulanan')}
            className={`flex-1 py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 ${
              activeTab === 'kas-bulanan' ? 'bg-emerald-600 text-white' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <PiggyBank size={18} />
            <span className="font-medium">Kas Bulanan</span>
          </button>
          <button
            onClick={() => setActiveTab('kas-acara')}
            className={`flex-1 py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 ${
              activeTab === 'kas-acara' ? 'bg-emerald-600 text-white' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Gift size={18} />
            <span className="font-medium">Kas Acara</span>
          </button>
        </div>
      </div>

      {/* OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Warga */}
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-2xl shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm opacity-90 mb-1">Total Warga</p>
                  <p className="text-3xl font-black">128 KK</p>
                </div>
                <div className="p-3 bg-white/20 rounded-xl">
                  <Users size={24} />
                </div>
              </div>
              <div className="text-sm opacity-80">
                <div className="flex justify-between mb-1">
                  <span>Sudah Bayar:</span>
                  <span>101 warga</span>
                </div>
                <div className="w-full bg-white/20 h-1.5 rounded-full">
                  <div className="bg-white h-1.5 rounded-full" style={{ width: '79%' }}></div>
                </div>
                <p className="mt-1 text-center font-medium">79%</p>
              </div>
            </div>
            
            {/* Total Saldo */}
            <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white p-6 rounded-2xl shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm opacity-90 mb-1">Total Saldo ({selectedYear})</p>
                  <p className="text-3xl font-black">{formatCurrency(
                    (filteredData.monthlyData.reduce((sum, d) => sum + d.income, 0) + filteredData.totalSukarela) - 
                    filteredData.filteredExpenses.reduce((sum, e) => sum + (e.amount || 0), 0)
                  )}</p>
                </div>
                <div className="p-3 bg-white/20 rounded-xl">
                  <Wallet size={24} />
                </div>
              </div>
              <div className="text-sm opacity-80 space-y-1">
                <div className="flex justify-between">
                  <span>Total Pemasukan:</span>
                  <span>{formatCurrency(
                    filteredData.monthlyData.reduce((sum, d) => sum + d.income, 0) + filteredData.totalSukarela
                  )}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Pengeluaran:</span>
                  <span>{formatCurrency(filteredData.filteredExpenses.reduce((sum, e) => sum + (e.amount || 0), 0))}</span>
                </div>
              </div>
            </div>
            
            {/* Kas Bulanan */}
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-2xl shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm opacity-90 mb-1">Kas Bulanan</p>
                  <p className="text-3xl font-black">{formatCurrency(
                    filteredData.monthlyData.reduce((sum, d) => sum + d.income, 0) - 
                    filteredData.filteredExpenses
                      .filter(e => e.category === 'Operasional' || e.category === 'Lainnya')
                      .reduce((sum, e) => sum + (e.amount || 0), 0)
                  )}</p>
                </div>
                <div className="p-3 bg-white/20 rounded-xl">
                  <CreditCard size={24} />
                </div>
              </div>
              <div className="text-sm opacity-80 space-y-1">
                <div className="flex justify-between">
                  <span>Total Masuk ({selectedYear}):</span>
                  <span>{formatCurrency(filteredData.monthlyData.reduce((sum, d) => sum + d.income, 0))}</span>
                </div>
                <div className="flex justify-between">
                  <span>Operasional ({selectedYear}):</span>
                  <span>{formatCurrency(
                    filteredData.filteredExpenses
                      .filter(e => e.category === 'Operasional' || e.category === 'Lainnya')
                      .reduce((sum, e) => sum + (e.amount || 0), 0)
                  )}</span>
                </div>
                <div className="text-center mt-2">
                  <span className="px-2 py-1 text-xs rounded-full bg-green-400 text-green-900">
                    Kas sehat
                  </span>
                </div>
              </div>
            </div>
            
            {/* Kas Acara */}
            <div className="bg-gradient-to-br from-pink-500 to-pink-600 text-white p-6 rounded-2xl shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm opacity-90 mb-1">Kas Acara</p>
                  <p className="text-3xl font-black">{formatCurrency(filteredData.totalSukarela - filteredData.totalAcaraExpenses)}</p>
                </div>
                <div className="p-3 bg-white/20 rounded-xl">
                  <Gift size={24} />
                </div>
              </div>
              <div className="text-sm opacity-80 space-y-1">
                <div className="flex justify-between">
                  <span>Total Masuk:</span>
                  <span>{formatCurrency(filteredData.totalSukarela)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Pengeluaran Acara:</span>
                  <span>{formatCurrency(filteredData.totalAcaraExpenses)}</span>
                </div>
                <div className="flex justify-between font-medium">
                  <span>Saldo Tersedia:</span>
                  <span>{formatCurrency(filteredData.totalSukarela - filteredData.totalAcaraExpenses)}</span>
                </div>
                <div className="text-center mt-2">
                  <span className="px-2 py-1 text-xs rounded-full bg-green-400 text-green-900">
                    Dana tersedia
                  </span>
                </div>
              </div>
            </div>

          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
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
                  <PieChart>
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
                    <Tooltip formatter={(value) => [`${value} warga`, 'Jumlah']} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
                <div className="text-center p-3 bg-emerald-50 rounded-xl">
                  <p className="text-sm font-medium text-emerald-700 mb-1">Menetap</p>
                  <p className="text-lg font-bold text-gray-800">{filteredData.menetap}</p>
                  <p className="text-xs text-emerald-600">
                    {filteredData.allResidents.length > 0 ? Math.round((filteredData.menetap / filteredData.allResidents.length) * 100) : 0}%
                  </p>
                </div>
                <div className="text-center p-3 bg-blue-50 rounded-xl">
                  <p className="text-sm font-medium text-blue-700 mb-1">Penyewa</p>
                  <p className="text-lg font-bold text-gray-800">{filteredData.penyewa}</p>
                  <p className="text-xs text-blue-600">
                    {filteredData.allResidents.length > 0 ? Math.round((filteredData.penyewa / filteredData.allResidents.length) * 100) : 0}%
                  </p>
                </div>
                <div className="text-center p-3 bg-amber-50 rounded-xl">
                  <p className="text-sm font-medium text-amber-700 mb-1">Kunjungan</p>
                  <p className="text-lg font-bold text-gray-800">{filteredData.kunjungan}</p>
                  <p className="text-xs text-amber-600">
                    {filteredData.allResidents.length > 0 ? Math.round((filteredData.kunjungan / filteredData.allResidents.length) * 100) : 0}%
                  </p>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-xl">
                  <p className="text-sm font-medium text-purple-700 mb-1">2026</p>
                  <p className="text-lg font-bold text-gray-800">{filteredData.ditempati2026}</p>
                  <p className="text-xs text-purple-600">
                    {filteredData.allResidents.length > 0 ? Math.round((filteredData.ditempati2026 / filteredData.allResidents.length) * 100) : 0}%
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                  <CreditCard size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-800">Status Pembayaran {filteredData.monthName}</h3>
                  <p className="text-gray-600 text-sm">Warga yang sudah dan belum bayar iuran</p>
                </div>
              </div>
              
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={paymentChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {paymentChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} warga`, 'Jumlah']} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              
              <div className="grid grid-cols-2 gap-3 mt-4">
                <div className="text-center p-3 bg-emerald-50 rounded-xl">
                  <p className="text-sm font-medium text-emerald-700 mb-1">Sudah Bayar</p>
                  <p className="text-lg font-bold text-gray-800">{filteredData.selectedMonthPaidCount}</p>
                  <p className="text-xs text-emerald-600">{filteredData.selectedMonthPaymentRate}%</p>
                </div>
                <div className="text-center p-3 bg-red-50 rounded-xl">
                  <p className="text-sm font-medium text-red-700 mb-1">Belum Bayar</p>
                  <p className="text-lg font-bold text-gray-800">{filteredData.selectedMonthUnpaidCount}</p>
                  <p className="text-xs text-red-600">{100 - filteredData.selectedMonthPaymentRate}%</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* KAS BULANAN TAB */}
      {activeTab === 'kas-bulanan' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-2xl shadow-lg">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-white/20 rounded-xl">
                  <PiggyBank size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-black">Kas Bulanan (Wajib)</h3>
                  <p className="opacity-90">Iuran Rp 10.000/KK per bulan</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="bg-white/10 p-4 rounded-xl">
                  <div className="flex justify-between items-center mb-2">
                    <span className="opacity-90">Masuk ({filteredData.monthName})</span>
                    <span className="text-lg font-bold">{formatCurrency(filteredData.selectedMonthIncome)}</span>
                  </div>
                  <p className="text-sm opacity-80">
                    {filteredData.selectedMonthPaidCount} dari {filteredData.allResidents.length} warga
                  </p>
                </div>
                
                <div className="bg-white/10 p-4 rounded-xl">
                  <div className="flex justify-between items-center mb-2">
                    <span className="opacity-90">Pengeluaran Operasional</span>
                    <span className="text-lg font-bold">{formatCurrency(
                      filteredData.filteredExpenses.filter(e => e.category === 'Operasional' || e.category === 'Lainnya')
                        .reduce((sum, e) => sum + (e.amount || 0), 0)
                    )}</span>
                  </div>
                  <p className="text-sm opacity-80">
                    {filteredData.filteredExpenses.filter(e => e.category === 'Operasional' || e.category === 'Lainnya').length} transaksi
                  </p>
                </div>
                
                <div className="bg-white/10 p-4 rounded-xl">
                  <div className="flex justify-between items-center mb-2">
                    <span className="opacity-90">Total Masuk ({selectedYear})</span>
                    <span className="text-lg font-bold">{formatCurrency(filteredData.monthlyData.reduce((sum, d) => sum + d.income, 0))}</span>
                  </div>
                  <p className="text-sm opacity-80">Dari seluruh pembayaran iuran wajib</p>
                </div>
                
                <div className="bg-white/20 p-4 rounded-xl border-2 border-white/30">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold">Saldo Kas Bulanan</span>
                    <span className="text-2xl font-black">{formatCurrency(
                      filteredData.monthlyData.reduce((sum, d) => sum + d.income, 0) - 
                      filteredData.filteredExpenses
                        .filter(e => e.category === 'Operasional' || e.category === 'Lainnya')
                        .reduce((sum, e) => sum + (e.amount || 0), 0)
                    )}</span>
                  </div>
                  <div className="mt-2">
                    <span className="px-3 py-1 text-sm rounded-full bg-green-400 text-green-900">
                      Kas sehat
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
                <CreditCard size={20} />
                Statistik Pembayaran {selectedYear}
              </h3>
              
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-xl">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Rasio Pembayaran</span>
                    <span className="text-lg font-bold text-purple-600">{filteredData.selectedMonthPaymentRate}%</span>
                  </div>
                  <div className="w-full bg-gray-200 h-3 rounded-full">
                    <div className="bg-purple-600 h-3 rounded-full transition-all duration-500" style={{ width: `${filteredData.selectedMonthPaymentRate}%` }}></div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>{filteredData.selectedMonthPaidCount} dari {filteredData.allResidents.length} warga sudah bayar</span>
                    <span>{filteredData.selectedMonthPaymentRate}%</span>
                  </div>
                </div>

                <div className="text-sm text-gray-600">
                  <p>Info: Dana kas bulanan dialokasikan untuk menunjang biaya operasional paguyuban, yang meliputi pengadaan Alat Tulis Kantor (ATK), biaya administrasi, serta dana sosial untuk memberikan santunan atau bantuan kepada warga yang membutuhkan.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
              <BarChart3 size={20} />
              Pengeluaran Operasional {selectedYear}
            </h3>
            
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Bulan</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-700">Pemasukan</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-700">Pengeluaran</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-700">Saldo</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-700">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.monthlyData.map((data, index) => {
                    const monthIndex = index + 1;
                    const isActive = monthIndex === selectedMonth;
                    const operationalExpenses = allExpenses?.filter(e => {
                      const expenseDate = new Date(e.date);
                      return expenseDate.getMonth() + 1 === monthIndex && 
                             expenseDate.getFullYear() === selectedYear &&
                             (e.category === 'Operasional' || e.category === 'Lainnya');
                    }).reduce((sum, e) => sum + (e.amount || 0), 0) || 0;
                    
                    const balance = data.income - operationalExpenses;
                    const status = balance > 0 ? 'Sehat' : balance === 0 ? 'Aman' : 'Perlu Perhatian';
                    const statusColor = balance > 0 ? 'green' : balance === 0 ? 'blue' : 'yellow';
                    
                    return (
                      <tr key={index} className="border-b border-gray-100">
                        <td className="py-3 px-4 font-medium">{data.month}</td>
                        <td className="py-3 px-4 text-right">
                          {isActive && (
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Aktif</span>
                          )}
                          <div className={isActive ? "mt-1" : ""}>
                            {formatCurrency(data.income)}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right">{formatCurrency(operationalExpenses)}</td>
                        <td className="py-3 px-4 text-right font-medium">{formatCurrency(balance)}</td>
                        <td className="py-3 px-4 text-center">
                          <span className={`px-2 py-1 text-xs rounded-full bg-${statusColor}-100 text-${statusColor}-800`}>
                            {status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                  <tr className="bg-gray-50 font-bold">
                    <td className="py-3 px-4">Total</td>
                    <td className="py-3 px-4 text-right">
                      {formatCurrency(filteredData.monthlyData.reduce((sum, d) => sum + d.income, 0))}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {formatCurrency(
                        allExpenses?.filter(e => {
                          const expenseDate = new Date(e.date);
                          return expenseDate.getFullYear() === selectedYear &&
                                 (e.category === 'Operasional' || e.category === 'Lainnya');
                        }).reduce((sum, e) => sum + (e.amount || 0), 0) || 0
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {formatCurrency(
                        filteredData.monthlyData.reduce((sum, d) => sum + d.income, 0) -
                        allExpenses?.filter(e => {
                          const expenseDate = new Date(e.date);
                          return expenseDate.getFullYear() === selectedYear &&
                                 (e.category === 'Operasional' || e.category === 'Lainnya');
                        }).reduce((sum, e) => sum + (e.amount || 0), 0) || 0
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800 font-medium">
                        Kas Sehat
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="text-sm text-gray-600 mt-4">
              <p>Dashboard Keuangan Paguyuban Cluster Beryl • Update terakhir: {new Date().toLocaleDateString('id-ID')}</p>
            </div>
          </div>
        </div>
      )}

      {/* KAS ACARA TAB */}
      {activeTab === 'kas-acara' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-pink-500 to-pink-600 text-white p-6 rounded-2xl shadow-lg">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-white/20 rounded-xl">
                  <Gift size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-black">Kas Acara (Sukarela)</h3>
                  <p className="opacity-90">Iuran sukarela untuk kegiatan</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="bg-white/10 p-4 rounded-xl">
                  <div className="flex justify-between items-center mb-2">
                    <span className="opacity-90">Total Masuk</span>
                    <span className="text-lg font-bold">{formatCurrency(filteredData.totalSukarela)}</span>
                  </div>
                  <p className="text-sm opacity-80">Dari iuran sukarela semua warga</p>
                </div>
                
                <div className="bg-white/10 p-4 rounded-xl">
                  <div className="flex justify-between items-center mb-2">
                    <span className="opacity-90">Pengeluaran Acara</span>
                    <span className="text-lg font-bold">{formatCurrency(filteredData.totalAcaraExpenses)}</span>
                  </div>
                  <p className="text-sm opacity-80">
                    {allExpenses?.filter(e => e.category === 'Acara').length || 0} transaksi acara
                  </p>
                </div>
                
                <div className="bg-white/20 p-4 rounded-xl border-2 border-white/30">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold">Saldo Kas Acara</span>
                    <span className="text-2xl font-black">{formatCurrency(filteredData.totalSukarela - filteredData.totalAcaraExpenses)}</span>
                  </div>
                  <div className="mt-2">
                    <span className="px-3 py-1 text-sm rounded-full bg-green-400 text-green-900">
                      Dana tersedia
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Donatur Terbaik */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
                <Gift size={20} />
                Donatur Terbaik {selectedYear}
              </h3>
              
              <div className="space-y-4">
                <div className="overflow-y-auto max-h-64">
                  {filteredData.allResidents
                    .filter(r => (r.eventDuesAmount || 0) > 0)
                    .sort((a, b) => (b.eventDuesAmount || 0) - (a.eventDuesAmount || 0))
                    .slice(0, 10)
                    .map((resident, index) => (
                      <div key={resident.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                            index === 0 ? 'bg-yellow-100 text-yellow-800' :
                            index === 1 ? 'bg-gray-100 text-gray-800' :
                            index === 2 ? 'bg-orange-100 text-orange-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : (index + 1)}
                          </div>
                          <div>
                            <p className="font-medium">{resident.fullName}</p>
                            <p className="text-xs text-gray-500">Blok {resident.blockNumber}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-pink-600">
                            {formatCurrency(resident.eventDuesAmount || 0)}
                          </p>
                          <p className="text-xs text-gray-500">donasi</p>
                        </div>
                      </div>
                    ))}
                </div>
                
                <div className="bg-pink-50 p-4 rounded-xl">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-pink-700 font-bold mb-1">Total Donatur</p>
                      <p className="text-xl font-black text-pink-700">
                        {filteredData.allResidents.filter(r => (r.eventDuesAmount || 0) > 0).length} warga
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-pink-700 font-bold mb-1">Rata-rata Donasi</p>
                      <p className="text-xl font-black text-pink-700">
                        {filteredData.allResidents.filter(r => (r.eventDuesAmount || 0) > 0).length > 0
                          ? formatCurrency(Math.round(
                              filteredData.totalSukarela / 
                              filteredData.allResidents.filter(r => (r.eventDuesAmount || 0) > 0).length
                            ))
                          : 'Rp 0'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Detail Transaksi Acara */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
              <Calendar size={20} />
              Detail Transaksi Acara {selectedYear}
            </h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Pengeluaran Acara */}
              <div>
                <h4 className="font-medium text-gray-700 mb-3">Pengeluaran Acara</h4>
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {allExpenses
                    ?.filter(e => e.category === 'Acara')
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .map(expense => (
                      <div key={expense.id} className="p-3 border border-pink-200 rounded-lg bg-pink-50">
                        <div className="flex justify-between items-start mb-1">
                          <p className="font-medium">{expense.description}</p>
                          <p className="font-bold text-pink-600">{formatCurrency(expense.amount)}</p>
                        </div>
                        <div className="flex justify-between text-sm text-gray-500">
                          <span>{expense.date}</span>
                          <span className="bg-pink-100 text-pink-800 px-2 py-0.5 rounded-full text-xs">
                            Acara
                          </span>
                        </div>
                      </div>
                    ))}
                  {allExpenses?.filter(e => e.category === 'Acara').length === 0 && (
                    <p className="text-gray-500 text-center py-4">Belum ada pengeluaran acara</p>
                  )}
                </div>
              </div>
              
              {/* Ringkasan */}
              <div className="bg-pink-50 p-4 rounded-xl">
                <h4 className="font-bold text-pink-800 mb-3">Ringkasan Kas Acara</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-pink-700">Total Donasi:</span>
                    <span className="font-bold text-pink-800">{formatCurrency(filteredData.totalSukarela)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-pink-700">Total Pengeluaran:</span>
                    <span className="font-bold text-pink-800">{formatCurrency(filteredData.totalAcaraExpenses)}</span>
                  </div>
                  <div className="border-t border-pink-200 pt-3">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-pink-800">Saldo Tersedia:</span>
                      <span className="text-xl font-black text-pink-900">
                        {formatCurrency(filteredData.totalSukarela - filteredData.totalAcaraExpenses)}
                      </span>
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="text-sm text-pink-700">
                      💰 <strong>Sisa dana acara</strong> dapat digunakan untuk kegiatan sosial, acara komunitas, atau bantuan darurat.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Statistik Partisipasi */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
              <BarChart3 size={20} />
              Statistik Partisipasi Sukarela
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-purple-50 rounded-xl">
                <p className="text-sm font-medium text-purple-700 mb-1">Partisipasi</p>
                <p className="text-2xl font-bold text-purple-700">
                  {filteredData.allResidents.length > 0 
                    ? Math.round((filteredData.allResidents.filter(r => (r.eventDuesAmount || 0) > 0).length / filteredData.allResidents.length) * 100)
                    : 0}%
                </p>
                <p className="text-xs text-purple-600">
                  {filteredData.allResidents.filter(r => (r.eventDuesAmount || 0) > 0).length} dari {filteredData.allResidents.length} warga
                </p>
              </div>
              
              <div className="text-center p-4 bg-emerald-50 rounded-xl">
                <p className="text-sm font-medium text-emerald-700 mb-1">Total Terkumpul</p>
                <p className="text-2xl font-bold text-emerald-700">
                  {formatCurrency(filteredData.totalSukarela)}
                </p>
                <p className="text-xs text-emerald-600">Dari semua donasi</p>
              </div>
              
              <div className="text-center p-4 bg-blue-50 rounded-xl">
                <p className="text-sm font-medium text-blue-700 mb-1">Rata-rata Donasi</p>
                <p className="text-2xl font-bold text-blue-700">
                  {filteredData.allResidents.filter(r => (r.eventDuesAmount || 0) > 0).length > 0
                    ? formatCurrency(Math.round(filteredData.totalSukarela / filteredData.allResidents.filter(r => (r.eventDuesAmount || 0) > 0).length))
                    : 'Rp 0'}
                </p>
                <p className="text-xs text-blue-600">Per donatur aktif</p>
              </div>
            </div>
            
            <div className="mt-4 text-sm text-gray-600">
              <p>💡 <strong>Tips:</strong> Apresiasi donatur terbesar dapat meningkatkan partisipasi warga lainnya. Buat laporan transparan untuk menjaga kepercayaan warga.</p>
            </div>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <div className="text-center text-gray-400 text-sm py-4">
        <p>Dashboard Keuangan Paguyuban Cluster Beryl • Update terakhir: {new Date().toLocaleDateString('id-ID')}</p>
      </div>
    </div>
  );
};

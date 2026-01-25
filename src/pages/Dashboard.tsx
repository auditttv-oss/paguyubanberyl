import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchResidentsWithStatus, fetchExpenses, fetchAllPayments } from '../services/dataService';
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

const getMonthName = (monthNumber: number) => {
  const date = new Date();
  date.setMonth(monthNumber - 1);
  return date.toLocaleString('id-ID', { month: 'long' });
};

const formatCurrency = (amount: number) => {
  return `Rp ${amount.toLocaleString('id-ID')}`;
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

  // Calculate monthly payment data
  const monthlyPaymentData = useMemo(() => {
    const startOfCurrentMonth = new Date(selectedYear, selectedMonth - 1, 1);
    
    // Kas Bulanan (Wajib)
    const priorWajibIn = payments?.filter(p => {
      const paymentDate = new Date(p.paid_at);
      return paymentDate < startOfCurrentMonth;
    }).reduce((sum, p) => sum + (p.amount || 0), 0) || 0;
    
    const priorWajibOut = expenses?.filter(e => {
      const expenseDate = new Date(e.date);
      return expenseDate < startOfCurrentMonth && e.category === 'Operasional';
    }).reduce((sum, e) => sum + (e.amount || 0), 0) || 0;
    
    const currentMonthWajibIn = payments?.filter(p => {
      const paymentDate = new Date(p.paid_at);
      return paymentDate.getMonth() === selectedMonth - 1 && paymentDate.getFullYear() === selectedYear;
    }).reduce((sum, p) => sum + (p.amount || 0), 0) || 0;
    
    const currentMonthWajibOut = expenses?.filter(e => {
      const expenseDate = new Date(e.date);
      return expenseDate.getMonth() === selectedMonth - 1 && expenseDate.getFullYear() === selectedYear && e.category === 'Operasional';
    }).reduce((sum, e) => sum + (e.amount || 0), 0) || 0;
    
    // Kas Acara (Sukarela)
    const totalSukarelaIn = residents.reduce((sum, r) => sum + (r.eventDuesAmount || 0), 0);
    const totalSukarelaOut = expenses?.filter(e => e.category === 'Acara').reduce((sum, e) => sum + (e.amount || 0), 0) || 0;
    
    return {
      wajibSaldoAkhir: (priorWajibIn - priorWajibOut) + currentMonthWajibIn - currentMonthWajibOut,
      wajibTotalMasukTahun: payments?.filter(p => p.year === selectedYear).reduce((sum, p) => sum + (p.amount || 0), 0) || 0,
      sukarelaTotalMasuk: totalSukarelaIn,
      sukarelaTotalKeluar: totalSukarelaOut,
      sukarelaSaldoTersedia: totalSukarelaIn - totalSukarelaOut,
    };
  }, [payments, expenses, residents, selectedMonth, selectedYear]);

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

  // Calculate current month data
  const currentMonthWajibIn = payments?.filter(p => {
    const paymentDate = new Date(p.paid_at);
    return paymentDate.getMonth() === selectedMonth - 1 && paymentDate.getFullYear() === selectedYear;
  }).reduce((sum, p) => sum + (p.amount || 0), 0) || 0;
  
  const currentMonthWajibOut = expenses?.filter(e => {
    const expenseDate = new Date(e.date);
    return expenseDate.getMonth() === selectedMonth - 1 && expenseDate.getFullYear() === selectedYear && e.category === 'Operasional';
  }).reduce((sum, e) => sum + (e.amount || 0), 0) || 0;
  
  const currentMonthSukarelaIn = residents.reduce((sum, r) => sum + (r.eventDuesAmount || 0), 0); // Total donasi (ini sudah benar)
  const currentMonthSukarelaOut = expenses?.filter(e => {
    const expenseDate = new Date(e.date);
    return expenseDate.getMonth() === selectedMonth - 1 && expenseDate.getFullYear() === selectedYear && e.category === 'Acara';
  }).reduce((sum, e) => sum + (e.amount || 0), 0) || 0;
  
  // Calculate yearly data
  const yearlyTotalIn = payments?.filter(p => p.year === selectedYear).reduce((sum, p) => sum + (p.amount || 0), 0) || 0;
  const yearlyTotalOut = expenses?.filter(e => {
    const expenseDate = new Date(e.date);
    return expenseDate.getFullYear() === selectedYear && e.category === 'Operasional';
  }).reduce((sum, e) => sum + (e.amount || 0), 0) || 0;
  
  // Calculate cumulative balance by month (correct logic)
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
      
      // Add current month to cumulative balance
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
  
  // Calculate total all kas
  const totalAllKas = (monthlyPaymentData.wajibSaldoAkhir + monthlyPaymentData.sukarelaSaldoTersedia);
  
  // Calculate grand total (all kas - all expenses)
  const totalSukarelaOut = expenses?.filter(e => e.category === 'Acara').reduce((sum, e) => sum + (e.amount || 0), 0) || 0;
  const grandTotal = totalAllKas - (yearlyTotalOut + totalSukarelaOut);

  // Chart data
  const occupancyChartData = useMemo(() => [
    { name: 'Menetap', value: stats.menetap, color: '#10b981' },
    { name: 'Penyewa', value: stats.penyewa, color: '#3b82f6' },
    { name: 'Kunjungan', value: stats.kunjungan, color: '#f59e0b' },
    { name: '2026', value: stats.ditempati2026, color: '#8b5cf6' }
  ].filter(item => item.value > 0), [stats]);

  // Loading state
  if (isLoading || expensesLoading || paymentsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="mx-auto w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4 animate-spin">
            <BarChart3 size={24} />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Memuat Data</h2>
          <p className="text-gray-600">Sedang mengambil data dashboard...</p>
        </div>
      </div>
    );
  }

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
                    Update terakhir: {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
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
                </select>
              </div>
            </div>
          </div>
        </header>

        {/* Top Metrics Section - Realtime Overview */}
        <section className="mb-6 md:mb-8">
          <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1 gap-4">
            {/* Total Warga Realtime */}
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-5 rounded-2xl shadow-lg">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <UsersIcon size={20} />
                </div>
                <span className="text-xs font-medium bg-white/20 px-2 py-1 rounded-full">Realtime</span>
              </div>
              <p className="text-2xl font-bold mb-1">{stats.total}</p>
              <p className="text-sm opacity-90">Total Warga Tercatat</p>
              <p className="text-xs opacity-75 mt-2">Kepala Keluarga</p>
            </div>

            {/* Grand Total Kas */}
            <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-5 rounded-2xl shadow-lg">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <Wallet size={20} />
                </div>
                <span className="text-xs font-medium bg-white/20 px-2 py-1 rounded-full">Grand Total</span>
              </div>
              <p className="text-3xl font-bold mb-1">{formatCurrency(grandTotal)}</p>
              <p className="text-sm opacity-90">Total All Kas</p>
              <p className="text-xs opacity-75 mt-2">Kas Bulanan + Kas Acara - Pengeluaran</p>
            </div>
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
              
              {/* Pie Chart Visualization */}
              <div className="mt-6">
                <div className="flex items-center justify-center space-x-4">
                  {occupancyChartData.map((item, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full" style={{backgroundColor: item.color}}></div>
                      <span className="text-sm text-gray-600">{item.name}: {item.value}</span>
                    </div>
                  ))}
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
              
              {/* Kas Bulanan Status */}
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
              
              {/* Kas Acara Statistics */}
              <div>
                <h4 className="text-sm font-bold text-gray-700 mb-3">Kas Acara (Sukarela)</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-purple-50 p-4 rounded-xl border border-purple-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-purple-700">Sudah Donasi</span>
                      <span className="text-2xl font-bold text-purple-600">{stats.donatedSukarela}</span>
                    </div>
                    <p className="text-xs text-purple-600 mb-2">{stats.sukarelaPercentage}% dari total warga</p>
                    <div className="w-full bg-purple-200 rounded-full h-3">
                      <div className="bg-purple-500 h-3 rounded-full transition-all duration-500" style={{width: `${stats.sukarelaPercentage}%`}} />
                    </div>
                    <p className="text-xs text-purple-600 mt-2">Total: {formatCurrency(stats.totalSukarela)}</p>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Belum Donasi</span>
                      <span className="text-2xl font-bold text-gray-600">{stats.notDonatedSukarela}</span>
                    </div>
                    <p className="text-xs text-gray-600 mb-2">{stats.notSukarelaPercentage}% dari total warga</p>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div className="bg-gray-500 h-3 rounded-full transition-all duration-500" style={{width: `${stats.notSukarelaPercentage}%`}} />
                    </div>
                    <p className="text-xs text-gray-600 mt-2">Rata-rata: {formatCurrency(stats.avgSukarela)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Monthly Statistics Table & Pengeluaran Kas Acara */}
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
                              {isActive && <span className="text-xs font-medium text-emerald-600 bg-emerald-100 px-1 py-0.5 rounded-full">Aktif</span>}
                            </div>
                          </td>
                          <td className="text-right py-1 px-1 text-xs">{data.income > 0 ? formatCurrency(data.income) : '-'}</td>
                          <td className="text-right py-1 px-1 text-xs">{data.expense > 0 ? formatCurrency(data.expense) : '-'}</td>
                          <td className="text-right py-1 px-1 font-medium text-xs">{formatCurrency(data.cumulativeBalance)}</td>
                          <td className="text-center py-1 px-1">
                            <span className={`px-1 py-0.5 rounded-full text-xs font-medium ${statusColor}`}>
                              {data.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                    
                    {/* Calculate totals */}
                    {(() => {
                      const totalIncome = yearlyTotalIn;
                      const totalExpense = yearlyTotalOut;
                      const finalBalance = totalIncome - totalExpense;
                      
                      return (
                        <tr className="font-bold bg-gray-50">
                          <td className="py-1 px-1 text-xs">Total</td>
                          <td className="text-right py-1 px-1 text-xs">{formatCurrency(totalIncome)}</td>
                          <td className="text-right py-1 px-1 text-xs">{formatCurrency(totalExpense)}</td>
                          <td className="text-right py-1 px-1 text-xs">{formatCurrency(finalBalance)}</td>
                          <td className="text-center py-1 px-1">
                            <span className="px-1 py-0.5 rounded-full text-xs font-medium text-emerald-600 bg-emerald-50">
                              Kas Sehat
                            </span>
                          </td>
                        </tr>
                      );
                    })()}
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
                          <p className="text-xs text-gray-500">{new Date(expense.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-red-600">{formatCurrency(expense.amount || 0)}</p>
                        <p className="text-xs text-red-500">pengeluaran</p>
                      </div>
                    </div>
                  ))}
              </div>
              
              {(!expenses?.filter(e => {
                const expenseDate = new Date(e.date);
                return expenseDate.getFullYear() === selectedYear && e.category === 'Acara';
              }).length) && (
                <div className="text-center py-8">
                  <TrendingDown className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">Belum ada pengeluaran kas acara</p>
                  <p className="text-sm text-gray-400">Pengeluaran acara akan muncul di sini</p>
                </div>
              )}
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

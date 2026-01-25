import React, { useState, useMemo, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  fetchExpenses, createExpense, updateExpense, deleteExpense, 
  fetchResidents, fetchAllPayments 
} from '../services/dataService';
import { useAuth } from '../contexts/AuthContext';
import { 
  Plus, Search, Trash2, Edit3, Wallet, TrendingDown, 
  Calendar, Loader2, PieChart, DollarSign, X, Save, 
  ArrowRightCircle, Filter, Receipt, ChevronDown, AlertCircle,
  TrendingUp, BarChart3, CreditCard
} from 'lucide-react';
import { Expense } from '../types';

export const Expenses = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  // State
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    description: '', 
    amount: '', 
    category: 'Operasional' as any,
    date: new Date().toISOString().split('T')[0], 
    receiptUrl: ''
  });

  // Data fetching
  const { 
    data: expenses = [], 
    isLoading: loadExp, 
    error 
  } = useQuery({ 
    queryKey: ['expenses'], 
    queryFn: fetchExpenses 
  });

  const { data: residents = [] } = useQuery({ 
    queryKey: ['residents'], 
    queryFn: fetchResidents 
  });

  const { data: payments = [] } = useQuery({ 
    queryKey: ['payments'], 
    queryFn: fetchAllPayments 
  });

  // Set form data when editing
  useEffect(() => {
    if (selectedExpense) {
      setFormData({
        description: selectedExpense.description,
        amount: selectedExpense.amount.toString(),
        category: selectedExpense.category,
        date: selectedExpense.date,
        receiptUrl: selectedExpense.receiptUrl || ''
      });
    } else {
      setFormData({ 
        description: '', 
        amount: '', 
        category: 'Operasional', 
        date: new Date().toISOString().split('T')[0], 
        receiptUrl: '' 
      });
    }
  }, [selectedExpense]);

  // Mutations
  const mutation = useMutation({
    mutationFn: (data: any) => 
      selectedExpense ? updateExpense({ ...data, id: selectedExpense.id }) : createExpense(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      setIsModalOpen(false);
      setSelectedExpense(null);
    },
    onError: (err: any) => {
      alert("Gagal menyimpan data: " + (err.message || 'Unknown error'));
    }
  });

  const deleteMutation = useMutation({
    mutationFn: deleteExpense,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      setShowDeleteConfirm(null);
    },
    onError: (err: any) => {
      alert("Gagal menghapus data: " + (err.message || 'Unknown error'));
    }
  });

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.description.trim()) {
      alert("Deskripsi belanja harus diisi!");
      return;
    }
    if (!formData.amount || Number(formData.amount) <= 0) {
      alert("Nominal harus lebih dari 0!");
      return;
    }
    
    mutation.mutate({ 
      ...formData, 
      amount: Number(formData.amount),
      date: formData.date || new Date().toISOString().split('T')[0]
    });
  };

  // Calculate statistics
  const stats = useMemo(() => {
    const incomeKas = payments.length * 10000;
    const spendKas = expenses.filter(e => e.category !== 'Acara').reduce((s, e) => s + e.amount, 0);
    const incomeAcara = residents.reduce((s, r) => s + (r.eventDuesAmount || 0), 0);
    const spendAcara = expenses.filter(e => e.category === 'Acara').reduce((s, e) => s + e.amount, 0);
    
    const totalIncome = incomeKas + incomeAcara;
    const totalSpend = spendKas + spendAcara;
    const kasRemaining = incomeKas - spendKas;
    const acaraRemaining = incomeAcara - spendAcara;
    const totalRemaining = kasRemaining + acaraRemaining;

    // Monthly breakdown
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();
    
    const monthlySpend = expenses
      .filter(e => {
        const date = new Date(e.date);
        return date.getMonth() + 1 === currentMonth && date.getFullYear() === currentYear;
      })
      .reduce((sum, e) => sum + e.amount, 0);

    const topCategory = expenses.reduce((acc: any, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
      return acc;
    }, {});

    const highestCategory = Object.entries(topCategory)
      .sort(([,a], [,b]) => (b as number) - (a as number))[0];

    return {
      kasRemaining,
      acaraRemaining,
      totalRemaining,
      totalSpend,
      monthlySpend,
      highestCategory: highestCategory ? {
        name: highestCategory[0],
        amount: highestCategory[1] as number
      } : null
    };
  }, [expenses, residents, payments]);

  // Filter expenses
  const filteredExpenses = useMemo(() => {
    return expenses.filter(e => {
      const matchesSearch = e.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           e.category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || e.category === categoryFilter;
      return matchesSearch && matchesCategory;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [expenses, searchTerm, categoryFilter]);

  // Get category color
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Operasional': return { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' };
      case 'Acara': return { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' };
      case 'Lainnya': return { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' };
      default: return { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200' };
    }
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return `Rp ${amount.toLocaleString('id-ID')}`;
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  // Loading state
  if (loadExp) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="animate-spin mx-auto text-emerald-600 mb-4" size={48} />
          <h2 className="text-xl font-bold text-emerald-700">Memuat Data Pengeluaran</h2>
          <p className="text-gray-500 mt-2">Mohon tunggu sebentar...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md">
          <AlertCircle className="text-rose-500 mx-auto mb-4" size={48} />
          <h2 className="text-xl font-bold text-gray-800 mb-2">Terjadi Kesalahan</h2>
          <p className="text-gray-600 mb-4">
            Gagal memuat data pengeluaran. Silakan coba lagi.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg font-medium"
          >
            Muat Ulang
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content Container */}
      <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 md:py-6">
        
        {/* Header Section */}
        <header className="mb-6 md:mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 md:gap-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                Manajemen Pengeluaran
              </h1>
              <p className="text-gray-600 mt-1">
                Monitor dan kelola pengeluaran Cluster Beryl
              </p>
            </div>

            {/* Add Expense Button - Only for authenticated users */}
            {user && (
              <button 
                onClick={() => { 
                  setSelectedExpense(null); 
                  setIsModalOpen(true); 
                }} 
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-3.5 rounded-xl font-medium shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
              >
                <Plus size={20} />
                <span>Catat Pengeluaran</span>
              </button>
            )}
          </div>
        </header>

        {/* Statistics Section */}
        <section className="mb-6 md:mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            {/* Total Saldo Card */}
            <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white p-5 md:p-6 rounded-2xl shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm font-medium opacity-90">Total Saldo</p>
                  <p className="text-2xl md:text-3xl font-bold mt-1">
                    {formatCurrency(stats.totalRemaining)}
                  </p>
                </div>
                <Wallet size={28} className="opacity-80" />
              </div>
              <div className="text-xs opacity-80">
                Saldo tersedia untuk pengeluaran
              </div>
            </div>

            {/* Kas Wajib Card */}
            <div className="bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-emerald-100 text-emerald-600">
                  <CreditCard size={20} />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Kas Wajib</p>
                  <p className="text-lg font-bold text-emerald-700">
                    {formatCurrency(stats.kasRemaining)}
                  </p>
                </div>
              </div>
              <div className="text-xs text-gray-500">
                Untuk pengeluaran operasional
              </div>
            </div>

            {/* Kas Acara Card */}
            <div className="bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                  <PieChart size={20} />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Kas Acara</p>
                  <p className="text-lg font-bold text-blue-700">
                    {formatCurrency(stats.acaraRemaining)}
                  </p>
                </div>
              </div>
              <div className="text-xs text-gray-500">
                Untuk pengeluaran acara
              </div>
            </div>

            {/* Total Pengeluaran Card */}
            <div className="bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-rose-100 text-rose-600">
                  <TrendingDown size={20} />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Keluar</p>
                  <p className="text-lg font-bold text-rose-700">
                    {formatCurrency(stats.totalSpend)}
                  </p>
                </div>
              </div>
              <div className="text-xs text-gray-500">
                {formatCurrency(stats.monthlySpend)} bulan ini
              </div>
            </div>
          </div>
        </section>

        {/* Search and Filters Section */}
        <section className="mb-6">
          <div className="flex flex-col md:flex-row gap-3 md:gap-4">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Cari deskripsi atau kategori..."
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  aria-label="Clear search"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Desktop Filter */}
            <div className="hidden md:flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Filter size={20} className="text-gray-400" />
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-white focus:border-emerald-500 outline-none min-w-[140px]"
                >
                  <option value="all">Semua Kategori</option>
                  <option value="Operasional">Operasional</option>
                  <option value="Acara">Acara</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>
            </div>

            {/* Mobile Filter Button */}
            <div className="md:hidden">
              <button
                onClick={() => setShowMobileFilters(!showMobileFilters)}
                className="w-full flex items-center justify-between gap-2 py-3 px-4 bg-white border border-gray-200 rounded-xl"
              >
                <div className="flex items-center gap-2">
                  <Filter size={20} />
                  <span className="font-medium">Filter</span>
                </div>
                <ChevronDown className={`transition-transform ${showMobileFilters ? 'rotate-180' : ''}`} size={16} />
              </button>
            </div>
          </div>

          {/* Mobile Filters Panel */}
          {showMobileFilters && (
            <div className="md:hidden mt-3 p-4 bg-white border border-gray-200 rounded-xl space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kategori
                </label>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-white focus:border-emerald-500 outline-none"
                >
                  <option value="all">Semua Kategori</option>
                  <option value="Operasional">Operasional</option>
                  <option value="Acara">Acara</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>
            </div>
          )}
        </section>

        {/* Expenses Table Section */}
        <section>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Table Header */}
            <div className="p-4 md:p-6 border-b border-gray-100">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold text-gray-800">Daftar Pengeluaran</h2>
                  <p className="text-gray-600 text-sm mt-1">
                    {filteredExpenses.length} dari {expenses.length} data ditampilkan
                  </p>
                </div>
                
                {filteredExpenses.length > 0 && (
                  <div className="text-sm text-gray-500">
                    Total: {formatCurrency(filteredExpenses.reduce((sum, e) => sum + e.amount, 0))}
                  </div>
                )}
              </div>
            </div>

            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full min-w-[700px]">
                <thead className="bg-gray-50">
                  <tr className="text-left text-sm font-semibold text-gray-700">
                    <th className="p-4">Tanggal</th>
                    <th className="p-4">Deskripsi</th>
                    <th className="p-4">Kategori</th>
                    <th className="p-4">Bukti</th>
                    <th className="p-4 text-right">Jumlah</th>
                    <th className="p-4 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredExpenses.length > 0 ? (
                    filteredExpenses.map((expense) => {
                      const categoryColor = getCategoryColor(expense.category);
                      return (
                        <tr 
                          key={expense.id} 
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <Calendar size={14} className="text-gray-400" />
                              <span className="text-sm text-gray-600 whitespace-nowrap">
                                {formatDate(expense.date)}
                              </span>
                            </div>
                          </td>
                          
                          <td className="p-4">
                            <div className="font-medium text-gray-800">
                              {expense.description}
                            </div>
                          </td>
                          
                          <td className="p-4">
                            <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium ${categoryColor.bg} ${categoryColor.text} ${categoryColor.border}`}>
                              {expense.category}
                            </span>
                          </td>
                          
                          <td className="p-4">
                            {expense.receiptUrl ? (
                              <a
                                href={expense.receiptUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 hover:underline"
                              >
                                <Receipt size={14} />
                                <span>Lihat</span>
                              </a>
                            ) : (
                              <span className="text-gray-400 text-sm">-</span>
                            )}
                          </td>
                          
                          <td className="p-4 text-right">
                            <div className="font-bold text-rose-600">
                              {formatCurrency(expense.amount)}
                            </div>
                          </td>
                          
                          <td className="p-4">
                            {user ? (
                              <div className="flex justify-center gap-2">
                                <button
                                  onClick={() => {
                                    setSelectedExpense(expense);
                                    setIsModalOpen(true);
                                  }}
                                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                  title="Edit pengeluaran"
                                >
                                  <Edit3 size={18} />
                                </button>
                                <button
                                  onClick={() => setShowDeleteConfirm(expense.id)}
                                  className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                  title="Hapus pengeluaran"
                                >
                                  <Trash2 size={18} />
                                </button>
                              </div>
                            ) : (
                              <span className="text-gray-400 text-sm">Lihat saja</span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={6} className="p-8 text-center">
                        <div className="inline-flex flex-col items-center">
                          <Search size={48} className="text-gray-300 mb-4" />
                          <h3 className="text-lg font-semibold text-gray-700 mb-2">
                            Tidak ada data ditemukan
                          </h3>
                          <p className="text-gray-500">
                            {searchTerm 
                              ? `Tidak ada hasil untuk "${searchTerm}"`
                              : 'Belum ada data pengeluaran'}
                          </p>
                          {!searchTerm && user && (
                            <button
                              onClick={() => setIsModalOpen(true)}
                              className="mt-4 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-lg"
                            >
                              Tambah Pengeluaran Pertama
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile Card List */}
            <div className="md:hidden divide-y divide-gray-100">
              {filteredExpenses.length > 0 ? (
                filteredExpenses.map((expense) => {
                  const categoryColor = getCategoryColor(expense.category);
                  return (
                    <div key={expense.id} className="p-4 hover:bg-gray-50">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Calendar size={14} className="text-gray-400" />
                            <span className="text-sm text-gray-600">
                              {formatDate(expense.date)}
                            </span>
                          </div>
                          <h3 className="font-medium text-gray-800">
                            {expense.description}
                          </h3>
                        </div>
                        
                        <div className="text-right">
                          <div className="font-bold text-rose-600">
                            {formatCurrency(expense.amount)}
                          </div>
                          <div className="mt-1">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${categoryColor.bg} ${categoryColor.text}`}>
                              {expense.category}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                        <div>
                          {expense.receiptUrl ? (
                            <a
                              href={expense.receiptUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
                            >
                              <Receipt size={14} />
                              <span>Lihat Bukti</span>
                            </a>
                          ) : (
                            <span className="text-gray-400 text-sm">Tidak ada bukti</span>
                          )}
                        </div>
                        
                        {user && (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                setSelectedExpense(expense);
                                setIsModalOpen(true);
                              }}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                              title="Edit"
                            >
                              <Edit3 size={18} />
                            </button>
                            <button
                              onClick={() => setShowDeleteConfirm(expense.id)}
                              className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg"
                              title="Hapus"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-8 text-center">
                  <Search size={48} className="mx-auto text-gray-300 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">
                    Tidak ada data ditemukan
                  </h3>
                  <p className="text-gray-500">
                    {searchTerm 
                      ? `Tidak ada hasil untuk "${searchTerm}"`
                      : 'Belum ada data pengeluaran'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-8 pt-6 border-t border-gray-200">
          <div className="text-center">
            <p className="text-gray-600 text-sm">
              <span className="font-semibold">Sistem Keuangan Beryl</span> • v2.0
            </p>
            <p className="text-gray-400 text-xs mt-1">
              Total {expenses.length} pengeluaran tercatat
            </p>
          </div>
        </footer>
      </div>

      {/* Add/Edit Expense Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            {/* Modal Header */}
            <div className={`p-6 text-white ${selectedExpense ? 'bg-blue-600' : 'bg-emerald-600'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold">
                    {selectedExpense ? 'Edit Pengeluaran' : 'Catat Pengeluaran'}
                  </h2>
                  <p className="text-sm opacity-90 mt-1">
                    {selectedExpense ? 'Ubah data pengeluaran' : 'Tambah data pengeluaran baru'}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setIsModalOpen(false);
                    setSelectedExpense(null);
                  }}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-6">
              <div className="space-y-4">
                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Deskripsi Pengeluaran *
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none transition-all"
                    placeholder="Contoh: Beli ATK, Bayar listrik, dll"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                  />
                </div>

                {/* Amount and Category */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Jumlah (Rp) *
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none transition-all"
                      placeholder="0"
                      value={formData.amount}
                      onChange={(e) => setFormData({...formData, amount: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Kategori *
                    </label>
                    <select
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none transition-all"
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                    >
                      <option value="Operasional">Operasional</option>
                      <option value="Acara">Acara</option>
                      <option value="Lainnya">Lainnya</option>
                    </select>
                  </div>
                </div>

                {/* Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tanggal *
                  </label>
                  <input
                    type="date"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none transition-all"
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                  />
                </div>

                {/* Receipt URL */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Link Bukti (Opsional)
                  </label>
                  <input
                    type="url"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none transition-all"
                    placeholder="https://drive.google.com/..."
                    value={formData.receiptUrl}
                    onChange={(e) => setFormData({...formData, receiptUrl: e.target.value})}
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={mutation.isPending}
                  className={`w-full py-3.5 rounded-lg font-medium text-white flex items-center justify-center gap-2 transition-all ${
                    selectedExpense 
                      ? 'bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400' 
                      : 'bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400'
                  }`}
                >
                  {mutation.isPending ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <>
                      <Save size={18} />
                      <span>{selectedExpense ? 'Update Pengeluaran' : 'Simpan Pengeluaran'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 size={24} className="text-rose-600" />
              </div>
              
              <h3 className="text-lg font-bold text-gray-800 mb-2">
                Hapus Pengeluaran?
              </h3>
              
              <p className="text-gray-600 mb-6">
                Apakah Anda yakin ingin menghapus data pengeluaran ini? Tindakan ini tidak dapat dibatalkan.
              </p>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  onClick={() => {
                    deleteMutation.mutate(showDeleteConfirm);
                  }}
                  disabled={deleteMutation.isPending}
                  className="flex-1 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  {deleteMutation.isPending ? (
                    <Loader2 size={18} className="animate-spin mx-auto" />
                  ) : (
                    'Hapus'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
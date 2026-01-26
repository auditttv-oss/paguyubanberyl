import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchResidentsWithStatus, updateResident, createResident, updateResidentPayment, deleteResident, fetchAllPayments } from '../services/dataService';
import { 
  Users, 
  Search, 
  Filter, 
  ChevronDown, 
  UserPlus, 
  Phone, 
  MessageCircle,
  Edit,
  Trash2,
  Loader2,
  Home,
  DollarSign,
  TrendingUp,
  Activity,
  Target,
  Clock,
  Calendar,
  PieChart,
  ArrowUpDown,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { ResidentModal } from '../components/ResidentModal';
import { Resident } from '../types';
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

export const Residents = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedResident, setSelectedResident] = useState<Resident | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [showNotes, setShowNotes] = useState<{ [key: string]: boolean }>({});
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedResidentForPayment, setSelectedResidentForPayment] = useState<Resident | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  
  // Data fetching dengan periode dinamis
  const { 
    data: residents = [], 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['residents', selectedMonth, selectedYear],
    queryFn: () => fetchResidentsWithStatus(selectedMonth, selectedYear),
  });

  // Fetch all payments data
  const { 
    data: payments = [], 
  } = useQuery({
    queryKey: ['allPayments'],
    queryFn: fetchAllPayments,
  });

  // Mutations
  const paymentMutation = useMutation({
    mutationFn: ({ id, isPaid, month, year }: { id: string; isPaid: boolean; month: number; year: number }) =>
      updateResidentPayment(id, isPaid, month, year),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['residents'] });
      queryClient.invalidateQueries({ queryKey: ['allPayments'] });
      queryClient.invalidateQueries({ queryKey: ['payments'] });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: deleteResident,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['residents'] });
      queryClient.invalidateQueries({ queryKey: ['allPayments'] });
      queryClient.invalidateQueries({ queryKey: ['payments'] });
    }
  });

  const createMutation = useMutation({
    mutationFn: createResident,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['residents'] });
      queryClient.invalidateQueries({ queryKey: ['allPayments'] });
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      setIsModalOpen(false);
      setSelectedResident(null);
    }
  });

  const editMutation = useMutation({
    mutationFn: updateResident,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['residents'] });
      queryClient.invalidateQueries({ queryKey: ['allPayments'] });
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      setIsModalOpen(false);
      setSelectedResident(null);
    }
  });

  // Statistics
  const stats = useMemo(() => {
    const total = residents.length;
    // Perbaikan: Occupied adalah Menetap + Penyewa + Ditempati 2026 (bukan filter NOT IN)
    const occupied = residents.filter(r => 
      r.occupancyStatus === 'Menetap' || 
      r.occupancyStatus === 'Penyewa' || 
      r.occupancyStatus === 'Ditempati 2026'
    ).length;
    const paidKas = residents.filter(r => r.isPaidCurrentMonth).length;
    const paidSukarela = residents.filter(r => (r.eventDuesAmount || 0) > 0).length;
    const totalKas = paidKas * 10000;
    const totalSukarela = residents.reduce((sum, r) => sum + (r.eventDuesAmount || 0), 0);
    const avgSukarela = paidSukarela > 0 ? Math.round(totalSukarela / paidSukarela) : 0;

    return {
      total,
      occupied,
      occupancyRate: total > 0 ? Math.round((occupied / total) * 100) : 0,
      paidKas,
      paidSukarela,
      totalKas,
      totalSukarela,
      avgSukarela,
      paymentRate: total > 0 ? Math.round((paidKas / total) * 100) : 0,
      sukarelaRate: total > 0 ? Math.round((paidSukarela / total) * 100) : 0,
    };
  }, [residents]);

  // Status data for pie chart
  const statusData = useMemo(() => [
    { name: 'Menetap', value: residents.filter(r => r.occupancyStatus === 'Menetap').length, percentage: 0 },
    { name: 'Penyewa', value: residents.filter(r => r.occupancyStatus === 'Penyewa').length, percentage: 0 },
    { name: 'Kunjungan', value: residents.filter(r => r.occupancyStatus === 'Kunjungan').length, percentage: 0 },
    { name: 'Ditempati 2026', value: residents.filter(r => r.occupancyStatus === 'Ditempati 2026').length, percentage: 0 },
  ].map(item => ({
    ...item,
    percentage: stats.total > 0 ? Math.round((item.value / stats.total) * 100) : 0
  })), [residents, stats.total]);

  // Top 10 earliest payers
  const topEarlyPayers = useMemo(() => {
    return residents
      .filter(r => r.isPaidCurrentMonth && r.updatedAt)
      .sort((a, b) => a.updatedAt - b.updatedAt)
      .slice(0, 10)
      .map(r => ({
        name: r.fullName,
        block: r.blockNumber,
        paymentDate: new Date(r.updatedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
      }));
  }, [residents]);

  // Top 10 biggest sukarela contributors
  const topSukarelaContributors = useMemo(() => {
    return residents
      .filter(r => (r.eventDuesAmount || 0) > 0)
      .sort((a, b) => (b.eventDuesAmount || 0) - (a.eventDuesAmount || 0))
      .slice(0, 10)
      .map(r => ({
        name: r.fullName,
        block: r.blockNumber,
        amount: r.eventDuesAmount || 0
      }));
  }, [residents]);

  // Top 10 most consistent payers (kas + sukarela)
  const mostConsistentPayers = useMemo(() => {
    return residents
      .filter(r => r.isPaidCurrentMonth && (r.eventDuesAmount || 0) > 0)
      .map(r => ({
        name: r.fullName,
        block: r.blockNumber,
        total: 10000 + (r.eventDuesAmount || 0)
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 10);
  }, [residents]);

  // Calculate total paid months for each resident
  const residentPaymentStats = useMemo(() => {
    return residents.map(resident => {
      // Count how many months this resident has paid
      const paidMonths = payments?.filter(p => p.resident_id === resident.id).length || 0;
      return {
        ...resident,
        totalPaidMonths: paidMonths
      };
    });
  }, [residents, payments]);

  // Filter and sort residents
  const processedResidents = useMemo(() => {
    let filtered = residents;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(r => 
        r.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.blockNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.notes?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(r => r.occupancyStatus === filterStatus);
    }

    // Apply sorting
    filtered = [...filtered].sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'name':
          comparison = a.fullName.localeCompare(b.fullName);
          break;
        case 'block':
          comparison = a.blockNumber.localeCompare(b.blockNumber);
          break;
        case 'status':
          comparison = a.occupancyStatus.localeCompare(b.occupancyStatus);
          break;
        case 'payment':
          comparison = (a.isPaidCurrentMonth ? 1 : 0) - (b.isPaidCurrentMonth ? 1 : 0);
          break;
        case 'sukarela':
          comparison = (a.eventDuesAmount || 0) - (b.eventDuesAmount || 0);
          break;
        default:
          comparison = 0;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [residents, searchTerm, filterStatus, sortBy, sortOrder]);

  const getWaLink = (phone: string) => {
    const clean = phone.replace(/\D/g, '');
    if (clean.startsWith('0')) {
      return `https://wa.me/62${clean.substring(1)}`;
    }
    return `https://wa.me/${clean}`;
  };

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const handlePaymentClick = (resident: Resident) => {
    if (!user) return; // Jangan izinkan aksi untuk mode tamu
    setSelectedResidentForPayment(resident);
    setShowPaymentModal(true);
  };

  const handlePaymentConfirm = (isPaid: boolean) => {
    if (selectedResidentForPayment) {
      paymentMutation.mutate({
        id: selectedResidentForPayment.id,
        isPaid,
        month: selectedMonth,
        year: selectedYear
      });
      setShowPaymentModal(false);
      setSelectedResidentForPayment(null);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="animate-spin mx-auto text-emerald-600 mb-4" size={40} />
          <p className="text-gray-600">Memuat data warga...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">Data Warga</h1>
        <p className="text-gray-600">Total {stats.total} kepala keluarga</p>
      </div>

      {/* Enhanced Stats Cards with Infographics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 mb-6">
        {/* Combined Stats Card */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-2xl shadow-lg text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-white/20 rounded-xl">
              <DollarSign className="w-6 h-6" />
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold">{stats.total}</p>
              <p className="text-blue-100 text-sm">Total KK</p>
            </div>
          </div>
          <div className="bg-white/10 rounded-lg p-3">
            <div className="flex justify-between text-sm mb-2">
              <span>Occupancy Rate</span>
              <span className="font-bold">{stats.occupancyRate}%</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-2 mt-2">
              <div 
                className="bg-white rounded-full h-2 transition-all duration-500"
                style={{ width: `${stats.occupancyRate}%` }}
              />
            </div>
          </div>
          <div className="bg-white/10 rounded-lg p-3">
            <div className="flex justify-between text-sm mb-2">
              <span>Total Dana</span>
              <span className="font-bold">Rp {(stats.totalKas + stats.totalSukarela).toLocaleString('id-ID')}</span>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-2">
              <div>
                <p className="text-xs text-blue-100 mb-1">Iuran Wajib</p>
                <p className="font-bold text-sm">Rp {stats.totalKas.toLocaleString('id-ID')}</p>
              </div>
              <div>
                <p className="text-xs text-blue-100 mb-1">Sukarela</p>
                <p className="font-bold text-sm">Rp {stats.totalSukarela.toLocaleString('id-ID')}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Rate Card */}
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-2xl shadow-lg text-white mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-white/20 rounded-xl">
              <Target className="w-6 h-6" />
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold">{stats.paymentRate}%</p>
              <p className="text-purple-100 text-sm">Tingkat Bayar Kas</p>
            </div>
          </div>
          <div className="space-y-3">
            <div className="bg-white/10 rounded-lg p-3">
              <div className="flex justify-between text-sm mb-1">
                <span>Kas: {stats.paidKas}/{stats.total}</span>
                <span className="font-bold">{stats.paymentRate}%</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-2">
                <div 
                  className="bg-white rounded-full h-2 transition-all duration-500"
                  style={{ width: `${stats.paymentRate}%` }}
                />
              </div>
            </div>
            <div className="bg-white/10 rounded-lg p-3">
              <div className="flex justify-between text-sm mb-1">
                <span>Sukarela: {stats.paidSukarela}/{stats.total}</span>
                <span className="font-bold">{stats.sukarelaRate}%</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-2">
                <div 
                  className="bg-blue-300 rounded-full h-2 transition-all duration-500"
                  style={{ width: `${stats.sukarelaRate}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Top Contributors Card */}
        <div className="bg-gradient-to-br from-amber-500 to-amber-600 p-6 rounded-2xl shadow-lg text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-white/20 rounded-xl">
              <Activity className="w-6 h-6" />
            </div>
            <div className="text-right">
              <p className="text-lg font-bold">Top Contributors</p>
              <p className="text-amber-100 text-sm">Donatur & Pembayar Terbanyak</p>
            </div>
          </div>
          <div className="space-y-3">
            {/* Top 3 Donatur Acara */}
            <div className="bg-white/10 rounded-lg p-3">
              <p className="text-xs font-bold mb-2 text-amber-100">🏆 Top 3 Donatur Acara</p>
              {residents
                .filter(r => (r.eventDuesAmount || 0) > 0)
                .sort((a, b) => (b.eventDuesAmount || 0) - (a.eventDuesAmount || 0))
                .slice(0, 3)
                .map((resident, index) => (
                  <div key={resident.id} className="flex items-center justify-between py-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold">{index + 1}.</span>
                      <span className="text-xs">{resident.fullName}</span>
                    </div>
                    <span className="text-xs font-bold">Rp {(resident.eventDuesAmount || 0).toLocaleString('id-ID')}</span>
                  </div>
                ))}
            </div>
            
            {/* Top 3 Pembayar Kas Terbanyak */}
            <div className="bg-white/10 rounded-lg p-3">
              <p className="text-xs font-bold mb-2 text-amber-100">💰 Top 3 Pembayar Kas Terbanyak</p>
              {residentPaymentStats
                .filter(r => r.totalPaidMonths > 0)
                .sort((a, b) => (b.totalPaidMonths || 0) - (a.totalPaidMonths || 0))
                .slice(0, 3)
                .map((resident, index) => (
                  <div key={resident.id} className="flex items-center justify-between py-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold">{index + 1}.</span>
                      <span className="text-xs">{resident.fullName}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold">
                        {resident.totalPaidMonths || 0} bulan
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* Quick Search Card */}
        <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 p-6 rounded-2xl shadow-lg text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-white/20 rounded-xl">
              <Search className="w-6 h-6" />
            </div>
            <div className="text-right">
              <p className="text-lg font-bold">Quick Search</p>
              <p className="text-indigo-100 text-sm">Pencarian & Edit Warga</p>
            </div>
          </div>
          <div className="space-y-3">
            <div className="bg-white/10 rounded-lg p-3">
              <input
                type="text"
                placeholder="Cari nama, blok, atau catatan..."
                className="w-full bg-white/20 border border-white/30 rounded-lg px-3 py-2 text-sm text-white placeholder-white/70 focus:outline-none focus:border-white/50 focus:bg-white/30"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="bg-white/10 rounded-lg p-3 max-h-64 overflow-y-auto">
              <p className="text-xs font-bold mb-2 text-indigo-100">📋 Data Warga (Edit)</p>
              {processedResidents.slice(0, 5).map((resident) => (
                <div key={resident.id} className="bg-white/20 rounded-lg p-2 mb-2 last:mb-0">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="font-semibold">Nama:</span>
                      <span className="ml-1">{resident.fullName}</span>
                    </div>
                    <div>
                      <span className="font-semibold">Blok:</span>
                      <span className="ml-1">{resident.blockNumber}</span>
                    </div>
                    <div>
                      <span className="font-semibold">Status:</span>
                      <span className="ml-1">{resident.occupancyStatus}</span>
                    </div>
                    <div>
                      <span className="font-semibold">Kontak:</span>
                      <span className="ml-1">{resident.whatsapp || '-'}</span>
                    </div>
                    <div>
                      <span className="font-semibold">Kas:</span>
                      <span className="ml-1">{resident.isPaidCurrentMonth ? '✅' : '❌'}</span>
                    </div>
                    <div>
                      <span className="font-semibold">Sukarela:</span>
                      <span className="ml-1">Rp {(resident.eventDuesAmount || 0).toLocaleString('id-ID')}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="font-semibold">Catatan:</span>
                      <span className="ml-1">{resident.notes || '-'}</span>
                    </div>
                    <div className="col-span-2 flex gap-1 mt-1">
                      <button
                        onClick={() => {
                          setSelectedResident(resident);
                          setIsModalOpen(true);
                        }}
                        className="bg-white/30 hover:bg-white/40 rounded px-2 py-1 text-xs transition-colors"
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => handlePaymentClick(resident)}
                        className="bg-white/30 hover:bg-white/40 rounded px-2 py-1 text-xs transition-colors"
                      >
                        💰 Kas
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm(`Hapus ${resident.fullName}?`)) {
                            deleteMutation.mutate(resident.id);
                          }
                        }}
                        className="bg-red-500/30 hover:bg-red-500/40 rounded px-2 py-1 text-xs transition-colors"
                      >
                        🗑️ Hapus
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {processedResidents.length === 0 && (
                <p className="text-center text-white/70 text-xs py-4">
                  Tidak ada data warga yang ditemukan
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Period Selector - Below Stats */}
      <div className="bg-white rounded-xl shadow-sm border p-4 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Calendar className="text-emerald-600" size={20} />
            <div>
              <h3 className="font-semibold text-gray-800">
                Periode: {new Date(selectedYear, selectedMonth - 1).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
              </h3>
              <p className="text-sm text-gray-600">Status pembayaran yang ditampilkan untuk periode ini. Klik "Lunas/Belum" untuk mengubah status pembayaran periode lain.</p>
            </div>
          </div>
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
        </div>
      </div>

      {/* Search and Add Button - Moved Below Stats */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Cari nama, blok, atau catatan..."
            className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg font-medium flex items-center justify-center gap-2"
        >
          <UserPlus size={20} />
          {user ? 'Tambah Warga' : 'Lapor Diri'}
        </button>
      </div>

      {/* Filters for Mobile */}
      <div className="md:hidden mb-4">
        <button
          onClick={() => setShowMobileFilters(!showMobileFilters)}
          className="w-full flex items-center justify-center gap-2 py-3 bg-white border rounded-lg"
        >
          <Filter size={20} />
          <span>Filter & Urutkan</span>
          <ChevronDown className={`transition-transform ${showMobileFilters ? 'rotate-180' : ''}`} size={16} />
        </button>
        
        {showMobileFilters && (
          <div className="mt-3 p-4 bg-white border rounded-lg space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Status Huni</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full border rounded-lg p-2"
              >
                <option value="all">Semua</option>
                <option value="Menetap">Menetap</option>
                <option value="Penyewa">Penyewa</option>
                <option value="Kunjungan">Kunjungan</option>
                <option value="Ditempati 2026">Ditempati 2026</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Urutkan</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full border rounded-lg p-2"
              >
                <option value="name">Nama</option>
                <option value="block">Blok</option>
                <option value="status">Status</option>
                <option value="payment">Status Pembayaran</option>
                <option value="sukarela">Iuran Sukarela</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Desktop Filters */}
      <div className="hidden md:flex items-center gap-4 mb-4">
        <div>
          <label className="text-sm font-medium mr-2">Status:</label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border rounded-lg p-2"
          >
            <option value="all">Semua</option>
            <option value="Menetap">Menetap</option>
            <option value="Penyewa">Penyewa</option>
            <option value="Kunjungan">Kunjungan</option>
            <option value="Ditempati 2026">Ditempati 2026</option>
          </select>
        </div>
        <div>
          <label className="text-sm font-medium mr-2">Urutkan:</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="border rounded-lg p-2"
          >
            <option value="name">Nama</option>
            <option value="block">Blok</option>
            <option value="status">Status</option>
            <option value="payment">Status Pembayaran</option>
            <option value="sukarela">Iuran Sukarela</option>
          </select>
        </div>
      </div>

      {/* Residents List/Table */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead className="bg-gray-50">
              <tr>
                <th 
                  onClick={() => handleSort('name')}
                  className="p-4 text-left text-sm font-medium text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    Nama
                    {sortBy === 'name' ? (
                      sortOrder === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />
                    ) : (
                      <ArrowUpDown size={14} className="text-gray-400" />
                    )}
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('block')}
                  className="p-4 text-left text-sm font-medium text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    Blok
                    {sortBy === 'block' ? (
                      sortOrder === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />
                    ) : (
                      <ArrowUpDown size={14} className="text-gray-400" />
                    )}
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('status')}
                  className="p-4 text-left text-sm font-medium text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    Status
                    {sortBy === 'status' ? (
                      sortOrder === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />
                    ) : (
                      <ArrowUpDown size={14} className="text-gray-400" />
                    )}
                  </div>
                </th>
                <th className="p-4 text-left text-sm font-medium text-gray-700">Kontak</th>
                <th 
                  onClick={() => handleSort('payment')}
                  className="p-4 text-left text-sm font-medium text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    Kas 10rb
                    {sortBy === 'payment' ? (
                      sortOrder === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />
                    ) : (
                      <ArrowUpDown size={14} className="text-gray-400" />
                    )}
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('sukarela')}
                  className="p-4 text-left text-sm font-medium text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    Sukarela
                    {sortBy === 'sukarela' ? (
                      sortOrder === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />
                    ) : (
                      <ArrowUpDown size={14} className="text-gray-400" />
                    )}
                  </div>
                </th>
                <th className="p-4 text-left text-sm font-medium text-gray-700">Catatan</th>
                <th className="p-4 text-left text-sm font-medium text-gray-700">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {processedResidents.map((resident) => (
                <tr key={resident.id} className="hover:bg-gray-50">
                  <td className="p-4">
                    <p className="font-medium text-gray-800">{resident.fullName}</p>
                  </td>
                  <td className="p-4">
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm">
                      {resident.blockNumber}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      resident.occupancyStatus === 'Menetap' 
                        ? 'bg-emerald-100 text-emerald-800'
                        : resident.occupancyStatus === 'Penyewa'
                        ? 'bg-blue-100 text-blue-800'
                        : resident.occupancyStatus === 'Kunjungan'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-purple-100 text-purple-800'
                    }`}>
                      {resident.occupancyStatus}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      {user ? (
                        <>
                          <a
                            href={getWaLink(resident.whatsapp)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-green-600 hover:text-green-700"
                          >
                            <MessageCircle size={16} />
                          </a>
                          <span className="text-sm text-gray-600">{resident.whatsapp}</span>
                        </>
                      ) : (
                        <span className="text-sm text-gray-400">
                          <MessageCircle size={16} className="inline mr-1" />
                          Hidden (Guest Mode)
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-4">
                    {user ? (
                      <button
                        onClick={() => handlePaymentClick(resident)}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                          resident.isPaidCurrentMonth
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            : 'bg-red-100 text-red-800 hover:bg-red-200'
                        }`}
                      >
                        {resident.isPaidCurrentMonth ? 'Sudah' : 'Belum'}
                      </button>
                    ) : (
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        resident.isPaidCurrentMonth
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {resident.isPaidCurrentMonth ? 'Sudah' : 'Belum'}
                      </span>
                    )}
                  </td>
                  <td className="p-4">
                    <span className="text-sm font-medium text-blue-600">
                      Rp {(resident.eventDuesAmount || 0).toLocaleString('id-ID')}
                    </span>
                  </td>
                  <td className="p-4">
                    <button
                      onClick={() => setShowNotes(prev => ({ ...prev, [resident.id]: !prev[resident.id] }))}
                      className="text-gray-600 hover:text-gray-800"
                    >
                      {showNotes[resident.id] ? (
                        <div className="max-w-xs">
                          <p className="text-sm text-gray-600">{resident.notes || '-'}</p>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-500">
                          {resident.notes ? resident.notes.substring(0, 30) + '...' : '-'}
                        </span>
                      )}
                    </button>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      {user && (
                        <>
                          <button
                            onClick={() => {
                              setSelectedResident(resident);
                              setIsModalOpen(true);
                            }}
                            className="text-blue-600 hover:text-blue-700"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm(`Hapus ${resident.fullName}?`)) {
                                deleteMutation.mutate(resident.id);
                              }
                            }}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 size={16} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden">
          {processedResidents.map((resident) => (
            <div key={resident.id} className="p-4 border-b">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-medium text-gray-800">{resident.fullName}</p>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    resident.occupancyStatus === 'Menetap' 
                      ? 'bg-emerald-100 text-emerald-800'
                      : resident.occupancyStatus === 'Penyewa'
                      ? 'bg-blue-100 text-blue-800'
                      : resident.occupancyStatus === 'Kunjungan'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-purple-100 text-purple-800'
                  }`}>
                    {resident.occupancyStatus}
                  </span>
                </div>
                <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm">
                  {resident.blockNumber}
                </span>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  {user ? (
                    <>
                      <a
                        href={getWaLink(resident.whatsapp)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-green-600 hover:text-green-700"
                      >
                        <MessageCircle size={16} />
                      </a>
                      <span className="text-gray-600">{resident.whatsapp}</span>
                    </>
                  ) : (
                    <span className="text-gray-400">
                      <MessageCircle size={16} className="inline mr-1" />
                      Hidden (Guest Mode)
                    </span>
                  )}
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Kas:</span>
                  {user ? (
                    <button
                      onClick={() => handlePaymentClick(resident)}
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        resident.isPaidCurrentMonth
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {resident.isPaidCurrentMonth ? 'Sudah' : 'Belum'}
                    </button>
                  ) : (
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      resident.isPaidCurrentMonth
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {resident.isPaidCurrentMonth ? 'Sudah' : 'Belum'}
                    </span>
                  )}
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Sukarela:</span>
                  <span className="font-medium text-blue-600">
                    Rp {(resident.eventDuesAmount || 0).toLocaleString('id-ID')}
                  </span>
                </div>
                
                {resident.notes && (
                  <div>
                    <span className="text-gray-600">Catatan:</span>
                    <p className="text-xs text-gray-500 mt-1">{resident.notes}</p>
                  </div>
                )}
              </div>
              
              {user && (
                <div className="flex justify-end gap-2 mt-3">
                  <button
                    onClick={() => {
                      setSelectedResident(resident);
                      setIsModalOpen(true);
                    }}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm(`Hapus ${resident.fullName}?`)) {
                        deleteMutation.mutate(resident.id);
                      }
                    }}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-6 text-center text-gray-500 text-sm">
        <p>Total {processedResidents.length} warga dari {stats.total} total</p>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <ResidentModal
          resident={selectedResident}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedResident(null);
          }}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['residents'] });
            setIsModalOpen(false);
            setSelectedResident(null);
          }}
        />
      )}

      {/* Payment Period Modal */}
      {showPaymentModal && selectedResidentForPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-lg font-bold text-gray-800 mb-4">
              Konfirmasi Pembayaran Iuran
            </h3>
            
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">
                Warga: <span className="font-medium">{selectedResidentForPayment.fullName}</span>
              </p>
              <p className="text-sm text-gray-600 mb-4">
                Blok: <span className="font-medium">{selectedResidentForPayment.blockNumber}</span>
              </p>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bulan
                </label>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(Number(e.target.value))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none"
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
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tahun
                </label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none"
                >
                  <option value={2024}>2024</option>
                  <option value={2025}>2025</option>
                  <option value={2026}>2026</option>
                  <option value={2027}>2027</option>
                  <option value={2028}>2028</option>
                </select>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6">
              <p className="text-sm text-blue-800">
                <strong>Periode:</strong> {new Date(selectedYear, selectedMonth - 1).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
              </p>
              <p className="text-xs text-blue-600 mt-1">
                Iuran wajib Rp 10.000 akan dicatat untuk periode ini
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => handlePaymentConfirm(false)}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Belum Lunas
              </button>
              <button
                onClick={() => handlePaymentConfirm(true)}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Lunas
              </button>
              <button
                onClick={() => {
                  setShowPaymentModal(false);
                  setSelectedResidentForPayment(null);
                }}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

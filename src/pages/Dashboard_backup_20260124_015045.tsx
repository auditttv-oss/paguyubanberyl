lockdown-install.js:1 SES Removing unpermitted intrinsics
installHook.js:1  ⚠️ React Router Future Flag Warning: React Router will begin wrapping state updates in `React.startTransition` in v7. You can use the `v7_startTransition` future flag to opt-in early. For more information, see https://reactrouter.com/v6/upgrading/future#v7_starttransition. Error Component Stack
    at BrowserRouter (index.tsx:789:3)
    at AuthProvider (AuthContext.tsx:19:73)
    at QueryClientProvider (QueryClientProvider.tsx:30:3)
    at App (<anonymous>)
overrideMethod @ installHook.js:1
warnOnce @ deprecations.ts:9
logDeprecation @ deprecations.ts:14
logV6DeprecationWarnings @ deprecations.ts:26
(anonymous) @ index.tsx:816
commitHookEffectListMount @ react-dom.development.js:23189
commitPassiveMountOnFiber @ react-dom.development.js:24965
commitPassiveMountEffects_complete @ react-dom.development.js:24930
commitPassiveMountEffects_begin @ react-dom.development.js:24917
commitPassiveMountEffects @ react-dom.development.js:24905
flushPassiveEffectsImpl @ react-dom.development.js:27078
flushPassiveEffects @ react-dom.development.js:27023
(anonymous) @ react-dom.development.js:26808
workLoop @ scheduler.development.js:266
flushWork @ scheduler.development.js:239
performWorkUntilDeadline @ scheduler.development.js:533
installHook.js:1  ⚠️ React Router Future Flag Warning: Relative route resolution within Splat routes is changing in v7. You can use the `v7_relativeSplatPath` future flag to opt-in early. For more information, see https://reactrouter.com/v6/upgrading/future#v7_relativesplatpath. Error Component Stack
    at BrowserRouter (index.tsx:789:3)
    at AuthProvider (AuthContext.tsx:19:73)
    at QueryClientProvider (QueryClientProvider.tsx:30:3)
    at App (<anonymous>)
overrideMethod @ installHook.js:1
warnOnce @ deprecations.ts:9
logDeprecation @ deprecations.ts:14
logV6DeprecationWarnings @ deprecations.ts:37
(anonymous) @ index.tsx:816
commitHookEffectListMount @ react-dom.development.js:23189
commitPassiveMountOnFiber @ react-dom.development.js:24965
commitPassiveMountEffects_complete @ react-dom.development.js:24930
commitPassiveMountEffects_begin @ react-dom.development.js:24917
commitPassiveMountEffects @ react-dom.development.js:24905
flushPassiveEffectsImpl @ react-dom.development.js:27078
flushPassiveEffects @ react-dom.development.js:27023
(anonymous) @ react-dom.development.js:26808
workLoop @ scheduler.development.js:266
flushWork @ scheduler.development.js:239
performWorkUntilDeadline @ scheduler.development.js:533
ddiomvflkgbejocbenol.supabase.co/rest/v1/residents?columns=%22full_name%22%2C%22block_number%22%2C%22whatsapp%22%2C%22occupancy_status%22%2C%22event_dues_amount%22%2C%22notes%22%2C%22created_at%22%2C%22updated_at%22:1   Failed to load resource: the server responded with a status of 400 ()
[NEW] Explain Console errors by using Copilot in Edge: click
         
         to explain an error. 
        Learn more
        Don't show again
DevTools extension 'React Developer Tools' registered with setOpenResourceHandler for all schemes, which is already registered by 'React Developer Tools'. This can lead to unexpected results.
import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchResidentsWithStatus, togglePayment, deleteResident } from '../services/dataService';
import { 
  CheckCircle, 
  XCircle, 
  Trash2, 
  UserPlus, 
  Search,
  Edit3,
  Loader2,
  Phone,
  Filter,
  Home,
  Key,
  Clock,
  PieChart as PieChartIcon,
  Users,
  MessageCircle,
  Clipboard,
  ChevronDown,
  ChevronUp,
  ArrowUpDown,
  AlertCircle,
  Shield,
  Eye,
  Wallet,
  DollarSign,
  TrendingUp,
  Gift,
  Heart,
  Star,
  Zap,
  TrendingDown,
  Percent,
  Users as UsersIcon
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { ResidentModal } from '../components/ResidentModal';
import { Resident } from '../types';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart as RechartsPieChart, Pie, Cell, Legend,
  CartesianGrid
} from 'recharts';

// Types
type SortField = 'fullName' | 'blockNumber' | 'occupancyStatus' | 'isPaidCurrentMonth' | 'eventDuesAmount';
type SortDirection = 'asc' | 'desc';

export const Residents = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  // State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedResident, setSelectedResident] = useState<Resident | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField>('fullName');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPayment, setFilterPayment] = useState<string>('all');
  const [filterSukarela, setFilterSukarela] = useState<string>('all');
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [expandedNotes, setExpandedNotes] = useState<string | null>(null);

  // Data fetching
  const { 
    data: residents = [], 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['residents'],
    queryFn: () => fetchResidentsWithStatus(new Date().getMonth() + 1, new Date().getFullYear()),
  });

  // Mutations
  const deleteMutation = useMutation({
    mutationFn: deleteResident,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['residents'] });
      setShowDeleteConfirm(null);
    },
    onError: (error) => {
      console.error('Failed to delete resident:', error);
    }
  });

  const paymentMutation = useMutation({
    mutationFn: ({ id, status }: { id: string, status: boolean }) => 
      togglePayment(id, new Date().getMonth() + 1, new Date().getFullYear(), status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['residents'] }),
    onError: (error) => {
      console.error('Failed to update payment:', error);
    }
  });

  // Sorting handler
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Get sort icon
  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown size={14} className="text-gray-400" />;
    }
    return sortDirection === 'asc' 
      ? <ChevronUp size={14} className="text-emerald-600" />
      : <ChevronDown size={14} className="text-emerald-600" />;
  };

  // Process residents with filters and search
  const processedResidents = useMemo(() => {
    let filtered = residents.filter(r => {
      const matchesSearch = 
        r.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.blockNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (r.notes && r.notes.toLowerCase().includes(searchTerm.toLowerCase())) ||
        r.whatsapp.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = filterStatus === 'all' || r.occupancyStatus === filterStatus;
      
      const matchesPayment = filterPayment === 'all' || 
        (filterPayment === 'paid' && r.isPaidCurrentMonth) ||
        (filterPayment === 'unpaid' && !r.isPaidCurrentMonth);

      const matchesSukarela = filterSukarela === 'all' || 
        (filterSukarela === 'donated' && (r.eventDuesAmount || 0) > 0) ||
        (filterSukarela === 'not_donated' && (r.eventDuesAmount || 0) === 0);

      return matchesSearch && matchesStatus && matchesPayment && matchesSukarela;
    });

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortField) {
        case 'fullName':
          aValue = a.fullName.toLowerCase();
          bValue = b.fullName.toLowerCase();
          break;
        case 'blockNumber':
          const aBlock = a.blockNumber.match(/\d+/g);
          const bBlock = b.blockNumber.match(/\d+/g);
          aValue = aBlock ? parseInt(aBlock[0]) : 0;
          bValue = bBlock ? parseInt(bBlock[0]) : 0;
          break;
        case 'occupancyStatus':
          aValue = a.occupancyStatus;
          bValue = b.occupancyStatus;
          break;
        case 'isPaidCurrentMonth':
          aValue = a.isPaidCurrentMonth ? 1 : 0;
          bValue = b.isPaidCurrentMonth ? 1 : 0;
          break;
        case 'eventDuesAmount':
          aValue = a.eventDuesAmount || 0;
          bValue = b.eventDuesAmount || 0;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      
      return a.fullName.localeCompare(b.fullName);
    });

    return filtered;
  }, [residents, searchTerm, filterStatus, filterPayment, filterSukarela, sortField, sortDirection]);

  // Statistics dengan data lengkap
  const stats = useMemo(() => {
    const total = residents.length;
    
    // Status hunian lengkap
    const menetap = residents.filter(r => r.occupancyStatus === 'Menetap').length;
    const penyewa = residents.filter(r => r.occupancyStatus === 'Penyewa').length;
    const kunjungan = residents.filter(r => r.occupancyStatus === 'Kunjungan').length;
    const ditempati2026 = residents.filter(r => r.occupancyStatus === 'Ditempati 2026').length;
    
    // Kas wajib
    const paidKas = residents.filter(r => r.isPaidCurrentMonth).length;
    const unpaidKas = total - paidKas;
    
    // Kas sukarela
    const donatedSukarela = residents.filter(r => (r.eventDuesAmount || 0) > 0).length;
    const notDonatedSukarela = total - donatedSukarela;
    const totalSukarela = residents.reduce((sum, r) => sum + (r.eventDuesAmount || 0), 0);
    const avgSukarela = donatedSukarela > 0 ? Math.round(totalSukarela / donatedSukarela) : 0;
    
    // Jumlah donasi per kategori
    const smallDonors = residents.filter(r => (r.eventDuesAmount || 0) > 0 && (r.eventDuesAmount || 0) <= 50000).length;
    const mediumDonors = residents.filter(r => (r.eventDuesAmount || 0) > 50000 && (r.eventDuesAmount || 0) <= 200000).length;
    const largeDonors = residents.filter(r => (r.eventDuesAmount || 0) > 200000).length;

    return {
      // Basic stats
      total,
      
      // Status hunian lengkap
      menetap,
      penyewa,
      kunjungan,
      ditempati2026,
      
      // Persentase status hunian
      menetapPercentage: total > 0 ? Math.round((menetap / total) * 100) : 0,
      penyewaPercentage: total > 0 ? Math.round((penyewa / total) * 100) : 0,
      kunjunganPercentage: total > 0 ? Math.round((kunjungan / total) * 100) : 0,
      ditempati2026Percentage: total > 0 ? Math.round((ditempati2026 / total) * 100) : 0,
      
      // Kas wajib
      paidKas,
      unpaidKas,
      totalKas: paidKas * 10000,
      paidPercentage: total > 0 ? Math.round((paidKas / total) * 100) : 0,
      unpaidPercentage: total > 0 ? Math.round((unpaidKas / total) * 100) : 0,
      
      // Kas sukarela lengkap
      donatedSukarela,
      notDonatedSukarela,
      totalSukarela,
      avgSukarela,
      sukarelaPercentage: total > 0 ? Math.round((donatedSukarela / total) * 100) : 0,
      notSukarelaPercentage: total > 0 ? Math.round((notDonatedSukarela / total) * 100) : 0,
      
      // Donation categories
      smallDonors,
      mediumDonors,
      largeDonors,
    };
  }, [residents]);

  // Data untuk chart status hunian
  const occupancyChartData = useMemo(() => [
    { name: 'Menetap', value: stats.menetap, color: '#10b981' },
    { name: 'Penyewa', value: stats.penyewa, color: '#3b82f6' },
    { name: 'Kunjungan', value: stats.kunjungan, color: '#f59e0b' },
    { name: '2026', value: stats.ditempati2026, color: '#8b5cf6' }
  ].filter(item => item.value > 0), [stats]);

  // Data untuk chart kas wajib
  const kasWajibChartData = useMemo(() => [
    { name: 'Sudah Bayar', value: stats.paidKas, color: '#10b981' },
    { name: 'Belum Bayar', value: stats.unpaidKas, color: '#ef4444' }
  ], [stats]);

  // Data untuk chart kas sukarela
  const kasSukarelaChartData = useMemo(() => [
    { name: 'Sudah Donasi', value: stats.donatedSukarela, color: '#8b5cf6' },
    { name: 'Belum Donasi', value: stats.notDonatedSukarela, color: '#d1d5db' }
  ], [stats]);

  // Data untuk chart kategori donasi
  const donationCategoryData = useMemo(() => [
    { name: 'Kecil (<50k)', value: stats.smallDonors, color: '#60a5fa' },
    { name: 'Sedang (50k-200k)', value: stats.mediumDonors, color: '#8b5cf6' },
    { name: 'Besar (>200k)', value: stats.largeDonors, color: '#f59e0b' }
  ].filter(item => item.value > 0), [stats]);

  // WhatsApp link helper
  const getWaLink = (phone: string) => {
    const clean = phone.replace(/\D/g, '');
    if (clean.startsWith('0')) {
      return `https://wa.me/62${clean.substring(1)}`;
    }
    return `https://wa.me/${clean}`;
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return `Rp ${amount.toLocaleString('id-ID')}`;
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Menetap': return { bg: 'bg-emerald-100', text: 'text-emerald-800', border: 'border-emerald-200' };
      case 'Penyewa': return { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-200' };
      case 'Kunjungan': return { bg: 'bg-amber-100', text: 'text-amber-800', border: 'border-amber-200' };
      case 'Ditempati 2026': return { bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-200' };
      default: return { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-200' };
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin mx-auto text-emerald-600 mb-4" size={48} />
          <h2 className="text-xl font-bold text-gray-800">Memuat Data Warga</h2>
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
          <AlertCircle className="text-rose-500 mx-auto mb-4" size={48} />
          <h2 className="text-xl font-bold text-gray-800 mb-2">Terjadi Kesalahan</h2>
          <p className="text-gray-600 mb-6">
            Gagal memuat data warga. Silakan periksa koneksi internet Anda.
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
      {/* Main Content Container */}
      <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 md:py-6">
        
        {/* Header Section */}
        <header className="mb-6 md:mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 md:gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white">
                  <Users size={24} />
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Data Warga Cluster Beryl</h1>
                  <p className="text-gray-600 text-sm md:text-base">
                    Total {stats.total} Kepala Keluarga • {processedResidents.length} ditampilkan
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
              {/* Search Input */}
              <div className="relative flex-1 lg:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Cari nama, blok, WhatsApp, atau catatan..."
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none transition-all"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                    aria-label="Clear search"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Add Resident Button */}
              <button
                onClick={() => setIsModalOpen(true)}
                className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white px-5 py-3.5 rounded-xl font-medium shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 min-w-[140px]"
              >
                <UserPlus size={20} />
                <span>{user ? 'Tambah Warga' : 'Lapor Diri'}</span>
              </button>
            </div>
          </div>
        </header>

        {/* Stats Overview Section */}
        <section className="mb-6 md:mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
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

            {/* Kas Wajib */}
            <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white p-5 md:p-6 rounded-2xl shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm font-medium opacity-90">Kas Wajib</p>
                  <p className="text-2xl md:text-3xl font-bold">{formatCurrency(stats.totalKas)}</p>
                  <p className="text-sm opacity-80 mt-1">{stats.paidKas} warga sudah bayar</p>
                </div>
                <div className="p-3 bg-white/20 rounded-xl">
                  <Wallet size={24} />
                </div>
              </div>
            </div>

            {/* Kas Sukarela */}
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-5 md:p-6 rounded-2xl shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm font-medium opacity-90">Kas Sukarela</p>
                  <p className="text-2xl md:text-3xl font-bold">{formatCurrency(stats.totalSukarela)}</p>
                  <p className="text-sm opacity-80 mt-1">{stats.donatedSukarela} warga ikut</p>
                </div>
                <div className="p-3 bg-white/20 rounded-xl">
                  <Gift size={24} />
                </div>
              </div>
            </div>

            {/* Rata-rata Donasi */}
            <div className="bg-gradient-to-br from-pink-500 to-pink-600 text-white p-5 md:p-6 rounded-2xl shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm font-medium opacity-90">Rata-rata Donasi</p>
                  <p className="text-2xl md:text-3xl font-bold">{formatCurrency(stats.avgSukarela)}</p>
                  <p className="text-sm opacity-80 mt-1">Per warga donatur</p>
                </div>
                <div className="p-3 bg-white/20 rounded-xl">
                  <DollarSign size={24} />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Infografis Lengkap Section */}
        <section className="mb-6 md:mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
            {/* Chart Status Hunian */}
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

            {/* Chart Kas Wajib vs Sukarela */}
            <div className="bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-gray-200">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                  <BarChart width={20} height={20} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-800">Kepatuhan & Partisipasi</h3>
                  <p className="text-gray-600 text-sm">Perbandingan kas wajib dan sukarela</p>
                </div>
              </div>
              
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={[
                      { 
                        name: 'Kas Wajib', 
                        Sudah: stats.paidKas, 
                        Belum: stats.unpaidKas,
                        SudahColor: '#10b981',
                        BelumColor: '#ef4444'
                      },
                      { 
                        name: 'Kas Sukarela', 
                        Sudah: stats.donatedSukarela, 
                        Belum: stats.notDonatedSukarela,
                        SudahColor: '#8b5cf6',
                        BelumColor: '#d1d5db'
                      }
                    ]}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="name" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" />
                    <Tooltip 
                      formatter={(value) => [`${value} warga`, 'Jumlah']}
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                    />
                    <Legend />
                    <Bar dataKey="Sudah" name="Sudah Bayar/Donasi" fill="#10b981" />
                    <Bar dataKey="Belum" name="Belum Bayar/Donasi" fill="#ef4444" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="p-3 bg-gradient-to-r from-emerald-50 to-emerald-100 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-emerald-700">Kas Wajib</p>
                    <Percent size={16} className="text-emerald-600" />
                  </div>
                  <div className="flex items-baseline gap-2">
                    <p className="text-2xl font-bold text-emerald-800">{stats.paidPercentage}%</p>
                    <p className="text-sm text-emerald-600">({stats.paidKas}/{stats.total})</p>
                  </div>
                  <div className="w-full bg-emerald-200 h-2 rounded-full mt-2">
                    <div 
                      className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${stats.paidPercentage}%` }}
                    />
                  </div>
                </div>
                
                <div className="p-3 bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-purple-700">Kas Sukarela</p>
                    <Heart size={16} className="text-purple-600" />
                  </div>
                  <div className="flex items-baseline gap-2">
                    <p className="text-2xl font-bold text-purple-800">{stats.sukarelaPercentage}%</p>
                    <p className="text-sm text-purple-600">({stats.donatedSukarela}/{stats.total})</p>
                  </div>
                  <div className="w-full bg-purple-200 h-2 rounded-full mt-2">
                    <div 
                      className="bg-purple-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${stats.sukarelaPercentage}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Donasi Detail Section - SIMPLIFIED */}
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

        {/* Filters Section */}
        <section className="mb-6">
          <div className="flex flex-col md:flex-row gap-3 md:gap-4">
            {/* Mobile Filter Button */}
            <div className="md:hidden">
              <button
                onClick={() => setShowMobileFilters(!showMobileFilters)}
                className="w-full flex items-center justify-between gap-2 py-3 px-4 bg-white border border-gray-200 rounded-xl"
              >
                <div className="flex items-center gap-2">
                  <Filter size={20} />
                  <span className="font-medium">Filter & Urutkan</span>
                </div>
                <ChevronDown className={`transition-transform ${showMobileFilters ? 'rotate-180' : ''}`} size={16} />
              </button>
            </div>

            {/* Desktop Filters */}
            <div className="hidden md:flex flex-wrap items-center gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mr-2">Status Huni:</label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:border-emerald-500 outline-none min-w-[120px]"
                >
                  <option value="all">Semua Status</option>
                  <option value="Menetap">Menetap</option>
                  <option value="Penyewa">Penyewa</option>
                  <option value="Kunjungan">Kunjungan</option>
                  <option value="Ditempati 2026">2026</option>
                </select>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700 mr-2">Kas Wajib:</label>
                <select
                  value={filterPayment}
                  onChange={(e) => setFilterPayment(e.target.value)}
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:border-emerald-500 outline-none min-w-[120px]"
                >
                  <option value="all">Semua</option>
                  <option value="paid">Sudah Bayar</option>
                  <option value="unpaid">Belum Bayar</option>
                </select>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700 mr-2">Kas Sukarela:</label>
                <select
                  value={filterSukarela}
                  onChange={(e) => setFilterSukarela(e.target.value)}
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:border-emerald-500 outline-none min-w-[120px]"
                >
                  <option value="all">Semua</option>
                  <option value="donated">Sudah Donasi</option>
                  <option value="not_donated">Belum Donasi</option>
                </select>
              </div>
            </div>

            {/* Mobile Filters (Collapsible) */}
            {showMobileFilters && (
              <div className="md:hidden grid grid-cols-1 gap-3 bg-white p-4 rounded-xl border border-gray-200">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Status Huni:</label>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:border-emerald-500 outline-none"
                  >
                    <option value="all">Semua Status</option>
                    <option value="Menetap">Menetap</option>
                    <option value="Penyewa">Penyewa</option>
                    <option value="Kunjungan">Kunjungan</option>
                    <option value="Ditempati 2026">2026</option>
                  </select>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Kas Wajib:</label>
                  <select
                    value={filterPayment}
                    onChange={(e) => setFilterPayment(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:border-emerald-500 outline-none"
                  >
                    <option value="all">Semua</option>
                    <option value="paid">Sudah Bayar</option>
                    <option value="unpaid">Belum Bayar</option>
                  </select>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Kas Sukarela:</label>
                  <select
                    value={filterSukarela}
                    onChange={(e) => setFilterSukarela(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:border-emerald-500 outline-none"
                  >
                    <option value="all">Semua</option>
                    <option value="donated">Sudah Donasi</option>
                    <option value="not_donated">Belum Donasi</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Residents Table Section */}
        <section>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Table Header */}
            <div className="px-4 md:px-6 py-4 border-b border-gray-100 bg-gray-50">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg font-bold text-gray-800">Daftar Warga</h3>
                  <p className="text-sm text-gray-600">
                    Menampilkan {processedResidents.length} dari {residents.length} warga
                  </p>
                </div>
                
                <div className="flex items-center gap-3 text-sm text-gray-700">
                  <span>Urutkan:</span>
                  <button
                    onClick={() => handleSort('fullName')}
                    className="flex items-center gap-1 px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-50"
                  >
                    <span>Nama</span>
                    {getSortIcon('fullName')}
                  </button>
                  <button
                    onClick={() => handleSort('blockNumber')}
                    className="flex items-center gap-1 px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-50"
                  >
                    <span>Blok</span>
                    {getSortIcon('blockNumber')}
                  </button>
                </div>
              </div>
            </div>

            {/* Table Body */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <button
                        onClick={() => handleSort('fullName')}
                        className="flex items-center gap-1 hover:text-gray-700"
                      >
                        <span>Nama Lengkap</span>
                        {getSortIcon('fullName')}
                      </button>
                    </th>
                    <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <button
                        onClick={() => handleSort('blockNumber')}
                        className="flex items-center gap-1 hover:text-gray-700"
                      >
                        <span>Blok / Nomor</span>
                        {getSortIcon('blockNumber')}
                      </button>
                    </th>
                    <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <button
                        onClick={() => handleSort('occupancyStatus')}
                        className="flex items-center gap-1 hover:text-gray-700"
                      >
                        <span>Status Huni</span>
                        {getSortIcon('occupancyStatus')}
                      </button>
                    </th>
                    <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      WhatsApp
                    </th>
                    <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <button
                        onClick={() => handleSort('isPaidCurrentMonth')}
                        className="flex items-center gap-1 hover:text-gray-700"
                      >
                        <span>Kas Wajib</span>
                        {getSortIcon('isPaidCurrentMonth')}
                      </button>
                    </th>
                    <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <button
                        onClick={() => handleSort('eventDuesAmount')}
                        className="flex items-center gap-1 hover:text-gray-700"
                      >
                        <span>Kas Sukarela</span>
                        {getSortIcon('eventDuesAmount')}
                      </button>
                    </th>
                    <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Catatan
                    </th>
                    <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {processedResidents.map((resident) => {
                    const statusColor = getStatusColor(resident.occupancyStatus);
                    
                    return (
                      <tr key={resident.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-4 md:px-6 py-4">
                          <div>
                            <div className="font-medium text-gray-900">{resident.fullName}</div>
                            <div className="text-xs text-gray-500">
                              {resident.familyMembers || 1} anggota keluarga
                            </div>
                          </div>
                        </td>
                        
                        <td className="px-4 md:px-6 py-4">
                          <div className="font-medium text-gray-900">{resident.blockNumber}</div>
                        </td>
                        
                        <td className="px-4 md:px-6 py-4">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${statusColor.bg} ${statusColor.text} ${statusColor.border}`}>
                            {resident.occupancyStatus}
                          </span>
                        </td>
                        
                        <td className="px-4 md:px-6 py-4">
                          <a
                            href={getWaLink(resident.whatsapp)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
                          >
                            <Phone size={16} />
                            <span>{resident.whatsapp}</span>
                          </a>
                        </td>
                        
                        <td className="px-4 md:px-6 py-4">
                          <button
                            onClick={() => {
                              if (user) {
                                paymentMutation.mutate({
                                  id: resident.id,
                                  status: !resident.isPaidCurrentMonth
                                });
                              }
                            }}
                            className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg font-medium ${
                              resident.isPaidCurrentMonth
                                ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                                : 'bg-rose-100 text-rose-700 hover:bg-rose-200'
                            } ${!user ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                            disabled={!user || paymentMutation.isPending}
                          >
                            {paymentMutation.isPending ? (
                              <Loader2 size={16} className="animate-spin" />
                            ) : resident.isPaidCurrentMonth ? (
                              <CheckCircle size={16} />
                            ) : (
                              <XCircle size={16} />
                            )}
                            <span>
                              {resident.isPaidCurrentMonth ? 'Sudah Bayar' : 'Belum Bayar'}
                            </span>
                          </button>
                        </td>
                        
                        <td className="px-4 md:px-6 py-4">
                          <div className="flex flex-col gap-1">
                            <span className={`font-medium ${
                              (resident.eventDuesAmount || 0) > 0 
                                ? 'text-purple-700' 
                                : 'text-gray-500'
                            }`}>
                              {(resident.eventDuesAmount || 0) > 0 
                                ? formatCurrency(resident.eventDuesAmount || 0) 
                                : 'Belum donasi'}
                            </span>
                            {(resident.eventDuesAmount || 0) > 0 && (
                              <span className="text-xs text-gray-500">
                                Donasi {resident.eventDuesCategory || '-'}
                              </span>
                            )}
                          </div>
                        </td>
                        
                        <td className="px-4 md:px-6 py-4 max-w-[200px]">
                          {resident.notes ? (
                            <div>
                              <button
                                onClick={() => setExpandedNotes(
                                  expandedNotes === resident.id ? null : resident.id
                                )}
                                className="text-left text-sm text-gray-600 hover:text-gray-800"
                              >
                                {expandedNotes === resident.id || resident.notes.length <= 60
                                  ? resident.notes
                                  : `${resident.notes.substring(0, 60)}...`
                                }
                                {resident.notes.length > 60 && (
                                  <span className="text-blue-600 ml-1">
                                    {expandedNotes === resident.id ? 'Tutup' : 'Baca'}
                                  </span>
                                )}
                              </button>
                            </div>
                          ) : (
                            <span className="text-gray-400 text-sm">-</span>
                          )}
                        </td>
                        
                        <td className="px-4 md:px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                setSelectedResident(resident);
                                setIsModalOpen(true);
                              }}
                              className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Edit"
                            >
                              <Edit3 size={18} />
                            </button>
                            
                            {user && (
                              <button
                                onClick={() => setShowDeleteConfirm(resident.id)}
                                className="p-2 text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                                title="Hapus"
                              >
                                <Trash2 size={18} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Empty State */}
            {processedResidents.length === 0 && (
              <div className="text-center py-12">
                <Users className="mx-auto text-gray-300 mb-4" size={48} />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Tidak ada warga ditemukan</h3>
                <p className="text-gray-500 mb-6">
                  Coba ubah filter pencarian atau tambahkan warga baru
                </p>
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setFilterStatus('all');
                    setFilterPayment('all');
                    setFilterSukarela('all');
                  }}
                  className="text-emerald-600 hover:text-emerald-700 font-medium"
                >
                  Reset semua filter
                </button>
              </div>
            )}

            {/* Footer */}
            {processedResidents.length > 0 && (
              <div className="px-4 md:px-6 py-4 border-t border-gray-100 bg-gray-50 text-sm text-gray-600">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div>
                    Menampilkan {processedResidents.length} dari {residents.length} warga
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-emerald-100 rounded-full"></div>
                      <span>Menetap</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-blue-100 rounded-full"></div>
                      <span>Penyewa</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-amber-100 rounded-full"></div>
                      <span>Kunjungan</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Modal for Add/Edit Resident */}
        {isModalOpen && (
          <ResidentModal
            resident={selectedResident}
            isOpen={isModalOpen}
            onClose={() => {
              setIsModalOpen(false);
              setSelectedResident(null);
            }}
          />
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6">
              <div className="text-center">
                <div className="mx-auto w-12 h-12 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mb-4">
                  <AlertCircle size={24} />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Hapus Data Warga?</h3>
                <p className="text-gray-600 mb-6">
                  Data warga akan dihapus permanen dari sistem. Tindakan ini tidak dapat dibatalkan.
                </p>
                
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowDeleteConfirm(null)}
                    className="flex-1 py-3 border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    onClick={() => deleteMutation.mutate(showDeleteConfirm)}
                    disabled={deleteMutation.isPending}
                    className="flex-1 py-3 bg-rose-600 text-white font-medium rounded-xl hover:bg-rose-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {deleteMutation.isPending ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader2 size={16} className="animate-spin" />
                        Menghapus...
                      </span>
                    ) : (
                      'Ya, Hapus'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
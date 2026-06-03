import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  fetchResidentsWithStatus, 
  updateResident, 
  createResident, 
  updateResidentPayment, 
  deleteResident, 
  fetchAllPayments,
  deserializeExtendedFields,
  formatToLocalIdDate
} from '../services/dataService';
import { 
  Users, 
  Search, 
  ChevronDown, 
  UserPlus, 
  MessageCircle,
  Edit,
  Trash2,
  Loader2,
  Calendar,
  FileSpreadsheet,
  Check,
  X,
  FileText,
  Download,
  Home,
  Shield,
  Car,
  ChevronUp,
  UserCheck
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { ResidentModal } from '../components/ResidentModal';
import { Resident } from '../types';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';

const MONTH_NAMES = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

export const Residents = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const userEmail = user?.email || '';
  const isKetua = userEmail.includes('ketua');
  const isBendahara = userEmail.includes('bendahara') || (!isKetua && !!user); 
  const isAdmin = !!user;

  // Tabs
  const [activeTab, setActiveTab] = useState<'manage' | 'rekap' | 'advanced_profile'>('manage');

  // State pencarian
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedResident, setSelectedResident] = useState<Resident | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [advancedSearch, setAdvancedSearch] = useState(''); 
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  
  // State untuk melacak baris keluarga yang sedang diekspansi
  const [expandedRows, setExpandedRows] = useState<{ [key: string]: boolean }>({});

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

  const { data: allPayments = [] } = useQuery({
    queryKey: ['allPayments'],
    queryFn: fetchAllPayments,
  });

  // Toggle payment directly from tables
  const paymentMutation = useMutation({
    mutationFn: ({ id, isPaid, month, year }: { id: string; isPaid: boolean; month: number; year: number }) =>
      updateResidentPayment(id, isPaid, month, year),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['residents'] });
      queryClient.invalidateQueries({ queryKey: ['allPayments'] });
      toast.success('Status kas bulanan diperbarui');
    },
    onError: () => toast.error('Gagal memperbarui kas bulanan')
  });

  const deleteMutation = useMutation({
    mutationFn: deleteResident,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['residents'] });
      queryClient.invalidateQueries({ queryKey: ['allPayments'] });
      toast.success('Data warga berhasil dihapus');
    },
    onError: () => toast.error('Gagal menghapus warga')
  });

  // Calculate stats
  const stats = useMemo(() => {
    const total = residents.length;
    const occupied = residents.filter(r => r.occupancyStatus === 'Menetap' || r.occupancyStatus === 'Penyewa').length;
    const paidKas = residents.filter(r => r.isPaidCurrentMonth).length;
    const paidSukarela = residents.filter(r => (r.eventDuesAmount || 0) > 0).length;
    const totalKas = paidKas * 10000;
    const totalSukarela = residents.reduce((sum, r) => sum + (r.eventDuesAmount || 0), 0);

    return {
      total,
      occupied,
      occupancyRate: total > 0 ? Math.round((occupied / total) * 100) : 0,
      paidKas,
      paidSukarela,
      totalKas,
      totalSukarela,
      paymentRate: total > 0 ? Math.round((paidKas / total) * 100) : 0,
      sukarelaRate: total > 0 ? Math.round((paidSukarela / total) * 100) : 0,
    };
  }, [residents]);

  const processedResidents = useMemo(() => {
    let filtered = residents;

    if (searchTerm) {
      filtered = filtered.filter(r => 
        r.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.blockNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.notes?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(r => r.occupancyStatus === filterStatus);
    }

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

  // Algoritme Pencarian Terintegrasi (Memindai Kepala Keluarga sekaligus seluruh Anggota Keluarga Serumah)
  const filteredAdvancedResidents = useMemo(() => {
    if (!advancedSearch.trim()) return processedResidents;
    return processedResidents.filter(r => {
      const { fields, rawNotes } = deserializeExtendedFields(r.notes, !!user);
      
      const familyNames = (fields as any).family_members_list?.map((f: any) => f.name).join(' ') || '';

      const textToSearch = [
        r.fullName,
        r.blockNumber,
        fields.id_rumah || '',
        fields.jenis_kelamin || '',
        fields.pekerjaan || '',
        fields.status_warga || '',
        fields.nama_pemilik_asli || '',
        fields.jenis_kendaraan || '',
        fields.plat_nomor || '',
        fields.keterangan_warna_merk || '',
        familyNames,
        rawNotes || ''
      ].join(' ').toLowerCase();

      return textToSearch.includes(advancedSearch.toLowerCase());
    });
  }, [processedResidents, advancedSearch, user]);

  const toggleRowExpansion = (id: string) => {
    setExpandedRows(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const getWaLink = (phone: string) => {
    const clean = phone.replace(/\D/g, '');
    if (clean.startsWith('0')) {
      return `https://wa.me/62${clean.substring(1)}`;
    }
    return `https://wa.me/${clean}`;
  };

  const checkPaymentStatus = (residentId: string, monthNum: number) => {
    return allPayments.some(p => p.resident_id === residentId && p.month === monthNum && p.year === selectedYear);
  };

  const handleCellClick = (residentId: string, monthNum: number) => {
    if (!isAdmin) return;
    if (!isBendahara) {
      toast.error('❌ Hak Akses Terbatas: Hanya Bendahara yang diizinkan mengedit kas.');
      return;
    }
    const isPaid = checkPaymentStatus(residentId, monthNum);
    paymentMutation.mutate({
      id: residentId,
      isPaid: !isPaid,
      month: monthNum,
      year: selectedYear
    });
  };

  const handleExportRekapToExcel = () => {
    const rekapData = processedResidents.map((r, index) => {
      const row: any = {
        'No.': index + 1,
        'Nama Lengkap': r.fullName,
        'Blok / No Rumah': r.blockNumber,
        'Status Hunian': r.occupancyStatus
      };

      let paidCount = 0;
      for (let m = 1; m <= 12; m++) {
        const isPaid = checkPaymentStatus(r.id, m);
        row[MONTH_NAMES[m-1].substring(0, 3)] = isPaid ? 'LUNAS (10K)' : 'BELUM';
        if (isPaid) paidCount++;
      }

      row['Total Kas Terbayar'] = `Rp ${(paidCount * 10000).toLocaleString('id-ID')}`;
      row['Status Bayar'] = `${paidCount}/12`;
      return row;
    });

    const worksheet = XLSX.utils.json_to_sheet(rekapData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, `Rekap Kas ${selectedYear}`);
    XLSX.writeFile(workbook, `Rekap_Kas_Warga_Beryl_${selectedYear}.xlsx`);
    toast.success('Excel Berhasil didownload!');
  };

  const handleExportKependudukanToExcel = () => {
    const listData = filteredAdvancedResidents.map((r, index) => {
      const { fields, rawNotes } = deserializeExtendedFields(r.notes, !!user);
      return {
        'No.': index + 1,
        'Nama Lengkap': r.fullName,
        'ID Rumah': fields.id_rumah || r.blockNumber,
        'Blok / No Rumah': r.blockNumber,
        'WhatsApp': r.whatsapp,
        'Jenis Kelamin': fields.jenis_kelamin || 'Laki-Laki',
        'Peran Keluarga': fields.peran_keluarga || 'Kepala Keluarga',
        'Tempat, Tgl Lahir': fields.tempat_tgl_lahir || '',
        'Agama': fields.agama || 'Islam',
        'Gol. Darah': fields.golongan_darah || 'O',
        'Pekerjaan': fields.pekerjaan || '',
        'Status Warga': fields.status_warga || 'Tetap',
        'Tanggal Bergabung': fields.tanggal_bergabung ? formatToLocalIdDate(fields.tanggal_bergabung) : '',
        'Pemilik Asli': fields.nama_pemilik_asli || '',
        'No. HP Pemilik': fields.no_hp_pemilik_asli || '',
        'Status Hunian': r.occupancyStatus,
        'Mulai Huni': fields.tgl_mulai_huni ? formatToLocalIdDate(fields.tgl_mulai_huni) : '',
        'Jenis Kendaraan': fields.jenis_kendaraan || 'Tidak Ada',
        'Plat Nomor': fields.plat_nomor || '',
        'Warna / Merk': fields.keterangan_warna_merk || '',
        'Catatan Tambahan': rawNotes
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(listData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Kependudukan');
    XLSX.writeFile(workbook, `Data_Kependudukan_Lengkap_Beryl_${selectedYear}.xlsx`);
    toast.success('File Kependudukan berhasil diunduh!');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 pb-24 font-sans">
      
      {/* Header */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-gray-800">Manajemen Data Warga</h1>
          <p className="text-gray-500 text-sm">Cluster Beryl - Total {stats.total} Kepala Keluarga</p>
        </div>
        
        {/* PEMBARUAN KEAMANAN: Semua mode (Admin, Warga, maupun Tamu) diizinkan untuk menambah warga baru */}
        <button
          onClick={() => { setSelectedResident(null); setIsModalOpen(true); }}
          className="px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 text-sm"
        >
          <UserPlus size={18} />
          Tambah Warga Baru
        </button>
      </div>

      {/* Tabs Menu */}
      <div className="flex flex-col sm:flex-row border-b mb-6 bg-white rounded-xl shadow-sm p-1.5 gap-1">
        <button
          onClick={() => setActiveTab('manage')}
          className={`flex-1 py-3 font-bold text-xs uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-2 ${
            activeTab === 'manage' ? 'bg-emerald-600 text-white shadow-md' : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          <Users size={16} />
          Daftar & Kelola Warga
        </button>
        <button
          onClick={() => setActiveTab('rekap')}
          className={`flex-1 py-3 font-bold text-xs uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-2 ${
            activeTab === 'rekap' ? 'bg-emerald-600 text-white shadow-md' : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          <FileSpreadsheet size={16} />
          Laporan Rekap Bulanan (12 Bulan)
        </button>
        <button
          onClick={() => setActiveTab('advanced_profile')}
          className={`flex-1 py-3 font-bold text-xs uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-2 ${
            activeTab === 'advanced_profile' ? 'bg-emerald-600 text-white shadow-md' : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          <FileText size={16} />
          Profil Kependudukan Lengkap
        </button>
      </div>

      {/* Statistics */}
      {activeTab !== 'advanced_profile' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white p-5 rounded-2xl shadow-lg shadow-emerald-500/10">
            <p className="text-xs font-bold uppercase opacity-85">Kepatuhan Kas Wajib</p>
            <p className="text-3xl font-black mt-1">{stats.paymentRate}%</p>
            <p className="text-xs opacity-75 mt-2">{stats.paidKas} dari {stats.total} KK Lunas Bulan Ini</p>
          </div>
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-5 rounded-2xl shadow-lg shadow-blue-500/10">
            <p className="text-xs font-bold uppercase opacity-85">Rasio Hunian Aktif</p>
            <p className="text-3xl font-black mt-1">{stats.occupancyRate}%</p>
            <p className="text-xs opacity-75 mt-2">{stats.occupied} dari {stats.total} Rumah Dihuni</p>
          </div>
          <div className="bg-gradient-to-br from-amber-500 to-amber-600 text-white p-5 rounded-2xl shadow-lg shadow-amber-500/10">
            <p className="text-xs font-bold uppercase opacity-85">Kas Sukarela Terkumpul</p>
            <p className="text-3xl font-black mt-1">Rp {stats.totalSukarela.toLocaleString('id-ID')}</p>
            <p className="text-xs opacity-75 mt-2">Partisipasi Iuran Sukarela: {stats.paidSukarela} KK</p>
          </div>
        </div>
      )}

      {/* Period Selector (Rekap & Kas) */}
      <div className="bg-white rounded-2xl border p-4 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <Calendar className="text-emerald-600" size={20} />
          <div>
            <h3 className="font-bold text-gray-800 text-sm">
              Rekapitulasi Tahun: {selectedYear}
            </h3>
            <p className="text-xs text-gray-500">Pilih tahun untuk memonitor data pembayaran warga.</p>
          </div>
        </div>
        <div className="flex gap-2">
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="bg-white border rounded-xl px-3 py-2 text-sm font-semibold focus:ring-2 focus:ring-emerald-500 outline-none"
          >
            {[2024, 2025, 2026, 2027, 2028].map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
          {activeTab === 'rekap' && (
            <button
              onClick={handleExportRekapToExcel}
              className="px-4 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded-xl font-bold text-xs flex items-center gap-1.5"
            >
              <FileSpreadsheet size={14}/>
              Ekspor Rekap Excel
            </button>
          )}
          {activeTab === 'advanced_profile' && (
            <button
              onClick={handleExportKependudukanToExcel}
              className="px-4 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded-xl font-bold text-xs flex items-center gap-1.5 animate-in fade-in"
            >
              <Download size={14}/>
              Unduh Seluruh Data Kependudukan
            </button>
          )}
        </div>
      </div>

      {/* Tab 1: MANAGE RESIDENTS */}
      {activeTab === 'manage' && (
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Cari nama, blok, atau catatan..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-emerald-500 text-sm bg-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="border rounded-xl px-3 py-2.5 text-sm bg-white font-semibold outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">Semua Hunian</option>
              <option value="Menetap">Menetap</option>
              <option value="Penyewa">Penyewa</option>
              <option value="Kunjungan">Kunjungan</option>
              <option value="Ditempati 2026">Ditempati 2026</option>
            </select>
          </div>

          <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-gray-500 font-bold border-b text-xs uppercase tracking-wider">
                  <tr>
                    <th className="p-4">Blok</th>
                    <th className="p-4">Nama Lengkap</th>
                    <th className="p-4">Status Huni</th>
                    <th className="p-4">Kontak (WA)</th>
                    <th className="p-4">Kas Wajib (10K)</th>
                    <th className="p-4">Kas Acara (Sukarela)</th>
                    <th className="p-4">Catatan</th>
                    {isAdmin && <th className="p-4 text-center">Aksi</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {processedResidents.map((resident) => (
                    <tr key={resident.id} className="hover:bg-gray-50/50">
                      <td className="p-4 font-bold text-gray-800">{resident.blockNumber}</td>
                      <td className="p-4 font-bold text-gray-900">{resident.fullName}</td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                          resident.occupancyStatus === 'Menetap' ? 'bg-emerald-100 text-emerald-800' :
                          resident.occupancyStatus === 'Penyewa' ? 'bg-blue-100 text-blue-800' :
                          resident.occupancyStatus === 'Kunjungan' ? 'bg-amber-100 text-amber-800' :
                          'bg-purple-100 text-purple-800'
                        }`}>
                          {resident.occupancyStatus}
                        </span>
                      </td>
                      <td className="p-4 text-gray-500">
                        {user ? (
                          <a 
                            href={getWaLink(resident.whatsapp)} 
                            target="_blank" 
                            rel="noreferrer" 
                            className="text-emerald-600 hover:text-emerald-700 flex items-center gap-1.5 font-semibold"
                          >
                            <MessageCircle size={16}/> {resident.whatsapp}
                          </a>
                        ) : (
                          <span className="text-gray-400 italic flex items-center gap-1">
                            🔒 Tersembunyi (Mode Tamu)
                          </span>
                        )}
                      </td>
                      <td className="p-4">
                        <button
                          onClick={() => {
                            if (!isAdmin) return;
                            if (!isBendahara) {
                              toast.error('❌ Hak Akses Terbatas: Hanya Bendahara yang diizinkan memproses Kas.');
                              return;
                            }
                            paymentMutation.mutate({
                              id: resident.id,
                              isPaid: !resident.isPaidCurrentMonth,
                              month: selectedMonth,
                              year: selectedYear
                            });
                          }}
                          disabled={!isAdmin}
                          className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1 ${
                            resident.isPaidCurrentMonth ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {resident.isPaidCurrentMonth ? <Check size={14}/> : <X size={14}/>}
                          {resident.isPaidCurrentMonth ? 'Lunas' : 'Belum'}
                        </button>
                      </td>
                      <td className="p-4 font-black text-blue-600 text-xs">
                        Rp {(resident.eventDuesAmount || 0).toLocaleString('id-ID')}
                      </td>
                      <td className="p-4 text-xs text-gray-500 italic truncate max-w-[150px]">
                        {deserializeExtendedFields(resident.notes, !!user).rawNotes || '-'}
                      </td>
                      {isAdmin && (
                        <td className="p-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => { setSelectedResident(resident); setIsModalOpen(true); }}
                              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"
                              title="Edit"
                            >
                              <Edit size={16}/>
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`Hapus data warga ${resident.fullName}?`)) {
                                  deleteMutation.mutate(resident.id);
                                }
                              }}
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"
                              title="Hapus"
                            >
                              <Trash2 size={16}/>
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: REKAP BULANAN DENGAN BAR PENCARIAN DEDIKASI */}
      {activeTab === 'rekap' && (
        <div className="space-y-4">
          
          {/* Bar Pencarian di Laporan Rekap Bulanan */}
          <div className="bg-white p-4 rounded-2xl border shadow-sm flex gap-3 items-center">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-600" size={18} />
              <input
                type="text"
                placeholder="Cari nama warga atau blok di laporan rekap bulanan..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-emerald-200 text-sm bg-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="text-xs font-bold text-gray-400 hover:text-gray-600 underline whitespace-nowrap"
              >
                Reset Pencarian
              </button>
            )}
          </div>

          <div className="bg-white rounded-2xl border shadow-sm overflow-hidden animate-in fade-in duration-300">
            <div className="p-4 bg-gray-50 border-b flex flex-col md:flex-row justify-between md:items-center gap-2">
              <div>
                <p className="font-bold text-gray-800 text-sm">Rekapitulasi Setoran Kas Wajib (Rp 10.000/Bulan)</p>
                <p className="text-xs text-gray-500">
                  {isAdmin ? 'Klik pada sel iuran bulanan untuk mengubah status pembayaran.' : 'Laporan iuran warga berjalan.'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1 text-xs text-emerald-700 font-bold"><Check size={14}/> Lunas</span>
                <span className="flex items-center gap-1 text-xs text-red-500 font-bold"><X size={14}/> Belum</span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse min-w-[1000px]">
                <thead className="bg-gray-100 font-bold text-gray-600 uppercase border-b text-[10px]">
                  <tr>
                    <th className="p-3 border-r">No.</th>
                    <th className="p-3 border-r min-w-[150px]">Nama Warga</th>
                    <th className="p-3 border-r">Blok</th>
                    {MONTH_NAMES.map((m) => (
                      <th key={m} className="p-2 border-r text-center">{m.substring(0, 3)}</th>
                    ))}
                    <th className="p-3 border-r text-center">Total</th>
                    <th className="p-3 text-center">Status Bayar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {processedResidents.map((r, index) => {
                    let payCount = 0;
                    return (
                      <tr key={r.id} className="hover:bg-gray-50/50">
                        <td className="p-3 border-r text-gray-400 font-bold">{index + 1}</td>
                        <td className="p-3 border-r font-bold text-gray-900">{r.fullName}</td>
                        <td className="p-3 border-r font-black text-gray-700">{r.blockNumber}</td>
                        
                        {Array.from({ length: 12 }, (_, i) => {
                          const monthNum = i + 1;
                          const isPaid = checkPaymentStatus(r.id, monthNum);
                          if (isPaid) payCount++;

                          return (
                            <td 
                              key={monthNum} 
                              onClick={() => handleCellClick(r.id, monthNum)}
                              className={`p-2 border-r text-center transition-all ${
                                isAdmin ? 'cursor-pointer hover:scale-110' : ''
                              } ${isPaid ? 'bg-emerald-50/50' : 'bg-rose-50/20'}`}
                            >
                              <div className="flex items-center justify-center">
                                {isPaid ? (
                                  <span className="bg-emerald-500 text-white rounded-full p-0.5" title="Lunas Rp 10.000">
                                    <Check size={10} strokeWidth={4}/>
                                  </span>
                                ) : (
                                  <span className="text-gray-300">
                                    <X size={10} strokeWidth={2}/>
                                  </span>
                                )}
                              </div>
                            </td>
                          );
                        })}

                        <td className="p-3 border-r text-center font-black text-emerald-600 bg-emerald-50/30">
                          Rp {(payCount * 10000).toLocaleString('id-ID')}
                        </td>
                        
                        <td className="p-3 text-center bg-gray-50/30">
                          <span className={`px-2 py-0.5 rounded-full font-black text-[10px] ${
                            payCount === 12 ? 'bg-emerald-100 text-emerald-800' :
                            payCount > 6 ? 'bg-blue-100 text-blue-800' :
                            payCount > 0 ? 'bg-amber-100 text-amber-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {payCount}/12
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      )}

      {/* TAB 3: PROFIL KEPENDUDUKAN LENGKAP DENGAN SUB-LIST KELUARGA INTERAKTIF */}
      {activeTab === 'advanced_profile' && (
        <div className="space-y-4 animate-in fade-in duration-300">
          
          {/* Bar Pencarian Kependudukan */}
          <div className="bg-white p-4 rounded-2xl border shadow-sm flex flex-col sm:flex-row gap-3 items-center">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-600" size={18} />
              <input
                type="text"
                placeholder="Cari berdasarkan nama, id rumah, plat nomor, pemilik asli, atau nama anggota keluarga serumah..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-emerald-200 text-sm bg-white"
                value={advancedSearch}
                onChange={(e) => setAdvancedSearch(e.target.value)}
              />
            </div>
            {advancedSearch && (
              <button 
                onClick={() => setAdvancedSearch('')}
                className="text-xs font-bold text-gray-400 hover:text-gray-600 underline whitespace-nowrap"
              >
                Reset Pencarian
              </button>
            )}
          </div>

          <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
            <div className="p-4 bg-gray-50 border-b flex justify-between items-center flex-wrap gap-2">
              <div>
                <h3 className="font-bold text-gray-800 text-sm">Dashboard Informasi Identitas Warga (Lengkap)</h3>
                <p className="text-xs text-gray-500">
                  Hasil penyaringan: {filteredAdvancedResidents.length} KK. Klik ikon panah pada nama untuk melihat detail anggota keluarga serumah.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse min-w-[1400px]">
                <thead className="bg-gray-100 font-bold text-gray-600 uppercase border-b text-[10px]">
                  <tr>
                    <th className="p-3 border-r w-[50px] text-center">Detail</th>
                    <th className="p-3 border-r">Nama Lengkap</th>
                    <th className="p-3 border-r">ID Rumah</th>
                    <th className="p-3 border-r min-w-[200px]">Anggota Serumah</th> {/* KOLOM ANGGOTA SERUMAH LANGSUNG */}
                    <th className="p-3 border-r">Jenis Kelamin</th>
                    <th className="p-3 border-r">Peran</th>
                    <th className="p-3 border-r">Tempat, Tgl Lahir</th>
                    <th className="p-3 border-r">Agama</th>
                    <th className="p-3 border-r">Darah</th>
                    <th className="p-3 border-r">Pekerjaan</th>
                    <th className="p-3 border-r">Status</th>
                    <th className="p-3 border-r">Pemilik Asli</th>
                    <th className="p-3 border-r">No. HP Pemilik</th>
                    <th className="p-3 border-r">Mulai Huni</th>
                    <th className="p-3 border-r">Kendaraan</th>
                    <th className="p-3 border-r">Plat Nomor</th>
                    <th className="p-3">Warna / Merk</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredAdvancedResidents.map((r) => {
                    // Proteksi Keamanan API: Mengirim !!user ke deseralisator
                    const { fields } = deserializeExtendedFields(r.notes, !!user);
                    const isExpanded = !!expandedRows[r.id];
                    const familyList: any[] = (fields as any).family_members_list || [];

                    return (
                      <React.Fragment key={r.id}>
                        {/* Baris Utama Kepala Keluarga */}
                        <tr className={`hover:bg-gray-50/50 transition-colors ${isExpanded ? 'bg-emerald-50/10' : ''}`}>
                          <td className="p-3 border-r text-center">
                            {familyList.length > 0 ? (
                              <button 
                                onClick={() => toggleRowExpansion(r.id)}
                                className="p-1 hover:bg-gray-200 rounded-lg text-emerald-700 transition-colors"
                                title="Lihat Anggota Keluarga Serumah"
                              >
                                {isExpanded ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}
                              </button>
                            ) : (
                              <span className="text-gray-300 font-bold text-[10px]">-</span>
                            )}
                          </td>
                          <td className="p-3 border-r font-bold text-gray-900">{r.fullName}</td>
                          <td className="p-3 border-r font-black text-emerald-800">{fields.id_rumah || r.blockNumber}</td>
                          
                          {/* MENAMPILKAN DAFTAR ANGGOTA SERUMAH LANGSUNG BERUPA LENCANA KECIL */}
                          <td className="p-3 border-r">
                            {familyList.length > 0 ? (
                              <div className="flex flex-wrap gap-1">
                                {familyList.map((f: any, fidx: number) => (
                                  <span 
                                    key={fidx} 
                                    className="bg-emerald-50 text-emerald-800 px-1.5 py-0.5 rounded text-[10px] font-bold border border-emerald-100 whitespace-nowrap"
                                    title={`${f.name} (${f.relation})`}
                                  >
                                    {f.relation}: {f.name}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span className="text-gray-400 italic text-[10px]">Hanya KK</span>
                            )}
                          </td>

                          <td className="p-3 border-r">{fields.jenis_kelamin || 'Laki-Laki'}</td>
                          <td className="p-3 border-r font-semibold text-gray-600">{fields.peran_keluarga || 'Kepala Keluarga'}</td>
                          <td className="p-3 border-r">{fields.tempat_tgl_lahir || '-'}</td>
                          <td className="p-3 border-r">{fields.agama || 'Islam'}</td>
                          <td className="p-3 border-r text-center font-bold text-rose-600">{fields.golongan_darah || 'O'}</td>
                          <td className="p-3 border-r">{fields.pekerjaan || '-'}</td>
                          <td className="p-3 border-r font-semibold text-blue-800">{fields.status_warga || 'Tetap'}</td>
                          <td className="p-3 border-r">{fields.nama_pemilik_asli || '-'}</td>
                          <td className="p-3 border-r text-gray-500">
                            {user ? (fields.no_hp_pemilik_asli || '-') : '🔒 Terproteksi'}
                          </td>
                          <td className="p-3 border-r text-gray-500">
                            {fields.tgl_mulai_huni ? formatToLocalIdDate(fields.tgl_mulai_huni) : '-'}
                          </td>
                          <td className="p-3 border-r font-bold text-indigo-700">{fields.jenis_kendaraan || 'Tidak Ada'}</td>
                          <td className="p-3 border-r font-mono font-bold text-gray-800">{fields.plat_nomor || '-'}</td>
                          <td className="p-3 text-gray-500">{fields.keterangan_warna_merk || '-'}</td>
                        </tr>

                        {/* Baris Ekspansi Detail Anggota Keluarga Serumah */}
                        {isExpanded && familyList.length > 0 && (
                          <tr className="bg-emerald-50/5 font-sans">
                            <td colSpan={17} className="p-4 bg-emerald-50/10 border-b border-emerald-100">
                              <div className="rounded-2xl border border-emerald-200/50 overflow-hidden bg-white shadow-md animate-in slide-in-from-top-2 duration-300">
                                <div className="bg-emerald-600 px-4 py-2.5 text-white flex items-center gap-2">
                                  <UserCheck size={16}/>
                                  <span className="font-bold text-xs uppercase tracking-wider">
                                    Daftar Anggota Keluarga Serumah ({r.fullName} - Blok {r.blockNumber})
                                  </span>
                                </div>
                                <div className="p-3">
                                  <table className="w-full text-left text-xs">
                                    <thead className="bg-gray-50 text-gray-500 font-bold uppercase text-[9px] border-b">
                                      <tr>
                                        <th className="p-2.5">Nama Anggota</th>
                                        <th className="p-2.5">Hubungan</th>
                                        <th className="p-2.5">Kontak (HP/WA)</th>
                                        <th className="p-2.5">Jenis Kelamin</th>
                                        <th className="p-2.5">Tempat, Tgl Lahir</th>
                                        <th className="p-2.5">Agama</th>
                                        <th className="p-2.5 text-center">Gol. Darah</th>
                                        <th className="p-2.5">Pekerjaan</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                      {familyList.map((f: any, idx: number) => (
                                        <tr key={idx} className="hover:bg-gray-50">
                                          <td className="p-2.5 font-bold text-gray-900">{f.name}</td>
                                          <td className="p-2.5">
                                            <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase">
                                              {f.relation}
                                            </span>
                                          </td>
                                          <td className="p-2.5 font-semibold text-gray-600">
                                            {user ? (f.phone || '-') : '🔒 Terproteksi'}
                                          </td>
                                          <td className="p-2.5 text-gray-500">{f.gender || 'Perempuan'}</td>
                                          <td className="p-2.5 text-gray-500">{f.birth_place || '-'}</td>
                                          <td className="p-2.5 text-gray-500">{f.religion || 'Islam'}</td>
                                          <td className="p-2.5 text-center font-bold text-rose-500">{f.blood_type || 'O'}</td>
                                          <td className="p-2.5 text-gray-500">{f.job || '-'}</td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Modal CRUD */}
      {isModalOpen && (
        <ResidentModal
          resident={selectedResident}
          isOpen={isModalOpen}
          onClose={() => { setSelectedResident(null); setIsModalOpen(false); }}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['residents'] });
            queryClient.invalidateQueries({ queryKey: ['allPayments'] });
            setIsModalOpen(false);
            setSelectedResident(null);
          }}
        />
      )}
    </div>
  );
};
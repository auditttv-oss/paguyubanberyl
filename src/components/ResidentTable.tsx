import React, { useState, useMemo } from 'react';
import { ResidentWithPayment } from '../types';
import { 
  Trash2, 
  MessageCircle, 
  ArrowUpDown, 
  ShieldOff, 
  Search, 
  Lock, 
  CheckCircle2, 
  XCircle,
  Edit2,
  Save,
  X,
  Info,
  Users,
  Home,
  TrendingUp,
  PieChart,
  BarChart3,
  Percent,
  Wallet
} from 'lucide-react';

interface ResidentTableProps {
  residents: ResidentWithPayment[];
  onUpdate: (updatedResident: ResidentWithPayment) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onTogglePayment: (resident: ResidentWithPayment) => Promise<void>;
  isReadOnly?: boolean;
  selectedMonthName: string;
}

type SortKey = 'blockNumber' | 'fullName' | 'occupancyStatus' | 'isPaidCurrentMonth' | 'eventDuesAmount';

export const ResidentTable: React.FC<ResidentTableProps> = ({ 
  residents, 
  onUpdate, 
  onDelete, 
  onTogglePayment, 
  isReadOnly = false, 
  selectedMonthName 
}) => {
  // --- STATE ---
  const [filter, setFilter] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('blockNumber');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<ResidentWithPayment>>({});

  // --- LOGIKA SORTING ---
  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
  };

  // --- LOGIKA EDITING ---
  const startEdit = (resident: ResidentWithPayment) => {
    setEditingId(resident.id);
    setEditForm({ ...resident });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const saveEdit = async () => {
    if (editingId && editForm) {
      await onUpdate(editForm as ResidentWithPayment);
      setEditingId(null);
      setEditForm({});
    }
  };

  // --- PEMROSESAN DATA (Filter & Sort) ---
  const processedResidents = useMemo(() => {
    let result = residents.filter(r => 
      r.fullName.toLowerCase().includes(filter.toLowerCase()) || 
      r.blockNumber.toLowerCase().includes(filter.toLowerCase())
    );

    result.sort((a: any, b: any) => {
      let valA = a[sortKey];
      let valB = b[sortKey];

      if (sortKey === 'blockNumber') {
        return sortOrder === 'asc' 
          ? valA.localeCompare(valB, undefined, { numeric: true })
          : valB.localeCompare(valA, undefined, { numeric: true });
      }

      if (typeof valA === 'string') {
        return sortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }

      return sortOrder === 'asc' ? (valA > valB ? 1 : -1) : (valA < valB ? 1 : -1);
    });

    return result;
  }, [residents, filter, sortKey, sortOrder]);

  // --- STATISTIK INFORMASI ---
  const stats = useMemo(() => {
    const totalResidents = processedResidents.length;
    const paidResidents = processedResidents.filter(r => r.isPaidCurrentMonth).length;
    const unpaidResidents = totalResidents - paidResidents;
    const paymentRate = totalResidents > 0 ? Math.round((paidResidents / totalResidents) * 100) : 0;
    
    // Hitung per status hunian
    const statusCounts: Record<string, number> = {};
    processedResidents.forEach(r => {
      statusCounts[r.occupancyStatus] = (statusCounts[r.occupancyStatus] || 0) + 1;
    });
    
    const statusStats = Object.entries(statusCounts).map(([status, count]) => ({
      status,
      count,
      percentage: totalResidents > 0 ? Math.round((count / totalResidents) * 100) : 0
    }));

    // Total iuran acara
    const totalEventDues = processedResidents.reduce((sum, r) => sum + (r.eventDuesAmount || 0), 0);

    return {
      totalResidents,
      paidResidents,
      unpaidResidents,
      paymentRate,
      statusStats,
      totalEventDues
    };
  }, [processedResidents]);

  // PERBAIKAN: Fungsi untuk menentukan warna status hunian
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Menetap':
        return 'bg-blue-100 text-blue-700';
      case 'Penyewa':
        return 'bg-emerald-100 text-emerald-700';
      case 'Kunjungan':
        return 'bg-amber-100 text-amber-700';
      case 'Ditempati 2026':
        return 'bg-purple-100 text-purple-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden animate-in fade-in duration-500">
      
      {/* INFOGRAFIS STATISTIK */}
      <div className="p-6 border-b bg-gradient-to-r from-gray-50 to-blue-50">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-bold text-lg text-gray-700 flex items-center gap-2">
            <BarChart3 size={20} /> Data Statistik Warga
          </h3>
          <p className="text-sm text-gray-500">Periode: {selectedMonthName}</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Total Warga */}
          <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Total Warga</p>
                <p className="text-2xl font-black text-gray-800 mt-1">{stats.totalResidents} KK</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="text-blue-600" size={20} />
              </div>
            </div>
          </div>

          {/* Status Pembayaran */}
          <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Status Iuran</p>
                <div className="flex items-center gap-4 mt-1">
                  <div className="text-center">
                    <p className="text-lg font-black text-emerald-600">{stats.paidResidents}</p>
                    <p className="text-xs text-emerald-600">Lunas</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-black text-rose-600">{stats.unpaidResidents}</p>
                    <p className="text-xs text-rose-600">Belum</p>
                  </div>
                </div>
              </div>
              <div className="p-3 bg-emerald-100 rounded-lg">
                <Percent className="text-emerald-600" size={20} />
              </div>
            </div>
            <div className="mt-3">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${stats.paymentRate}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-1 text-right">
                Rasio: <span className="font-bold">{stats.paymentRate}%</span>
              </p>
            </div>
          </div>

          {/* Total Iuran Acara */}
          <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Iuran Acara</p>
                <p className="text-xl font-black text-purple-600 mt-1">
                  Rp {stats.totalEventDues.toLocaleString('id-ID')}
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <Wallet className="text-purple-600" size={20} />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {stats.totalResidents > 0 
                ? `Rata-rata: Rp ${Math.round(stats.totalEventDues / stats.totalResidents).toLocaleString('id-ID')}/KK`
                : 'Belum ada data'
              }
            </p>
          </div>

          {/* Status Hunian */}
          <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Status Hunian</p>
                <p className="text-lg font-black text-gray-800 mt-1">
                  {stats.statusStats.length} Kategori
                </p>
              </div>
              <div className="p-3 bg-amber-100 rounded-lg">
                <Home className="text-amber-600" size={20} />
              </div>
            </div>
          </div>
        </div>

        {/* Detail Status Hunian */}
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
          <h4 className="font-bold text-gray-700 mb-3 flex items-center gap-2">
            <PieChart size={16} /> Distribusi Status Hunian
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {stats.statusStats.map((item, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">{item.status}</span>
                  <span className="text-xs font-bold bg-gray-100 px-2 py-1 rounded">
                    {item.percentage}%
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div 
                      className="h-2 rounded-full"
                      style={{ 
                        width: `${item.percentage}%`,
                        backgroundColor: index === 0 ? '#3b82f6' : 
                                        index === 1 ? '#10b981' : 
                                        index === 2 ? '#f59e0b' : 
                                        '#ef4444'
                      }}
                    ></div>
                  </div>
                  <span className="text-xs font-bold text-gray-600">{item.count}</span>
                </div>
                <p className="text-xs text-gray-500">
                  {item.count} KK ({item.percentage}%)
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* HEADER TABEL */}
      <div className="p-6 border-b flex flex-col sm:flex-row justify-between items-center gap-4 bg-white">
        <h3 className="font-bold text-lg text-gray-700 flex items-center gap-2">
          <Users size={20} /> Data Warga & Status Bayar
          <span className="text-sm font-normal text-gray-500">({selectedMonthName})</span>
        </h3>
        <div className="relative w-full sm:w-80">
          <input 
            placeholder="Cari nama atau blok..." 
            className="w-full pl-4 pr-10 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none" 
            value={filter} 
            onChange={e => setFilter(e.target.value)} 
          />
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18}/>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-[11px] text-left">
          <thead className="bg-gray-50 text-gray-600 font-bold border-b">
            <tr>
              <th className="px-4 py-4 uppercase">No</th>
              <th className="px-4 py-4 uppercase cursor-pointer" onClick={() => handleSort('blockNumber')}>
                Blok <ArrowUpDown size={12} className="inline ml-1"/>
              </th>
              <th className="px-4 py-4 uppercase cursor-pointer" onClick={() => handleSort('fullName')}>
                Nama Lengkap <ArrowUpDown size={12} className="inline ml-1"/>
              </th>
              <th className="px-4 py-4 uppercase">No. WA</th>
              <th className="px-4 py-4 uppercase cursor-pointer" onClick={() => handleSort('occupancyStatus')}>
                Status Hunian <ArrowUpDown size={12} className="inline ml-1"/>
              </th>
              <th className="px-4 py-4 uppercase text-center cursor-pointer bg-blue-50/50" onClick={() => handleSort('isPaidCurrentMonth')}>
                Iuran {selectedMonthName.split(' ')[0]} <br/> (10RB) <ArrowUpDown size={12} className="inline ml-1"/>
              </th>
              <th className="px-4 py-4 uppercase text-center cursor-pointer" onClick={() => handleSort('eventDuesAmount')}>
                Iuran Acara <br/> (Sukarela) <ArrowUpDown size={12} className="inline ml-1"/>
              </th>
              <th className="px-4 py-4 uppercase">Catatan</th>
              {!isReadOnly && <th className="px-4 py-4 uppercase text-center">Aksi</th>}
            </tr>
          </thead>
          
          <tbody className="divide-y divide-gray-100">
            {processedResidents.map((r, index) => {
              const isEditing = editingId === r.id;

              return (
                <tr key={r.id} className={`transition-all ${isEditing ? 'bg-emerald-50/50' : 'hover:bg-gray-50'}`}>
                  <td className="px-4 py-4 text-gray-400">{index + 1}</td>
                  
                  {/* BLOK */}
                  <td className="px-4 py-4 font-bold text-gray-700">
                    {isEditing ? (
                      <input 
                        className="border border-gray-300 rounded px-2 py-1 w-16 outline-none focus:ring-2 focus:ring-emerald-500" 
                        value={editForm.blockNumber} 
                        onChange={e => setEditForm({...editForm, blockNumber: e.target.value})} 
                      />
                    ) : r.blockNumber}
                  </td>

                  {/* NAMA */}
                  <td className="px-4 py-4 font-bold text-gray-800">
                    {isEditing ? (
                      <input 
                        className="border border-gray-300 rounded px-2 py-1 w-full outline-none focus:ring-2 focus:ring-emerald-500" 
                        value={editForm.fullName} 
                        onChange={e => setEditForm({...editForm, fullName: e.target.value})} 
                      />
                    ) : r.fullName}
                  </td>

                  {/* WA */}
                  <td className="px-4 py-4">
                    {isReadOnly ? (
                      <span className="text-gray-300 italic flex items-center gap-1">
                        <Lock size={10} /> Terproteksi
                      </span>
                    ) : (
                      isEditing ? (
                        <input 
                          className="border border-gray-300 rounded px-2 py-1 w-full outline-none focus:ring-2 focus:ring-emerald-500" 
                          value={editForm.whatsapp} 
                          onChange={e => setEditForm({...editForm, whatsapp: e.target.value})} 
                        />
                      ) : (
                        r.whatsapp ? (
                          <a 
                            href={`https://wa.me/${r.whatsapp.replace(/\D/g,'')}`} 
                            target="_blank" 
                            rel="noreferrer" 
                            className="text-emerald-600 hover:text-emerald-800 flex items-center gap-1 transition-colors"
                          >
                            <MessageCircle size={14}/> {r.whatsapp}
                          </a>
                        ) : '-'
                      )
                    )}
                  </td>

                  {/* STATUS HUNIAN - PERBAIKAN: Gunakan getStatusColor */}
                  <td className="px-4 py-4">
                    <span className={`px-3 py-1 rounded-full font-bold text-[10px] ${getStatusColor(r.occupancyStatus)}`}>
                      {r.occupancyStatus}
                    </span>
                  </td>

                  {/* IURAN WAJIB */}
                  <td className="px-4 py-4 text-center bg-blue-50/20">
                    <button 
                      disabled={isReadOnly || isEditing} 
                      onClick={() => onTogglePayment(r)} 
                      className={`px-4 py-1.5 rounded-full font-bold border transition-all ${
                        r.isPaidCurrentMonth 
                          ? 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100' 
                          : 'bg-rose-50 text-rose-500 border-rose-100 hover:bg-rose-100'
                      } ${(isReadOnly || isEditing) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                      {r.isPaidCurrentMonth ? (
                        <>
                          <CheckCircle2 size={12} className="inline mr-1"/> Lunas
                        </>
                      ) : (
                        <>
                          <XCircle size={12} className="inline mr-1"/> Belum
                        </>
                      )}
                    </button>
                  </td>

                  {/* IURAN SUKARELA */}
                  <td className="px-4 py-4 text-center font-bold">
                    {isEditing ? (
                      <div className="relative">
                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500 text-xs">Rp</span>
                        <input 
                          type="number" 
                          className="border border-gray-300 rounded px-2 py-1 pl-6 w-24 text-center outline-none focus:ring-2 focus:ring-emerald-500" 
                          value={editForm.eventDuesAmount} 
                          onChange={e => setEditForm({...editForm, eventDuesAmount: Number(e.target.value)})} 
                        />
                      </div>
                    ) : (
                      <div className={`px-4 py-1.5 rounded-lg inline-block ${
                        r.eventDuesAmount > 0 
                          ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' 
                          : 'bg-gray-100 text-gray-400 border border-gray-200'
                      }`}>
                        Rp {r.eventDuesAmount.toLocaleString('id-ID')}
                      </div>
                    )}
                  </td>

                  {/* KOLOM CATATAN */}
                  <td className="px-4 py-4 text-gray-500 italic max-w-xs">
                    {isEditing ? (
                      <textarea 
                        className="border border-gray-300 rounded px-2 py-1 w-full outline-none focus:ring-2 focus:ring-emerald-500 italic" 
                        value={editForm.notes || ''} 
                        onChange={e => setEditForm({...editForm, notes: e.target.value})} 
                        placeholder="Tambahkan catatan..."
                        rows={2}
                      />
                    ) : (
                      r.notes ? (
                        <div className="group relative">
                          <span className="truncate block max-w-[150px]">{r.notes}</span>
                          {r.notes.length > 20 && (
                            <div className="absolute left-0 top-full mt-1 hidden group-hover:block bg-gray-900 text-white text-xs p-2 rounded-lg z-10 max-w-xs whitespace-normal">
                              {r.notes}
                            </div>
                          )}
                        </div>
                      ) : '-'
                    )}
                  </td>

                  {/* AKSI */}
                  {!isReadOnly && (
                    <td className="px-4 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {isEditing ? (
                          <>
                            <button 
                              onClick={saveEdit} 
                              className="text-emerald-600 p-1.5 hover:bg-emerald-100 rounded-lg transition-colors"
                              title="Simpan perubahan"
                            >
                              <Save size={18}/>
                            </button>
                            <button 
                              onClick={cancelEdit} 
                              className="text-gray-400 p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                              title="Batalkan edit"
                            >
                              <X size={18}/>
                            </button>
                          </>
                        ) : (
                          <>
                            <button 
                              onClick={() => startEdit(r)} 
                              className="text-blue-400 p-1.5 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Edit data warga"
                            >
                              <Edit2 size={16}/>
                            </button>
                            <button 
                              onClick={() => onDelete(r.id)} 
                              className="text-rose-300 p-1.5 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                              title="Hapus data warga"
                            >
                              <Trash2 size={16}/>
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* FOOTER INFO */}
      <div className="p-4 bg-gray-50 border-t border-gray-100">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
              <span>Lunas: {stats.paidResidents}</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-rose-500"></div>
              <span>Belum: {stats.unpaidResidents}</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span>Total: {stats.totalResidents} KK</span>
            </div>
          </div>
          
          <div className="text-sm text-gray-500">
            {isReadOnly ? (
              <div className="flex items-center gap-2 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-100">
                <Info size={14} className="text-amber-600"/>
                <p className="text-xs font-bold text-amber-700 uppercase tracking-widest">
                  Mode Tamu - Beberapa data disembunyikan
                </p>
              </div>
            ) : (
              <p className="text-xs">
                Ditampilkan {processedResidents.length} dari {residents.length} warga
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
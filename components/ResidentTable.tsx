import React, { useState, useMemo } from 'react';
import { Resident, OccupancyStatus } from '../types';
import { OCCUPANCY_OPTIONS } from '../constants';
import { CheckCircle, XCircle, Trash2, Edit2, Save, X, MessageCircle } from 'lucide-react';

interface ResidentTableProps {
  residents: Resident[];
  onUpdate: (updatedResident: Resident) => void;
  onDelete: (id: string) => void;
  isReadOnly?: boolean;
}

export const ResidentTable: React.FC<ResidentTableProps> = ({ residents, onUpdate, onDelete, isReadOnly = false }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Resident>>({});
  const [filter, setFilter] = useState('');

  const handleEditClick = (resident: Resident) => {
    setEditingId(resident.id);
    setEditForm({ ...resident });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const handleSaveEdit = () => {
    if (editingId && editForm) {
      onUpdate(editForm as Resident);
      setEditingId(null);
    }
  };

  const toggleStatus = (resident: Resident, field: 'monthlyDuesPaid') => {
    if (isReadOnly) return;
    onUpdate({
      ...resident,
      [field]: !resident[field],
      updatedAt: Date.now()
    });
  };

  const getWhatsAppLink = (number: string) => {
    if (!number) return '#';
    // Remove non-numeric chars
    let cleanNumber = number.replace(/\D/g, '');
    // Replace leading 0 with 62
    if (cleanNumber.startsWith('0')) {
      cleanNumber = '62' + cleanNumber.slice(1);
    }

    // Determine message based on role
    const message = isReadOnly 
      ? "Assalamu alaikum , Selamat ......, Halo Salam Kenal saya dari ...... ..."
      : "Assalamu alaikum, Selamat ..... , maaf kami dari pengurus paguyuban ingin ..........";

    return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;
  };

  const getStatusColor = (status: OccupancyStatus) => {
    switch (status) {
      case 'Menetap': return 'bg-blue-100 text-blue-800';
      case 'Penyewa': return 'bg-yellow-100 text-yellow-800';
      case 'Kunjungan': return 'bg-purple-100 text-purple-800';
      case 'Ditempati 2026': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Filter and Sort Logic
  const processedResidents = useMemo(() => {
    // 1. Filter
    const filtered = residents.filter(r => 
      r.fullName.toLowerCase().includes(filter.toLowerCase()) ||
      r.blockNumber.toLowerCase().includes(filter.toLowerCase())
    );
    
    // 2. Sort Alphabetically by Name
    return filtered.sort((a, b) => a.fullName.localeCompare(b.fullName));
  }, [residents, filter]);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-4 border-b border-gray-200 bg-gray-50 flex flex-col sm:flex-row justify-between items-center gap-4">
        <h3 className="font-semibold text-gray-700">Daftar Warga Cluster Beryl</h3>
        <input 
          type="text" 
          placeholder="Cari nama atau blok..." 
          className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-beryl-500 focus:outline-none w-full sm:w-64"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-gray-700 uppercase bg-gray-100">
            <tr>
              <th className="px-4 py-3 w-12 text-center">No</th>
              <th className="px-4 py-3">Blok</th>
              <th className="px-4 py-3">Nama Lengkap</th>
              <th className="px-4 py-3">No. WA</th>
              <th className="px-4 py-3">Status Hunian</th>
              <th className="px-4 py-3 text-center">Iuran Wajib<br/>(10rb)</th>
              <th className="px-4 py-3 text-center">Iuran Acara<br/>(Sukarela)</th>
              <th className="px-4 py-3">Catatan</th>
              {!isReadOnly && <th className="px-4 py-3 text-center">Aksi</th>}
            </tr>
          </thead>
          <tbody>
            {processedResidents.length === 0 ? (
              <tr>
                <td colSpan={isReadOnly ? 8 : 9} className="px-4 py-8 text-center text-gray-500">
                  Data tidak ditemukan.
                </td>
              </tr>
            ) : (
              processedResidents.map((resident, index) => {
                const isEditing = editingId === resident.id;

                if (isEditing) {
                  return (
                    <tr key={resident.id} className="bg-beryl-50 border-b">
                      <td className="px-2 py-2 text-center text-gray-400">{index + 1}</td>
                      <td className="px-2 py-2">
                        <input 
                          value={editForm.blockNumber} 
                          onChange={e => setEditForm({...editForm, blockNumber: e.target.value})}
                          className="w-full p-1 border rounded"
                        />
                      </td>
                      <td className="px-2 py-2">
                        <input 
                          value={editForm.fullName} 
                          onChange={e => setEditForm({...editForm, fullName: e.target.value})}
                          className="w-full p-1 border rounded"
                        />
                      </td>
                      <td className="px-2 py-2">
                        <input 
                          value={editForm.whatsapp} 
                          onChange={e => setEditForm({...editForm, whatsapp: e.target.value})}
                          className="w-full p-1 border rounded"
                          placeholder="08..."
                        />
                      </td>
                      <td className="px-2 py-2">
                        <select 
                          value={editForm.occupancyStatus}
                          onChange={e => setEditForm({...editForm, occupancyStatus: e.target.value as OccupancyStatus})}
                          className="w-full p-1 border rounded"
                        >
                          {OCCUPANCY_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                        </select>
                      </td>
                      <td className="px-2 py-2 text-center text-gray-400">
                         (Edit tombol)
                      </td>
                      <td className="px-2 py-2 text-center">
                        <input 
                          type="number"
                          value={editForm.eventDuesAmount} 
                          onChange={e => setEditForm({...editForm, eventDuesAmount: Number(e.target.value)})}
                          className="w-full p-1 border rounded text-right"
                          placeholder="0"
                        />
                      </td>
                      <td className="px-2 py-2">
                         <input 
                          value={editForm.notes} 
                          onChange={e => setEditForm({...editForm, notes: e.target.value})}
                          className="w-full p-1 border rounded"
                        />
                      </td>
                      <td className="px-2 py-2 flex justify-center gap-2">
                        <button onClick={handleSaveEdit} className="text-green-600 hover:text-green-800"><Save size={18} /></button>
                        <button onClick={handleCancelEdit} className="text-red-500 hover:text-red-700"><X size={18} /></button>
                      </td>
                    </tr>
                  );
                }

                return (
                  <tr key={resident.id} className="bg-white border-b hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-center text-gray-500 font-mono text-xs">{index + 1}</td>
                    <td className="px-4 py-3 font-medium text-gray-900">{resident.blockNumber}</td>
                    <td className="px-4 py-3 font-medium text-gray-900">{resident.fullName}</td>
                    <td className="px-4 py-3 text-gray-500">
                      {resident.whatsapp ? (
                        <a 
                          href={getWhatsAppLink(resident.whatsapp)} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-green-600 hover:text-green-800 hover:underline transition-all"
                        >
                          <MessageCircle size={14} />
                          {resident.whatsapp}
                        </a>
                      ) : '-'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(resident.occupancyStatus)}`}>
                        {resident.occupancyStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button 
                        disabled={isReadOnly}
                        onClick={() => toggleStatus(resident, 'monthlyDuesPaid')}
                        className={`flex items-center justify-center gap-1 mx-auto px-3 py-1 rounded-full text-xs font-bold transition-all
                        ${resident.monthlyDuesPaid ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}
                        ${!isReadOnly ? 'hover:scale-105 cursor-pointer' : 'cursor-default opacity-90'}`}
                      >
                        {resident.monthlyDuesPaid ? (
                          <><CheckCircle size={14} /> Sudah</>
                        ) : (
                          <><XCircle size={14} /> Belum</>
                        )}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-center">
                       <div 
                        className={`flex items-center justify-center gap-1 mx-auto px-3 py-1 rounded-full text-xs font-bold transition-all border
                        ${(resident.eventDuesAmount || 0) > 0 
                          ? 'bg-beryl-100 text-beryl-700 border-beryl-200' 
                          : 'bg-gray-100 text-gray-500 border-gray-200'}`}
                      >
                         {(resident.eventDuesAmount || 0) > 0 ? (
                          <><CheckCircle size={14} /> Rp {resident.eventDuesAmount.toLocaleString('id-ID')}</>
                        ) : (
                          <><XCircle size={14} /> Rp 0</>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600 italic truncate max-w-[150px]">
                      {resident.notes || '-'}
                    </td>
                    {!isReadOnly && (
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-3">
                          <button onClick={() => handleEditClick(resident)} className="text-blue-500 hover:text-blue-700">
                            <Edit2 size={18} />
                          </button>
                          <button onClick={() => onDelete(resident.id)} className="text-red-500 hover:text-red-700">
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
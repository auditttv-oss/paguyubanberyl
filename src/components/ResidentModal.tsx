import React, { useState, useEffect } from 'react';
import { X, Save, Home, Key, Clock, MapPin, ClipboardList } from 'lucide-react';
import { createResident, updateResident } from '../services/dataService';
import { OccupancyStatus, Resident } from '../types';
import { useAuth } from '../contexts/AuthContext';

interface Props {
  resident: Resident | null; // Data warga untuk diedit (null jika tambah baru)
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const ResidentModal: React.FC<Props> = ({ resident, isOpen, onClose, onSuccess }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  
  // State Form
  const [form, setForm] = useState({
    fullName: '',
    blockNumber: '',
    whatsapp: '',
    occupancyStatus: 'Menetap' as OccupancyStatus,
    eventDuesAmount: 0,
    notes: ''
  });

  // EFFECT: Masukkan data ke form jika mode EDIT (resident tidak null)
  useEffect(() => {
    if (resident) {
      setForm({
        fullName: resident.fullName || '',
        blockNumber: resident.blockNumber || '',
        whatsapp: resident.whatsapp || '',
        occupancyStatus: resident.occupancyStatus || 'Menetap',
        eventDuesAmount: resident.eventDuesAmount || 0,
        notes: resident.notes || ''
      });
    }
  }, [resident]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (resident?.id) {
        // JIKA ADA ID -> JALANKAN UPDATE
        await updateResident({ ...form, id: resident.id });
        alert("✅ Data warga berhasil diperbarui!");
      } else {
        // JIKA TIDAK ADA ID -> JALANKAN CREATE
        await createResident(form);
        alert("✅ Warga baru berhasil ditambahkan!");
      }
      onSuccess();
    } catch (err: any) {
      alert("❌ Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-emerald-950/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in duration-300">
        {/* HEADER */}
        <div className="bg-emerald-900 p-8 text-white flex justify-between items-center">
          <div>
            <h3 className="text-2xl font-black uppercase tracking-tight">
              {resident ? 'Edit Data Warga' : 'Tambah Warga Baru'}
            </h3>
            <p className="text-emerald-300 text-xs font-bold uppercase">Cluster Beryl Management</p>
          </div>
          <button onClick={onClose} className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors">
            <X size={20}/>
          </button>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="p-8 space-y-5 max-h-[70vh] overflow-y-auto custom-scrollbar">
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-gray-400 ml-1 tracking-widest">Nama Lengkap</label>
            <input required className="w-full bg-gray-50 border-none p-4 rounded-2xl focus:ring-2 focus:ring-emerald-500 font-bold text-emerald-900" 
              value={form.fullName} onChange={e => setForm({...form, fullName: e.target.value})} placeholder="Nama warga..." />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-gray-400 ml-1 tracking-widest">Blok Rumah</label>
              <input required className="w-full bg-gray-50 border-none p-4 rounded-2xl focus:ring-2 focus:ring-emerald-500 font-bold text-emerald-900" 
                value={form.blockNumber} onChange={e => setForm({...form, blockNumber: e.target.value})} placeholder="Contoh: A1/01" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-gray-400 ml-1 tracking-widest">No. WhatsApp</label>
              <input required className="w-full bg-gray-50 border-none p-4 rounded-2xl focus:ring-2 focus:ring-emerald-500 font-bold text-emerald-900" 
                value={form.whatsapp} onChange={e => setForm({...form, whatsapp: e.target.value})} placeholder="0812..." />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-gray-400 ml-1 tracking-widest">Status Hunian</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'Menetap', icon: <Home size={14}/> },
                { id: 'Penyewa', icon: <Key size={14}/> },
                { id: 'Kunjungan', icon: <Clock size={14}/> },
                { id: 'Ditempati 2026', icon: <MapPin size={14}/> }
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setForm({...form, occupancyStatus: opt.id as OccupancyStatus})}
                  className={`flex items-center justify-center gap-2 p-3 rounded-xl text-[10px] font-black uppercase border-2 transition-all ${
                    form.occupancyStatus === opt.id 
                    ? 'bg-emerald-900 text-white border-emerald-900 shadow-lg' 
                    : 'bg-white text-gray-400 border-gray-100 hover:border-emerald-200'
                  }`}
                >
                  {opt.icon} {opt.id}
                </button>
              ))}
            </div>
          </div>

          {/* Kolom Iuran Sukarela - Hanya untuk user login */}
          {user && (
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-gray-400 ml-1 tracking-widest">Iuran Sukarela (Nominal)</label>
              <input type="number" required className="w-full bg-emerald-50 border-none p-4 rounded-2xl focus:ring-2 focus:ring-emerald-500 font-black text-emerald-900 text-xl" 
                value={form.eventDuesAmount} onChange={e => setForm({...form, eventDuesAmount: parseInt(e.target.value) || 0})} />
            </div>
          )}

          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-gray-400 ml-1 tracking-widest">Keterangan Tambahan</label>
            <textarea rows={2} className="w-full bg-gray-50 border-none p-4 rounded-2xl focus:ring-2 focus:ring-emerald-500 font-medium text-gray-600" 
              value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} placeholder="Catatan untuk warga ini..." />
          </div>

          <button
            disabled={loading}
            className="w-full bg-emerald-600 text-white font-black py-5 rounded-[2rem] shadow-xl shadow-emerald-100 hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 tracking-widest uppercase active:scale-95 disabled:opacity-50"
          >
            {loading ? 'MENYIMPAN...' : <><Save size={20}/> {resident ? 'PERBARUI DATA' : 'SIMPAN WARGA'}</>}
          </button>
        </form>
      </div>
    </div>
  );
};
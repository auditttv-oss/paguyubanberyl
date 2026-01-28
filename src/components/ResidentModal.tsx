import React, { useState, useEffect } from 'react';
import { X, Save, Home, Key, Clock, MapPin, ClipboardList, Phone, User } from 'lucide-react';
import { createResident, updateResident } from '../services/dataService';
import { OccupancyStatus, Resident } from '../types';
import { useAuth } from '../contexts/AuthContext';

interface Props {
  resident: Resident | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const ResidentModal: React.FC<Props> = ({ resident, isOpen, onClose, onSuccess }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  
  const [form, setForm] = useState({
    fullName: '',
    blockNumber: '',
    whatsapp: '',
    occupancyStatus: 'Menetap' as OccupancyStatus,
    eventDuesAmount: 0,
    notes: ''
  });

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      if (resident) {
        setForm({
          fullName: resident.fullName || '',
          blockNumber: resident.blockNumber || '',
          whatsapp: resident.whatsapp || '',
          occupancyStatus: resident.occupancyStatus || 'Menetap',
          eventDuesAmount: resident.eventDuesAmount || 0,
          notes: resident.notes || ''
        });
      } else {
        setForm({
          fullName: '',
          blockNumber: '',
          whatsapp: '',
          occupancyStatus: 'Menetap',
          eventDuesAmount: 0,
          notes: ''
        });
      }
      setErrors({});
    }
  }, [resident, isOpen]);

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!form.fullName.trim()) {
      newErrors.fullName = 'Nama wajib diisi';
    }
    
    if (!form.blockNumber.trim()) {
      newErrors.blockNumber = 'Blok rumah wajib diisi';
    }
    
    if (!form.whatsapp.trim()) {
      newErrors.whatsapp = 'Nomor WhatsApp wajib diisi';
    } else if (!/^[0-9+]{10,15}$/.test(form.whatsapp.replace(/\D/g, ''))) {
      newErrors.whatsapp = 'Format nomor WhatsApp tidak valid';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    try {
      const formattedData = {
        ...form,
        whatsapp: form.whatsapp.replace(/\D/g, '').replace(/^0+/, '62'),
        eventDuesAmount: Number(form.eventDuesAmount) || 0
      };

      if (resident?.id) {
        await updateResident({ ...formattedData, id: resident.id });
        toast.success('✅ Data warga berhasil diperbarui!', {
          duration: 3000,
          position: 'top-center'
        });
      } else {
        await createResident(formattedData);
        toast.success('✅ Warga baru berhasil ditambahkan!', {
          duration: 3000,
          position: 'top-center'
        });
      }
      
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Error saving resident:', err);
      toast.error(`❌ ${err.message || 'Gagal menyimpan data'}`, {
        duration: 4000,
        position: 'top-center'
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 animate-in fade-in duration-300 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden animate-in zoom-in duration-300">
        {/* HEADER */}
        <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 p-6 text-white">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-xl">
                <User size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold">
                  {resident ? 'Edit Data Warga' : 'Tambah Warga Baru'}
                </h3>
                <p className="text-emerald-100 text-sm">Cluster Beryl Management</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-full transition-colors duration-200"
              aria-label="Tutup modal"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
          {/* Full Name */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Nama Lengkap <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              className={`w-full px-4 py-3 rounded-xl border ${
                errors.fullName ? 'border-red-500' : 'border-gray-300'
              } focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-colors`}
              value={form.fullName}
              onChange={e => setForm({...form, fullName: e.target.value})}
              placeholder="Masukkan nama lengkap warga"
              disabled={loading}
            />
            {errors.fullName && (
              <p className="text-sm text-red-600">{errors.fullName}</p>
            )}
          </div>

          {/* Block Number & WhatsApp */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Blok Rumah <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                className={`w-full px-4 py-3 rounded-xl border ${
                  errors.blockNumber ? 'border-red-500' : 'border-gray-300'
                } focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-colors`}
                value={form.blockNumber}
                onChange={e => setForm({...form, blockNumber: e.target.value})}
                placeholder="Contoh: A1/01"
                disabled={loading}
              />
              {errors.blockNumber && (
                <p className="text-sm text-red-600">{errors.blockNumber}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                WhatsApp <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="tel"
                  required
                  className={`w-full pl-10 pr-4 py-3 rounded-xl border ${
                    errors.whatsapp ? 'border-red-500' : 'border-gray-300'
                  } focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-colors`}
                  value={form.whatsapp}
                  onChange={e => setForm({...form, whatsapp: e.target.value})}
                  placeholder="081234567890"
                  disabled={loading}
                />
              </div>
              {errors.whatsapp && (
                <p className="text-sm text-red-600">{errors.whatsapp}</p>
              )}
            </div>
          </div>

          {/* Occupancy Status */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Status Hunian
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'Menetap' as OccupancyStatus, icon: <Home size={16} />, label: 'Menetap' },
                { id: 'Penyewa' as OccupancyStatus, icon: <Key size={16} />, label: 'Penyewa' },
                { id: 'Kunjungan' as OccupancyStatus, icon: <Clock size={16} />, label: 'Kunjungan' },
                { id: 'Ditempati 2026' as OccupancyStatus, icon: <MapPin size={16} />, label: 'Ditempati 2026' }
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setForm({...form, occupancyStatus: opt.id})}
                  className={`flex items-center justify-center gap-2 p-3 rounded-lg text-sm font-medium border-2 transition-all ${
                    form.occupancyStatus === opt.id 
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-500' 
                    : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-emerald-300'
                  } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  disabled={loading}
                >
                  {opt.icon}
                  <span className="truncate">{opt.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Event Dues (Only for logged in users) */}
          {user && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Iuran Sukarela
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
                  Rp
                </span>
                <input
                  type="number"
                  min="0"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-colors"
                  value={form.eventDuesAmount}
                  onChange={e => setForm({...form, eventDuesAmount: parseInt(e.target.value) || 0})}
                  placeholder="0"
                  disabled={loading}
                />
              </div>
              <p className="text-xs text-gray-500">
                Isi dengan nominal iuran sukarela untuk acara
              </p>
            </div>
          )}

          {/* Notes */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Catatan Tambahan
            </label>
            <textarea
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-colors resize-none"
              value={form.notes}
              onChange={e => setForm({...form, notes: e.target.value})}
              placeholder="Catatan penting mengenai warga ini..."
              disabled={loading}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-6 py-3 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 text-white font-medium hover:from-emerald-700 hover:to-emerald-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Menyimpan...
                </>
              ) : (
                <>
                  <Save size={20} />
                  {resident ? 'Perbarui Data' : 'Simpan Warga'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
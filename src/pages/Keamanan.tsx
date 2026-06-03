import React, { useEffect, useState } from 'react';
import { UserCheck, Clock, LogOut, Loader2, ShieldCheck, AlertCircle, Edit2, Trash2, Lock, Save, X } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { fetchTamu, createTamu, updateTamu, updateTamuKeluar, deleteTamu } from '../services/dataService';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const getStandardISODateTime = () => {
  return new Date().toISOString();
};

const formatDateTime = (dt: string | null) => {
  if (!dt) return null;
  try {
    const d = new Date(dt);
    return d.toLocaleString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dt;
  }
};

export const Keamanan = () => {
  const { user, isSecurity, isAdmin } = useAuth();
  
  // VERIFIKASI MODE TAMU: Jika tidak login (Tamu), kunci total akses halaman Log Keamanan
  const isGuestMode = !user; 
  const canModify = !!user && (isSecurity || isAdmin); // Satpam & Admin utama bisa mengedit dan menghapus log

  const [tamu, setTamu] = useState<any[]>([]);
  const [loading, setLoading] = useState(!isGuestMode);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // States untuk modul Edit Log Tamu (U dari CRUD)
  const [editingTamu, setEditingTamu] = useState<any | null>(null);
  const [editName, setEditName] = useState('');
  const [editTarget, setEditTarget] = useState('');
  const [editPurpose, setEditPurpose] = useState('');
  const [editIdentity, setEditIdentity] = useState('Kosong');
  const [editTimeIn, setEditTimeIn] = useState('');
  const [editTimeOut, setEditTimeOut] = useState('');

  const loadData = async () => {
    if (isGuestMode) return;
    try {
      const data = await fetchTamu();
      setTamu(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    if (!isGuestMode) {
      const interval = setInterval(loadData, 15000);
      return () => clearInterval(interval);
    }
  }, [isGuestMode]);

  const handleKeluar = async (id: number) => {
    if (!canModify) return;
    setActionLoading(id);
    try {
      await updateTamuKeluar(id, getStandardISODateTime());
      toast.success('Tamu berhasil ditandai keluar');
      loadData();
    } catch (err) {
      toast.error('Gagal mencatat keluar');
    } finally {
      setActionLoading(null);
    }
  };

  const handleMasuk = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!canModify) return;
    
    const formElement = e.currentTarget; 
    const formData = new FormData(formElement);
    
    const namaTamu = formData.get('nama_tamu') as string;
    const rumahTujuan = formData.get('id_rumah_tujuan') as string;
    const tujuanKunjungan = formData.get('tujuan_kunjungan') as string;

    if (!namaTamu.trim() || !rumahTujuan.trim() || !tujuanKunjungan.trim()) {
      toast.error('Kolom bertanda bintang (*) wajib diisi!');
      return;
    }

    const payload = {
      nama_tamu: namaTamu,
      id_rumah_tujuan: rumahTujuan,
      waktu_masuk: getStandardISODateTime(),
      waktu_keluar: null,
      titip_identitas: formData.get('titip_identitas') as string,
      tujuan_kunjungan: tujuanKunjungan
    };

    setIsSubmitting(true);
    try {
      await createTamu(payload);
      toast.success('Kunjungan tamu berhasil dicatat!');
      formElement.reset(); 
      loadData();
    } catch (err) {
      toast.error('Gagal mencatat tamu');
    } finally {
      setIsSubmitting(false);
    }
  };

  // AKSI EDIT / UPDATE LOG TAMU (U - CRUD)
  const openEditModal = (item: any) => {
    setEditingTamu(item);
    setEditName(item.nama_tamu || '');
    setEditTarget(item.id_rumah_tujuan || '');
    setEditPurpose(item.tujuan_kunjungan || '');
    setEditIdentity(item.titip_identitas || 'Kosong');
    setEditTimeIn(item.waktu_masuk || '');
    setEditTimeOut(item.waktu_keluar || '');
  };

  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTamu) return;

    setActionLoading(editingTamu.id_tamu);
    try {
      await updateTamu(editingTamu.id_tamu, {
        nama_tamu: editName,
        id_rumah_tujuan: editTarget,
        tujuan_kunjungan: editPurpose,
        titip_identitas: editIdentity,
        waktu_masuk: editTimeIn,
        waktu_keluar: editTimeOut || null
      });
      toast.success('Log kunjungan berhasil diperbarui!');
      setEditingTamu(null);
      loadData();
    } catch (err) {
      toast.error('Gagal memperbarui log');
    } finally {
      setActionLoading(null);
    }
  };

  // AKSI HAPUS LOG TAMU (D - CRUD)
  const handleDelete = async (id: number) => {
    if (!window.confirm("Hapus catatan log kunjungan ini secara permanen dari database?")) return;
    setActionLoading(id);
    try {
      await deleteTamu(id);
      toast.success('Log kunjungan berhasil dihapus!');
      loadData();
    } catch (err) {
      toast.error('Gagal menghapus log');
    } finally {
      setActionLoading(null);
    }
  };

  const tamuAktif = tamu.filter(t => !t.waktu_keluar);
  const tamuSelesai = tamu.filter(t => t.waktu_keluar);

  // VIEW MODE TAMU TERKUNCI (SECURITY LOCK SCREEN)
  if (isGuestMode) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl border border-red-100 shadow-xl max-w-md w-full text-center space-y-4 animate-in zoom-in duration-300">
          <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto border border-red-100">
            <Lock size={32} className="animate-bounce" />
          </div>
          <h3 className="text-xl font-black text-slate-800">Akses Log Terkunci</h3>
          <p className="text-slate-500 text-xs leading-relaxed">
            Halaman log pengawasan gerbang satpam bersifat rahasia demi privasi dan keamanan Cluster Beryl. 
            Silakan masuk menggunakan akun **Satpam (Security)** atau **Pengurus** untuk mengelola data ini.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 flex-1 flex flex-col h-full relative p-2 sm:p-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-100 text-emerald-700 rounded-2xl">
            <ShieldCheck size={28} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">Log Keamanan Satpam</h2>
            <p className="text-slate-500 text-xs">Sesi Aktif: **{isSecurity ? 'Satpam' : 'Pengurus'}** • Manajemen keluar masuk tamu.</p>
          </div>
        </div>

        <div className="flex space-x-3 w-full sm:w-auto">
          <div className="flex-1 sm:flex-initial bg-amber-50 border border-amber-200 rounded-2xl px-4 py-2 text-center min-w-[95px]">
            <p className="text-[9px] font-black text-amber-600 uppercase tracking-wider">Di Dalam</p>
            <p className="text-xl font-bold text-amber-700">{tamuAktif.length}</p>
          </div>
          <div className="flex-1 sm:flex-initial bg-emerald-50 border border-emerald-200 rounded-2xl px-4 py-2 text-center min-w-[95px]">
            <p className="text-[9px] font-black text-emerald-600 uppercase tracking-wider">Hari Ini</p>
            <p className="text-xl font-bold text-emerald-700">
              {tamu.filter(t => t.waktu_masuk?.substring(0, 10) === getStandardISODateTime().substring(0, 10)).length}
            </p>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Form Catat Tamu */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex flex-col lg:sticky lg:top-6">
          <h4 className="font-black text-slate-800 text-sm uppercase tracking-wider mb-4 border-b pb-3 text-emerald-800">Catat Tamu Masuk</h4>
          <form onSubmit={handleMasuk} className="space-y-4">
            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase mb-1.5">Nama Tamu / Instansi *</label>
              <input
                required
                disabled={isSubmitting}
                name="nama_tamu"
                placeholder="Kurir Shopee, Tamu Keluarga, dll."
                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500 outline-none transition-all bg-white"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase mb-1.5">Rumah Tujuan (Blok/No) *</label>
              <input
                required
                disabled={isSubmitting}
                name="id_rumah_tujuan"
                placeholder="Contoh: C5/09"
                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500 outline-none transition-all font-bold text-emerald-900 bg-white"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase mb-1.5">Tujuan Kunjungan *</label>
              <input
                required
                disabled={isSubmitting}
                name="tujuan_kunjungan"
                placeholder="Contoh: Antar Paket, Silahturahmi, Perbaikan AC"
                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500 outline-none transition-all bg-white"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase mb-1.5">Titip Identitas</label>
              <select
                disabled={isSubmitting}
                required
                name="titip_identitas"
                className="w-full px-4 py-3 border border-slate-200 bg-white rounded-xl text-xs focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500 outline-none transition-all font-bold text-gray-700"
              >
                <option value="Kosong">Tidak Ada</option>
                <option value="KTP">KTP</option>
                <option value="SIM">SIM</option>
                <option value="Kartu Pelajar">Kartu Pelajar</option>
                <option value="Lainnya">Lainnya</option>
              </select>
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black py-3.5 rounded-xl uppercase tracking-widest transition-all shadow-md"
            >
              {isSubmitting ? <Loader2 className="animate-spin mx-auto" size={16} /> : 'Catat Masuk'}
            </button>
          </form>
        </div>

        {/* Tabel Log Kunjungan */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-gray-50/50">
            <h4 className="font-black text-slate-800 text-xs uppercase tracking-wider">Log Kunjungan Gerbang</h4>
            <span className="text-[10px] font-black bg-gray-200 text-gray-700 px-2.5 py-1 rounded-full">
              {loading ? 'Memuat...' : `${tamu.length} Record`}
            </span>
          </div>

          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex flex-col items-center justify-center p-12 text-gray-400">
                <Loader2 className="animate-spin mb-2" size={24} />
                <p className="text-xs font-bold">Sedang menyinkronkan data tamu...</p>
              </div>
            ) : (
              <table className="w-full text-left text-xs text-slate-600 min-w-[700px]">
                <thead className="bg-slate-50 text-[9px] uppercase tracking-wider text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3 font-bold">Waktu Masuk</th>
                    <th className="px-4 py-3 font-bold">Nama Tamu</th>
                    <th className="px-4 py-3 font-bold">Tujuan Rumah</th>
                    <th className="px-4 py-3 font-bold">Tujuan Kunjungan</th>
                    <th className="px-4 py-3 font-bold">Identitas</th>
                    <th className="px-4 py-3 font-bold text-center">Aksi / Status Keluar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {tamuAktif.map(t => (
                    <tr key={t.id_tamu} className="hover:bg-amber-50/30 transition-all bg-amber-50/5">
                      <td className="px-4 py-3.5 text-blue-600 font-mono text-[10px] font-medium">
                        <div className="flex items-center space-x-1">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{formatDateTime(t.waktu_masuk)}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 font-bold text-slate-900">{t.nama_tamu}</td>
                      <td className="px-4 py-3.5 font-bold text-emerald-800">{t.id_rumah_tujuan}</td>
                      <td className="px-4 py-3.5 font-medium text-slate-700">{t.tujuan_kunjungan || 'Kunjungan'}</td>
                      <td className="px-4 py-3.5">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                          t.titip_identitas === 'Kosong' ? 'bg-slate-100 text-slate-500' : 'bg-blue-100 text-blue-700'
                        }`}>
                          {t.titip_identitas}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleKeluar(t.id_tamu)}
                            disabled={actionLoading === t.id_tamu}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-700 rounded-full text-[9px] font-black uppercase transition-all"
                          >
                            {actionLoading === t.id_tamu ? <Loader2 size={10} className="animate-spin" /> : <LogOut className="w-3 h-3" />}
                            <span>Keluar</span>
                          </button>
                          
                          <button 
                            onClick={() => openEditModal(t)}
                            className="p-1.5 hover:bg-blue-50 text-blue-600 rounded-lg"
                            title="Edit Log"
                          >
                            <Edit2 size={14}/>
                          </button>
                          
                          <button 
                            onClick={() => handleDelete(t.id_tamu)}
                            className="p-1.5 hover:bg-rose-50 text-rose-600 rounded-lg"
                            title="Hapus Log"
                          >
                            <Trash2 size={14}/>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {tamuSelesai.map(t => (
                    <tr key={t.id_tamu} className="hover:bg-slate-50/50 transition-colors opacity-75">
                      <td className="px-4 py-3 text-slate-400 font-mono text-[10px]">
                        {formatDateTime(t.waktu_masuk)}
                      </td>
                      <td className="px-4 py-3 text-slate-600 line-through">{t.nama_tamu}</td>
                      <td className="px-4 py-3 text-slate-500 font-semibold">{t.id_rumah_tujuan}</td>
                      <td className="px-4 py-3 text-slate-500 italic">{t.tujuan_kunjungan || 'Kunjungan'}</td>
                      <td className="px-4 py-3">
                        <span className="text-slate-400 text-[9px] uppercase">{t.titip_identitas}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-3">
                          <div className="flex items-center justify-center space-x-1 text-emerald-600 font-bold text-[10px]">
                            <UserCheck className="w-3.5 h-3.5" />
                            <span className="font-mono">{formatDateTime(t.waktu_keluar)}</span>
                          </div>
                          
                          <button 
                            onClick={() => openEditModal(t)}
                            className="p-1.5 hover:bg-blue-50 text-blue-600 rounded-lg"
                            title="Edit Log"
                          >
                            <Edit2 size={14}/>
                          </button>
                          
                          <button 
                            onClick={() => handleDelete(t.id_tamu)}
                            className="p-1.5 hover:bg-rose-50 text-rose-600 rounded-lg"
                            title="Hapus Log"
                          >
                            <Trash2 size={14}/>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {tamu.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-5 py-12 text-center text-slate-400 font-bold">
                        <AlertCircle className="mx-auto mb-2 text-gray-300" size={32} />
                        Belum ada data kunjungan tamu di gerbang utama.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* MODAL UPDATE / EDIT LOG TAMU */}
      {editingTamu && (
        <div className="fixed inset-0 bg-black/60 z-[9999] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto animate-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-6 border-b pb-3">
              <h3 className="text-lg font-black text-gray-800">Edit Log Kunjungan</h3>
              <button onClick={() => setEditingTamu(null)} className="p-1.5 hover:bg-gray-100 rounded-full text-gray-400"><X size={20}/></button>
            </div>

            <form onSubmit={handleUpdateSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">Nama Tamu / Instansi</label>
                <input 
                  type="text" required
                  className="w-full border rounded-xl p-3 text-xs focus:ring-2 focus:ring-emerald-200 outline-none"
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">Blok Tujuan</label>
                <input 
                  type="text" required
                  className="w-full border rounded-xl p-3 text-xs focus:ring-2 focus:ring-emerald-200 outline-none font-bold text-emerald-800"
                  value={editTarget}
                  onChange={e => setEditTarget(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">Tujuan Kunjungan</label>
                <input 
                  type="text" required
                  className="w-full border rounded-xl p-3 text-xs focus:ring-2 focus:ring-emerald-200 outline-none"
                  value={editPurpose}
                  onChange={e => setEditPurpose(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">Titip Identitas</label>
                  <select
                    className="w-full border rounded-xl p-3 text-xs focus:ring-2 focus:ring-emerald-200 outline-none font-bold text-gray-700 bg-white"
                    value={editIdentity}
                    onChange={e => setEditIdentity(e.target.value)}
                  >
                    <option value="Kosong">Tidak Ada</option>
                    <option value="KTP">KTP</option>
                    <option value="SIM">SIM</option>
                    <option value="Kartu Pelajar">Kartu Pelajar</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3">
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">Waktu Masuk</label>
                  <input 
                    type="text" required
                    className="w-full border rounded-xl p-3 text-xs focus:ring-2 focus:ring-emerald-200 outline-none font-mono"
                    value={editTimeIn}
                    onChange={e => setEditTimeIn(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">Waktu Keluar</label>
                  <input 
                    type="text"
                    placeholder="Kosongkan jika masih di dalam"
                    className="w-full border rounded-xl p-3 text-xs focus:ring-2 focus:ring-emerald-200 outline-none font-mono"
                    value={editTimeOut}
                    onChange={e => setEditTimeOut(e.target.value)}
                  />
                </div>
              </div>

              <button 
                type="submit" 
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 text-xs uppercase tracking-widest"
              >
                <Save size={16}/> Simpan Pembaruan Log
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
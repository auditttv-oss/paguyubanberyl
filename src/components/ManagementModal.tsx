import React, { useState, useRef, useEffect } from 'react';
import { 
  Download, Upload, Database, FileJson, 
  X, AlertTriangle, CheckCircle, Users, TrendingDown, Calendar,
  RefreshCw, Trash2, Shield, HardDrive, Save, CloudOff, 
  BarChart3, Filter, Archive, FileSpreadsheet, FileText,
  CreditCard, UserPlus, Calendar as CalendarIcon,
  PieChart, DollarSign, Home, MessageSquare
} from "lucide-react";
import backupService from '../services/backupService';
import storageService from '../services/storageService';
import excelService from '../services/excelService';

interface ManagementModalProps {
  onClose: () => void;
  residents: any[];
  expenses: any[];
  allPayments: any[];
  onRefresh: () => void;
}

export const ManagementModal: React.FC<ManagementModalProps> = ({ 
  onClose, 
  residents, 
  expenses, 
  allPayments, 
  onRefresh 
}) => {
  const [activeTab, setActiveTab] = useState<'backup' | 'import' | 'reset' | 'export'>('backup');
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info', text: string } | null>(null);
  const [backupInfo, setBackupInfo] = useState<any>(null);
  const [snapshots, setSnapshots] = useState<any[]>([]);
  const [dateRange, setDateRange] = useState<{ from: Date | null; to: Date | null }>({
    from: null,
    to: null
  });
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load backup info dan snapshots
  useEffect(() => {
    loadBackupInfo();
    loadSnapshots();
  }, []);

  const loadBackupInfo = async () => {
    try {
      const info = await backupService.getBackupInfo();
      setBackupInfo(info);
    } catch (error) {
      console.error('Gagal load backup info:', error);
    }
  };

  const loadSnapshots = () => {
    const snapshotList = backupService.listSnapshots();
    setSnapshots(snapshotList);
  };

  // 1. HANDLER EXPORT JSON (BACKUP)
  const handleBackupJson = async () => {
    setIsProcessing(true);
    setMessage(null);
    try {
      const result = await backupService.exportToJson();
      setMessage({ 
        type: result.success ? 'success' : 'error', 
        text: result.message 
      });
      await loadBackupInfo();
    } catch (error: any) {
      setMessage({ 
        type: 'error', 
        text: `Gagal backup: ${error.message}` 
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // 2. HANDLER RESTORE JSON
  const handleRestoreJson = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setMessage(null);
    
    try {
      const result = await backupService.importFromJson(file);
      
      setMessage({ 
        type: result.success ? 'success' : 'error', 
        text: result.message 
      });
      
      if (result.success) {
        // Tunggu sebentar lalu refresh
        setTimeout(() => {
          onRefresh();
        }, 2000);
      }
    } catch (error: any) {
      setMessage({ 
        type: 'error', 
        text: `Gagal restore: ${error.message}` 
      });
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // 3. HANDLER CREATE SNAPSHOT
  const handleCreateSnapshot = async () => {
    setIsProcessing(true);
    setMessage(null);
    
    try {
      const backup = await storageService.getDatabaseBackup();
      const result = backupService.createLocalSnapshot(
        backup, 
        `snapshot_${new Date().toISOString().split('T')[0]}`
      );
      
      setMessage({ 
        type: result.success ? 'success' : 'error', 
        text: result.message 
      });
      
      loadSnapshots();
    } catch (error: any) {
      setMessage({ 
        type: 'error', 
        text: `Gagal membuat snapshot: ${error.message}` 
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // 4. HANDLER EXPORT CSV
  const handleExportCsv = async () => {
    setIsProcessing(true);
    setMessage(null);
    
    try {
      const result = backupService.exportToCsv(residents, expenses, allPayments);
      setMessage({ 
        type: result.success ? 'success' : 'error', 
        text: result.message 
      });
    } catch (error: any) {
      setMessage({ 
        type: 'error', 
        text: `Gagal export CSV: ${error.message}` 
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // 5. HANDLER DELETE SNAPSHOT
  const handleDeleteSnapshot = (name: string) => {
    if (window.confirm(`Hapus snapshot "${name}"?`)) {
      const result = backupService.deleteSnapshot(name);
      setMessage({ 
        type: result.success ? 'success' : 'error', 
        text: result.message 
      });
      loadSnapshots();
    }
  };

  // 6. HANDLER RESTORE FROM SNAPSHOT
  const handleRestoreSnapshot = async (name: string) => {
    if (!window.confirm(`Restore dari snapshot "${name}"? Data saat ini akan diganti.`)) {
      return;
    }

    setIsProcessing(true);
    setMessage(null);
    
    try {
      const snapshot = backupService.loadLocalSnapshot(name);
      if (!snapshot) {
        throw new Error('Snapshot tidak ditemukan');
      }

      await storageService.restoreDatabase(snapshot.data);
      
      setMessage({ 
        type: 'success', 
        text: 'Snapshot berhasil direstore!' 
      });
      
      setTimeout(() => {
        onRefresh();
        onClose();
      }, 2000);
    } catch (error: any) {
      setMessage({ 
        type: 'error', 
        text: `Gagal restore snapshot: ${error.message}` 
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // 7. HANDLER CLEAR CACHE
  const handleClearCache = () => {
    if (window.confirm('Bersihkan cache dan snapshot lokal?')) {
      try {
        // Hapus semua snapshot
        const snapshotList = backupService.listSnapshots();
        snapshotList.forEach(snapshot => {
          backupService.deleteSnapshot(snapshot.name);
        });
        
        // Hapus cache lainnya
        const keys = Object.keys(localStorage).filter(key => 
          key.startsWith('beryl_cache_') || 
          key.startsWith('temp_')
        );
        
        keys.forEach(key => localStorage.removeItem(key));
        
        setMessage({ 
          type: 'success', 
          text: `Cache berhasil dibersihkan (${keys.length + snapshotList.length} item)` 
        });
        
        loadSnapshots();
      } catch (error) {
        setMessage({ type: 'error', text: 'Gagal membersihkan cache' });
      }
    }
  };

  // 8. HANDLER EXPORT EXCEL SEMUA DATA
  const handleExportExcel = async () => {
    setIsProcessing(true);
    setMessage(null);
    
    try {
      await excelService.exportAllToExcel();
      setMessage({ 
        type: 'success', 
        text: 'Export Excel berhasil! File sudah didownload.' 
      });
    } catch (error: any) {
      setMessage({ 
        type: 'error', 
        text: `Gagal export Excel: ${error.message}` 
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // 9. HANDLER EXPORT EXCEL DENGAN FILTER TANGGAL
  const handleExportExcelWithDateRange = async () => {
    if (!dateRange.from || !dateRange.to) {
      setMessage({ 
        type: 'error', 
        text: 'Pilih tanggal mulai dan tanggal akhir terlebih dahulu!' 
      });
      return;
    }
    
    if (dateRange.from > dateRange.to) {
      setMessage({ 
        type: 'error', 
        text: 'Tanggal mulai tidak boleh lebih besar dari tanggal akhir!' 
      });
      return;
    }
    
    setIsProcessing(true);
    setMessage(null);
    
    try {
      await excelService.exportByDateRange(dateRange.from, dateRange.to);
      setMessage({ 
        type: 'success', 
        text: `Export Excel periode ${dateRange.from.toLocaleDateString('id-ID')} - ${dateRange.to.toLocaleDateString('id-ID')} berhasil!` 
      });
    } catch (error: any) {
      setMessage({ 
        type: 'error', 
        text: `Gagal export Excel: ${error.message}` 
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // 10. HANDLER EXPORT LAPORAN RINGKASAN
  const handleExportSummaryReport = async () => {
    setIsProcessing(true);
    setMessage(null);
    
    try {
      await excelService.exportSummaryReport();
      setMessage({ 
        type: 'success', 
        text: 'Laporan ringkasan berhasil diexport!' 
      });
    } catch (error: any) {
      setMessage({ 
        type: 'error', 
        text: `Gagal export laporan: ${error.message}` 
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // 11. HANDLER EXPORT EXCEL RINGKAS
  const handleExportExcelSummary = async () => {
    setIsProcessing(true);
    setMessage(null);
    
    try {
      // Perbaikan: panggil fungsi yang benar dari excelService
      // Ganti createSummaryWorkbook dengan exportAllToExcel atau fungsi yang sesuai
      await excelService.exportAllToExcel();
      
      setMessage({ 
        type: 'success', 
        text: 'Export ringkasan Excel berhasil!' 
      });
    } catch (error: any) {
      setMessage({ 
        type: 'error', 
        text: `Gagal export ringkasan: ${error.message}` 
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-[200] backdrop-blur-sm">
      <div className="bg-white rounded-[40px] shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="bg-[#064e3b] p-8 text-white">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-2xl font-black uppercase tracking-tighter flex items-center gap-3">
              <Database className="text-emerald-400" /> Pengaturan Data
            </h3>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-all">
              <X size={24} />
            </button>
          </div>
          <p className="text-emerald-200 text-xs font-bold uppercase tracking-widest opacity-70">
            Export, Backup, & Restore Database Paguyuban
          </p>
        </div>

        {/* Tabs */}
        <div className="flex bg-gray-50 border-b">
          {[
            { id: 'backup', label: 'Export & Backup', icon: <HardDrive size={16}/> },
            { id: 'export', label: 'Export Excel', icon: <FileSpreadsheet size={16}/> },
            { id: 'import', label: 'Import & Restore', icon: <Upload size={16}/> },
            { id: 'reset', label: 'Sistem', icon: <Shield size={16}/> }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 flex items-center justify-center gap-2 py-4 font-black text-[10px] uppercase tracking-widest transition-all ${
                activeTab === tab.id ? 'bg-white text-emerald-900 border-b-2 border-emerald-600' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Body Content */}
        <div className="p-8 overflow-y-auto flex-1 space-y-8">
          {/* Message Alert */}
          {message && (
            <div className={`p-4 rounded-2xl border flex items-center gap-3 animate-fade-in ${
              message.type === 'success' 
                ? 'bg-emerald-50 border-emerald-100 text-emerald-700' 
                : message.type === 'error'
                ? 'bg-rose-50 border-rose-100 text-rose-700'
                : 'bg-blue-50 border-blue-100 text-blue-700'
            }`}>
              {message.type === 'success' ? <CheckCircle size={20} /> : <AlertTriangle size={20} />}
              <p className="text-xs font-bold uppercase">{message.text}</p>
            </div>
          )}

          {/* Stat Summary */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 text-center">
              <Users size={16} className="mx-auto mb-1 text-blue-500" />
              <p className="text-[10px] font-black text-gray-400 uppercase">Warga</p>
              <p className="text-xl font-black text-gray-800">{residents.length}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 text-center">
              <TrendingDown size={16} className="mx-auto mb-1 text-rose-500" />
              <p className="text-[10px] font-black text-gray-400 uppercase">Expense</p>
              <p className="text-xl font-black text-gray-800">{expenses.length}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 text-center">
              <CreditCard size={16} className="mx-auto mb-1 text-emerald-500" />
              <p className="text-[10px] font-black text-gray-400 uppercase">Bayar</p>
              <p className="text-xl font-black text-gray-800">{allPayments.length}</p>
            </div>
          </div>

          {/* TAB 1: BACKUP & EXPORT */}
          {activeTab === 'backup' && (
            <div className="space-y-4 animate-in slide-in-from-left-4 duration-300">
              {/* Backup Info */}
              {backupInfo && !backupInfo.error && (
                <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100">
                  <p className="text-xs font-black text-blue-800 uppercase mb-2">Info Backup Terakhir</p>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-[10px] text-blue-600">Tanggal</p>
                      <p className="text-sm font-bold">{backupInfo.backupDate}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-blue-600">Total Warga</p>
                      <p className="text-sm font-bold">{backupInfo.totalResidents}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Backup JSON Button */}
              <button 
                onClick={handleBackupJson}
                disabled={isProcessing}
                className="w-full flex items-center gap-4 p-6 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-[24px] hover:from-emerald-600 hover:to-teal-600 transition-all group shadow-lg shadow-emerald-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-sm group-hover:scale-110 transition-transform">
                  <FileJson size={28}/>
                </div>
                <div className="text-left">
                  <p className="font-black text-lg">Download Backup JSON</p>
                  <p className="text-xs opacity-90 font-bold uppercase">Cadangan Database Lengkap</p>
                </div>
              </button>

              {/* Create Snapshot Button */}
              <button 
                onClick={handleCreateSnapshot}
                disabled={isProcessing}
                className="w-full flex items-center gap-4 p-6 bg-blue-50 rounded-[24px] border border-blue-100 hover:bg-blue-100 transition-all group"
              >
                <div className="p-4 bg-white rounded-2xl shadow-sm text-blue-600 group-hover:scale-110 transition-transform">
                  <Save size={28}/>
                </div>
                <div className="text-left">
                  <p className="font-black text-blue-900">Buat Snapshot Lokal</p>
                  <p className="text-[10px] text-blue-500 font-bold uppercase">Cadangan cepat ke browser</p>
                </div>
              </button>

              {/* Export CSV Button */}
              <button 
                onClick={handleExportCsv}
                disabled={isProcessing}
                className="w-full flex items-center gap-4 p-6 bg-purple-50 rounded-[24px] border border-purple-100 hover:bg-purple-100 transition-all group"
              >
                <div className="p-4 bg-white rounded-2xl shadow-sm text-purple-600 group-hover:scale-110 transition-transform">
                  <FileText size={28}/>
                </div>
                <div className="text-left">
                  <p className="font-black text-purple-900">Export ke CSV</p>
                  <p className="text-[10px] text-purple-500 font-bold uppercase">Format untuk Excel/Spreadsheet</p>
                </div>
              </button>

              {/* List Snapshots */}
              {snapshots.length > 0 && (
                <div className="mt-6">
                  <p className="text-sm font-bold text-gray-700 mb-3">Snapshot Lokal ({snapshots.length})</p>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {snapshots.map((snapshot, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-xl">
                        <div>
                          <p className="text-xs font-bold text-gray-700">{snapshot.name}</p>
                          <p className="text-[10px] text-gray-500">
                            {new Date(snapshot.created).toLocaleString('id-ID')}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleRestoreSnapshot(snapshot.name)}
                            className="text-emerald-600 hover:text-emerald-700 text-xs font-bold"
                            title="Restore snapshot"
                          >
                            Restore
                          </button>
                          <button
                            onClick={() => handleDeleteSnapshot(snapshot.name)}
                            className="text-rose-600 hover:text-rose-700 text-xs font-bold"
                            title="Hapus snapshot"
                          >
                            Hapus
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: EXPORT EXCEL */}
          {activeTab === 'export' && (
            <div className="space-y-4 animate-in slide-in-from-left-4 duration-300">
              {/* Info Export */}
              <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100 mb-4 flex gap-3 items-start">
                <FileSpreadsheet className="text-emerald-500 flex-shrink-0 mt-1" size={18} />
                <p className="text-xs font-bold text-emerald-800 leading-relaxed">
                  <span className="block font-black uppercase mb-1">📊 Export Excel</span>
                  Export semua data dalam 1 file Excel dengan multiple sheets. Format kompatibel dengan Microsoft Excel, Google Sheets, dan aplikasi spreadsheet lainnya.
                </p>
              </div>

              {/* Export Excel Full Button */}
              <button 
                onClick={handleExportExcel}
                disabled={isProcessing}
                className="w-full flex items-center gap-4 p-6 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-[24px] hover:from-green-700 hover:to-emerald-700 transition-all group shadow-lg shadow-green-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-sm group-hover:scale-110 transition-transform">
                  <FileSpreadsheet size={28}/>
                </div>
                <div className="text-left">
                  <p className="font-black text-lg">Export Excel Semua Data</p>
                  <p className="text-xs opacity-90 font-bold uppercase">5 sheets: Warga, Pengeluaran, Pembayaran, Ringkasan, Statistik</p>
                </div>
              </button>

              {/* Export dengan Filter Tanggal */}
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 space-y-3">
                <div className="flex items-center gap-2">
                  <Filter size={16} className="text-gray-500" />
                  <p className="text-sm font-bold text-gray-700">Export dengan Filter Tanggal</p>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">Dari Tanggal</label>
                    <input
                      type="date"
                      value={dateRange.from ? dateRange.from.toISOString().split('T')[0] : ''}
                      onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value ? new Date(e.target.value) : null }))}
                      className="w-full p-2 text-sm border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">Sampai Tanggal</label>
                    <input
                      type="date"
                      value={dateRange.to ? dateRange.to.toISOString().split('T')[0] : ''}
                      onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value ? new Date(e.target.value) : null }))}
                      className="w-full p-2 text-sm border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>
                
                <button
                  onClick={handleExportExcelWithDateRange}
                  disabled={isProcessing || !dateRange.from || !dateRange.to}
                  className="w-full flex items-center justify-center gap-2 p-3 bg-blue-100 text-blue-700 rounded-xl hover:bg-blue-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <CalendarIcon size={16} />
                  <span className="text-sm font-bold">Export Periode Terpilih</span>
                </button>
              </div>

              {/* Export Laporan Ringkasan */}
              <button 
                onClick={handleExportSummaryReport}
                disabled={isProcessing}
                className="w-full flex items-center gap-4 p-6 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-[24px] hover:from-purple-700 hover:to-indigo-700 transition-all group shadow-lg shadow-purple-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-sm group-hover:scale-110 transition-transform">
                  <BarChart3 size={28}/>
                </div>
                <div className="text-left">
                  <p className="font-black text-lg">Laporan Ringkasan Excel</p>
                  <p className="text-xs opacity-90 font-bold uppercase">Statistik dan analisis keuangan</p>
                </div>
              </button>

              {/* Sheet Info */}
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200">
                <h4 className="font-black text-gray-700 mb-3 text-sm">Sheet yang Akan Dibuat:</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="text-xs font-bold text-gray-700">Data Warga</span>
                    <span className="text-xs text-gray-500 ml-auto">{residents.length} data</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-rose-500 rounded-full"></div>
                    <span className="text-xs font-bold text-gray-700">Pengeluaran</span>
                    <span className="text-xs text-gray-500 ml-auto">{expenses.length} data</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                    <span className="text-xs font-bold text-gray-700">Pembayaran</span>
                    <span className="text-xs text-gray-500 ml-auto">{allPayments.length} data</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
                    <span className="text-xs font-bold text-gray-700">Ringkasan</span>
                    <span className="text-xs text-gray-500 ml-auto">Statistik utama</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                    <span className="text-xs font-bold text-gray-700">Statistik Bulanan</span>
                    <span className="text-xs text-gray-500 ml-auto">12 bulan</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: IMPORT & RESTORE */}
          {activeTab === 'import' && (
            <div className="space-y-4 animate-in slide-in-from-left-4 duration-300">
              <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100 mb-4 flex gap-3 items-start">
                <AlertTriangle className="text-amber-500 flex-shrink-0 mt-1" size={18} />
                <p className="text-xs font-bold text-amber-800 leading-relaxed">
                  <span className="block font-black uppercase mb-1">⚠️ PERINGATAN</span>
                  Fitur restore akan menggantikan semua data yang ada. Pastikan Anda sudah melakukan backup sebelumnya.
                </p>
              </div>

              <button 
                onClick={() => fileInputRef.current?.click()}
                disabled={isProcessing}
                className="w-full flex items-center gap-4 p-6 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-[24px] hover:from-rose-600 hover:to-pink-600 transition-all group shadow-lg shadow-rose-500/25 disabled:opacity-50"
              >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  hidden 
                  accept=".json,.JSON" 
                  onChange={handleRestoreJson} 
                  disabled={isProcessing}
                />
                <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-sm group-hover:scale-110 transition-transform">
                  <Upload size={28}/>
                </div>
                <div className="text-left">
                  <p className="font-black text-lg">Restore dari JSON</p>
                  <p className="text-xs opacity-90 font-bold uppercase">Upload file backup (.json)</p>
                </div>
              </button>

              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200">
                <h4 className="font-black text-gray-700 mb-2 text-sm">Petunjuk Restore:</h4>
                <ol className="text-xs text-gray-600 space-y-1 list-decimal pl-4">
                  <li>Download backup JSON terlebih dahulu</li>
                  <li>File harus dalam format .json yang valid</li>
                  <li>Pastikan file berasal dari sistem yang sama</li>
                  <li>Data lama akan digantikan sepenuhnya</li>
                  <li>Proses restore mungkin memakan waktu beberapa menit</li>
                </ol>
              </div>
            </div>
          )}

          {/* TAB 4: SYSTEM RESET */}
          {activeTab === 'reset' && (
            <div className="space-y-6 animate-in slide-in-from-left-4 duration-300">
              <div className="p-6 bg-rose-50 border-2 border-dashed border-rose-200 rounded-[32px] text-center">
                <AlertTriangle size={48} className="text-rose-500 mx-auto mb-4" />
                <h4 className="text-rose-900 font-black uppercase mb-2">Reset Database</h4>
                <p className="text-xs text-rose-700 font-bold leading-relaxed mb-6 uppercase">
                  Menghapus seluruh data secara permanen dari penyimpanan lokal.
                </p>
                <button 
                  onClick={() => {
                    if (window.confirm(
                      '⚠️ PERINGATAN KERAS!\n\n' +
                      'Aksi ini akan menghapus SEMUA data:\n' +
                      '- Semua data warga\n' +
                      '- Semua pengeluaran\n' +
                      '- Semua riwayat pembayaran\n' +
                      '- Semua komentar\n\n' +
                      'Tindakan ini TIDAK DAPAT DIBATALKAN!\n' +
                      'Apakah Anda yakin?'
                    )) {
                      storageService.clearAllData();
                      setTimeout(() => window.location.reload(), 2000);
                    }
                  }}
                  disabled={isProcessing}
                  className="px-8 py-4 bg-gradient-to-r from-rose-600 to-red-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:from-rose-700 hover:to-red-700 shadow-lg shadow-rose-200 transition-all disabled:opacity-50"
                >
                  <Trash2 size={16} className="inline mr-2" />
                  Reset Semua Data
                </button>
              </div>

              <button 
                onClick={handleClearCache}
                disabled={isProcessing}
                className="w-full flex items-center gap-4 p-6 bg-gray-50 rounded-[24px] border border-gray-200 hover:bg-gray-100 transition-all"
              >
                <div className="p-4 bg-white rounded-2xl shadow-sm text-gray-500">
                  <CloudOff size={24}/>
                </div>
                <div className="text-left">
                  <p className="font-black text-gray-700">Bersihkan Cache</p>
                  <p className="text-xs text-gray-400">Hapus snapshot dan data sementara</p>
                </div>
              </button>

              <div className="text-xs text-gray-500 text-center pt-4 border-t">
                <p>Ukuran LocalStorage saat ini: <span className="font-bold">
                  {Math.round((JSON.stringify(localStorage).length / 1024) * 100) / 100} KB
                </span></p>
                <p className="mt-1">Snapshot tersimpan: {snapshots.length}</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 bg-gray-50 border-t flex justify-between items-center">
          <div className="text-xs text-gray-500 flex items-center gap-2">
            <Database size={12} />
            <span>Last backup: {backupInfo?.backupDate || 'Belum ada'}</span>
          </div>
          <button 
            onClick={onClose}
            disabled={isProcessing}
            className="px-6 py-3 bg-white border border-gray-200 text-gray-500 rounded-2xl font-bold text-sm hover:bg-gray-100 transition-all disabled:opacity-50"
          >
            Tutup Panel
          </button>
        </div>
      </div>

      {/* Loading Overlay */}
      {isProcessing && (
        <div className="absolute inset-0 bg-white/70 backdrop-blur-sm flex items-center justify-center z-[210]">
          <div className="bg-gradient-to-r from-emerald-700 to-teal-700 text-white px-8 py-6 rounded-3xl font-black flex flex-col items-center gap-3 shadow-2xl">
            <RefreshCw className="animate-spin" size={28} />
            <span className="uppercase tracking-widest text-sm">Memproses...</span>
            <p className="text-xs opacity-75 font-normal mt-2">Mohon tunggu sebentar</p>
          </div>
        </div>
      )}
    </div>
  );
};
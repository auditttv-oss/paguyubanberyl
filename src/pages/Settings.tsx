import React, { useState, useRef, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import { exportDataToExcel, exportDataToJSON, importDataFromExcel, downloadExcelTemplate } from '../services/dataService';
import backupService, { BackupInfo } from '../services/backupService';
import { 
  Download, 
  Upload, 
  Database, 
  RefreshCw, 
  Shield, 
  HardDrive, 
  FileJson, 
  AlertTriangle, 
  CheckCircle2, 
  Loader2, 
  Trash2, 
  History, 
  FileSpreadsheet,
  Save,
  FileText
} from 'lucide-react';

export const Settings = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [backupInfo, setBackupInfo] = useState<BackupInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
  const [restoreProgress, setRestoreProgress] = useState({ current: 0, total: 0, status: '' });
  const [snapshots, setSnapshots] = useState<any[]>([]);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const excelInputRef = useRef<HTMLInputElement>(null);

  const loadBackupInfo = async () => {
    try {
      const info = await backupService.getBackupInfo();
      setBackupInfo(info);
      
      const snaps = backupService.listSnapshots();
      setSnapshots(snaps);
    } catch (error) {
      console.error('Error loading backup info:', error);
    }
  };

  useEffect(() => {
    loadBackupInfo();
  }, []);

  const handleExportBackup = async () => {
    if (!user) {
      setMessage({ type: 'error', text: 'Hanya admin yang dapat melakukan backup' });
      return;
    }
    
    setLoading(true);
    setMessage(null);
    
    try {
      await exportDataToJSON();
      setMessage({ type: 'success', text: '✅ Backup berhasil didownload!' });
      await loadBackupInfo();
    } catch (error: any) {
      setMessage({ type: 'error', text: `❌ Error: ${error.message || 'Gagal melakukan backup'}` });
    } finally {
      setLoading(false);
    }
  };

  const handleExportExcel = async () => {
    if (!user) {
      setMessage({ type: 'error', text: 'Hanya admin yang dapat melakukan export' });
      return;
    }
    
    setIsExporting(true);
    setMessage(null);
    
    try {
      await exportDataToExcel();
      setMessage({ type: 'success', text: '✅ Export Excel berhasil!' });
    } catch (error: any) {
      setMessage({ type: 'error', text: `❌ Error: ${error.message || 'Gagal export Excel'}` });
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportBackup = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!user) {
      setMessage({ type: 'error', text: 'Hanya admin yang dapat melakukan restore' });
      return;
    }
    
    const file = event.target.files?.[0];
    if (!file) return;
    
    setLoading(true);
    setMessage(null);
    setRestoreProgress({ current: 0, total: 100, status: 'Memulai proses restore...' });
    
    try {
      const result = await backupService.importFromJson(file);
      
      if (result.success) {
        setMessage({ type: 'success', text: result.message });
        
        queryClient.invalidateQueries({ queryKey: ['residents'] });
        queryClient.invalidateQueries({ queryKey: ['expenses'] });
        queryClient.invalidateQueries({ queryKey: ['payments'] });
        queryClient.invalidateQueries({ queryKey: ['allPayments'] });
        queryClient.invalidateQueries({ queryKey: ['comments'] });
        
        setTimeout(() => {
          alert('✅ Restore berhasil! Sistem akan refresh...');
          window.location.reload();
        }, 1000);
      } else {
        setMessage({ type: 'error', text: result.message });
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: `❌ Error: ${error.message}` });
    } finally {
      setLoading(false);
      setRestoreProgress({ current: 0, total: 0, status: '' });
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleCreateSnapshot = async () => {
    try {
      const result = backupService.createLocalSnapshot({}, `manual_${Date.now()}`);
      if (result.success) {
        setMessage({ type: 'success', text: '✅ Snapshot berhasil dibuat' });
        loadBackupInfo();
      }
    } catch (error) {
      setMessage({ type: 'error', text: '❌ Gagal membuat snapshot' });
    }
  };

  const handleRestoreSnapshot = async (snapshotName: string) => {
    if (!confirm(`Restore snapshot "${snapshotName}"? Data saat ini akan digantikan.`)) return;
    
    const snapshot = backupService.loadLocalSnapshot(snapshotName);
    if (snapshot) {
      try {
        await backupService.restoreFromBackup(snapshot);
        setMessage({ type: 'success', text: `✅ Snapshot "${snapshotName}" berhasil direstore` });
        setTimeout(() => window.location.reload(), 1000);
      } catch (error) {
        setMessage({ type: 'error', text: `❌ Gagal restore snapshot` });
      }
    }
  };

  const handleDeleteSnapshot = (snapshotName: string) => {
    if (confirm(`Hapus snapshot "${snapshotName}"?`)) {
      const result = backupService.deleteSnapshot(snapshotName);
      if (result.success) {
        setMessage({ type: 'success', text: `✅ Snapshot "${snapshotName}" dihapus` });
        loadBackupInfo();
      }
    }
  };

  const handleClearCache = () => {
    if (confirm('Bersihkan cache? Ini akan menghapus data sementara di browser.')) {
      localStorage.clear();
      setMessage({ type: 'success', text: '✅ Cache dibersihkan' });
      setTimeout(() => window.location.reload(), 1000);
    }
  };

  if (!user) {
    return (
      <div className="p-8 text-center">
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 max-w-md mx-auto">
          <Shield className="text-yellow-600 mx-auto mb-3" size={32} />
          <h3 className="text-lg font-bold text-yellow-800 mb-2">Akses Terbatas</h3>
          <p className="text-yellow-600 mb-4">
            Halaman pengaturan hanya dapat diakses oleh administrator.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* HEADER */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-black text-gray-800">Pengaturan & Backup</h2>
        <p className="text-gray-500">Kelola backup dan restore data paguyuban</p>
      </div>

      {/* MESSAGE */}
      {message && (
        <div className={`p-4 rounded-xl border ${message.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
          <div className="flex items-center gap-2">
            {message.type === 'success' ? <CheckCircle2 size={20} /> : <AlertTriangle size={20} />}
            <span className="font-medium">{message.text}</span>
          </div>
        </div>
      )}

      {/* BACKUP INFO CARD */}
      <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-2xl shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/20 rounded-xl">
              <Database size={24} />
            </div>
            <div>
              <h3 className="text-xl font-black">Status Database</h3>
              <p className="text-sm opacity-90">Informasi backup dan data</p>
            </div>
          </div>
          <button
            onClick={loadBackupInfo}
            className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
            title="Refresh"
          >
            <RefreshCw size={20} />
          </button>
        </div>
        
        {backupInfo ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white/10 p-4 rounded-xl">
              <p className="text-xs opacity-80 mb-1">Total Warga</p>
              <p className="text-lg font-bold">{backupInfo.totalResidents || 0} KK</p>
            </div>
            <div className="bg-white/10 p-4 rounded-xl">
              <p className="text-xs opacity-80 mb-1">Total Pengeluaran</p>
              <p className="text-lg font-bold">{backupInfo.totalExpenses || 0} transaksi</p>
            </div>
            <div className="bg-white/10 p-4 rounded-xl">
              <p className="text-xs opacity-80 mb-1">Total Pembayaran</p>
              <p className="text-lg font-bold">{backupInfo.totalPayments || 0} transaksi</p>
            </div>
            <div className="bg-white/10 p-4 rounded-xl">
              <p className="text-xs opacity-80 mb-1">Backup Terakhir</p>
              <p className="text-lg font-bold">{backupInfo.backupDate || '-'}</p>
            </div>
          </div>
        ) : (
          <div className="text-center py-4">
            <Loader2 className="animate-spin mx-auto" size={24} />
            <p className="mt-2">Memuat info database...</p>
          </div>
        )}
      </div>

      {/* BACKUP & RESTORE SECTION */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* BACKUP CARD */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg">
              <Download size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-800">Export Data</h3>
              <p className="text-sm text-gray-500">Download data dalam berbagai format</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <button
              onClick={handleExportExcel}
              disabled={isExporting}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isExporting ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Exporting...
                </>
              ) : (
                <>
                  <FileSpreadsheet size={20} />
                  Export Excel
                </>
              )}
            </button>
            
            <button
              onClick={handleExportBackup}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Processing...
                </>
              ) : (
                <>
                  <FileJson size={20} />
                  Backup JSON
                </>
              )}
            </button>
            
            <div className="text-xs text-gray-500 pt-4 border-t">
              <p><strong>Tip:</strong> Simpan backup di lokasi yang aman.</p>
            </div>
          </div>
        </div>

        {/* RESTORE CARD */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-amber-100 text-amber-700 rounded-lg">
              <Upload size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-800">Restore Data</h3>
              <p className="text-sm text-gray-500">Import data dari file backup</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl">
              <div className="flex items-start gap-2">
                <AlertTriangle className="text-amber-600 mt-0.5" size={16} />
                <div>
                  <p className="text-sm font-bold text-amber-800 mb-1">⚠️ PERINGATAN</p>
                  <p className="text-xs text-amber-700">
                    Restore akan mengganti semua data yang ada. Backup data saat ini terlebih dahulu.
                  </p>
                </div>
              </div>
            </div>
            
            <div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImportBackup}
                accept=".json,application/json"
                className="hidden"
              />
              
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={loading}
                className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    Processing...
                  </>
                ) : (
                  <>
                    <Upload size={20} />
                    Restore dari File
                  </>
                )}
              </button>
              
              <p className="text-xs text-gray-500 mt-2 text-center">
                Format file: Excel (.xlsx, .xls)
              </p>
            </div>
          </div>
          
          <div className="text-xs text-gray-500 pt-4 border-t">
            <p><strong>Panduan:</strong> Download template → Isi data → Upload file. Data akan ditambahkan ke database.</p>
          </div>
        </div>
      </div>

      {/* DANGER ZONE */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-red-200">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-red-100 text-red-700 rounded-lg">
            <AlertTriangle size={20} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-red-800">Zona Berbahaya</h3>
            <p className="text-sm text-red-600">Aksi yang tidak dapat dibatalkan</p>
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="bg-red-50 p-4 rounded-xl">
            <p className="text-sm text-red-700 mb-3">
              <strong>⚠️ PERHATIAN:</strong> Aksi di bawah ini akan menghapus data.
            </p>
          </div>
          
          <button
            onClick={handleClearCache}
            className="w-full py-3 border border-red-300 text-red-700 font-bold rounded-xl hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
          >
            <Trash2 size={18} />
            Bersihkan Cache Browser
          </button>
          
          <p className="text-xs text-gray-500">
            <strong>Cache:</strong> Menghapus data sementara di browser. Login diperlukan kembali.
          </p>
        </div>
      </div>

      {/* FOOTER */}
      <div className="text-center text-gray-400 text-sm pt-6 border-t">
        <p>Dashboard Keuangan Paguyuban Cluster Beryl • Version 2.0</p>
        <p className="mt-1">© {new Date().getFullYear()} - All rights reserved</p>
      </div>
    </div>
  );
};
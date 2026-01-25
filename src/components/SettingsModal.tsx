import React, { useRef } from 'react';
import { Download, Upload, FileSpreadsheet, Database, AlertTriangle, X } from 'lucide-react';

interface SettingsModalProps {
  onClose: () => void;
  onBackup: () => void;
  onRestore: (file: File) => void;
  onExportResidents: () => void;
  onExportFinance: () => void;
  onExportExpenses: () => void;
  isLoading: boolean;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  onClose,
  onBackup,
  onRestore,
  onExportResidents,
  onExportFinance,
  onExportExpenses,
  isLoading
}) => {
  const restoreInputRef = useRef<HTMLInputElement>(null);

  const handleRestoreClick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (window.confirm("PERINGATAN: Restore akan MENGHAPUS semua data saat ini dan menggantinya dengan data dari file backup. Data yang tidak ada di backup akan hilang. Lanjutkan?")) {
        onRestore(file);
      }
      e.target.value = ''; // Reset input agar bisa pilih file sama lagi
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[60] animate-fade-in">
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full overflow-hidden">
        <div className="p-4 border-b flex justify-between items-center bg-gray-50">
          <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2">
            <Database size={20} className="text-beryl-600"/> 
            Admin Tools & Data
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20}/></button>
        </div>
        
        <div className="p-6 space-y-6">
          
          {/* Section Export Excel */}
          <div>
            <h4 className="text-sm font-semibold text-gray-500 uppercase mb-3">Laporan Excel</h4>
            <div className="grid grid-cols-1 gap-3">
              <button 
                onClick={onExportResidents}
                disabled={isLoading}
                className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-green-50 hover:border-green-200 hover:text-green-700 transition-all text-left"
              >
                <div className="bg-green-100 p-2 rounded-full text-green-600"><FileSpreadsheet size={18}/></div>
                <div>
                  <div className="font-medium">Download Data Warga Lengkap</div>
                  <div className="text-xs text-gray-500">Export semua data warga ke Excel</div>
                </div>
              </button>

              <button 
                onClick={onExportFinance}
                disabled={isLoading}
                className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 transition-all text-left"
              >
                <div className="bg-blue-100 p-2 rounded-full text-blue-600"><FileSpreadsheet size={18}/></div>
                <div>
                  <div className="font-medium">Laporan Pemasukan (Bulan Ini)</div>
                  <div className="text-xs text-gray-500">Status Iuran Wajib & Nominal Iuran Acara</div>
                </div>
              </button>

              <button 
                onClick={onExportExpenses}
                disabled={isLoading}
                className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-red-50 hover:border-red-200 hover:text-red-700 transition-all text-left"
              >
                <div className="bg-red-100 p-2 rounded-full text-red-600"><FileSpreadsheet size={18}/></div>
                <div>
                  <div className="font-medium">Laporan Pengeluaran</div>
                  <div className="text-xs text-gray-500">Daftar semua belanja operasional</div>
                </div>
              </button>
            </div>
          </div>

          <hr/>

          {/* Section Backup & Restore */}
          <div>
            <h4 className="text-sm font-semibold text-gray-500 uppercase mb-3">Backup & Restore Database</h4>
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={onBackup}
                disabled={isLoading}
                className="flex flex-col items-center justify-center gap-2 p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-all text-center"
              >
                <Download size={24} className="text-gray-600"/>
                <span className="text-sm font-medium">Backup Data (JSON)</span>
              </button>

              <button 
                onClick={() => restoreInputRef.current?.click()}
                disabled={isLoading}
                className="flex flex-col items-center justify-center gap-2 p-4 rounded-lg border border-red-100 bg-red-50 hover:bg-red-100 transition-all text-center relative"
              >
                <input 
                  type="file" 
                  ref={restoreInputRef} 
                  className="hidden" 
                  accept=".json" 
                  onChange={handleRestoreClick}
                />
                <Upload size={24} className="text-red-600"/>
                <span className="text-sm font-medium text-red-700">Restore Database</span>
              </button>
            </div>
            <div className="mt-2 text-xs text-yellow-700 flex items-start gap-1 bg-yellow-50 p-2 rounded">
              <AlertTriangle size={12} className="mt-0.5 shrink-0"/>
              <span>Restore akan menimpa seluruh database saat ini.</span>
            </div>
          </div>

        </div>
        
        <div className="p-4 bg-gray-50 text-right">
          <button onClick={onClose} className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 text-sm font-medium">
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
import { 
  fetchResidents, 
  fetchExpenses, 
  fetchAllPayments, 
  fetchComments,
  createResident,
  updateResident,
  deleteResident,
  createExpense,
  updateExpense,
  deleteExpense,
  togglePayment
} from './dataService';
import { Resident, Expense, Payment, Comment } from '../types';

export interface BackupInfo {
  backupDate: string;
  totalResidents: number;
  totalExpenses: number;
  totalPayments: number;
  totalComments: number;
  totalEventDues: string;
  totalExpensesAmount: string;
  version: string;
  size: number;
}

export interface BackupData {
  metadata: {
    timestamp: string;
    version: string;
    backupDate: string;
    application: string;
    exportDate: string;
  };
  data: {
    residents: Resident[];
    expenses: Expense[];
    payments: Payment[];
    comments?: Comment[];
  };
  stats: {
    totalResidents: number;
    totalExpenses: number;
    totalPayments: number;
    totalComments?: number;
    totalEventDues: number;
    totalExpensesAmount: number;
  };
}

export const backupService = {
  // Download backup sebagai file JSON
  async exportToJson() {
    try {
      // Panggil fungsi exportDataToJSON dari dataService
      const { exportDataToJSON } = await import('./dataService');
      await exportDataToJSON();
      return { success: true, message: 'Backup berhasil didownload' };
    } catch (error: any) {
      console.error('❌ Backup export error:', error);
      return { success: false, message: error.message || 'Gagal export backup' };
    }
  },

  // Import & Restore dari file JSON
  async importFromJson(file: File): Promise<{success: boolean, message: string, data?: BackupData}> {
    try {
      console.log('🔄 Memulai proses restore dari file...');
      
      // Validasi file
      if (!file || file.type !== 'application/json') {
        throw new Error('File harus berupa JSON (.json)');
      }
      
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        throw new Error('Ukuran file terlalu besar (maksimal 10MB)');
      }
      
      // Baca file
      const text = await file.text();
      const backupData: BackupData = JSON.parse(text);
      
      // Validasi struktur data
      if (!backupData.metadata || !backupData.data) {
        throw new Error('Format backup tidak valid');
      }
      
      console.log('📦 Data backup ditemukan:', {
        residents: backupData.data.residents?.length || 0,
        expenses: backupData.data.expenses?.length || 0,
        payments: backupData.data.payments?.length || 0,
        version: backupData.metadata.version,
        date: backupData.metadata.backupDate
      });
      
      // Konfirmasi restore
      const confirmed = window.confirm(
        `⚠️ **RESTORE DATA** ⚠️\n\n` +
        `Anda akan mengimpor data dari backup:\n` +
        `• Tanggal Backup: ${backupData.metadata.backupDate}\n` +
        `• Warga: ${backupData.data.residents?.length || 0} data\n` +
        `• Pengeluaran: ${backupData.data.expenses?.length || 0} data\n` +
        `• Pembayaran: ${backupData.data.payments?.length || 0} data\n\n` +
        `**PERINGATAN:** Data saat ini akan digantikan!\n\n` +
        `Lanjutkan restore?`
      );
      
      if (!confirmed) {
        return { success: false, message: 'Restore dibatalkan oleh pengguna' };
      }
      
      // Simpan snapshot data saat ini (untuk rollback)
      const currentData = await this.createLocalBackup('pre_restore_backup');
      
      try {
        // Proses restore ke database
        await this.restoreToDatabase(backupData);
        
        console.log('✅ Restore berhasil!');
        return { 
          success: true, 
          message: `Restore berhasil! ${backupData.data.residents?.length || 0} data warga, ${backupData.data.expenses?.length || 0} pengeluaran, dan ${backupData.data.payments?.length || 0} pembayaran telah dipulihkan.`,
          data: backupData
        };
        
      } catch (restoreError: any) {
        // Rollback jika gagal
        console.error('❌ Restore gagal, melakukan rollback...', restoreError);
        await this.restoreFromBackup(currentData);
        
        return { 
          success: false, 
          message: `Restore gagal: ${restoreError.message || 'Unknown error'}. Data telah dikembalikan ke keadaan semula.` 
        };
      }
      
    } catch (error: any) {
      console.error('❌ Backup import error:', error);
      return { 
        success: false, 
        message: error.message || 'Gagal import backup. Pastikan file backup valid.' 
      };
    }
  },

  // Restore data ke database
  async restoreToDatabase(backupData: BackupData): Promise<void> {
    try {
      console.log('💾 Memulai restore ke database...');
      
      // Catat semua data yang ada saat ini untuk rollback
      const currentResidents = await fetchResidents();
      const currentExpenses = await fetchExpenses();
      const currentPayments = await fetchAllPayments();
      
      try {
        // Restore residents
        if (backupData.data.residents && backupData.data.residents.length > 0) {
          console.log(`Restoring ${backupData.data.residents.length} residents...`);
          
          // Hapus residents yang ada (dengan menghapus satu per satu)
          for (const resident of currentResidents) {
            try {
              await deleteResident(resident.id);
            } catch (err) {
              console.warn(`Gagal menghapus resident ${resident.id}:`, err);
            }
          }
          
          // Tambahkan residents dari backup
          for (const resident of backupData.data.residents) {
            try {
              if (resident.id) {
                await updateResident(resident);
              } else {
                await createResident(resident);
              }
            } catch (err) {
              console.warn(`Gagal restore resident ${resident.id || 'new'}:`, err);
            }
          }
        }
        
        // Restore expenses
        if (backupData.data.expenses && backupData.data.expenses.length > 0) {
          console.log(`Restoring ${backupData.data.expenses.length} expenses...`);
          
          // Catatan: Tidak ada fungsi delete all expenses di dataService
          // Kita akan menganggap expense dengan ID yang sama akan ditimpa
          for (const expense of backupData.data.expenses) {
            try {
              if (expense.id) {
                await updateExpense(expense as any);
              } else {
                await createExpense(expense);
              }
            } catch (err) {
              console.warn(`Gagal restore expense ${expense.id || 'new'}:`, err);
            }
          }
        }
        
        // Restore payments
        if (backupData.data.payments && backupData.data.payments.length > 0) {
          console.log(`Restoring ${backupData.data.payments.length} payments...`);
          
          // Untuk payments, kita bisa menggunakan togglePayment
          for (const payment of backupData.data.payments) {
            try {
              // Set payment status
              await togglePayment(
                payment.resident_id,
                payment.month,
                payment.year,
                true // isPaid
              );
            } catch (err) {
              console.warn(`Gagal restore payment ${payment.id}:`, err);
            }
          }
        }
        
        console.log('✅ Restore ke database selesai!');
        
      } catch (error: any) {
        // Jika terjadi error, coba rollback
        console.error('❌ Error selama restore:', error);
        throw error;
      }
      
    } catch (error: any) {
      console.error('❌ Error restoring to database:', error);
      throw new Error(`Gagal restore ke database: ${error.message}`);
    }
  },

  // Buat backup lokal (untuk rollback)
  async createLocalBackup(name: string = 'manual_backup'): Promise<BackupData> {
    try {
      console.log(`📦 Membuat backup lokal: ${name}`);
      
      const [residents, expenses, payments, comments] = await Promise.all([
        fetchResidents(),
        fetchExpenses(),
        fetchAllPayments(),
        fetchComments()
      ]);
      
      const backupData: BackupData = {
        metadata: {
          timestamp: new Date().toISOString(),
          version: "2.0",
          backupDate: new Date().toLocaleDateString('id-ID'),
          application: "Beryl Paguyuban System",
          exportDate: new Date().toLocaleDateString('id-ID')
        },
        data: {
          residents,
          expenses,
          payments,
          comments
        },
        stats: {
          totalResidents: residents.length,
          totalExpenses: expenses.length,
          totalPayments: payments.length,
          totalComments: comments.length,
          totalEventDues: residents.reduce((sum, r) => sum + (r.eventDuesAmount || 0), 0),
          totalExpensesAmount: expenses.reduce((sum, e) => sum + e.amount, 0)
        }
      };
      
      // Simpan ke localStorage untuk rollback
      localStorage.setItem(`beryl_rollback_${name}_${Date.now()}`, JSON.stringify(backupData));
      
      // Hapus rollback lama (simpan hanya 3 terakhir)
      this.cleanupOldRollbacks();
      
      return backupData;
      
    } catch (error: any) {
      console.error('❌ Error creating local backup:', error);
      throw error;
    }
  },

  // Restore dari backup lokal
  async restoreFromBackup(backupData: BackupData): Promise<void> {
    await this.restoreToDatabase(backupData);
  },

  // Hapus rollback lama
  cleanupOldRollbacks(): void {
    try {
      const rollbackKeys = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith('beryl_rollback_')) {
          rollbackKeys.push(key);
        }
      }
      
      // Urutkan berdasarkan timestamp (terlama dulu)
      rollbackKeys.sort((a, b) => {
        const timestampA = parseInt(a.split('_').pop() || '0');
        const timestampB = parseInt(b.split('_').pop() || '0');
        return timestampA - timestampB;
      });
      
      // Hapus yang lama, sisakan 3 terbaru
      while (rollbackKeys.length > 3) {
        const keyToRemove = rollbackKeys.shift();
        if (keyToRemove) {
          localStorage.removeItem(keyToRemove);
          console.log(`🗑️ Dihapus rollback lama: ${keyToRemove}`);
        }
      }
    } catch (error) {
      console.warn('Gagal cleanup rollback:', error);
    }
  },

  // Get backup info
  async getBackupInfo(): Promise<BackupInfo> {
    try {
      const [residents, expenses, payments, comments] = await Promise.all([
        fetchResidents(),
        fetchExpenses(),
        fetchAllPayments(),
        fetchComments()
      ]);
      
      const totalEventDues = residents.reduce((sum, r) => sum + (r.eventDuesAmount || 0), 0);
      const totalExpensesAmount = expenses.reduce((sum, e) => sum + e.amount, 0);
      
      // Cek backup terakhir
      let lastBackup = '-';
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith('beryl_rollback_')) {
          try {
            const data = JSON.parse(localStorage.getItem(key) || '{}');
            if (data.metadata?.backupDate) {
              lastBackup = data.metadata.backupDate;
              break;
            }
          } catch (e) {
            // Ignore corrupt data
          }
        }
      }
      
      return {
        backupDate: lastBackup,
        totalResidents: residents.length,
        totalExpenses: expenses.length,
        totalPayments: payments.length,
        totalComments: comments.length,
        totalEventDues: `Rp ${totalEventDues.toLocaleString('id-ID')}`,
        totalExpensesAmount: `Rp ${totalExpensesAmount.toLocaleString('id-ID')}`,
        version: "2.0",
        size: residents.length + expenses.length + payments.length + comments.length
      };
    } catch (error: any) {
      console.error('Error getting backup info:', error);
      return {
        backupDate: '-',
        totalResidents: 0,
        totalExpenses: 0,
        totalPayments: 0,
        totalComments: 0,
        totalEventDues: 'Rp 0',
        totalExpensesAmount: 'Rp 0',
        version: "2.0",
        size: 0
      };
    }
  },

  // Create backup snapshot (simpan di localStorage sebagai cadangan sementara)
  createLocalSnapshot(data: any, name: string = 'auto_backup') {
    try {
      const snapshot = {
        data,
        timestamp: Date.now(),
        name,
        created: new Date().toISOString()
      };
      
      localStorage.setItem(`beryl_snapshot_${name}`, JSON.stringify(snapshot));
      return { success: true, message: 'Snapshot berhasil dibuat' };
    } catch (error: any) {
      console.error('❌ Snapshot error:', error);
      return { success: false, message: 'Gagal membuat snapshot' };
    }
  },

  // Load snapshot dari localStorage
  loadLocalSnapshot(name: string = 'auto_backup'): BackupData | null {
    try {
      const snapshotStr = localStorage.getItem(`beryl_snapshot_${name}`);
      if (!snapshotStr) {
        throw new Error('Snapshot tidak ditemukan');
      }
      
      return JSON.parse(snapshotStr);
    } catch (error: any) {
      console.error('❌ Load snapshot error:', error);
      return null;
    }
  },

  // List semua snapshot yang tersedia
  listSnapshots() {
    const snapshots = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('beryl_snapshot_')) {
        try {
          const snapshot = JSON.parse(localStorage.getItem(key) || '{}');
          snapshots.push({
            name: key.replace('beryl_snapshot_', ''),
            timestamp: snapshot.timestamp,
            created: snapshot.created,
            size: JSON.stringify(snapshot).length
          });
        } catch (e) {
          console.warn(`Snapshot ${key} corrupt`);
        }
      }
    }
    return snapshots.sort((a, b) => b.timestamp - a.timestamp);
  },

  // Hapus snapshot
  deleteSnapshot(name: string) {
    try {
      localStorage.removeItem(`beryl_snapshot_${name}`);
      return { success: true, message: 'Snapshot berhasil dihapus' };
    } catch (error) {
      return { success: false, message: 'Gagal menghapus snapshot' };
    }
  },

  // Export ke CSV (format sederhana)
  exportToCsv(residents: any[], expenses: any[], payments: any[]) {
    try {
      // Convert residents to CSV
      let csvContent = "data:text/csv;charset=utf-8,";
      
      // Residents CSV
      const residentHeader = "ID,Nama,Blok,WhatsApp,Status,Iuran Acara,Catatan,Terakhir Diupdate\n";
      const residentRows = residents.map(r => 
        `${r.id},"${r.fullName}","${r.blockNumber}","${r.whatsapp}","${r.occupancyStatus}",${r.eventDuesAmount},"${r.notes}",${new Date(r.updatedAt).toLocaleString('id-ID')}`
      ).join("\n");
      
      csvContent += "===== DATA WARGA =====\n" + residentHeader + residentRows + "\n\n";
      
      // Expenses CSV
      const expenseHeader = "ID,Deskripsi,Jumlah,Tanggal,Kategori\n";
      const expenseRows = expenses.map(e => 
        `${e.id},"${e.description}",${e.amount},${new Date(e.date).toLocaleString('id-ID')},"${e.category}"`
      ).join("\n");
      
      csvContent += "===== PENGELUARAN =====\n" + expenseHeader + expenseRows + "\n\n";
      
      // Payments CSV
      const paymentHeader = "ID,ID Warga,Bulan,Tahun,Jumlah,Tanggal Bayar\n";
      const paymentRows = payments.map(p => 
        `${p.id},${p.resident_id || p.residentId},${p.month},${p.year},${p.amount},${new Date(p.paid_at || p.paidAt || Date.now()).toLocaleString('id-ID')}`
      ).join("\n");
      
      csvContent += "===== PEMBAYARAN =====\n" + paymentHeader + paymentRows;
      
      // Download CSV
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `beryl_export_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      return { success: true, message: 'Export CSV berhasil' };
    } catch (error: any) {
      console.error('❌ CSV export error:', error);
      return { success: false, message: 'Gagal export CSV' };
    }
  }
};

export default backupService;
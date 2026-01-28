import * as XLSX from 'xlsx';
import storageService from './storageService';
import { Resident, Expense, Payment } from '../types';

/** Helper untuk mendapatkan nama bulan */
const getMonthName = (m: number) => {
  const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
  return months[m - 1] || 'N/A';
};

export const excelService = {
  /** 1. FUNGSI UTAMA: EKSPOR SEMUA DATA (SANGAT LENGKAP) */
  async exportAllToExcel(): Promise<void> {
    try {
      const [res, exp, pay] = await Promise.all([
        storageService.getResidents(),
        storageService.getExpenses(),
        storageService.getAllMonthlyPayments()
      ]);

      const wb = XLSX.utils.book_new();
      const resMap = new Map(res.map(r => [r.id, r.fullName]));

      // SHEET 1: DATA WARGA + IURAN SUKARELA
      const ws1 = XLSX.utils.json_to_sheet(res.map(r => ({
        'Blok': r.blockNumber, 
        'Nama Lengkap': r.fullName, 
        'Status': r.occupancyStatus, 
        'WhatsApp': r.whatsapp, 
        'Iuran Sukarela': r.eventDuesAmount,
        'Catatan': r.notes
      })));
      XLSX.utils.book_append_sheet(wb, ws1, "Data Warga");

      // SHEET 2: PENGELUARAN DETAIL
      const ws2 = XLSX.utils.json_to_sheet(exp.map(e => ({
        'Tanggal': e.date, 
        'Kategori': e.category, 
        'Deskripsi': e.description, 
        'Nominal (Rp)': e.amount
      })));
      XLSX.utils.book_append_sheet(wb, ws2, "Pengeluaran");

      // SHEET 3: RIWAYAT IURAN 10RB (MASUK) - FIX INI YANG ANDA MINTA
      const ws3 = XLSX.utils.json_to_sheet(pay.map(p => ({
        'Nama Warga': resMap.get(p.resident_id) || 'N/A',
        'Bulan': getMonthName(p.month),
        'Tahun': p.year,
        'Nominal': p.amount,
        'Tanggal Bayar': new Date(p.paid_at).toLocaleDateString('id-ID')
      })));
      XLSX.utils.book_append_sheet(wb, ws3, "Iuran Kas 10rb");

      // SHEET 4: BUKU KAS BESAR (GABUNGAN MASUK & KELUAR)
      const gabungan: any[] = [];
      pay.forEach(p => gabungan.push({ tgl: new Date(p.paid_at), ket: `Iuran 10rb - ${resMap.get(p.resident_id)}`, masuk: p.amount, keluar: 0 }));
      exp.forEach(e => gabungan.push({ tgl: new Date(e.date), ket: e.description, masuk: 0, keluar: e.amount }));
      gabungan.sort((a, b) => b.tgl.getTime() - a.tgl.getTime());
      
      const ws4 = XLSX.utils.json_to_sheet(gabungan.map(g => ({
        'Tanggal': g.tgl.toLocaleDateString('id-ID'), 
        'Keterangan': g.ket, 
        'Pemasukan': g.masuk, 
        'Pengeluaran': g.keluar
      })));
      XLSX.utils.book_append_sheet(wb, ws4, "Buku Kas Besar");

      // SHEET 5: RINGKASAN SALDO
      const totalWajib = pay.length * 10000;
      const totalSukarela = res.reduce((s, r) => s + r.eventDuesAmount, 0);
      const totalBelanja = exp.reduce((s, e) => s + e.amount, 0);
      const ws5 = XLSX.utils.json_to_sheet([
        { 'Item': 'Total Warga', 'Nilai': res.length },
        { 'Item': 'Total Kas Wajib Masuk', 'Nilai': totalWajib },
        { 'Item': 'Total Iuran Sukarela Masuk', 'Nilai': totalSukarela },
        { 'Item': 'Total Seluruh Pengeluaran', 'Nilai': totalBelanja },
        { 'Item': 'SALDO AKHIR', 'Nilai': (totalWajib + totalSukarela) - totalBelanja }
      ]);
      XLSX.utils.book_append_sheet(wb, ws5, "Ringkasan");

      XLSX.writeFile(wb, `Laporan_Besar_Beryl_${new Date().getTime()}.xlsx`);
    } catch (error) {
      console.error("Export error:", error);
      alert("Gagal melakukan ekspor data.");
    }
  },

  /** 2. FUNGSI EKSPOR FILTER TANGGAL (FIX ERROR MANAGEMENT MODAL) */
  async exportByDateRange(from: Date | null, to: Date | null): Promise<void> {
    if (!from || !to) return;
    const exp = await storageService.getExpenses();
    const filtered = exp.filter(e => {
      const d = new Date(e.date);
      return d >= from && d <= to;
    });

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(filtered.map(e => ({
      'Tanggal': e.date, 'Kategori': e.category, 'Deskripsi': e.description, 'Nominal': e.amount
    })));
    XLSX.utils.book_append_sheet(wb, ws, "Filter Pengeluaran");
    XLSX.writeFile(wb, `Laporan_Filter_Beryl.xlsx`);
  },

  /** 3. FUNGSI EKSPOR RINGKASAN (FIX ERROR MANAGEMENT MODAL) */
  async exportSummaryReport(): Promise<void> {
    const wb = await this.createSummaryWorkbookFromData();
    XLSX.writeFile(wb, `Ringkasan_Beryl.xlsx`);
  },

  /** Helper untuk membuat workbook ringkasan */
  async createSummaryWorkbookFromData() {
    const [res, pay, exp] = await Promise.all([
      storageService.getResidents(),
      storageService.getAllMonthlyPayments(),
      storageService.getExpenses()
    ]);
    const wb = XLSX.utils.book_new();
    const totalWajib = pay.length * 10000;
    const totalSukarela = res.reduce((s, r) => s + r.eventDuesAmount, 0);
    const totalBelanja = exp.reduce((s, e) => s + e.amount, 0);
    const ws = XLSX.utils.json_to_sheet([
      { 'Item': 'Total Kas Wajib', 'Nilai': totalWajib },
      { 'Item': 'Total Kas Sukarela', 'Nilai': totalSukarela },
      { 'Item': 'Total Belanja', 'Nilai': totalBelanja },
      { 'Item': 'Sisa Saldo', 'Nilai': (totalWajib + totalSukarela) - totalBelanja }
    ]);
    XLSX.utils.book_append_sheet(wb, ws, "Ringkasan");
    return wb;
  }
};

export default excelService;
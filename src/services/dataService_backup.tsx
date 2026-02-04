import { supabase } from '../supabaseClient';
import { Resident, Expense, Payment, Comment, OccupancyStatus } from '../types';
import * as XLSX from 'xlsx';
import { GoogleGenerativeAI } from "@google/generative-ai";

// ==================== HELPER ====================
const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

const dateToTimestamp = (d: string): number => new Date(d).getTime();
const timestampToDate = (t: number): string => new Date(t).toISOString().split('T')[0];

// ==================== CRUD WARGA ====================
export const fetchResidents = async (): Promise<Resident[]> => {
  const { data, error } = await supabase.from('residents').select('*').order('block_number');
  if (error) throw error;
  return (data || []).map((r: any) => ({
    id: r.id, fullName: r.full_name, blockNumber: r.block_number, whatsapp: r.whatsapp,
    occupancyStatus: r.occupancy_status, eventDuesAmount: Number(r.event_dues_amount) || 0,
    notes: r.notes || ''
  }));
};

export const fetchResidentsWithStatus = async (m: number, y: number): Promise<Resident[]> => {
  const { data: res, error: re } = await supabase.from('residents').select('*').order('block_number');
  if (re) throw re;
  const { data: pay, error: pe } = await supabase.from('monthly_payments').select('resident_id').eq('month', m).eq('year', y);
  const paidIds = new Set((pay || []).map(p => p.resident_id));
  return res.map((r: any) => ({
    id: r.id, fullName: r.full_name, blockNumber: r.block_number, whatsapp: r.whatsapp,
    occupancyStatus: r.occupancy_status, eventDuesAmount: Number(r.event_dues_amount) || 0,
    notes: r.notes || '', isPaidCurrentMonth: paidIds.has(r.id)
  }));
};

export const createResident = async (r: any) => {
  await supabase.from('residents').insert([{
    full_name: r.fullName, block_number: r.blockNumber, whatsapp: r.whatsapp,
    occupancy_status: r.occupancyStatus, event_dues_amount: Number(r.eventDuesAmount),
    notes: r.notes
  }]);
};

export const updateResident = async (r: any) => {
  await supabase.from('residents').update({
    full_name: r.fullName, block_number: r.blockNumber, whatsapp: r.whatsapp,
    occupancy_status: r.occupancyStatus, event_dues_amount: Number(r.eventDuesAmount),
    notes: r.notes
  }).eq('id', r.id);
};

export const updateResidentPayment = async (id: string, isPaid: boolean, month: number, year: number) => {
  if (isPaid) {
    await supabase.from('monthly_payments').insert([{
      resident_id: id,
      month: month,
      year: year,
      amount: 10000,
      paid_at: Date.now()
    }]);
  } else {
    await supabase.from('monthly_payments')
      .delete()
      .match({ resident_id: id, month: month, year: year });
  }
};

export const deleteResident = async (id: string) => {
  await supabase.from('residents').delete().eq('id', id);
};

// ==================== CRUD PENGELUARAN ====================
export const fetchExpenses = async (): Promise<Expense[]> => {
  const { data, error } = await supabase.from('expenses').select('*').order('date', { ascending: false });
  if (error) throw error;
  return (data || []).map((e: any) => ({
    id: e.id, description: e.description, amount: Number(e.amount),
    date: timestampToDate(e.date), category: e.category, receiptUrl: e.receipt_url
  }));
};

export const createExpense = async (e: any) => {
  await supabase.from('expenses').insert([{
    description: e.description, amount: Number(e.amount), date: dateToTimestamp(e.date),
    category: e.category, receipt_url: e.receiptUrl || ''
  }]);
};

export const deleteExpense = async (id: string) => {
  await supabase.from('expenses').delete().eq('id', id);
};

export const updateExpense = async (e: any) => {
  await supabase.from('expenses').update({
    description: e.description, amount: Number(e.amount), date: dateToTimestamp(e.date),
    category: e.category, receipt_url: e.receiptUrl || ''
  }).eq('id', e.id);
};

// ==================== IURAN & LAINNYA ====================
export const fetchAllPayments = async (): Promise<Payment[]> => {
  const { data, error } = await supabase.from('monthly_payments').select('*');
  if (error) throw error;
  return (data || []).map((p: any) => ({ id: p.id, resident_id: p.resident_id, month: p.month, year: p.year, amount: p.amount, paid_at: p.paid_at }));
};

export const fetchPaymentsByMonth = async (m: number, y: number) => {
  const { data } = await supabase.from('monthly_payments').select('*').eq('month', m).eq('year', y);
  return data || [];
};

export const togglePayment = async (rid: string, m: number, y: number, status: boolean) => {
  if (status) await supabase.from('monthly_payments').insert([{ resident_id: rid, month: m, year: y, amount: 10000, paid_at: Date.now() }]);
  else await supabase.from('monthly_payments').delete().match({ resident_id: rid, month: m, year: y });
};

export const fetchComments = async () => {
  const { data } = await supabase.from('comments').select('*').order('created_at', { ascending: false });
  return data || [];
};

export const createComment = async (n: string, c: string) => { await supabase.from('comments').insert([{ name: n, content: c }]); };
export const deleteComment = async (id: string) => { await supabase.from('comments').delete().eq('id', id); };

export const analyzeFinancesWithAI = async (sum: string) => {
  const key = import.meta.env.VITE_GEMINI_API_KEY;
  if (!key) return "AI Key Error";
  const genAI = new GoogleGenerativeAI(key);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const result = await model.generateContent(sum);
  return result.response.text();
};

// ==================== EKSPOR EXCEL ====================
export const exportDataToExcel = async () => {
  const [residents, payments, expenses] = await Promise.all([
    fetchResidents(),
    fetchAllPayments(),
    fetchExpenses()
  ]);

  const wb = XLSX.utils.book_new();

  // Sheet Warga
  const wsWarga = XLSX.utils.json_to_sheet(residents.map(r => ({
    'Nama Lengkap': r.fullName,
    'Nomor Blok': r.blockNumber,
    'WhatsApp': r.whatsapp,
    'Status Hunian': r.occupancyStatus,
    'Iuran Kas': r.eventDuesAmount,
    'Catatan': r.notes
  })));
  XLSX.utils.book_append_sheet(wb, wsWarga, 'Data Warga');

  // Sheet Pembayaran
  const wsPembayaran = XLSX.utils.json_to_sheet(payments.map(p => ({
    'Nama Warga': residents.find(r => r.id === p.resident_id)?.fullName || 'Unknown',
    'Bulan': months[p.month - 1],
    'Tahun': p.year,
    'Jenis': 'Kas',
    'Jumlah': p.amount,
    'Tanggal': new Date(p.paid_at).toLocaleDateString('en-GB') // DD/MM/YYYY format
  })));
  XLSX.utils.book_append_sheet(wb, wsPembayaran, 'Data Pembayaran');

  // Sheet Pengeluaran
  const wsPengeluaran = XLSX.utils.json_to_sheet(expenses.map(e => ({
    'Keterangan': e.description,
    'Jumlah': e.amount,
    'Tanggal': new Date(e.date).toLocaleDateString('en-GB') // DD/MM/YYYY format
  })));
  XLSX.utils.book_append_sheet(wb, wsPengeluaran, 'Data Pengeluaran');

  XLSX.writeFile(wb, `Data_Paguyuban_Beryl_${new Date().toISOString().split('T')[0]}.xlsx`);
};

export const importDataFromExcel = async (file: File) => {
  const data = await file.arrayBuffer();
  const workbook = XLSX.read(data);
  
  const results = {
    residents: 0,
    payments: 0,
    expenses: 0,
    errors: [] as string[]
  };

  // Helper function to parse DD/MM/YYYY format
  const parseDate = (dateStr: string): string => {
    if (!dateStr) return new Date().toISOString().split('T')[0];
    
    // Try DD/MM/YYYY format first
    const ddmmyyyy = dateStr.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (ddmmyyyy) {
      const [, day, month, year] = ddmmyyyy;
      return `${year}-${month}-${day}`;
    }
    
    // Try YYYY-MM-DD format
    const yyyymmdd = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (yyyymmdd) {
      return dateStr;
    }
    
    // Default to today if invalid format
    return new Date().toISOString().split('T')[0];
  };

  // Helper function to convert status
  const convertStatus = (status: string): OccupancyStatus => {
    if (!status) return 'Menetap';
    const statusLower = status.toLowerCase();
    if (statusLower === 'di huni' || statusLower === 'dihuni' || statusLower === 'occupied') return 'Menetap';
    if (statusLower === 'kosong' || statusLower === 'vacant') return 'Penyewa';
    if (statusLower === 'kunjungan') return 'Kunjungan';
    if (statusLower === 'ditempati 2026') return 'Ditempati 2026';
    return 'Menetap';
  };

  try {
    // Import Data Warga
    if (workbook.Sheets['Data Warga']) {
      const wargaData = XLSX.utils.sheet_to_json(workbook.Sheets['Data Warga']) as any[];
      
      for (const row of wargaData) {
        try {
          if (row['Nama Lengkap'] && row['Nomor Blok']) {
            await createResident({
              fullName: row['Nama Lengkap'],
              blockNumber: row['Nomor Blok'],
              whatsapp: row['WhatsApp'] || '',
              occupancyStatus: convertStatus(row['Status Hunian']),
              eventDuesAmount: Number(row['Iuran Kas']) || 10000,
              notes: row['Catatan'] || ''
            });
            results.residents++;
          }
        } catch (error) {
          results.errors.push(`Error importing warga ${row['Nama Lengkap']}: ${error}`);
        }
      }
    }

    // Import Data Pembayaran
    if (workbook.Sheets['Data Pembayaran']) {
      const paymentData = XLSX.utils.sheet_to_json(workbook.Sheets['Data Pembayaran']) as any[];
      
      for (const row of paymentData) {
        try {
          if (row['Nama Warga'] && row['Bulan'] && row['Tahun']) {
            // Find resident by name
            const { data: residents } = await supabase.from('residents').select('id').eq('full_name', row['Nama Warga']);
            if (residents && residents.length > 0) {
              const monthIndex = months.indexOf(row['Bulan']);
              if (monthIndex !== -1) {
                await createPayment({
                  residentId: residents[0].id,
                  month: monthIndex + 1,
                  year: Number(row['Tahun']),
                  type: row['Jenis'] || 'kas',
                  amount: Number(row['Jumlah']) || 10000,
                  timestamp: new Date(parseDate(row['Tanggal'])).getTime()
                });
                results.payments++;
              }
            }
          }
        } catch (error) {
          results.errors.push(`Error importing payment for ${row['Nama Warga']}: ${error}`);
        }
      }
    }

    // Import Data Pengeluaran
    if (workbook.Sheets['Data Pengeluaran']) {
      const expenseData = XLSX.utils.sheet_to_json(workbook.Sheets['Data Pengeluaran']) as any[];
      
      for (const row of expenseData) {
        try {
          if (row['Keterangan']) {
            await createExpense({
              description: row['Keterangan'],
              amount: Number(row['Jumlah']) || 0,
              date: parseDate(row['Tanggal']),
              category: row['Kategori'] || 'Operasional'
            });
            results.expenses++;
          }
        } catch (error) {
          results.errors.push(`Error importing expense: ${error}`);
        }
      }
    }

  } catch (error) {
    results.errors.push(`General import error: ${error}`);
  }

  return results;
};

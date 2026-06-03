import { supabase } from '../supabaseClient';
import { Resident, Expense, Payment, Comment, OccupancyStatus } from '../types';
import * as XLSX from 'xlsx';

const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

// ==================== UTILITY TANGGAL STANDAR ====================
export const normalizeDate = (d: any): string => {
  if (!d) return new Date().toISOString().split('T')[0];
  if (typeof d === 'number') return new Date(d).toISOString().split('T')[0];
  if (typeof d === 'string') return d.includes('T') ? d.split('T')[0] : d;
  return new Date().toISOString().split('T')[0];
};

export const formatToLocalIdDate = (dateStr: string): string => {
  try {
    return new Date(normalizeDate(dateStr)).toLocaleDateString('id-ID', {
      day: 'numeric', month: 'long', year: 'numeric'
    });
  } catch {
    return dateStr;
  }
};

// ==================== PENYIMPANAN STRUKTUR ORGANISASI KELOMPOK & SEKSI (SUPABASE & FALLBACK) ====================
export const fetchLeadershipStructure = async (): Promise<any[]> => {
  try {
    const { data, error } = await supabase
      .from('organization_structure')
      .select('data')
      .eq('id', 'leadership')
      .single();
    if (error) throw error;
    return data?.data || [];
  } catch (err) {
    console.warn("Table 'organization_structure' missing or inaccessible. Loading from local fallback.");
    const local = localStorage.getItem('beryl_leadership_struct');
    return local ? JSON.parse(local) : [];
  }
};

export const saveLeadershipStructure = async (structureData: any[]) => {
  try {
    const { error } = await supabase
      .from('organization_structure')
      .upsert({ id: 'leadership', data: structureData, updated_at: new Date().toISOString() });
    if (error) throw error;
  } catch (err) {
    console.warn("Saving structure to local storage fallback.");
    localStorage.setItem('beryl_leadership_struct', JSON.stringify(structureData));
  }
};

export const fetchDivisionsStructure = async (): Promise<any[]> => {
  try {
    const { data, error } = await supabase
      .from('organization_structure')
      .select('data')
      .eq('id', 'divisions')
      .single();
    if (error) throw error;
    return data?.data || [];
  } catch (err) {
    console.warn("Table 'organization_structure' missing or inaccessible. Loading from local fallback.");
    const local = localStorage.getItem('beryl_divisions_struct');
    return local ? JSON.parse(local) : [];
  }
};

export const saveDivisionsStructure = async (structureData: any[]) => {
  try {
    const { error } = await supabase
      .from('organization_structure')
      .upsert({ id: 'divisions', data: structureData, updated_at: new Date().toISOString() });
    if (error) throw error;
  } catch (err) {
    console.warn("Saving structure to local storage fallback.");
    localStorage.setItem('beryl_divisions_struct', JSON.stringify(structureData));
  }
};

// ==================== RIWAYAT KAS ACARA RELASIONAL ====================
export interface EventPayment {
  id: string;
  resident_id: string;
  resident_name?: string;
  amount: number;
  event_name: string;
  paid_at: string;
}

export const fetchEventPayments = async (): Promise<EventPayment[]> => {
  try {
    const { data, error } = await supabase.from('event_payments').select('*').order('paid_at', { ascending: false });
    if (error) throw error;
    return (data || []).map((p: any) => ({
      id: p.id, resident_id: p.resident_id, amount: Number(p.amount) || 0,
      event_name: p.event_name, paid_at: normalizeDate(p.paid_at)
    }));
  } catch (err) {
    const local = localStorage.getItem('beryl_event_payments_history');
    return local ? JSON.parse(local) : [];
  }
};

export const createEventPayment = async (p: Omit<EventPayment, 'id'>) => {
  const newPayment = { id: `evp_${Date.now()}`, ...p, paid_at: normalizeDate(p.paid_at) };
  try {
    const { error } = await supabase.from('event_payments').insert([newPayment]);
    if (error) throw error;
  } catch (err) {
    const local = localStorage.getItem('beryl_event_payments_history');
    const history = local ? JSON.parse(local) : [];
    history.unshift(newPayment);
    localStorage.setItem('beryl_event_payments_history', JSON.stringify(history));
  }
};

export const deleteEventPayment = async (id: string) => {
  try {
    const { error } = await supabase.from('event_payments').delete().eq('id', id);
    if (error) throw error;
  } catch (err) {
    const local = localStorage.getItem('beryl_event_payments_history');
    if (local) {
      const history: EventPayment[] = JSON.parse(local);
      localStorage.setItem('beryl_event_payments_history', JSON.stringify(history.filter(p => p.id !== id)));
    }
  }
};

// ==================== LOG KEAMANAN / TAMU REAL-TIME & FALLBACK ====================
export const fetchTamu = async (): Promise<any[]> => {
  try {
    const { data, error } = await supabase.from('tamu').select('*').order('waktu_masuk', { ascending: false });
    if (error) throw error;
    return data || [];
  } catch (err) {
    const local = localStorage.getItem('beryl_tamu_history');
    return local ? JSON.parse(local) : [];
  }
};

export const createTamu = async (t: any) => {
  const newTamu = { id_tamu: Date.now(), ...t, waktu_masuk: t.waktu_masuk || new Date().toISOString() };
  try {
    const { error } = await supabase.from('tamu').insert([{
      nama_tamu: t.nama_tamu, id_rumah_tujuan: t.id_rumah_tujuan,
      waktu_masuk: t.waktu_masuk, waktu_keluar: t.waktu_keluar,
      titip_identitas: t.titip_identitas, tujuan_kunjungan: t.tujuan_kunjungan
    }]);
    if (error) throw error;
  } catch (err) {
    const local = localStorage.getItem('beryl_tamu_history');
    const history = local ? JSON.parse(local) : [];
    history.unshift(newTamu);
    localStorage.setItem('beryl_tamu_history', JSON.stringify(history));
  }
};

export const updateTamu = async (id: number, t: any) => {
  try {
    const { error } = await supabase.from('tamu').update({
      nama_tamu: t.nama_tamu, id_rumah_tujuan: t.id_rumah_tujuan,
      titip_identitas: t.titip_identitas, tujuan_kunjungan: t.tujuan_kunjungan,
      waktu_masuk: t.waktu_masuk, waktu_keluar: t.waktu_keluar
    }).eq('id_tamu', id);
    if (error) throw error;
  } catch (err) {
    const local = localStorage.getItem('beryl_tamu_history');
    if (local) {
      const history: any[] = JSON.parse(local);
      const updated = history.map(item => item.id_tamu === id ? { ...item, ...t } : item);
      localStorage.setItem('beryl_tamu_history', JSON.stringify(updated));
    }
  }
};

export const updateTamuKeluar = async (id: number, waktuKeluar: string) => {
  try {
    const { error } = await supabase.from('tamu').update({ waktu_keluar: waktuKeluar }).eq('id_tamu', id);
    if (error) throw error;
  } catch (err) {
    const local = localStorage.getItem('beryl_tamu_history');
    if (local) {
      const history: any[] = JSON.parse(local);
      const updated = history.map(t => t.id_tamu === id ? { ...t, waktu_keluar: waktuKeluar } : t);
      localStorage.setItem('beryl_tamu_history', JSON.stringify(updated));
    }
  }
};

export const deleteTamu = async (id: number) => {
  try {
    const { error } = await supabase.from('tamu').delete().eq('id_tamu', id);
    if (error) throw error;
  } catch (err) {
    const local = localStorage.getItem('beryl_tamu_history');
    if (local) {
      const history: any[] = JSON.parse(local);
      localStorage.setItem('beryl_tamu_history', JSON.stringify(history.filter(t => t.id_tamu !== id)));
    }
  }
};

// ==================== LAYANAN PENJADWALAN FASUM (CALENDAR & BOOKING) ====================
export interface FasumBooking {
  id: string;
  facility: 'Lapangan Bulutangkis' | 'Mini Soccer';
  booker_name: string;
  block_number: string;
  booking_date: string; 
  start_time: string; 
  end_time: string; 
  created_at?: string;
}

export const fetchFasumBookings = async (): Promise<FasumBooking[]> => {
  try {
    const { data, error } = await supabase.from('fasum_bookings').select('*').order('booking_date', { ascending: true });
    if (error) throw error;
    return (data || []).map((b: any) => ({
      id: b.id, facility: b.facility, booker_name: b.booker_name, block_number: b.block_number,
      booking_date: normalizeDate(b.booking_date),
      start_time: b.start_time ? b.start_time.substring(0, 5) : '',
      end_time: b.end_time ? b.end_time.substring(0, 5) : '',
      created_at: b.created_at
    }));
  } catch (err) {
    const local = localStorage.getItem('beryl_fasum_bookings_history');
    return local ? JSON.parse(local) : [];
  }
};

export const createFasumBooking = async (b: Omit<FasumBooking, 'id'>) => {
  try {
    const { error } = await supabase.from('fasum_bookings').insert([{
      facility: b.facility, booker_name: b.booker_name, block_number: b.block_number,
      booking_date: b.booking_date, start_time: b.start_time, end_time: b.end_time
    }]);
    if (error) {
      if (error.code === '23505') {
        const conflictError = new Error('CONCURRENT_CONFLICT');
        (conflictError as any).code = '23505';
        throw conflictError;
      }
      throw error;
    }
  } catch (err: any) {
    if (err.code === '23505' || err.message === 'CONCURRENT_CONFLICT') throw err;
    const newBooking = { id: `book_${Date.now()}`, ...b, booking_date: normalizeDate(b.booking_date) };
    const local = localStorage.getItem('beryl_fasum_bookings_history');
    const bookings = local ? JSON.parse(local) : [];
    bookings.push(newBooking);
    localStorage.setItem('beryl_fasum_bookings_history', JSON.stringify(bookings));
  }
};

export const deleteFasumBooking = async (id: string) => {
  try {
    const { error } = await supabase.from('fasum_bookings').delete().eq('id', id);
    if (error) throw error;
  } catch (err) {
    const local = localStorage.getItem('beryl_fasum_bookings_history');
    if (local) {
      const bookings: FasumBooking[] = JSON.parse(local);
      localStorage.setItem('beryl_fasum_bookings_history', JSON.stringify(bookings.filter(b => b.id !== id)));
    }
  }
};

// ==================== SERIALISASI DATA KEPENDUDUKAN LENGKAP ====================
export interface ExtendedResidentFields {
  id_rumah?: string;
  jenis_kelamin?: string;
  peran_keluarga?: string;
  tempat_tgl_lahir?: string;
  agama?: string;
  golongan_darah?: string;
  pekerjaan?: string;
  status_warga?: string;
  tanggal_bergabung?: string;
  nama_pemilik_asli?: string;
  no_hp_pemilik_asli?: string;
  tgl_mulai_huni?: string;
  jenis_kendaraan?: string;
  plat_nomor?: string;
  keterangan_warna_merk?: string;
  family_members_list?: any[]; 
}

export const serializeExtendedFields = (fields: ExtendedResidentFields, rawNotes: string = ''): string => {
  return JSON.stringify({ _is_extended: true, fields, rawNotes });
};

export const deserializeExtendedFields = (notesString: string | null, isAuthenticated: boolean = false): { fields: ExtendedResidentFields; rawNotes: string } => {
  const defaultFields: ExtendedResidentFields = {
    id_rumah: '', jenis_kelamin: 'Laki-Laki', peran_keluarga: 'Kepala Keluarga',
    tempat_tgl_lahir: '', agama: 'Islam', golongan_darah: 'O', pekerjaan: '',
    status_warga: 'Tetap', tanggal_bergabung: '', nama_pemilik_asli: '',
    no_hp_pemilik_asli: '', tgl_mulai_huni: '', jenis_kendaraan: 'Tidak Ada',
    plat_nomor: '', keterangan_warna_merk: '', family_members_list: []
  };

  if (!notesString) return { fields: defaultFields, rawNotes: '' };
  try {
    if (notesString.trim().startsWith('{')) {
      const parsed = JSON.parse(notesString);
      if (parsed._is_extended) {
        if (!isAuthenticated && parsed.fields) {
          if (parsed.fields.no_hp_pemilik_asli) parsed.fields.no_hp_pemilik_asli = '🔒 Terproteksi';
          
          if (parsed.fields.tempat_tgl_lahir) parsed.fields.tempat_tgl_lahir = '🔒 Terproteksi';
          
          if (parsed.fields.family_members_list) {
            parsed.fields.family_members_list = parsed.fields.family_members_list.map((f: any) => ({ 
              ...f, 
              phone: '🔒 Terproteksi',
              birth_place: '🔒 Terproteksi' 
            }));
          }
        }
        return { fields: { ...defaultFields, ...parsed.fields }, rawNotes: parsed.rawNotes || '' };
      }
    }
  } catch (e) {}
  return { fields: defaultFields, rawNotes: notesString };
};

// ==================== ALGORITME SINKRONISASI CERMIN GANDA ====================
const saveToLocalMirror = (residents: Resident[]) => localStorage.setItem('beryl_residents_mirror_db', JSON.stringify(residents));
const getLocalMirror = (): Resident[] => {
  const mirror = localStorage.getItem('beryl_residents_mirror_db');
  return mirror ? JSON.parse(mirror) : [];
};

// ==================== CRUD WARGA DENGAN FILTER PRIVASI GUEST ====================
export const fetchResidents = async (): Promise<Resident[]> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    const isAuth = !!session;
    const selectQuery = isAuth 
      ? 'id, full_name, block_number, whatsapp, occupancy_status, event_dues_amount, notes, updated_at'
      : 'id, full_name, block_number, occupancy_status, event_dues_amount, notes, updated_at';

    const { data, error } = await supabase.from('residents').select(selectQuery).order('block_number');
    if (error) throw error;
    const mapped = (data || []).map((r: any) => ({
      id: r.id, fullName: r.full_name, blockNumber: r.block_number,
      whatsapp: isAuth ? r.whatsapp : '🔒 Terproteksi (Mode Tamu)',
      occupancyStatus: r.occupancy_status, eventDuesAmount: Number(r.event_dues_amount) || 0,
      notes: r.notes || '', updatedAt: r.updated_at
    }));
    saveToLocalMirror(mapped);
    return mapped;
  } catch (err) {
    return getLocalMirror();
  }
};

export const fetchResidentsWithStatus = async (m: number, y: number): Promise<Resident[]> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    const isAuth = !!session;
    const selectQuery = isAuth 
      ? 'id, full_name, block_number, whatsapp, occupancy_status, event_dues_amount, notes, updated_at'
      : 'id, full_name, block_number, occupancy_status, event_dues_amount, notes, updated_at';

    const { data: res, error: re } = await supabase.from('residents').select(selectQuery).order('block_number');
    if (re) throw re;
    const { data: pay } = await supabase.from('monthly_payments').select('resident_id').eq('month', m).eq('year', y);
    const paidIds = new Set((pay || []).map(p => p.resident_id));
    const mapped = res.map((r: any) => ({
      id: r.id, fullName: r.full_name, blockNumber: r.block_number,
      whatsapp: isAuth ? r.whatsapp : '🔒 Terproteksi (Mode Tamu)',
      occupancyStatus: r.occupancy_status, eventDuesAmount: Number(r.event_dues_amount) || 0,
      notes: r.notes || '', updatedAt: r.updated_at, isPaidCurrentMonth: paidIds.has(r.id)
    }));
    saveToLocalMirror(mapped);
    return mapped;
  } catch (err) {
    return getLocalMirror().map(r => ({ ...r, isPaidCurrentMonth: false }));
  }
};

export const createResident = async (r: any) => {
  const { data, error } = await supabase.from('residents').insert([{
    full_name: r.fullName, block_number: r.blockNumber, whatsapp: r.whatsapp,
    occupancy_status: r.occupancyStatus, event_dues_amount: Number(r.eventDuesAmount),
    notes: r.notes, updated_at: Date.now()
  }]).select();
  if (error) throw error;
  
  const currentMirror = getLocalMirror();
  if (data && data[0]) {
    const newRes = { id: data[0].id, fullName: r.fullName, blockNumber: r.blockNumber, whatsapp: r.whatsapp, occupancyStatus: r.occupancyStatus, eventDuesAmount: Number(r.eventDuesAmount), notes: r.notes, updatedAt: Date.now() };
    saveToLocalMirror([newRes, ...currentMirror]);
  }
  return data;
};

export const updateResident = async (r: any) => {
  const { error } = await supabase.from('residents').update({
    full_name: r.fullName, block_number: r.blockNumber, whatsapp: r.whatsapp,
    occupancy_status: r.occupancyStatus, event_dues_amount: Number(r.eventDuesAmount),
    notes: r.notes, updated_at: Date.now()
  }).eq('id', r.id);
  if (error) throw error;

  const currentMirror = getLocalMirror();
  saveToLocalMirror(currentMirror.map(item => item.id === r.id ? { ...item, fullName: r.fullName, blockNumber: r.blockNumber, whatsapp: r.whatsapp, occupancyStatus: r.occupancyStatus, eventDuesAmount: Number(r.eventDuesAmount), notes: r.notes, updatedAt: Date.now() } : item));
};

export const updateResidentPayment = async (id: string, isPaid: boolean, month: number, year: number) => {
  if (isPaid) {
    await supabase.from('monthly_payments').insert([{ resident_id: id, month, year, amount: 10000, paid_at: Date.now() }]);
  } else {
    await supabase.from('monthly_payments').delete().match({ resident_id: id, month, year });
  }
};

export const deleteResident = async (id: string) => {
  const { error } = await supabase.from('residents').delete().eq('id', id);
  if (error) throw error;
  const currentMirror = getLocalMirror();
  saveToLocalMirror(currentMirror.filter(r => r.id !== id));
};

// ==================== CRUD PENGELUARAN ====================
export const fetchExpenses = async (): Promise<Expense[]> => {
  const { data, error } = await supabase.from('expenses').select('*').order('date', { ascending: false });
  if (error) throw error;
  return (data || []).map((e: any) => ({
    id: e.id, description: e.description, amount: Number(e.amount),
    date: normalizeDate(e.date), category: e.category, receiptUrl: e.receipt_url
  }));
};

export const createExpense = async (e: any) => {
  await supabase.from('expenses').insert([{
    description: e.description, amount: Number(e.amount), date: new Date(normalizeDate(e.date)).getTime(),
    category: e.category, receipt_url: e.receiptUrl || ''
  }]);
};

export const deleteExpense = async (id: string) => {
  await supabase.from('expenses').delete().eq('id', id);
};

export const updateExpense = async (e: any) => {
  await supabase.from('expenses').update({
    description: e.description, amount: Number(e.amount), date: new Date(normalizeDate(e.date)).getTime(),
    category: e.category, receipt_url: e.receiptUrl || ''
  }).eq('id', e.id);
};

// ==================== IURAN KAS WAJIB ====================
export const fetchAllPayments = async (): Promise<Payment[]> => {
  const { data, error } = await supabase.from('monthly_payments').select('*');
  if (error) throw error;
  return (data || []).map((p: any) => ({ id: p.id, resident_id: p.resident_id, month: p.month, year: p.year, amount: p.amount, paid_at: p.paid_at }));
};

export const togglePayment = async (rid: string, m: number, y: number, status: boolean) => {
  if (status) {
    await supabase.from('monthly_payments').insert([{ resident_id: rid, month: m, year: y, amount: 10000, paid_at: Date.now() }]);
  } else {
    await supabase.from('monthly_payments').delete().match({ resident_id: rid, month: m, year: y });
  }
};

export const fetchComments = async () => {
  const { data } = await supabase.from('comments').select('*').order('created_at', { ascending: false });
  return data || [];
};

export const createComment = async (n: string, c: string) => { 
  await supabase.from('comments').insert([{ name: n, content: c }]); 
};

export const deleteComment = async (id: string) => { 
  await supabase.from('comments').delete().eq('id', id); 
};

// ==================== EKSPOR EXCEL & EXCEL TOOLS ====================
export const exportDataToExcel = async () => {
  const [residents, payments, expenses] = await Promise.all([
    fetchResidents(), fetchAllPayments(), fetchExpenses()
  ]);

  const wb = XLSX.utils.book_new();

  const wsWarga = XLSX.utils.json_to_sheet(residents.map(r => {
    const { fields, rawNotes } = deserializeExtendedFields(r.notes, true);
    return {
      'Nama Lengkap': r.fullName, 'Nomor Blok': r.blockNumber, 'WhatsApp': r.whatsapp,
      'Status Hunian': r.occupancyStatus, 'Iuran Sukarela': r.eventDuesAmount,
      'ID Rumah': fields.id_rumah || r.blockNumber, 'Jenis Kelamin': fields.jenis_kelamin,
      'Peran Keluarga': fields.peran_keluarga, 'Tempat, Tgl Lahir': fields.tempat_tgl_lahir,
      'Agama': fields.agama, 'Gol. Darah': fields.golongan_darah, 'Pekerjaan': fields.pekerjaan,
      'Status Warga': fields.status_warga, 'Tanggal Bergabung': fields.tanggal_bergabung,
      'Nama Pemilik Asli': fields.nama_pemilik_asli, 'No. HP Pemilik Asli': fields.no_hp_pemilik_asli,
      'Mulai Huni': fields.tgl_mulai_huni, 'Jenis Kendaraan': fields.jenis_kendaraan,
      'Plat Nomor': fields.plat_nomor, 'Warna / Merk': fields.keterangan_warna_merk,
      'Catatan Tambahan': rawNotes
    };
  }));
  XLSX.utils.book_append_sheet(wb, wsWarga, 'Data Warga Lengkap');

  const wsPembayaran = XLSX.utils.json_to_sheet(payments.map(p => ({
    'Nama Warga': residents.find(r => r.id === p.resident_id)?.fullName || 'N/A',
    'Bulan': months[p.month - 1], 'Tahun': p.year, 'Jumlah': p.amount,
    'Tanggal': new Date(p.paid_at).toLocaleDateString('id-ID')
  })));
  XLSX.utils.book_append_sheet(wb, wsPembayaran, 'Data Kas Wajib');

  const wsPengeluaran = XLSX.utils.json_to_sheet(expenses.map(e => ({
    'Keterangan': e.description, 'Jumlah': e.amount, 'Tanggal': formatToLocalIdDate(e.date), 'Kategori': e.category
  })));
  XLSX.utils.book_append_sheet(wb, wsPengeluaran, 'Data Pengeluaran');

  XLSX.writeFile(wb, `Ekspor_Data_Cluster_Beryl_${new Date().toISOString().split('T')[0]}.xlsx`);
};

export const exportDataToJSON = async () => {
  const [residents, expenses, payments, comments] = await Promise.all([
    fetchResidents(), fetchExpenses(), fetchAllPayments(), fetchComments()
  ]);
  const blob = new Blob([JSON.stringify({ residents, expenses, payments, comments }, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a'); 
  link.href = url; link.download = `backup_database_beryl.json`; link.click();
};

export const importDataFromExcel = async (file: File) => {
  const data = await file.arrayBuffer();
  const workbook = XLSX.read(data);
  const results = { residents: 0, payments: 0, expenses: 0, errors: [] as string[] };

  try {
    if (workbook.Sheets['Data Warga Lengkap']) {
      const wargaData = XLSX.utils.sheet_to_json(workbook.Sheets['Data Warga Lengkap']) as any[];
      for (const row of wargaData) {
        try {
          if (row['Nama Lengkap'] && row['Nomor Blok']) {
            await createResident({
              fullName: row['Nama Lengkap'], blockNumber: row['Nomor Blok'], whatsapp: row['WhatsApp'] || '',
              occupancyStatus: row['Status Hunian'] || 'Menetap', eventDuesAmount: Number(row['Iuran Sukarela']) || 0,
              notes: serializeExtendedFields({
                id_rumah: row['ID Rumah'] || row['Nomor Blok'], jenis_kelamin: row['Jenis Kelamin'] || 'Laki-Laki',
                peran_keluarga: row['Peran Keluarga'] || 'Kepala Keluarga', tempat_tgl_lahir: row['Tempat, Tgl Lahir'] || '',
                agama: row['Agama'] || 'Islam', golongan_darah: row['Gol. Darah'] || 'O', pekerjaan: row['Pekerjaan'] || '',
                status_warga: row['Status Warga'] || 'Tetap', tanggal_bergabung: row['Tanggal Bergabung'] || '',
                nama_pemilik_asli: row['Nama Pemilik Asli'] || '', no_hp_pemilik_asli: row['No. HP Pemilik Asli'] || '',
                tgl_mulai_huni: row['Mulai Huni'] || '', jenis_kendaraan: row['Jenis Kendaraan'] || 'Tidak Ada',
                plat_nomor: row['Plat Nomor'] || '', keterangan_warna_merk: row['Warna / Merk'] || '',
                family_members_list: []
              }, row['Catatan Tambahan'] || '')
            });
            results.residents++;
          }
        } catch (e: any) {
          results.errors.push(`Error baris warga: ${e.message}`);
        }
      }
    }
  } catch (error: any) {
    results.errors.push(`Gagal membaca Excel: ${error.message}`);
  }
  return results;
};

export const downloadExcelTemplate = () => {
  const wb = XLSX.utils.book_new();

  const wsWarga = XLSX.utils.json_to_sheet([
    {
      'Nama Lengkap': 'M. Wahyu Heriyanto', 'Nomor Blok': 'C5/09', 'WhatsApp': '089672003771',
      'Status Hunian': 'Menetap', 'Iuran Sukarela': 50000, 'ID Rumah': 'C5/09',
      'Jenis Kelamin': 'Laki-Laki', 'Peran Keluarga': 'Kepala Keluarga', 'Tempat, Tgl Lahir': 'Cirebon, 27-01-1990',
      'Agama': 'Islam', 'Gol. Darah': 'O', 'Pekerjaan': 'Swasta', 'Status Warga': 'Tetap',
      'Tanggal Bergabung': '2026-01-03', 'Nama Pemilik Asli': 'Wahyu', 'No. HP Pemilik Asli': '089672003771',
      'Mulai Huni': '2026-01-03', 'Jenis Kendaraan': 'Mobil', 'Plat Nomor': 'B 1234 BRL',
      'Warna / Merk': 'Hitam / Toyota', 'Catatan Tambahan': 'Contoh catatan warga'
    }
  ]);
  XLSX.utils.book_append_sheet(wb, wsWarga, 'Data Warga Lengkap');
  XLSX.writeFile(wb, `Template_Impor_Kependudukan_Beryl.xlsx`);
};
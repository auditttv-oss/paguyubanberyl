// src/types.ts

export type OccupancyStatus = 'Menetap' | 'Penyewa' | 'Kunjungan' | 'Ditempati 2026';

export type TabView = 'dashboard' | 'residents' | 'expenses' | 'blog' | 'structure' | 'adart' | 'settings' | 'keamanan';

export type UserRole = 'Ketua' | 'Bendahara' | 'Humas' | 'Security' | 'Tamu' | 'admin' | 'guest';

export interface FamilyMember {
  name: string;
  relation: 'Istri' | 'Anak' | 'Mertua' | 'Ayah' | 'Ibu' | 'Lainnya';
  phone?: string;
}

export interface Resident {
  id: string;
  fullName: string;
  blockNumber: string;
  whatsapp: string;
  occupancyStatus: OccupancyStatus;
  eventDuesAmount: number;
  notes: string;
  updatedAt: number;
  isPaidCurrentMonth?: boolean;
  familyMembers?: number;
  eventDuesCategory?: string;
}

export interface ResidentWithPayment extends Resident {
  isPaidCurrentMonth: boolean;
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  date: string; 
  category: 'Operasional' | 'Acara' | 'Lainnya';
  receiptUrl: string;
}

export interface Payment {
  id: string;
  resident_id: string;
  month: number;
  year: number;
  amount: number;
  paid_at: number;
}

export interface Comment {
  id: string;
  name: string;
  content: string;
  createdAt: string;
}

export interface FinancialSummary {
  balanceTotal: number;
  balanceMonthly: number;
  balanceEvent: number;
  totalResidents: number;
  paidResidents: number;
  unpaidResidents: number;
  totalEventDues: number;
}

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

export interface Tamu {
  id_tamu: number;
  nama_tamu: string;
  id_rumah_tujuan: string;
  waktu_masuk: string | null;
  waktu_keluar: string | null;
  titip_identitas: string;
}
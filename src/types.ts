// src/types.ts

export type OccupancyStatus = 'Menetap' | 'Penyewa' | 'Kunjungan' | 'Ditempati 2026';

export type TabView = 'dashboard' | 'residents' | 'expenses' | 'blog' | 'structure' | 'adart' | 'settings';

export type UserRole = 'admin' | 'guest';

export interface Resident {
  id: string;
  fullName: string;
  blockNumber: string;
  whatsapp: string;
  occupancyStatus: OccupancyStatus;
  eventDuesAmount: number;
  notes: string;
  updatedAt: number;
  createdAt?: number;
  changeType?: string;
  changeDetail?: string;
  isPaidCurrentMonth?: boolean;
  familyMembers?: number;
  eventDuesCategory?: string;
}

/** Interface untuk Dashboard & Resident Table */
export interface ResidentWithPayment extends Resident {
  isPaidCurrentMonth: boolean;
}

/** Interface untuk Pengeluaran */
export interface Expense {
  id: string;
  description: string;
  amount: number;
  date: string; 
  category: 'Operasional' | 'Acara' | 'Lainnya';
  receiptUrl: string;
}

/** Interface untuk Pembayaran Kas */
export interface Payment {
  id: string;
  resident_id: string;
  month: number;
  year: number;
  amount: number;
  paid_at: number;
}

/** Interface untuk Aspirasi/Blog */
export interface Comment {
  id: string;
  name: string;
  content: string;
  createdAt: string;
}

/** FIX: Interface untuk DashboardView agar build sukses */
export interface FinancialSummary {
  balanceTotal: number;
  balanceMonthly: number;
  balanceEvent: number;
  totalResidents: number;
  paidResidents: number;
  unpaidResidents: number;
  totalEventDues: number;
}

/** Interface untuk System Info */
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
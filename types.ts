export type OccupancyStatus = 'Menetap' | 'Penyewa' | 'Kunjungan' | 'Ditempati 2026';

export interface Resident {
  id: string; // UUID dari Supabase
  fullName: string; // Di DB: full_name
  blockNumber: string; // Di DB: block_number
  whatsapp: string;
  occupancyStatus: OccupancyStatus; // Di DB: occupancy_status
  monthlyDuesPaid: boolean; // Di DB: monthly_dues_paid
  eventDuesAmount: number; // Di DB: event_dues_amount
  notes: string;
  updatedAt: number; // Di DB: updated_at
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  date: number;
  category: 'Operasional' | 'Acara' | 'Lainnya';
}

export interface FinancialSummary {
  totalResidents: number;
  totalMonthlyDues: number;
  totalEventDues: number;
  totalExpenses: number;
  balance: number;
}

export enum TabView {
  DASHBOARD = 'DASHBOARD',
  RESIDENTS = 'RESIDENTS',
  EXPENSES = 'EXPENSES',
}
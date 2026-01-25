// constants.ts
export const APP_TITLE = 'Beryl Paguyuban';
export const APP_SUBTITLE = 'Sistem Keuangan & Administrasi Warga';

export const MONTHLY_DUES_AMOUNT = 10000; // Rp 10,000 per KK per month

export const OCCUPANCY_OPTIONS = [
  { value: 'Menetap', label: 'Menetap' },
  { value: 'Kunjungan', label: 'Kunjungan' },
  { value: 'Ditempati2026', label: 'Ditempati2026' },
  { value: 'Penyewa', label: 'Penyewa' },
];

// Tambahkan MONTH_NAMES yang missing
export const MONTH_NAMES = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

// Color themes
export const COLORS = {
  primary: '#064e3b', // emerald-900
  secondary: '#059669', // emerald-600
  accent: '#3b82f6', // blue-500
  danger: '#ef4444', // red-500
  warning: '#f59e0b', // amber-500
  success: '#10b981', // emerald-500
};

// Paguyuban information
export const PAGUYUBAN_INFO = {
  name: 'Paguyuban Cluster Beryl',
  location: 'Cluster Beryl Permata Mutiara Maja, Lebak - Banten',
  established: '3 Januari 2026',
  status: 'Transisi (Pra-RT)'
};

// Payment categories
export const PAYMENT_CATEGORIES = [
  'Iuran Bulanan',
  'Iuran Acara',
  'Sumbangan',
  'Lain-lain'
];

// Expense categories
export const EXPENSE_CATEGORIES = [
  'Operasional',
  'Acara',
  'Perbaikan',
  'Kemananan',
  'Kebersihan',
  'Lain-lain'
];
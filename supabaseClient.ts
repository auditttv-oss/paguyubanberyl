import { createClient } from '@supabase/supabase-js';

// Mengambil variabel environment
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase URL atau Key belum diset di file .env');
}

export const supabase = createClient(
  supabaseUrl || '',
  supabaseAnonKey || ''
);
// src/supabaseClient.ts
import { createClient } from '@supabase/supabase-js';

// Konfigurasi Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validasi konfigurasi
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Supabase configuration is missing!');
  console.log('VITE_SUPABASE_URL:', supabaseUrl ? 'Set' : 'Missing');
  console.log('VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? 'Set' : 'Missing');
  
  // Fallback untuk development
  if (import.meta.env.DEV) {
    console.warn('⚠️ Running in development mode without Supabase. Using localStorage fallback.');
  }
}

// Buat client Supabase
export const supabase = createClient(
  supabaseUrl || 'https://dummy.supabase.co',
  supabaseAnonKey || 'dummy-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
    db: {
      schema: 'public'
    },
    global: {
      headers: {
        'x-application-name': 'beryl-paguyuban'
      }
    }
  }
);

// Cek koneksi Supabase
export const checkSupabaseConnection = async () => {
  try {
    const { data, error } = await supabase.from('residents').select('count', { count: 'exact', head: true });
    
    if (error) {
      console.error('❌ Supabase connection failed:', error);
      return false;
    }
    
    console.log('✅ Supabase connected successfully');
    return true;
  } catch (error) {
    console.error('❌ Supabase connection error:', error);
    return false;
  }
};
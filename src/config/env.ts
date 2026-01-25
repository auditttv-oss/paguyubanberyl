interface Environment {
  // Supabase
  supabaseUrl: string;
  supabaseAnonKey: string;
  
  // Gemini AI
  geminiApiKey: string;
  
  // App Configuration
  appName: string;
  appVersion: string;
  appEnv: 'development' | 'production' | 'test';
  appUrl: string;
  
  // Feature Flags
  enableAiAnalysis: boolean;
  enableSupabaseSync: boolean;
  enableExcelExport: boolean;
  enableBackup: boolean;
  enablePwa: boolean;
  
  // Security & Performance
  sessionTimeout: number;
  maxFileSize: number;
  apiTimeout: number;
  cacheDuration: number;
  
  // Analytics (Optional)
  gaTrackingId?: string;
  sentryDsn?: string;
  
  // Third-party Integrations (Optional)
  googleMapsApiKey?: string;
  stripePublicKey?: string;
}

// Validate required environment variables
const requiredEnvVars = [
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY',
  'VITE_GEMINI_API_KEY'
] as const;

requiredEnvVars.forEach((envVar) => {
  if (!import.meta.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
});

// Parse environment variables with type safety
export const env: Environment = {
  // Supabase
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
  supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
  
  // Gemini AI
  geminiApiKey: import.meta.env.VITE_GEMINI_API_KEY,
  
  // App Configuration
  appName: import.meta.env.VITE_APP_NAME || 'Beryl Admin',
  appVersion: import.meta.env.VITE_APP_VERSION || '1.0.0',
  appEnv: (import.meta.env.VITE_APP_ENV as Environment['appEnv']) || 'development',
  appUrl: import.meta.env.VITE_APP_URL || 'http://localhost:3000',
  
  // Feature Flags
  enableAiAnalysis: import.meta.env.VITE_ENABLE_AI_ANALYSIS === 'true',
  enableSupabaseSync: import.meta.env.VITE_ENABLE_SUPABASE_SYNC === 'true',
  enableExcelExport: import.meta.env.VITE_ENABLE_EXCEL_EXPORT === 'true',
  enableBackup: import.meta.env.VITE_ENABLE_BACKUP === 'true',
  enablePwa: import.meta.env.VITE_ENABLE_PWA === 'true',
  
  // Security & Performance
  sessionTimeout: parseInt(import.meta.env.VITE_SESSION_TIMEOUT || '3600', 10),
  maxFileSize: parseInt(import.meta.env.VITE_MAX_FILE_SIZE || '5242880', 10),
  apiTimeout: parseInt(import.meta.env.VITE_API_TIMEOUT || '30000', 10),
  cacheDuration: parseInt(import.meta.env.VITE_CACHE_DURATION || '300', 10),
  
  // Analytics (Optional)
  gaTrackingId: import.meta.env.VITE_GA_TRACKING_ID,
  sentryDsn: import.meta.env.VITE_SENTRY_DSN,
  
  // Third-party Integrations (Optional)
  googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  stripePublicKey: import.meta.env.VITE_STRIPE_PUBLIC_KEY,
};

// Helper functions
export const isDevelopment = env.appEnv === 'development';
export const isProduction = env.appEnv === 'production';
export const isTest = env.appEnv === 'test';

// Log environment info (only in development)
if (isDevelopment) {
  console.log('🚀 Environment Configuration:', {
    appName: env.appName,
    appVersion: env.appVersion,
    appEnv: env.appEnv,
    features: {
      aiAnalysis: env.enableAiAnalysis,
      supabaseSync: env.enableSupabaseSync,
      excelExport: env.enableExcelExport,
      backup: env.enableBackup,
      pwa: env.enablePwa,
    }
  });
}

// Export default
export default env;
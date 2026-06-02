import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../supabaseClient';
import { Loader2 } from 'lucide-react';
import { UserRole } from '../types';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  role: UserRole;
  isKetua: boolean;
  isBendahara: boolean;
  isHumas: boolean;
  isSecurity: boolean;
  isAdmin: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        setUser(session?.user ?? null);
      } catch (error) {
        console.error('Error checking session:', error);
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const parseRole = (): UserRole => {
    if (!user) return 'Tamu';

    const metaRole = user.user_metadata?.role || user.user_metadata?.user_role;
    if (metaRole === 'Ketua' || metaRole === 'Bendahara' || metaRole === 'Humas' || metaRole === 'Security') {
      return metaRole as UserRole;
    }

    const email = user.email?.toLowerCase() || '';
    if (email.includes('satpam') || email.includes('security')) return 'Security';
    if (email.includes('ketua')) return 'Ketua';
    if (email.includes('bendahara')) return 'Bendahara';
    if (email.includes('humas') || email.includes('sekretaris')) return 'Humas';

    return 'Ketua';
  };

  const role = parseRole();

  const value = {
    user,
    session,
    loading,
    role,
    isKetua: role === 'Ketua',
    isBendahara: role === 'Bendahara',
    isHumas: role === 'Humas',
    isSecurity: role === 'Security',
    isAdmin: role === 'Ketua' || role === 'Bendahara' || role === 'Humas' || role === 'Security',
    signOut,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 flex flex-col items-center max-w-sm w-full text-center">
          <Loader2 className="animate-spin text-emerald-600 mb-4" size={48} />
          <h3 className="font-bold text-gray-800 text-lg mb-1">Memuat Sesi Keamanan</h3>
          <p className="text-gray-500 text-xs leading-relaxed">
            Sedang memverifikasi kredensial pertahanan sistem Cluster Beryl. Mohon tunggu sebentar.
          </p>
        </div>
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
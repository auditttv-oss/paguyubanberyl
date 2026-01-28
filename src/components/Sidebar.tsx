// src/components/Sidebar.tsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  TrendingDown, 
  LogOut, 
  FileText, 
  Shield, 
  MessageSquare, 
  LogIn
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import clsx from 'clsx'; // Pastikan install: npm install clsx

interface SidebarProps {
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onCloseMobile }) => {
  const { signOut, user } = useAuth();

  // Daftar Menu Navigasi
  const navItems = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/residents', label: 'Data Warga', icon: Users, protected: true },
    { to: '/expenses', label: 'Pengeluaran', icon: TrendingDown, protected: true },
    { to: '/blog', label: 'Blog & Aspirasi', icon: MessageSquare, protected: false },
    { to: '/ad-art', label: 'AD / ART', icon: FileText, protected: false },
    { to: '/structure', label: 'Struktur', icon: Shield, protected: false },
  ];

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-emerald-900 to-teal-900 text-white shadow-xl">
      {/* Header Sidebar */}
      <div className="p-6 border-b border-emerald-800/50">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-800/50 rounded-lg">
            <Shield size={24} className="text-emerald-300" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight">BERYL</h1>
            <p className="text-emerald-300 text-xs">Sistem Paguyuban</p>
          </div>
        </div>
        
        <div className={`mt-6 text-xs px-3 py-1.5 rounded-lg inline-flex items-center gap-2 font-bold w-full ${user ? 'bg-emerald-600/50 text-white border border-emerald-500/50' : 'bg-amber-500/20 text-amber-200 border border-amber-500/30'}`}>
          <div className={`w-2 h-2 rounded-full ${user ? 'bg-emerald-400' : 'bg-amber-400'} animate-pulse`}></div>
          {user ? 'Mode Admin Aktif' : 'Mode Tamu (View Only)'}
        </div>
      </div>

      {/* Menu Navigasi */}
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto custom-scrollbar">
        {navItems.map((item) => {
          // Jika item protected dan user tidak login, sembunyikan (Opsional, saat ini ditampilkan semua agar tamu bisa lihat menu tapi redirect ke login jika diklik)
          // if (item.protected && !user) return null; 

          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onCloseMobile}
              className={({ isActive }) =>
                clsx(
                  'flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all font-medium text-sm',
                  isActive
                    ? 'bg-emerald-700 text-white shadow-lg shadow-emerald-900/20 border border-emerald-600'
                    : 'text-emerald-100 hover:bg-emerald-800/50 hover:text-white hover:pl-5'
                )
              }
            >
              <item.icon size={20} className={clsx("opacity-80")} />
              {item.label}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer Sidebar */}
      <div className="p-4 border-t border-emerald-800 bg-emerald-900/30">
        {user ? (
          <button
            onClick={() => {
              if(window.confirm('Apakah Anda yakin ingin logout?')) signOut();
            }}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-rose-500/10 text-rose-200 hover:bg-rose-600 hover:text-white transition-all border border-rose-500/20 font-bold text-sm group"
          >
            <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" /> 
            Logout Admin
          </button>
        ) : (
          <NavLink
            to="/login"
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 transition-all shadow-lg font-bold text-sm group text-white"
          >
            <LogIn size={18} className="group-hover:translate-x-1 transition-transform" /> 
            Login Admin
          </NavLink>
        )}
        <p className="text-[10px] text-center text-emerald-400/60 mt-4">
          v2.0 • Cluster Beryl
        </p>
      </div>
    </div>
  );
};
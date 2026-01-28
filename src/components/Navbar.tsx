// src/components/Navbar.tsx
import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../supabaseClient';
import { 
  Users, 
  Receipt, 
  Settings, 
  LogOut, 
  BarChart3, 
  Shield,
  Menu,
  X,
  FileSpreadsheet,
  Bell,
  ChevronDown,
  HardDrive
} from 'lucide-react';

export const Navbar = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const handleExportExcel = () => {
    // Import function from dataService
    import('../services/dataService').then(module => {
      module.exportDataToExcel();
    }).catch(err => {
      console.error('Failed to export:', err);
      alert('Gagal export Excel');
    });
  };

  const navItems = [
    { path: '/', icon: BarChart3, label: 'Dashboard' },
    { path: '/residents', icon: Users, label: 'Warga' },
    { path: '/expenses', icon: Receipt, label: 'Pengeluaran' },
    { path: '/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <>
      <nav className="bg-white shadow-md border-b sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo/Brand */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden p-2 rounded-lg hover:bg-gray-100"
              >
                {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
              
              <div className="flex items-center gap-2">
                <div className="p-2 bg-emerald-600 text-white rounded-lg">
                  <Shield size={20} />
                </div>
                <div>
                  <span className="font-bold text-gray-800 text-lg">Beryl Paguyuban</span>
                  <p className="text-xs text-gray-500 hidden md:block">Cluster Beryl Financial System</p>
                </div>
              </div>
            </div>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <NavLink 
                  key={item.path}
                  to={item.path} 
                  className={({ isActive }) => 
                    `flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${isActive 
                      ? 'bg-emerald-600 text-white' 
                      : 'text-gray-600 hover:bg-gray-100'}`
                  }
                >
                  <item.icon size={18} />
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </div>

            {/* User Profile & Actions */}
            <div className="flex items-center gap-3">
              {/* Quick Actions Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <div className="w-8 h-8 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center font-bold">
                    {user?.email?.charAt(0).toUpperCase() || 'A'}
                  </div>
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-medium text-gray-700">{user?.email}</p>
                    <p className="text-xs text-gray-500">Administrator</p>
                  </div>
                  <ChevronDown size={16} className="text-gray-400" />
                </button>
                
                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border py-2 z-50">
                    <div className="px-4 py-3 border-b">
                      <p className="font-bold text-gray-800">{user?.email}</p>
                      <p className="text-sm text-gray-500">Admin Paguyuban Beryl</p>
                    </div>
                    
                    <button
                      onClick={handleExportExcel}
                      className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <FileSpreadsheet size={18} />
                      <span>Export Excel</span>
                    </button>
                    
                    <button
                      onClick={() => navigate('/settings')}
                      className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <Settings size={18} />
                      <span>Pengaturan</span>
                    </button>
                    
                    <div className="border-t my-2"></div>
                    
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut size={18} />
                      <span>Keluar</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-b shadow-lg">
          <div className="container mx-auto px-4 py-3">
            <div className="space-y-1">
              {navItems.map((item) => (
                <NavLink 
                  key={item.path}
                  to={item.path} 
                  onClick={() => setIsMenuOpen(false)}
                  className={({ isActive }) => 
                    `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive 
                      ? 'bg-emerald-50 text-emerald-700 border-l-4 border-emerald-600' 
                      : 'text-gray-700 hover:bg-gray-100'}`
                  }
                >
                  <item.icon size={20} />
                  <span className="font-medium">{item.label}</span>
                </NavLink>
              ))}
              
              <div className="pt-3 border-t">
                <button
                  onClick={handleExportExcel}
                  className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg"
                >
                  <FileSpreadsheet size={20} className="text-green-600" />
                  <span>Export Excel</span>
                </button>
                
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg"
                >
                  <LogOut size={20} />
                  <span>Keluar</span>
                </button>
              </div>
              
              <div className="pt-3 border-t">
                <div className="px-4 py-2">
                  <p className="text-sm text-gray-500">Logged in as:</p>
                  <p className="font-medium text-gray-800">{user?.email}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
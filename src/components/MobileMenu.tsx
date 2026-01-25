import React from 'react';
import { X, Home, LogOut, LogIn } from 'lucide-react';
import { TabView, UserRole } from '../types';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  navItems: Array<{
    id: TabView;
    label: string;
    icon: React.ComponentType<{ size?: number }>;
    color: string;
    description: string;
  }>;
  activeTab: TabView;
  onTabChange: (tab: TabView) => void;
  isAuthenticated: boolean;
  userRole: UserRole;
  onLogin: () => void;
  onLogout: () => void;
}

export const MobileMenu: React.FC<MobileMenuProps> = ({
  isOpen,
  onClose,
  navItems,
  activeTab,
  onTabChange,
  isAuthenticated,
  userRole,
  onLogin,
  onLogout
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      
      <div className="fixed top-0 left-0 w-64 h-full bg-white shadow-xl">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Home size={24} className="text-beryl-600" />
              <span className="font-bold text-gray-900">Beryl Admin</span>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <X size={20} />
            </button>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-beryl-100 rounded-lg flex items-center justify-center">
              <div className="w-2 h-2 bg-beryl-600 rounded-full"></div>
            </div>
            <div>
              <p className="text-sm font-medium">
                {isAuthenticated ? 'Admin' : 'Tamu'}
              </p>
              <p className="text-xs text-gray-500">{userRole}</p>
            </div>
          </div>
        </div>
        
        <nav className="p-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                onTabChange(item.id);
                onClose();
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 ${
                activeTab === item.id
                  ? 'bg-beryl-50 text-beryl-700'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <item.icon size={20} />
              <div className="text-left">
                <div className="font-medium">{item.label}</div>
                <div className="text-xs text-gray-500">{item.description}</div>
              </div>
            </button>
          ))}
        </nav>
        
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          {isAuthenticated ? (
            <button
              onClick={() => {
                onLogout();
                onClose();
              }}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg"
            >
              <LogOut size={18} />
              Logout
            </button>
          ) : (
            <button
              onClick={() => {
                onLogin();
                onClose();
              }}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-beryl-600 text-white rounded-lg hover:bg-beryl-700"
            >
              <LogIn size={18} />
              Login Admin
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
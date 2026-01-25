import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Menu, X } from 'lucide-react';

export const Layout: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden md:block w-72 flex-shrink-0 z-20">
        <Sidebar />
      </aside>

      {/* Mobile Sidebar (Drawer) */}
      <div 
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity md:hidden ${mobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setMobileMenuOpen(false)}
      />
      <div className={`fixed inset-y-0 left-0 w-72 z-50 transform transition-transform md:hidden ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <Sidebar onCloseMobile={() => setMobileMenuOpen(false)} />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Mobile Header */}
        <header className="md:hidden bg-white shadow-sm p-4 flex items-center justify-between z-10 flex-shrink-0">
          <button onClick={() => setMobileMenuOpen(true)} className="p-2 text-emerald-800">
            <Menu size={24} />
          </button>
          <span className="font-bold text-emerald-900">BERYL PAGUYUBAN</span>
          <div className="w-8" />
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-7xl mx-auto pb-20">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
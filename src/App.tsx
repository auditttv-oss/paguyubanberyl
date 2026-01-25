import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Import Pages
import { Dashboard } from './pages/Dashboard';
import { Residents } from './pages/Residents';
import { Expenses } from './pages/Expenses';
import { Login } from './pages/Login';
import { Settings } from './pages/Settings';
import { Blog } from './pages/Blog';
import { AdArtNew } from './pages/AdArt_new';
import { Structure } from './pages/Structure';

// Import Components
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000,
    },
  },
});

const Layout = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <aside className="hidden md:block w-72 flex-shrink-0 z-20">
        <Sidebar />
      </aside>

      <div 
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity md:hidden ${mobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setMobileMenuOpen(false)}
      />
      
      <div className={`fixed inset-y-0 left-0 w-72 z-50 transform transition-transform md:hidden ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <Sidebar onCloseMobile={() => setMobileMenuOpen(false)} />
      </div>

      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        <div className="md:hidden bg-white shadow-sm p-4 flex items-center justify-between z-10 flex-shrink-0 border-b">
          <button onClick={() => setMobileMenuOpen(true)} className="p-2 text-emerald-800 bg-emerald-50 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
          </button>
          <span className="font-bold text-emerald-900">BERYL PAGUYUBAN</span>
          <div className="w-8" />
        </div>

        {user && <div className="hidden md:block"><Navbar /></div>}

        <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-gray-50">
          <div className="max-w-7xl mx-auto pb-20 animate-in fade-in duration-500">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
    </div>
  );
  
  return user ? <>{children}</> : <Navigate to="/login" />;
};

function AppContent() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      
      {/* 
         PERUBAHAN PENTING: 
         Layout Residents & Expenses sekarang TIDAK dibungkus ProtectedRoute.
         Tamu bisa melihat, tapi fitur edit/hapus diatur di dalam komponen masing-masing.
      */}
      <Route path="/" element={<Layout><Dashboard /></Layout>} />
      <Route path="/residents" element={<Layout><Residents /></Layout>} />
      <Route path="/expenses" element={<Layout><Expenses /></Layout>} />
      <Route path="/blog" element={<Layout><Blog /></Layout>} />
      <Route path="/ad-art" element={<Layout><AdArtNew /></Layout>} />
      <Route path="/structure" element={<Layout><Structure /></Layout>} />
      
      {/* HANYA SETTINGS YANG PERLU LOGIN MUTLAK */}
      <Route path="/settings" element={<ProtectedRoute><Layout><Settings /></Layout></ProtectedRoute>} />
      
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <AppContent />
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
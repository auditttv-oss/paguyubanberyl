import React, { useState } from 'react';
import { Lock, User, ArrowLeft } from 'lucide-react';
import { APP_TITLE, APP_SUBTITLE } from '../constants';

interface LoginScreenProps {
  onLogin: (role: string) => void;
  onCancel: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, onCancel }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Updated authentication logic with new password
    if (username === 'bendahara' && password === 'Paguyuban2026?!') {
      onLogin('Bendahara');
    } else if (username === 'pengurus' && password === 'Paguyuban2026?!') {
      onLogin('Pengurus Inti');
    } else {
      setError('Username atau password salah. Akses terbatas.');
    }
  };

  return (
    <div className="min-h-screen bg-beryl-900 flex flex-col items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden relative">
        <div className="bg-beryl-50 p-8 text-center border-b border-beryl-100">
          <h1 className="text-2xl font-bold text-beryl-800">{APP_TITLE}</h1>
          <p className="text-beryl-600 text-sm mt-2">{APP_SUBTITLE}</p>
        </div>
        
        <div className="p-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-6 text-center">Login Admin</h2>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User size={18} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  required
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-beryl-500 focus:outline-none"
                  placeholder="bendahara / pengurus"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock size={18} className="text-gray-400" />
                </div>
                <input
                  type="password"
                  required
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-beryl-500 focus:outline-none"
                  placeholder="******"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg border border-red-100">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-beryl-600 hover:bg-beryl-700 text-white font-bold py-3 px-4 rounded-lg transition-colors shadow-md mt-4"
            >
              Masuk Aplikasi
            </button>
          </form>

          <div className="mt-4 pt-4 border-t border-gray-100">
            <button
              onClick={onCancel}
              className="w-full flex items-center justify-center gap-2 text-gray-500 hover:text-beryl-600 py-2 transition-colors text-sm font-medium"
            >
              <ArrowLeft size={16} /> Kembali lihat sebagai Tamu
            </button>
          </div>

          <div className="mt-4 text-center text-xs text-gray-400">
            Hanya untuk kepentingan pengurus Cluster Beryl.
          </div>
        </div>
      </div>
    </div>
  );
};
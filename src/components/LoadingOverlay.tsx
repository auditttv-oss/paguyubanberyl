import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingOverlayProps {
  message?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ 
  message = 'Memuat...' 
}) => {
  return (
    <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center">
      <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-200 flex flex-col items-center">
        <Loader2 size={48} className="animate-spin text-beryl-600 mb-4" />
        <p className="text-gray-700 font-medium">{message}</p>
        <p className="text-sm text-gray-500 mt-2">Harap tunggu sebentar</p>
      </div>
    </div>
  );
};
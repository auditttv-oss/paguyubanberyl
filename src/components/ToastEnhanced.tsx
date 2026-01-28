import React, { useEffect } from 'react';
import { CheckCircle, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastProps {
  message: string;
  type: ToastType;
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
}

export const Toast: React.FC<ToastProps> = ({ message, type, isVisible, onClose, duration = 3000 }) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose, duration]);

  if (!isVisible) return null;

  const baseClass =
    'fixed top-4 right-4 z-[100] flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg border transition-all animate-slide-in';
  const typeClass: Record<ToastType, string> = {
    success: 'bg-white border-green-200 text-green-800 dark:bg-gray-900 dark:border-green-900/50 dark:text-green-300',
    error: 'bg-white border-red-200 text-red-800 dark:bg-gray-900 dark:border-red-900/50 dark:text-red-300',
    warning: 'bg-white border-yellow-200 text-yellow-800 dark:bg-gray-900 dark:border-yellow-900/50 dark:text-yellow-300',
    info: 'bg-white border-blue-200 text-blue-800 dark:bg-gray-900 dark:border-blue-900/50 dark:text-blue-300',
  };

  const Icon = type === 'success' ? CheckCircle : type === 'error' ? AlertCircle : type === 'warning' ? AlertTriangle : Info;

  return (
    <div className={`${baseClass} ${typeClass[type]}`} role="alert" aria-live="polite">
      <Icon size={20} />
      <p className="font-medium text-sm">{message}</p>
      <button
        onClick={onClose}
        className="ml-2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
        aria-label="Tutup notifikasi"
      >
        <X size={16} />
      </button>
    </div>
  );
};

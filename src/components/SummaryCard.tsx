import React from 'react';

interface SummaryCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  colorClass: string;
}

export const SummaryCard: React.FC<SummaryCardProps> = ({ 
  title, 
  value, 
  icon, 
  colorClass 
}) => {
  const getColorClasses = () => {
    switch (colorClass) {
      case 'green':
        return {
          bg: 'bg-emerald-50',
          text: 'text-emerald-700',
          border: 'border-emerald-100'
        };
      case 'red':
        return {
          bg: 'bg-rose-50',
          text: 'text-rose-700',
          border: 'border-rose-100'
        };
      case 'blue':
        return {
          bg: 'bg-blue-50',
          text: 'text-blue-700',
          border: 'border-blue-100'
        };
      case 'orange':
        return {
          bg: 'bg-amber-50',
          text: 'text-amber-700',
          border: 'border-amber-100'
        };
      case 'purple':
        return {
          bg: 'bg-purple-50',
          text: 'text-purple-700',
          border: 'border-purple-100'
        };
      default:
        return {
          bg: 'bg-gray-50',
          text: 'text-gray-700',
          border: 'border-gray-100'
        };
    }
  };

  const colors = getColorClasses();

  return (
    <div className={`p-4 rounded-xl border ${colors.bg} ${colors.border}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className={`text-xl font-bold ${colors.text}`}>{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${colors.bg}`}>
          {icon}
        </div>
      </div>
    </div>
  );
};
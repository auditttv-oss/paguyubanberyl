import React from 'react';

interface SummaryCardProps {
  title: string;
  value: string;
  icon?: React.ReactNode;
  colorClass?: string;
}

export const SummaryCard: React.FC<SummaryCardProps> = ({ title, value, icon, colorClass = "bg-white" }) => {
  return (
    <div className={`${colorClass} p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between`}>
      <div>
        <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-gray-800">{value}</h3>
      </div>
      {icon && <div className="p-3 bg-white/20 rounded-full">{icon}</div>}
    </div>
  );
};
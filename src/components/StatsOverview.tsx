import React from 'react';
import { Users, CheckCircle, TrendingUp, TrendingDown } from 'lucide-react';

interface StatsOverviewProps {
  totalResidents: number;
  paidResidents: number;
  monthlyIncome: number;
  monthlyExpense: number;
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({
  totalResidents,
  paidResidents,
  monthlyIncome,
  monthlyExpense
}) => {
  const complianceRate = totalResidents > 0 
    ? Math.round((paidResidents / totalResidents) * 100) 
    : 0;
  
  const formatCurrency = (amount: number) => {
    return `Rp ${amount.toLocaleString('id-ID')}`;
  };

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-medium text-gray-700">Statistik Singkat</h4>
      
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users size={14} className="text-gray-400" />
            <span className="text-xs text-gray-600">Total Warga</span>
          </div>
          <span className="font-medium">{totalResidents} KK</span>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle size={14} className="text-green-400" />
            <span className="text-xs text-gray-600">Kepatuhan</span>
          </div>
          <span className="font-medium">{complianceRate}%</span>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp size={14} className="text-blue-400" />
            <span className="text-xs text-gray-600">Pemasukan Bulan Ini</span>
          </div>
          <span className="font-medium text-green-600">
            {formatCurrency(monthlyIncome)}
          </span>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingDown size={14} className="text-red-400" />
            <span className="text-xs text-gray-600">Pengeluaran Bulan Ini</span>
          </div>
          <span className="font-medium text-red-600">
            {formatCurrency(monthlyExpense)}
          </span>
        </div>
      </div>
    </div>
  );
};
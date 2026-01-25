import React from 'react';

interface ChartTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
  total?: number;
}

export const ChartTooltip: React.FC<ChartTooltipProps> = ({ active, payload, label, total }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
        <p className="font-bold text-gray-800 mb-1">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-gray-600">{entry.name}:</span>
            <span className="font-bold">{entry.value}</span>
            {total && (
              <span className="text-gray-400">
                ({Math.round((entry.value / total) * 100)}%)
              </span>
            )}
          </div>
        ))}
      </div>
    );
  }
  return null;
};
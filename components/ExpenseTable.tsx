import React, { useState } from 'react';
import { Expense } from '../types';
import { Trash2, Plus } from 'lucide-react';

interface ExpenseTableProps {
  expenses: Expense[];
  onAdd: (expense: Omit<Expense, 'id'>) => void;
  onDelete: (id: string) => void;
  isReadOnly?: boolean;
}

export const ExpenseTable: React.FC<ExpenseTableProps> = ({ expenses, onAdd, onDelete, isReadOnly = false }) => {
  const [newExpense, setNewExpense] = useState({ description: '', amount: '', category: 'Operasional' });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExpense.description || !newExpense.amount) return;

    onAdd({
      description: newExpense.description,
      amount: parseInt(newExpense.amount),
      date: Date.now(),
      category: newExpense.category as any,
    });
    setNewExpense({ description: '', amount: '', category: 'Operasional' });
  };

  return (
    <div className="space-y-6">
      {!isReadOnly && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Catat Pengeluaran Baru</h3>
          <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Keterangan</label>
              <input 
                type="text" 
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none"
                placeholder="Contoh: Beli Snack Rapat"
                value={newExpense.description}
                onChange={(e) => setNewExpense({...newExpense, description: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nominal (Rp)</label>
              <input 
                type="number" 
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none"
                placeholder="0"
                value={newExpense.amount}
                onChange={(e) => setNewExpense({...newExpense, amount: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
               <select
                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none"
                 value={newExpense.category}
                 onChange={(e) => setNewExpense({...newExpense, category: e.target.value})}
               >
                  <option value="Operasional">Operasional</option>
                  <option value="Acara">Acara</option>
                  <option value="Lainnya">Lainnya</option>
               </select>
            </div>
            <button type="submit" className="md:col-span-4 bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors">
              <Plus size={20} /> Tambah Pengeluaran
            </button>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 bg-gray-50 border-b border-gray-200">
          <h3 className="font-semibold text-gray-700">Riwayat Pengeluaran</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-700 uppercase bg-gray-100">
              <tr>
                <th className="px-4 py-3">Tanggal</th>
                <th className="px-4 py-3">Keterangan</th>
                <th className="px-4 py-3">Kategori</th>
                <th className="px-4 py-3 text-right">Jumlah</th>
                {!isReadOnly && <th className="px-4 py-3 text-center">Aksi</th>}
              </tr>
            </thead>
            <tbody>
              {expenses.length === 0 ? (
                 <tr>
                 <td colSpan={isReadOnly ? 4 : 5} className="px-4 py-8 text-center text-gray-500">
                   Belum ada data pengeluaran.
                 </td>
               </tr>
              ) : (
                expenses.sort((a,b) => b.date - a.date).map((expense) => (
                  <tr key={expense.id} className="bg-white border-b hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-500">
                      {new Date(expense.date).toLocaleDateString('id-ID')}
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-900">{expense.description}</td>
                    <td className="px-4 py-3">
                      <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full">
                        {expense.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-red-600">
                      - Rp {expense.amount.toLocaleString('id-ID')}
                    </td>
                    {!isReadOnly && (
                      <td className="px-4 py-3 text-center">
                        <button onClick={() => onDelete(expense.id)} className="text-red-500 hover:text-red-700">
                          <Trash2 size={16} />
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
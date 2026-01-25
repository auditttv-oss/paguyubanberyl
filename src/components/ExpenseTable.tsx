import React, { useState } from 'react';
import { Expense } from '../types';
import { Trash2, Plus, Receipt, ExternalLink } from 'lucide-react';

interface ExpenseTableProps {
  expenses: Expense[];
  onAdd: (e: any) => void;
  onDelete: (id: string) => void;
  isReadOnly?: boolean;
}

export const ExpenseTable: React.FC<ExpenseTableProps> = ({ expenses, onAdd, onDelete, isReadOnly }) => {
  const [form, setForm] = useState({ description: '', amount: '', category: 'Operasional', receiptUrl: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({
      description: form.description,
      amount: parseInt(form.amount),
      category: form.category as any,
      receiptUrl: form.receiptUrl,
      date: Date.now()
    });
    setForm({ description: '', amount: '', category: 'Operasional', receiptUrl: '' });
  };

  const GroupTable = ({ title, data, color }: any) => (
    <div className="bg-white rounded-xl shadow-sm border mb-8 overflow-hidden">
      <div className={`p-4 ${color} text-white font-bold flex justify-between`}>
        <span>{title}</span>
        <span className="bg-white/20 px-2 py-1 rounded text-[10px] uppercase">Riwayat</span>
      </div>
      <table className="w-full text-sm text-left">
        <thead className="bg-gray-50 text-[10px] uppercase font-bold text-gray-500 border-b">
          <tr>
            <th className="px-4 py-3">Tanggal</th>
            <th className="px-4 py-3">Keterangan</th>
            <th className="px-4 py-3 text-right">Nominal</th>
            <th className="px-4 py-3 text-center">Bon/Bukti</th>
            {!isReadOnly && <th className="px-4 py-3 text-center">Aksi</th>}
          </tr>
        </thead>
        <tbody className="divide-y">
          {data.length === 0 ? <tr><td colSpan={5} className="p-4 text-center text-gray-400">Belum ada data.</td></tr> : data.map((e: any) => (
            <tr key={e.id} className="hover:bg-gray-50">
              <td className="px-4 py-4 text-gray-400 font-mono text-xs">{new Date(e.date).toLocaleDateString('id-ID')}</td>
              <td className="px-4 py-4 font-bold">{e.description}</td>
              <td className="px-4 py-4 text-right font-black text-red-600">Rp {e.amount.toLocaleString('id-ID')}</td>
              <td className="px-4 py-4 text-center">
                {e.receiptUrl ? (
                  <a href={e.receiptUrl} target="_blank" className="text-blue-600 inline-flex items-center gap-1 hover:underline font-bold text-xs"><Receipt size={14}/> Lihat Bon</a>
                ) : '-'}
              </td>
              {!isReadOnly && (
                <td className="px-4 py-4 text-center">
                  <button onClick={() => onDelete(e.id)} className="text-red-300 hover:text-red-500"><Trash2 size={16}/></button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="space-y-6">
      {!isReadOnly && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl border grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end shadow-sm">
          <div className="lg:col-span-2">
            <label className="text-xs font-bold uppercase text-gray-400 mb-1 block">Keterangan</label>
            <input required placeholder="Contoh: Perbaikan Lampu Blok A" className="w-full border p-2 rounded-lg outline-none focus:ring-2 focus:ring-red-500" value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
          </div>
          <div>
            <label className="text-xs font-bold uppercase text-gray-400 mb-1 block">Nominal (Rp)</label>
            <input required type="number" placeholder="0" className="w-full border p-2 rounded-lg outline-none focus:ring-2 focus:ring-red-500" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} />
          </div>
          <div>
            <label className="text-xs font-bold uppercase text-gray-400 mb-1 block">Kategori Kas</label>
            <select className="w-full border p-2 rounded-lg outline-none focus:ring-2 focus:ring-red-500" value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
              <option value="Operasional">Kas Bulanan (Wajib)</option>
              <option value="Acara">Kas Acara (Sukarela)</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-bold uppercase text-gray-400 mb-1 block">Link Bon GDrive</label>
            <input placeholder="https://drive..." className="w-full border p-2 rounded-lg outline-none focus:ring-2 focus:ring-red-500" value={form.receiptUrl} onChange={e => setForm({...form, receiptUrl: e.target.value})} />
          </div>
          <button className="lg:col-span-5 bg-red-600 text-white font-bold py-3 rounded-lg hover:bg-red-700 transition-all flex items-center justify-center gap-2">
            <Plus size={18}/> Tambah Pengeluaran
          </button>
        </form>
      )}

      <GroupTable title="Kas Bulanan (Operasional)" color="bg-blue-600" data={expenses.filter(e => e.category !== 'Acara')} />
      <GroupTable title="Kas Acara (Kegiatan Warga)" color="bg-purple-600" data={expenses.filter(e => e.category === 'Acara')} />
    </div>
  );
};
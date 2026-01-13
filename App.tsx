import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Users, 
  LayoutDashboard, 
  Wallet, 
  PlusCircle,
  BrainCircuit,
  TrendingDown,
  TrendingUp,
  LogOut,
  LogIn,
  Upload,
  Download,
  UserPlus,
  Loader2
} from 'lucide-react';
import { 
  Resident, 
  Expense, 
  TabView, 
  FinancialSummary 
} from './types';
import { 
  MONTHLY_DUES_AMOUNT, 
  APP_TITLE, 
  APP_SUBTITLE,
  OCCUPANCY_OPTIONS
} from './constants';
import * as storageService from './services/storageService';
import * as geminiService from './services/geminiService';
import * as excelService from './services/excelService';
import { ResidentTable } from './components/ResidentTable';
import { SummaryCard } from './components/SummaryCard';
import { ExpenseTable } from './components/ExpenseTable';
import { LoginScreen } from './components/LoginScreen';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [userRole, setUserRole] = useState('Tamu');
  
  const [activeTab, setActiveTab] = useState<TabView>(TabView.DASHBOARD);
  const [residents, setResidents] = useState<Resident[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [newResident, setNewResident] = useState<Partial<Resident>>({
    occupancyStatus: 'Menetap',
    monthlyDuesPaid: false,
    eventDuesAmount: 0 
  });

  // AI State
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);

  // File Upload Ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load Initial Data
  useEffect(() => {
    const auth = localStorage.getItem('beryl_auth');
    if (auth) {
      setIsAuthenticated(true);
      setUserRole(auth);
    }
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [residentsData, expensesData] = await Promise.all([
        storageService.getResidents(),
        storageService.getExpenses()
      ]);
      setResidents(residentsData);
      setExpenses(expensesData);
    } catch (error) {
      console.error("Failed to load data", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = (role: string) => {
    setIsAuthenticated(true);
    setUserRole(role);
    localStorage.setItem('beryl_auth', role);
    setShowLoginModal(false);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserRole('Tamu');
    localStorage.removeItem('beryl_auth');
  };

  // Compute Summary
  const summary: FinancialSummary = useMemo(() => {
    const totalMonthly = residents.filter(r => r.monthlyDuesPaid).length * MONTHLY_DUES_AMOUNT;
    const totalEvent = residents.reduce((sum, r) => sum + (r.eventDuesAmount || 0), 0);
    const totalExpenses = expenses.reduce((acc, curr) => acc + curr.amount, 0);
    
    return {
      totalResidents: residents.length,
      totalMonthlyDues: totalMonthly,
      totalEventDues: totalEvent,
      totalExpenses,
      balance: (totalMonthly + totalEvent) - totalExpenses
    };
  }, [residents, expenses]);

  // Actions
  const handleAddResident = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newResident.fullName || !newResident.blockNumber) return;

    try {
      await storageService.saveResident({
        fullName: newResident.fullName,
        blockNumber: newResident.blockNumber,
        whatsapp: newResident.whatsapp || '',
        occupancyStatus: newResident.occupancyStatus as any,
        monthlyDuesPaid: newResident.monthlyDuesPaid || false,
        eventDuesAmount: newResident.eventDuesAmount || 0,
        notes: newResident.notes || '',
        updatedAt: Date.now()
      });
      
      await fetchData(); // Refresh data from server
      setShowAddModal(false);
      setNewResident({ occupancyStatus: 'Menetap', monthlyDuesPaid: false, eventDuesAmount: 0 });
      
      if (!isAuthenticated) {
        alert("Terima kasih! Data Anda telah ditambahkan ke sistem.");
      }
    } catch (error) {
      alert("Gagal menyimpan data. Coba lagi.");
      console.error(error);
    }
  };

  const handleUpdateResident = async (updated: Resident) => {
    try {
      // Optimistic update (UI changes immediately)
      const oldResidents = [...residents];
      setResidents(residents.map(r => r.id === updated.id ? updated : r));
      
      await storageService.updateResident(updated);
    } catch (error) {
      console.error("Update failed", error);
      fetchData(); // Revert on error
      alert("Gagal mengupdate data.");
    }
  };

  const handleDeleteResident = async (id: string) => {
    if (window.confirm("Hapus data warga ini?")) {
      try {
        await storageService.deleteResident(id);
        setResidents(residents.filter(r => r.id !== id));
      } catch (error) {
        alert("Gagal menghapus data.");
      }
    }
  };

  const handleAddExpense = async (expenseData: Omit<Expense, 'id'>) => {
    try {
      await storageService.saveExpense(expenseData);
      await fetchData();
    } catch (error) {
      alert("Gagal menyimpan pengeluaran.");
    }
  };

  const handleDeleteExpense = async (id: string) => {
    if (window.confirm("Hapus data pengeluaran ini?")) {
      try {
        await storageService.deleteExpense(id);
        setExpenses(expenses.filter(e => e.id !== id));
      } catch (error) {
        alert("Gagal menghapus pengeluaran.");
      }
    }
  };

  const handleAnalyzeAi = async () => {
    setLoadingAi(true);
    const result = await geminiService.analyzeFinances(residents, expenses);
    setAiAnalysis(result);
    setLoadingAi(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (window.confirm("Upload Excel akan menggabungkan data baru ke Database. Lanjutkan?")) {
      try {
        setIsLoading(true);
        const importedResidents = await excelService.parseResidentsExcel(file);
        
        // Remove ID for new insertion
        const residentsToUpload = importedResidents.map(({ id, ...rest }) => rest);
        
        await storageService.bulkImportResidents(residentsToUpload);
        await fetchData();
        alert(`Berhasil mengimpor ${importedResidents.length} data warga.`);
      } catch (error) {
        console.error(error);
        alert("Gagal mengimpor file.");
      } finally {
        setIsLoading(false);
      }
    }
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Chart Data
  const occupancyData = useMemo(() => {
    const counts: Record<string, number> = { 'Menetap': 0, 'Penyewa': 0, 'Kunjungan': 0, 'Ditempati 2026': 0 };
    residents.forEach(r => {
      const status = r.occupancyStatus as string;
      if (counts[status] !== undefined) {
        counts[status]++;
      } else {
        if (!counts['Lainnya']) counts['Lainnya'] = 0;
        counts['Lainnya']++;
      }
    });
    return Object.entries(counts)
      .filter(([, value]) => value > 0)
      .map(([name, value]) => ({ name, value }));
  }, [residents]);

  const paymentData = useMemo(() => [
    {
      name: 'Iuran Wajib (10rb)',
      Sudah: residents.filter(r => r.monthlyDuesPaid).length,
      Belum: residents.filter(r => !r.monthlyDuesPaid).length,
    },
    {
      name: 'Iuran Acara (Sukarela)',
      Sudah: residents.filter(r => (r.eventDuesAmount || 0) > 0).length,
      Belum: residents.filter(r => !r.eventDuesAmount || r.eventDuesAmount === 0).length,
    }
  ], [residents]);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  if (showLoginModal) {
    return <LoginScreen onLogin={handleLogin} onCancel={() => setShowLoginModal(false)} />;
  }

  const isReadOnly = !isAuthenticated;

  return (
    <div className="min-h-screen font-sans text-gray-800 flex flex-col md:flex-row">
      
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-beryl-900 text-white flex-shrink-0 flex flex-col justify-between">
        <div>
          <div className="p-6">
            <h1 className="text-2xl font-bold tracking-tight">Beryl Admin</h1>
            <p className="text-beryl-200 text-xs mt-1">Sistem Keuangan Warga</p>
            <div className={`mt-2 text-xs py-1 px-2 rounded inline-block ${isAuthenticated ? 'bg-beryl-800 text-beryl-200' : 'bg-gray-700 text-gray-300'}`}>
              Mode: {userRole}
            </div>
          </div>
          <nav className="px-4 space-y-2">
            <button 
              onClick={() => setActiveTab(TabView.DASHBOARD)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === TabView.DASHBOARD ? 'bg-beryl-700 text-white' : 'text-beryl-100 hover:bg-beryl-800'}`}
            >
              <LayoutDashboard size={20} /> Dashboard
            </button>
            <button 
              onClick={() => setActiveTab(TabView.RESIDENTS)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === TabView.RESIDENTS ? 'bg-beryl-700 text-white' : 'text-beryl-100 hover:bg-beryl-800'}`}
            >
              <Users size={20} /> Data Warga
            </button>
            <button 
              onClick={() => setActiveTab(TabView.EXPENSES)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === TabView.EXPENSES ? 'bg-beryl-700 text-white' : 'text-beryl-100 hover:bg-beryl-800'}`}
            >
              <TrendingDown size={20} /> Pengeluaran
            </button>
          </nav>
        </div>
        
        <div className="p-4">
          {isAuthenticated ? (
            <button 
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-200 hover:bg-red-900/50 hover:text-red-100 transition-colors"
            >
              <LogOut size={20} /> Logout
            </button>
          ) : (
             <button 
              onClick={() => setShowLoginModal(true)}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-beryl-100 bg-beryl-800 hover:bg-beryl-700 transition-colors"
            >
              <LogIn size={20} /> Login Admin
            </button>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-gray-50/50">
        
        {/* Header */}
        <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">{APP_TITLE}</h2>
            <p className="text-gray-500">{APP_SUBTITLE}</p>
          </div>
          {activeTab === TabView.RESIDENTS && (
            <div className="flex gap-2">
              {!isReadOnly && (
                <>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept=".xlsx, .xls" 
                    onChange={handleFileUpload}
                  />
                  <button 
                    onClick={excelService.downloadTemplate}
                    className="bg-white hover:bg-gray-100 text-gray-700 px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm border border-gray-200 transition-all text-sm"
                  >
                    <Download size={18} /> Template
                  </button>
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm transition-all"
                  >
                    <Upload size={18} /> Import Excel
                  </button>
                  <button 
                    onClick={() => setShowAddModal(true)}
                    className="bg-beryl-600 hover:bg-beryl-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm transition-all"
                  >
                    <PlusCircle size={20} /> Tambah
                  </button>
                </>
              )}
              {isReadOnly && (
                 <button 
                    onClick={() => setShowAddModal(true)}
                    className="bg-beryl-600 hover:bg-beryl-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm transition-all"
                  >
                    <UserPlus size={20} /> Lapor Diri (Warga Baru)
                  </button>
              )}
            </div>
          )}
        </header>

        {/* Loading State */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-400">
            <Loader2 className="animate-spin mb-4" size={48} />
            <p>Memuat data dari Database...</p>
          </div>
        ) : (
          <>
            {/* Dashboard View */}
            {activeTab === TabView.DASHBOARD && (
              <div className="space-y-6 animate-fade-in">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <SummaryCard 
                    title="Total Kas Masuk" 
                    value={`Rp ${(summary.totalMonthlyDues + summary.totalEventDues).toLocaleString('id-ID')}`} 
                    icon={<TrendingUp className="text-green-600" />}
                    colorClass="bg-green-50 border-green-200"
                  />
                  <SummaryCard 
                    title="Total Pengeluaran" 
                    value={`Rp ${summary.totalExpenses.toLocaleString('id-ID')}`} 
                    icon={<TrendingDown className="text-red-600" />}
                    colorClass="bg-red-50 border-red-200"
                  />
                  <SummaryCard 
                    title="Saldo Akhir" 
                    value={`Rp ${summary.balance.toLocaleString('id-ID')}`} 
                    icon={<Wallet className="text-blue-600" />}
                    colorClass="bg-blue-50 border-blue-200"
                  />
                  <SummaryCard 
                    title="Total Warga" 
                    value={`${summary.totalResidents} Orang`} 
                    icon={<Users className="text-beryl-600" />}
                  />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Payment Status Chart */}
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Status Pembayaran Iuran</h3>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={paymentData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="Sudah" fill="#10b981" name="Sudah Bayar" />
                          <Bar dataKey="Belum" fill="#ef4444" name="Belum Bayar" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Occupancy Chart */}
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Status Hunian</h3>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={occupancyData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                            label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                          >
                            {occupancyData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                {/* AI Analysis Section */}
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-xl border border-indigo-100">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-indigo-900 flex items-center gap-2">
                      <BrainCircuit size={24} /> Analisa Keuangan Cerdas (AI)
                    </h3>
                    <button 
                      onClick={handleAnalyzeAi}
                      disabled={loadingAi}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                    >
                      {loadingAi ? 'Sedang Menganalisa...' : 'Analisa Sekarang'}
                    </button>
                  </div>
                  {aiAnalysis ? (
                    <div className="prose prose-indigo text-gray-700 bg-white p-4 rounded-lg shadow-sm border border-indigo-100 max-w-none">
                      <div dangerouslySetInnerHTML={{ __html: aiAnalysis.replace(/\n/g, '<br/>').replace(/\*\*(.*?)\*\*/g, '<b>$1</b>') }} />
                    </div>
                  ) : (
                    <p className="text-indigo-600/70 text-sm">
                      Klik tombol di atas untuk mendapatkan laporan singkat dan saran pengelolaan dana berdasarkan data saat ini menggunakan Google Gemini AI.
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Residents View */}
            {activeTab === TabView.RESIDENTS && (
              <ResidentTable 
                residents={residents} 
                onUpdate={handleUpdateResident}
                onDelete={handleDeleteResident}
                isReadOnly={isReadOnly}
              />
            )}

            {/* Expenses View */}
            {activeTab === TabView.EXPENSES && (
              <ExpenseTable 
                expenses={expenses}
                onAdd={handleAddExpense}
                onDelete={handleDeleteExpense}
                isReadOnly={isReadOnly}
              />
            )}
          </>
        )}
      </main>

      {/* Add Resident Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 animate-fade-in-up">
            <h3 className="text-xl font-bold mb-4">
              {isAuthenticated ? "Tambah Data Warga" : "Formulir Data Warga Baru"}
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              {isAuthenticated ? "Masukkan data warga baru di bawah ini." : "Silakan lengkapi data diri Anda untuk dimasukkan ke database warga."}
            </p>
            <form onSubmit={handleAddResident} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Blok & No. Rumah</label>
                <input 
                  required
                  className="w-full border p-2 rounded-lg focus:ring-2 focus:ring-beryl-500 focus:outline-none" 
                  placeholder="Contoh: B3-12"
                  value={newResident.blockNumber}
                  onChange={e => setNewResident({...newResident, blockNumber: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
                <input 
                  required
                  className="w-full border p-2 rounded-lg focus:ring-2 focus:ring-beryl-500 focus:outline-none" 
                  placeholder="Nama Warga"
                  value={newResident.fullName}
                  onChange={e => setNewResident({...newResident, fullName: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp</label>
                <input 
                  className="w-full border p-2 rounded-lg focus:ring-2 focus:ring-beryl-500 focus:outline-none" 
                  placeholder="08..."
                  value={newResident.whatsapp}
                  onChange={e => setNewResident({...newResident, whatsapp: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status Hunian</label>
                <select 
                  className="w-full border p-2 rounded-lg focus:ring-2 focus:ring-beryl-500 focus:outline-none"
                  value={newResident.occupancyStatus}
                  onChange={e => setNewResident({...newResident, occupancyStatus: e.target.value as any})}
                >
                  {OCCUPANCY_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              
              {isAuthenticated ? (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">Iuran Wajib (10rb)</label>
                     <select
                        className="w-full border p-2 rounded-lg focus:ring-2 focus:ring-beryl-500 focus:outline-none"
                        value={newResident.monthlyDuesPaid ? 'Sudah' : 'Belum'}
                        onChange={e => setNewResident({...newResident, monthlyDuesPaid: e.target.value === 'Sudah'})}
                     >
                       <option value="Belum">Belum Bayar</option>
                       <option value="Sudah">Sudah Bayar</option>
                     </select>
                  </div>
                  <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">Iuran Acara (Nominal)</label>
                     <input 
                        type="number"
                        className="w-full border p-2 rounded-lg focus:ring-2 focus:ring-beryl-500 focus:outline-none"
                        placeholder="0"
                        value={newResident.eventDuesAmount}
                        onChange={e => setNewResident({...newResident, eventDuesAmount: Number(e.target.value)})}
                     />
                  </div>
                </div>
              ) : (
                <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-100 text-sm text-yellow-800">
                  <p>Catatan: Status pembayaran iuran akan diverifikasi dan diupdate oleh pengurus/bendahara.</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Catatan Tambahan</label>
                <textarea 
                  className="w-full border p-2 rounded-lg focus:ring-2 focus:ring-beryl-500 focus:outline-none" 
                  rows={2}
                  value={newResident.notes}
                  onChange={e => setNewResident({...newResident, notes: e.target.value})}
                  placeholder="Opsional"
                />
              </div>
              <div className="flex gap-2 justify-end mt-6">
                <button 
                  type="button" 
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-beryl-600 text-white rounded-lg hover:bg-beryl-700"
                >
                  {isAuthenticated ? "Simpan Data" : "Kirim Data"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default App;
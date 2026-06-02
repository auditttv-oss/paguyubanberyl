import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchComments, createComment, deleteComment } from '../services/dataService';
import { useAuth } from '../contexts/AuthContext';
import { 
  MessageSquare, Send, Trash2, User, Loader2, 
  Cloud, Sun, CloudRain, Clock, RefreshCw, Shield,
  EyeOff, MapPin, Calendar, Plus, X, Edit2, Save,
  AlertCircle, BookOpen, Bookmark
} from 'lucide-react';

interface AgendaItem {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  description: string;
  status: 'Akan Datang' | 'Selesai' | 'Batal';
}

const DEFAULT_AGENDAS: AgendaItem[] = [
  {
    id: "agenda1",
    title: "Kerja Bakti Masal & Fogging Lingkungan",
    date: "2026-06-14",
    time: "07:30 WIB - Selesai",
    location: "Area Taman & Selokan Cluster Beryl",
    description: "Gotong royong bersama seluruh warga Cluster Beryl untuk pembersihan sarang nyamuk, saluran air selokan, dan perapihan taman guna menyambut musim pancaroba.",
    status: "Akan Datang"
  },
  {
    id: "agenda2",
    title: "Rapat Pleno Pra-RT & Pembahasan AD/ART",
    date: "2026-06-20",
    time: "20:00 WIB",
    location: "Gasebo Utama Cluster Beryl",
    description: "Pertemuan koordinasi seluruh kepala keluarga guna meninjau draf AD/ART transisi dan memantapkan rencana penanganan iuran bulanan.",
    status: "Akan Datang"
  },
  {
    id: "agenda3",
    title: "Pemberantasan Hama & Penyemprotan Disinfektan",
    date: "2026-05-10",
    time: "09:00 WIB",
    location: "Seluruh Blok Cluster Beryl",
    description: "Kegiatan rutin berkala penyemprotan area taman dan jalan umum cluster untuk membasmi jentik nyamuk dan serangga liar.",
    status: "Selesai"
  }
];

export const Blog = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const isAdmin = !!user;

  // Tabs
  const [activeTab, setActiveTab] = useState<'agenda' | 'aspirasi'>('agenda');

  // Agenda State Management
  const [agendas, setAgendas] = useState<AgendaItem[]>(() => {
    const local = localStorage.getItem('beryl_agendas_list');
    return local ? JSON.parse(local) : DEFAULT_AGENDAS;
  });

  const [isAgendaModalOpen, setIsAgendaModalOpen] = useState(false);
  const [editingAgenda, setEditingAgenda] = useState<AgendaItem | null>(null);
  
  // Agenda Form State
  const [agendaForm, setAgendaForm] = useState({
    title: '', date: '', time: '', location: '', description: '', status: 'Akan Datang' as any
  });

  // Aspirasi State Management
  const [aspirasiName, setAspirasiName] = useState('');
  const [aspirasiContent, setAspirasiContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync Agendas
  useEffect(() => {
    localStorage.setItem('beryl_agendas_list', JSON.stringify(agendas));
  }, [agendas]);

  // Fetch comments (Aspirasi)
  const { data: comments = [], isLoading: isLoadingComments, refetch } = useQuery({ 
    queryKey: ['comments'], 
    queryFn: fetchComments 
  });

  const commentMutation = useMutation({
    mutationFn: () => createComment(aspirasiName, aspirasiContent),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments'] });
      setAspirasiName(''); 
      setAspirasiContent(''); 
      setIsSubmitting(false);
      toastAlert('✅ Aspirasi Anda berhasil diposting!');
    }
  });

  const deleteCommentMutation = useMutation({
    mutationFn: deleteComment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments'] });
      toastAlert('🗑️ Aspirasi telah dihapus.');
    }
  });

  const toastAlert = (msg: string) => {
    alert(msg);
  };

  // Agenda CRUD Handlers
  const handleSaveAgenda = (e: React.FormEvent) => {
    e.preventDefault();
    if (!agendaForm.title.trim() || !agendaForm.date) return alert("Harap isi semua kolom wajib!");

    if (editingAgenda) {
      setAgendas(prev => prev.map(a => a.id === editingAgenda.id ? { ...a, ...agendaForm } : a));
      toastAlert('✅ Agenda berhasil diperbarui!');
    } else {
      const newAgenda: AgendaItem = {
        id: `agenda_${Date.now()}`,
        ...agendaForm
      };
      setAgendas(prev => [newAgenda, ...prev]);
      toastAlert('✅ Agenda kegiatan baru berhasil diposting!');
    }
    setIsAgendaModalOpen(false);
    setEditingAgenda(null);
  };

  const handleDeleteAgenda = (id: string) => {
    if (window.confirm("Hapus agenda kegiatan ini secara permanen?")) {
      setAgendas(prev => prev.filter(a => a.id !== id));
    }
  };

  const handleEditAgendaClick = (agenda: AgendaItem) => {
    setEditingAgenda(agenda);
    setAgendaForm({
      title: agenda.title,
      date: agenda.date,
      time: agenda.time,
      location: agenda.location,
      description: agenda.description,
      status: agenda.status
    });
    setIsAgendaModalOpen(true);
  };

  const handleCreateAgendaClick = () => {
    setEditingAgenda(null);
    setAgendaForm({
      title: '', date: '', time: '', location: '', description: '', status: 'Akan Datang'
    });
    setIsAgendaModalOpen(true);
  };

  const handleAspirasiSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aspirasiName.trim() || aspirasiContent.length < 5) return alert('Lengkapi data dengan benar!');
    setIsSubmitting(true);
    commentMutation.mutate();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Akan Datang': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Selesai': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      default: return 'bg-rose-100 text-rose-800 border-rose-200';
    }
  };

  return (
    <div className="space-y-6 px-2 sm:px-4 pb-20 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="text-center py-6">
        <h1 className="text-3xl md:text-5xl font-black text-emerald-950 uppercase tracking-tighter">Beryl Portal</h1>
        <p className="text-gray-500 font-bold text-sm mt-1">Agenda Kegiatan & Papan Aspirasi Warga</p>
        
        <div className={`mt-3 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest mx-auto w-fit ${
          !isAdmin ? 'bg-gray-100 text-gray-400' : 'bg-emerald-100 text-emerald-700'
        }`}>
          {!isAdmin ? <><EyeOff size={12} className="inline mr-1" /> Mode Tamu</> : <><Shield size={12} className="inline mr-1" /> Mode Admin Aktif</>}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b bg-white rounded-2xl p-1.5 shadow-sm">
        <button
          onClick={() => setActiveTab('agenda')}
          className={`flex-1 py-3 font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 ${
            activeTab === 'agenda' ? 'bg-emerald-600 text-white shadow-md' : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          <BookOpen size={16} />
          Agenda Kegiatan Paguyuban
        </button>
        <button
          onClick={() => setActiveTab('aspirasi')}
          className={`flex-1 py-3 font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 ${
            activeTab === 'aspirasi' ? 'bg-emerald-600 text-white shadow-md' : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          <MessageSquare size={16} />
          Papan Aspirasi Warga
        </button>
      </div>

      {/* TAB 1: AGENDA KEGIATAN BLOG */}
      {activeTab === 'agenda' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center bg-white p-4 rounded-2xl border shadow-sm">
            <div>
              <h2 className="font-black text-gray-800 text-sm uppercase tracking-wider">Timeline Agenda Cluster Beryl</h2>
              <p className="text-xs text-gray-500">Agenda kebersamaan, rapat pengurus, dan pembangunan lingkungan.</p>
            </div>
            {isAdmin && (
              <button
                onClick={handleCreateAgendaClick}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-1.5"
              >
                <Plus size={14}/> Tambah Agenda
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {agendas.map((item) => (
              <div 
                key={item.id} 
                className="bg-white rounded-3xl border border-gray-100 shadow-md hover:shadow-xl transition-all overflow-hidden flex flex-col relative group"
              >
                {/* Admin Controls */}
                {isAdmin && (
                  <div className="absolute top-2 right-2 flex gap-1 bg-white/85 p-1 rounded-xl shadow-sm opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    <button 
                      onClick={() => handleEditAgendaClick(item)} 
                      className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"
                    >
                      <Edit2 size={14}/>
                    </button>
                    <button 
                      onClick={() => handleDeleteAgenda(item.id)} 
                      className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 size={14}/>
                    </button>
                  </div>
                )}

                <div className="p-6 flex flex-col h-full space-y-4">
                  <div className="flex items-start justify-between gap-2">
                    <span className={`px-2.5 py-1 rounded-full text-[9px] font-black border uppercase tracking-wider ${getStatusBadge(item.status)}`}>
                      {item.status}
                    </span>
                    <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-bold bg-gray-50 px-2 py-1 rounded">
                      <Calendar size={12}/> {item.date}
                    </div>
                  </div>

                  <h3 className="font-black text-gray-800 text-base md:text-lg leading-tight group-hover:text-emerald-700 transition-colors">
                    {item.title}
                  </h3>

                  <p className="text-xs text-gray-500 leading-relaxed flex-grow">
                    {item.description}
                  </p>

                  <div className="pt-4 border-t border-gray-100 space-y-1.5 text-[11px] text-gray-600">
                    <div className="flex items-center gap-2">
                      <Clock size={12} className="text-gray-400"/>
                      <span>{item.time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin size={12} className="text-gray-400"/>
                      <span className="truncate">{item.location}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: PAPAN ASPIRASI (COMMENTS) */}
      {activeTab === 'aspirasi' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Post Form */}
          <div className="lg:col-span-1 bg-white p-5 rounded-3xl border shadow-md h-fit">
            <h3 className="font-black text-gray-800 uppercase text-xs tracking-widest mb-4 flex items-center gap-2">
              <Send size={14} className="text-emerald-500"/> Sampaikan Aspirasi Anda
            </h3>
            
            <form onSubmit={handleAspirasiSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Nama / Blok *</label>
                <input 
                  type="text" 
                  placeholder="Contoh: Pak Wahyu (C5/09)" 
                  className="w-full bg-gray-50 border-none p-3 rounded-2xl font-bold text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
                  value={aspirasiName} 
                  onChange={(e) => setAspirasiName(e.target.value)} 
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Pesan Aspirasi *</label>
                <textarea 
                  rows={4} 
                  placeholder="Tulis saran, perbaikan, atau aspirasi lingkungan..." 
                  className="w-full bg-gray-50 border-none p-3 rounded-2xl font-bold text-xs resize-none focus:ring-2 focus:ring-emerald-500 outline-none"
                  value={aspirasiContent} 
                  onChange={(e) => setAspirasiContent(e.target.value)} 
                  required
                />
              </div>

              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-3.5 rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 uppercase text-[10px] tracking-widest"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Send size={14} /> Posting Aspirasi</>}
              </button>
            </form>
          </div>

          {/* Aspirasi List */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-gray-800 uppercase text-xs tracking-widest">Aspirasi Warga ({comments.length})</h3>
              <button onClick={() => refetch()} className="p-2 bg-white rounded-xl shadow-sm border"><RefreshCw size={14}/></button>
            </div>

            {isLoadingComments ? (
              <div className="py-20 text-center text-gray-400 font-bold text-sm">Memuat data aspirasi...</div>
            ) : (
              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-1">
                {comments.map((comment: any) => (
                  <div key={comment.id} className="bg-white p-4 rounded-3xl shadow-sm border group">
                    <div className="flex gap-4">
                      <div className="w-10 h-10 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-700 font-black text-sm">
                        {comment.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-black text-gray-800 text-xs truncate">{comment.name}</h4>
                            <span className="text-[9px] font-bold text-gray-400 italic">
                              {new Date(comment.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          {isAdmin && (
                            <button 
                              onClick={() => {
                                if (window.confirm("Hapus aspirasi warga ini?")) {
                                  deleteCommentMutation.mutate(comment.id);
                                }
                              }} 
                              className="text-gray-300 hover:text-red-500 transition-colors"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                        <div className="mt-3 text-gray-600 text-xs leading-relaxed bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
                          {comment.content}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* AGENDA CRUD MODAL */}
      {isAgendaModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-[9999] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">
                {editingAgenda ? 'Edit Agenda Kegiatan' : 'Tambah Agenda Baru'}
              </h3>
              <button onClick={() => { setIsAgendaModalOpen(false); setEditingAgenda(null); }} className="p-2 hover:bg-gray-100 rounded-full"><X size={20}/></button>
            </div>

            <form onSubmit={handleSaveAgenda} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Nama/Tema Agenda *</label>
                <input 
                  type="text" 
                  required
                  placeholder="Contoh: Kerja Bakti Massal" 
                  className="w-full border rounded-xl p-3 focus:ring-2 focus:ring-emerald-500 outline-none"
                  value={agendaForm.title}
                  onChange={e => setAgendaForm({ ...agendaForm, title: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Tanggal Pelaksanaan *</label>
                  <input 
                    type="date" 
                    required
                    className="w-full border rounded-xl p-3 focus:ring-2 focus:ring-emerald-500 outline-none"
                    value={agendaForm.date}
                    onChange={e => setAgendaForm({ ...agendaForm, date: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Waktu / Jam *</label>
                  <input 
                    type="text" 
                    required
                    placeholder="Contoh: 07:30 WIB" 
                    className="w-full border rounded-xl p-3 focus:ring-2 focus:ring-emerald-500 outline-none"
                    value={agendaForm.time}
                    onChange={e => setAgendaForm({ ...agendaForm, time: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Lokasi / Tempat *</label>
                <input 
                  type="text" 
                  required
                  placeholder="Contoh: Gasebo Utama Cluster" 
                  className="w-full border rounded-xl p-3 focus:ring-2 focus:ring-emerald-500 outline-none"
                  value={agendaForm.location}
                  onChange={e => setAgendaForm({ ...agendaForm, location: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Deskripsi Kerja / Detail Agenda</label>
                <textarea 
                  rows={3}
                  placeholder="Rincian kegiatan yang akan dilakukan..." 
                  className="w-full border rounded-xl p-3 focus:ring-2 focus:ring-emerald-500 outline-none resize-none"
                  value={agendaForm.description}
                  onChange={e => setAgendaForm({ ...agendaForm, description: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Status Agenda</label>
                <select
                  className="w-full border rounded-xl p-3 focus:ring-2 focus:ring-emerald-500 outline-none font-bold"
                  value={agendaForm.status}
                  onChange={e => setAgendaForm({ ...agendaForm, status: e.target.value as any })}
                >
                  <option value="Akan Datang">Akan Datang</option>
                  <option value="Selesai">Selesai</option>
                  <option value="Batal">Batal</option>
                </select>
              </div>

              <button 
                type="submit" 
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2"
              >
                <Save size={18}/> Simpan Agenda
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Blog;
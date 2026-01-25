import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, Send, CloudSun, Newspaper, 
  Calendar as CalendarIcon, User, MessageCircle, Loader2,
  Trash2, AlertTriangle, CheckCircle, X, Shield
} from 'lucide-react';
import * as storageService from '../services/storageService';
import { Comment } from '../types';

interface BlogViewProps {
  isAdmin?: boolean;
}

export const BlogView: React.FC<BlogViewProps> = ({ isAdmin = false }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newName, setNewName] = useState('');
  const [newContent, setNewContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingComments, setIsLoadingComments] = useState(true);
  const [commentToDelete, setCommentToDelete] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showAdminInfo, setShowAdminInfo] = useState(false);

  useEffect(() => {
    fetchComments();
  }, []);

  const fetchComments = async () => {
    setIsLoadingComments(true);
    try {
      // PERBAIKAN: Gunakan getComments (bukan getAllComments)
      const data = await storageService.getComments();
      setComments(data);
    } catch (error) {
      console.error("Gagal memuat komentar:", error);
    } finally {
      setIsLoadingComments(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newContent.trim()) {
      alert('Harap isi nama dan pesan aspirasi Anda.');
      return;
    }
    
    if (newContent.length < 10) {
      alert('Pesan terlalu pendek. Mohon tulis aspirasi minimal 10 karakter.');
      return;
    }

    setIsSubmitting(true);
    try {
      // PERBAIKAN: Gunakan saveComment (bukan addComment)
      await storageService.saveComment(newName.trim(), newContent.trim());
      setNewName('');
      setNewContent('');
      await fetchComments();
      alert('✅ Aspirasi Anda berhasil dikirim!');
    } catch (error) {
      console.error("Gagal mengirim komentar:", error);
      alert('❌ Gagal mengirim aspirasi. Silakan coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // FUNGSI DELETE KOMENTAR
  const handleDeleteComment = async () => {
    if (!commentToDelete || !isAdmin) return;
    
    try {
      // PERBAIKAN: Gunakan deleteComment (bukan removeComment)
      await storageService.deleteComment(commentToDelete);
      setComments(comments.filter(comment => comment.id !== commentToDelete));
      alert('✅ Komentar berhasil dihapus!');
    } catch (error) {
      console.error("Gagal menghapus komentar:", error);
      alert('❌ Gagal menghapus komentar. Silakan coba lagi.');
    } finally {
      setShowDeleteConfirm(false);
      setCommentToDelete(null);
    }
  };

  const openDeleteConfirm = (commentId: string) => {
    setCommentToDelete(commentId);
    setShowDeleteConfirm(true);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-20 animate-in fade-in duration-700 px-4">
      
      {/* ADMIN INFO BANNER */}
      {isAdmin && (
        <div className="bg-gradient-to-r from-emerald-900 to-teal-800 text-white p-4 rounded-2xl shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield size={24} className="text-emerald-300" />
              <div>
                <h3 className="font-bold text-lg">Mode Admin Aktif</h3>
                <p className="text-sm opacity-90">Anda dapat menghapus komentar yang tidak pantas.</p>
              </div>
            </div>
            <button 
              onClick={() => setShowAdminInfo(!showAdminInfo)}
              className="text-emerald-200 hover:text-white text-sm font-medium"
            >
              {showAdminInfo ? 'Sembunyikan' : 'Lihat Panduan'}
            </button>
          </div>
          
          {showAdminInfo && (
            <div className="mt-4 p-4 bg-white/10 rounded-xl border border-white/20">
              <h4 className="font-bold mb-2 flex items-center gap-2">
                <AlertTriangle size={18} /> Panduan Moderasi
              </h4>
              <ul className="text-sm space-y-1">
                <li>✅ <span className="font-medium">Hapus komentar yang mengandung:</span></li>
                <li className="ml-4">• Konten SARA atau ujaran kebencian</li>
                <li className="ml-4">• Spam atau iklan komersial</li>
                <li className="ml-4">• Informasi pribadi sensitif</li>
                <li className="ml-4">• Konten tidak pantas atau menyinggung</li>
              </ul>
            </div>
          )}
        </div>
      )}

      {/* SECTION 1: GOOGLE WIDGETS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* WIDGET CUACA */}
        <div className="bg-white rounded-3xl shadow-lg border p-6 flex flex-col h-[400px]">
          <h3 className="font-black text-emerald-900 flex items-center gap-2 mb-4 uppercase text-sm">
            <CloudSun size={20}/> Cuaca Maja Banten
          </h3>
          <div className="flex-1 rounded-2xl overflow-hidden">
            <iframe 
              src="https://www.meteoblue.com/en/weather/widget/three/maja_indonesia_1636597?geodesic=0&days=4&tempunit=CELSIUS&windunit=KILOMETER_PER_HOUR&layout=light" 
              frameBorder="0" 
              scrolling="NO" 
              allowTransparency={true} 
              className="w-full h-full"
              title="Weather Widget"
            ></iframe>
          </div>
          <p className="text-xs text-gray-500 mt-2 text-center">Sumber: Meteoblue</p>
        </div>

        {/* WIDGET BERITA */}
        <div className="bg-white rounded-3xl shadow-lg border p-6 flex flex-col h-[400px]">
          <h3 className="font-black text-emerald-900 flex items-center gap-2 mb-4 uppercase text-sm">
            <Newspaper size={20}/> Berita Terkini Indonesia
          </h3>
          <div className="flex-1 rounded-2xl overflow-hidden">
            <iframe 
              src="https://rss.app/embed/v1/magazine/tR2Y3mEsh6vSjG9S" 
              frameBorder="0" 
              className="w-full h-full"
              title="News Widget"
            ></iframe>
          </div>
          <p className="text-xs text-gray-500 mt-2 text-center">Sumber: RSS News Feed</p>
        </div>

        {/* WIDGET KALENDER */}
        <div className="bg-white rounded-3xl shadow-lg border p-6 flex flex-col h-[400px]">
          <h3 className="font-black text-emerald-900 flex items-center gap-2 mb-4 uppercase text-sm">
            <CalendarIcon size={20}/> Kalender & Agenda
          </h3>
          <div className="flex-1 rounded-2xl overflow-hidden">
            <iframe 
              src="https://calendar.google.com/calendar/embed?src=id.indonesian%23holiday%40group.v.calendar.google.com&ctz=Asia%2FJakarta" 
              className="w-full h-full border-0"
              title="Calendar Widget"
            ></iframe>
          </div>
          <p className="text-xs text-gray-500 mt-2 text-center">Hari libur nasional Indonesia</p>
        </div>

      </div>

      {/* SECTION 2: PAPAN ASPIRASI */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* FORM INPUT */}
        <div className="bg-gradient-to-br from-emerald-900 to-teal-800 rounded-3xl p-8 text-white shadow-xl h-fit lg:sticky lg:top-24">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-white/10 rounded-2xl">
              <MessageCircle size={24} className="text-emerald-300" />
            </div>
            <div>
              <h2 className="text-2xl font-black mb-1 tracking-tight">Papan Aspirasi</h2>
              <p className="text-emerald-200 text-sm">Sampaikan ide, saran, atau perbaikan untuk Cluster Beryl</p>
            </div>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6 mt-6">
            <div>
              <label className="text-xs font-bold uppercase text-emerald-300 block mb-2">
                Nama Anda <span className="text-rose-400">*</span>
              </label>
              <input 
                required
                maxLength={50}
                className="w-full bg-white/10 border border-white/20 p-4 rounded-2xl text-white placeholder:text-white/40 outline-none focus:ring-2 focus:ring-emerald-400 font-medium transition-all"
                placeholder="Contoh: Pak Wahyu Blok B3"
                value={newName}
                onChange={e => setNewName(e.target.value)}
              />
              <p className="text-xs text-emerald-200 mt-1">Nama akan ditampilkan publik</p>
            </div>
            
            <div>
              <label className="text-xs font-bold uppercase text-emerald-300 block mb-2">
                Pesan Aspirasi <span className="text-rose-400">*</span>
              </label>
              <textarea 
                required
                rows={5}
                maxLength={1000}
                className="w-full bg-white/10 border border-white/20 p-4 rounded-2xl text-white placeholder:text-white/40 outline-none focus:ring-2 focus:ring-emerald-400 font-medium transition-all resize-none"
                placeholder="Tuliskan ide atau saran perbaikan untuk lingkungan kita..."
                value={newContent}
                onChange={e => setNewContent(e.target.value)}
              />
              <div className="flex justify-between text-xs text-emerald-200 mt-1">
                <span>Minimal 10 karakter</span>
                <span>{newContent.length}/1000</span>
              </div>
            </div>
            
            <button 
              disabled={isSubmitting}
              type="submit" 
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-3 transition-all shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Mengirim...
                </>
              ) : (
                <>
                  <Send size={18} />
                  Kirim Aspirasi
                </>
              )}
            </button>
            
            <div className="text-xs text-emerald-200/70 text-center pt-4 border-t border-white/10">
              <p>Semua aspirasi akan ditampilkan setelah dikirim. Admin dapat menghapus konten yang tidak pantas.</p>
            </div>
          </form>
        </div>

        {/* LIST KOMENTAR */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-black text-2xl text-gray-800 flex items-center gap-3">
              <MessageSquare className="text-emerald-600"/> 
              Suara Warga 
              <span className="bg-emerald-100 text-emerald-700 text-sm font-black px-3 py-1 rounded-full">
                {comments.length}
              </span>
            </h3>
            <div className="flex items-center gap-2">
              <button 
                onClick={fetchComments}
                className="text-emerald-600 hover:text-emerald-700 text-sm font-bold flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </button>
            </div>
          </div>
          
          {isLoadingComments ? (
            <div className="h-64 flex flex-col items-center justify-center text-gray-400">
              <Loader2 className="animate-spin mb-4" size={32} />
              <p className="text-lg">Memuat aspirasi...</p>
            </div>
          ) : comments.length === 0 ? (
            <div className="bg-white p-10 rounded-3xl border-2 border-dashed border-gray-200 text-center">
              <div className="inline-block p-4 bg-emerald-50 rounded-full mb-4">
                <MessageSquare size={32} className="text-emerald-400" />
              </div>
              <h4 className="text-xl font-black text-gray-700 mb-2">Belum ada aspirasi</h4>
              <p className="text-gray-500 mb-6">Jadilah yang pertama memberikan saran untuk lingkungan kita!</p>
            </div>
          ) : (
            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-4 custom-scrollbar">
              {comments.map((comment) => (
                <div 
                  key={comment.id} 
                  className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-all group relative"
                >
                  {/* DELETE BUTTON (Hanya untuk Admin) */}
                  {isAdmin && (
                    <button
                      onClick={() => openDeleteConfirm(comment.id)}
                      className="absolute -top-2 -right-2 bg-rose-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-600 z-10 shadow-lg"
                      title="Hapus komentar"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                  
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-2xl flex items-center justify-center text-emerald-600 flex-shrink-0 group-hover:scale-105 transition-transform">
                      <User size={28} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                        <h4 className="font-black text-emerald-900 text-lg truncate">
                          {comment.name}
                        </h4>
                        <span className="text-xs font-bold text-gray-400 bg-gray-50 px-3 py-1.5 rounded-full whitespace-nowrap">
                          {new Date(comment.createdAt).toLocaleDateString('id-ID', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                      <div className="bg-emerald-50/50 p-4 rounded-2xl">
                        <p className="text-gray-700 leading-relaxed font-medium">
                          {comment.content}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {comments.length > 0 && (
            <div className="text-center pt-6">
              <p className="text-sm text-gray-500">
                Menampilkan {comments.length} aspirasi dari warga Cluster Beryl
                {isAdmin && " • Mode Admin: Klik ikon tong sampah untuk menghapus"}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* INFORMASI TAMBAHAN */}
      <div className="bg-gradient-to-r from-blue-50 to-emerald-50 p-6 rounded-3xl border border-blue-100 mt-10">
        <h4 className="font-black text-blue-900 text-lg mb-3 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" />
          Panduan Aspirasi
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <p className="text-sm font-bold text-blue-800">✅ Boleh</p>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Saran perbaikan lingkungan</li>
              <li>• Ide kegiatan paguyuban</li>
              <li>• Kritik membangun</li>
              <li>• Informasi penting</li>
            </ul>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-bold text-rose-800">❌ Tidak Boleh</p>
            <ul className="text-sm text-rose-700 space-y-1">
              <li>• Konten SARA & ujaran kebencian</li>
              <li>• Spam atau iklan komersial</li>
              <li>• Informasi pribadi sensitif</li>
              <li>• Konten tidak pantas</li>
            </ul>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-bold text-emerald-800">ℹ️ Informasi</p>
            <ul className="text-sm text-emerald-700 space-y-1">
              <li>• Aspirasi akan ditampilkan publik</li>
              <li>• Admin dapat menghapus konten</li>
              <li>• Data disimpan di database</li>
              <li>• Anonim jika nama tidak diisi</li>
            </ul>
          </div>
        </div>
      </div>

      {/* MODAL KONFIRMASI DELETE */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-[100] backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 animate-scale-in">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-black text-gray-800 flex items-center gap-2">
                <AlertTriangle className="text-rose-500" size={24} />
                Hapus Komentar
              </h3>
              <button 
                onClick={() => setShowDeleteConfirm(false)}
                className="p-2 hover:bg-gray-100 rounded-xl"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="bg-rose-50 p-4 rounded-xl border border-rose-100">
                <p className="text-sm font-bold text-rose-700">
                  ⚠️ PERINGATAN: Tindakan ini tidak dapat dibatalkan!
                </p>
              </div>
              
              <p className="text-gray-600">
                Apakah Anda yakin ingin menghapus komentar ini? 
                Komentar akan dihapus secara permanen dari database.
              </p>
              
              <div className="flex gap-3 justify-end pt-6 border-t">
                <button 
                  type="button" 
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-6 py-3 text-gray-500 hover:bg-gray-100 rounded-xl transition-all font-bold"
                >
                  Batal
                </button>
                <button 
                  onClick={handleDeleteComment}
                  className="px-6 py-3 bg-gradient-to-r from-rose-600 to-red-600 text-white rounded-xl hover:from-rose-700 hover:to-red-700 shadow-lg transition-all font-bold flex items-center gap-2"
                >
                  <Trash2 size={16} />
                  Hapus Permanen
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CSS untuk custom scrollbar */}
      <style>
        {`
          .custom-scrollbar::-webkit-scrollbar {
            width: 6px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: #f1f5f9;
            border-radius: 10px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #10b981;
            border-radius: 10px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: #059669;
          }
        `}
      </style>
    </div>
  );
};
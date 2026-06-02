import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchFasumBookings, createFasumBooking, deleteFasumBooking, FasumBooking } from '../services/dataService';
import { useAuth } from '../contexts/AuthContext';
import { Calendar as CalendarIcon, Clock, MapPin, Plus, Trash2, CheckCircle, AlertTriangle, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export const Fasum = () => {
  const { user, isSecurity } = useAuth();
  const isAdmin = !!user && !isSecurity; 
  const queryClient = useQueryClient();

  const [activeFacility, setActiveFacility] = useState<'Lapangan Bulutangkis' | 'Mini Soccer'>('Lapangan Bulutangkis');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);

  // Form states
  const [bookerName, setBookerName] = useState('');
  const [blockNumber, setBlockNumber] = useState('');
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('09:00');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch bookings data
  const { data: bookings = [], isLoading, refetch } = useQuery({
    queryKey: ['fasum_bookings'],
    queryFn: fetchFasumBookings
  });

  const deleteBookingMutation = useMutation({
    mutationFn: deleteFasumBooking,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fasum_bookings'] });
      refetch();
      toast.success('Pemesanan berhasil dibatalkan!');
    },
    onError: () => toast.error('Gagal menghapus pemesanan')
  });

  // Filter booking untuk fasilitas dan tanggal terpilih
  const activeBookings = useMemo(() => {
    return bookings.filter(b => b.facility === activeFacility && b.booking_date === selectedDate)
      .sort((a, b) => a.start_time.localeCompare(b.start_time));
  }, [bookings, activeFacility, selectedDate]);

  // ALGORITME PENCEGAHAN BENTROKAN WAKTU SISI KLIEN
  const isTimeOverlapping = (start1: string, end1: string, start2: string, end2: string) => {
    return start1 < end2 && start2 < end1;
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formElement = e.currentTarget as HTMLFormElement;

    if (!bookerName.trim() || !blockNumber.trim() || !startTime || !endTime) {
      toast.error('Harap lengkapi semua kolom pendaftaran!');
      return;
    }

    if (startTime >= endTime) {
      toast.error('Waktu mulai harus lebih awal dari waktu selesai!');
      return;
    }

    const startHour = parseInt(startTime.split(':')[0]);
    const endHour = parseInt(endTime.split(':')[0]);
    const duration = endHour - startHour;
    if (duration > 2) {
      toast.error('Maksimal pemakaian fasilitas adalah 2 jam demi keadilan warga.');
      return;
    }

    // Jalankan verifikasi bentrokan waktu terhadap booking aktif
    const conflict = activeBookings.find(b => 
      isTimeOverlapping(startTime, endTime, b.start_time, b.end_time)
    );

    if (conflict) {
      toast.error(`⚠️ Bentrok! Slot waktu ini sudah dibooking oleh ${conflict.booker_name} (${conflict.block_number}) jam ${conflict.start_time} - ${conflict.end_time}`);
      return;
    }

    setIsSubmitting(true); // LOCK ANTARMUKA: Kunci tombol submit untuk cegah Double-Submission
    try {
      await createFasumBooking({
        facility: activeFacility,
        booker_name: bookerName.trim(),
        block_number: blockNumber.trim(),
        booking_date: selectedDate,
        start_time: startTime,
        end_time: endTime
      });

      queryClient.invalidateQueries({ queryKey: ['fasum_bookings'] });
      refetch();
      toast.success('Jadwal pemakaian Fasum berhasil didaftarkan!');
      setBookerName('');
      setBlockNumber('');
      formElement.reset();
    } catch (error: any) {
      if (error.code === '23505') {
        toast.error('⚠️ Deteksi Tabrakan Waktu: Slot ini baru saja dipesan oleh warga lain secara bersamaan. Silakan pilih jam lain!');
      } else {
        toast.error('Gagal mengirim pemesanan.');
      }
    } finally {
      setIsSubmitting(false); // UNLOCK ANTARMUKA
    }
  };

  return (
    <div className="space-y-6 p-2 sm:p-4 max-w-7xl mx-auto font-sans pb-24 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="text-center md:text-left">
        <h2 className="text-2xl md:text-4xl font-black text-gray-800 tracking-tight flex items-center justify-center md:justify-start gap-2">
          <CalendarIcon className="text-emerald-600" size={32} />
          Booking Fasilitas Umum (Fasum)
        </h2>
        <p className="text-gray-500 text-xs md:text-sm mt-1">Sistem penjadwalan tertib waktu untuk Lapangan Bulutangkis & Mini Soccer Cluster Beryl.</p>
      </div>

      {/* Fasum Selection Tab */}
      <div className="flex border-b bg-white rounded-2xl p-1.5 shadow-sm">
        {(['Lapangan Bulutangkis', 'Mini Soccer'] as const).map((fac) => (
          <button
            key={fac}
            onClick={() => setActiveFacility(fac)}
            className={`flex-1 py-3 font-bold text-xs uppercase tracking-wider rounded-xl transition-all ${
              activeFacility === fac ? 'bg-emerald-600 text-white shadow-md' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            {fac}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Form Pendaftaran */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
          <h4 className="font-black text-slate-800 text-xs uppercase tracking-wider mb-4 border-b pb-3 flex items-center gap-1.5 text-emerald-800">
            <Plus size={16} /> Isi Jadwal Pemakaian
          </h4>
          <form onSubmit={handleBookingSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase mb-1.5">Nama Pemesan *</label>
              <input
                required
                disabled={isSubmitting}
                type="text"
                placeholder="Nama Lengkap / Warga"
                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-200 outline-none transition-all bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
                value={bookerName}
                onChange={e => setBookerName(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase mb-1.5">Blok / No. Rumah *</label>
              <input
                required
                disabled={isSubmitting}
                type="text"
                placeholder="Contoh: C5/09"
                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-200 outline-none transition-all font-bold text-emerald-900 bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
                value={blockNumber}
                onChange={e => setBlockNumber(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase mb-1.5">Pilih Tanggal *</label>
              <input
                required
                disabled={isSubmitting}
                type="date"
                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-200 outline-none transition-all font-bold text-gray-700 bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
                value={selectedDate}
                onChange={e => setSelectedDate(e.target.value)}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase mb-1.5">Jam Mulai *</label>
                <select
                  disabled={isSubmitting}
                  className="w-full px-4 py-3 border border-slate-200 bg-white rounded-xl text-xs focus:ring-2 focus:ring-emerald-200 outline-none transition-all font-black text-gray-800 disabled:bg-gray-100"
                  value={startTime}
                  onChange={e => setStartTime(e.target.value)}
                >
                  {Array.from({ length: 17 }, (_, i) => {
                    const h = (i + 6).toString().padStart(2, '0');
                    return <option key={h} value={`${h}:00`}>{`${h}:00 WIB`}</option>;
                  })}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase mb-1.5">Jam Selesai *</label>
                <select
                  disabled={isSubmitting}
                  className="w-full px-4 py-3 border border-slate-200 bg-white rounded-xl text-xs focus:ring-2 focus:ring-emerald-200 outline-none transition-all font-black text-gray-800 disabled:bg-gray-100"
                  value={endTime}
                  onChange={e => setEndTime(e.target.value)}
                >
                  {Array.from({ length: 17 }, (_, i) => {
                    const h = (i + 7).toString().padStart(2, '0');
                    return <option key={h} value={`${h}:00`}>{`${h}:00 WIB`}</option>;
                  })}
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black py-3.5 rounded-xl uppercase tracking-widest transition-all shadow-md disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isSubmitting ? <Loader2 size={16} className="animate-spin mx-auto" /> : 'Kunci Jadwal (Booking)'}
            </button>
          </form>
        </div>

        {/* Jadwal Harian / Daftar Booking */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-gray-50/50 flex-wrap gap-2">
            <div>
              <h4 className="font-black text-slate-800 text-xs uppercase tracking-wider">Jadwal Penggunaan Aktif</h4>
              <p className="text-[11px] text-gray-500 mt-1">Tanggal terpilih: {selectedDate}</p>
            </div>
            <span className="text-[10px] font-black bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full">
              {activeBookings.length} Terjadwal
            </span>
          </div>

          <div className="p-4 space-y-3">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                <Loader2 className="animate-spin mb-2" size={24} />
                <p className="text-xs">Sedang menyelaraskan jadwal...</p>
              </div>
            ) : activeBookings.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <CheckCircle className="mx-auto text-emerald-300 mb-2" size={36} />
                <h5 className="font-bold text-gray-700 text-sm">Fasilitas Kosong / Tersedia</h5>
                <p className="text-xs text-gray-400 mt-1">Belum ada warga yang memesan untuk tanggal ini. Silakan gunakan form untuk mem-booking.</p>
              </div>
            ) : (
              <div className="grid gap-3">
                {activeBookings.map((b) => (
                  <div key={b.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100 shadow-inner gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-black">
                        {b.booker_name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-black text-gray-800 text-sm">{b.booker_name}</p>
                          <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 font-bold text-[9px] px-2 py-0.5 rounded">
                            Blok {b.block_number}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                          <span className="flex items-center gap-1 font-semibold text-gray-700">
                            <Clock size={12} /> {b.start_time} - {b.end_time} WIB
                          </span>
                        </div>
                      </div>
                    </div>

                    {isAdmin && (
                      <button
                        onClick={() => deleteBookingMutation.mutate(b.id)}
                        className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl self-end sm:self-auto"
                        title="Batalkan Booking"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Aturan Main */}
      <div className="bg-amber-50/50 border border-amber-200/60 p-6 rounded-3xl mt-6 flex gap-4 items-start">
        <AlertTriangle className="text-amber-600 flex-shrink-0" size={24} />
        <div>
          <h5 className="font-bold text-amber-800 text-sm mb-1">Tata Tertib Penggunaan Fasum</h5>
          <ol className="text-xs text-amber-700 leading-relaxed list-decimal pl-4 space-y-1">
            <li>Pemesanan terbuka untuk seluruh warga dan wajib didaftarkan demi ketertiban bersama.</li>
            <li>Batas maksimum pemakaian berturut-turut untuk satu kepala keluarga adalah **2 jam**.</li>
            <li>Harap merawat kebersihan, tidak meninggalkan sampah, dan mengunci gerbang setelah pemakaian selesai.</li>
          </ol>
        </div>
      </div>
    </div>
  );
};
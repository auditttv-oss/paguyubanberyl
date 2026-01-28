import React from 'react';
import { 
  FileText, 
  ShieldCheck, 
  Users, 
  Home,
  DollarSign,
  Shield,
  Bell,
  AlertTriangle,
  Calendar,
  CheckCircle2,
  MapPin,
  Clock,
  MessageSquare,
  Gavel,
  BookOpen,
  Info,
  Heart,
  Megaphone,
  Lock,
  Dog,
  Mic2,
  AlertCircle,
  ExternalLink,
  Volume2,
  ArrowRight
} from 'lucide-react';

export const AdArt = () => {
  return (
    <div className="max-w-5xl mx-auto pb-20 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* --- HEADER / COVER SECTION --- */}
      <div className="bg-white rounded-[3rem] shadow-xl border border-gray-100 overflow-hidden relative">
        <div className="bg-gradient-to-br from-emerald-900 to-teal-800 p-10 md:p-20 text-center text-white relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
          
          <div className="relative z-10">
            <div className="inline-flex items-center justify-center p-4 bg-white/10 backdrop-blur-md rounded-2xl mb-8 border border-white/20 shadow-lg">
              <BookOpen size={48} className="text-emerald-300" />
            </div>
            
            <h1 className="text-3xl md:text-5xl font-black tracking-tight mb-4 leading-tight">
              ANGGARAN DASAR &<br/>RUMAH TANGGA
            </h1>
            
            <p className="text-emerald-200 font-bold uppercase tracking-[0.3em] text-sm md:text-base mb-10">
              PAGUYUBAN CLUSTER BERYL
            </p>

            <div className="flex flex-wrap justify-center gap-3 text-xs md:text-sm font-bold uppercase tracking-wide">
              <span className="bg-emerald-500/20 border border-emerald-400/30 backdrop-blur-md px-5 py-2.5 rounded-full flex items-center gap-2">
                <Calendar size={14} /> Disahkan: 3 Jan 2026
              </span>
              <span className="bg-amber-500 text-white px-5 py-2.5 rounded-full shadow-lg flex items-center gap-2">
                <Clock size={14} /> Masa Transisi (Pra-RT)
              </span>
            </div>
          </div>
        </div>

        {/* Info Bar */}
        <div className="bg-emerald-50/50 p-6 border-b border-emerald-100 flex flex-wrap justify-center gap-6 text-sm text-emerald-800 font-medium">
          <div className="flex items-center gap-2">
            <MapPin size={16} className="text-emerald-600"/>
            Cluster Beryl Permata Mutiara Maja, Lebak - Banten
          </div>
          <div className="hidden md:block text-emerald-300">•</div>
          <div className="flex items-center gap-2">
            <ShieldCheck size={16} className="text-emerald-600"/>
            Berlaku hingga terbentuk RT Definitif
          </div>
          <div className="hidden md:block text-emerald-300">•</div>
          <a
            href="/structure"
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
          >
            <Users size={16} />
            <span>Lihat Struktur</span>
            <ExternalLink size={14} />
          </a>
        </div>
      </div>

      {/* --- CONTENT GRID --- */}
      <div className="grid grid-cols-1 gap-12">

        {/* BAB I: NAMA & KEDUDUKAN */}
        <section className="scroll-mt-20">
          <SectionHeader 
            icon={<Home size={24} />} 
            title="BAB I: Nama, Kedudukan, dan Sifat" 
            color="bg-blue-100 text-blue-700"
          />
          <div className="grid md:grid-cols-2 gap-6">
            <ArticleCard title="Pasal 1: Nama & Kedudukan">
              <ul className="list-disc pl-5 space-y-2 text-gray-700">
                <li>Bernama <strong>Paguyuban Cluster Beryl</strong>.</li>
                <li>Berkedudukan di Cluster Beryl Permata Mutiara Maja, Desa Curug Badak, Kecamatan Maja, Kabupaten Lebak, Provinsi Banten.</li>
                <li>Merupakan wadah musyawarah dan kerja sama warga.</li>
              </ul>
            </ArticleCard>
            <ArticleCard title="Pasal 2: Sifat & Jangka Waktu">
              <ul className="list-disc pl-5 space-y-2 text-gray-700">
                <li>Bersifat <span className="text-rose-600 font-bold bg-rose-50 px-1 rounded">SEMENTARA (TEMPORARY)</span> sebagai masa transisi hingga terbentuknya RT definitif.</li>
                <li>Berfungsi sebagai forum komunikasi, koordinasi, dan pemberdayaan warga.</li>
                <li>Tidak berorientasi profit dan bersifat independen.</li>
              </ul>
            </ArticleCard>
          </div>
        </section>

        {/* BAB II: JAGA WARGA (DANA SOSIAL) */}
        <section className="scroll-mt-20">
          <SectionHeader 
            icon={<Heart size={24} />} 
            title="BAB II: Jaga Warga (Dana Sosial)" 
            color="bg-rose-100 text-rose-700"
          />
          <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="grid md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gray-100">
              {/* Iuran */}
              <div className="p-8 bg-gradient-to-b from-white to-gray-50">
                <h4 className="font-bold text-gray-900 flex items-center gap-2 mb-4">
                  <DollarSign className="text-emerald-500" size={20}/> Pasal 3: Iuran Wajib
                </h4>
                <div className="text-center py-6 bg-white rounded-2xl border border-emerald-100 shadow-sm mb-4">
                  <p className="text-sm text-gray-500 mb-1">Nominal Iuran</p>
                  <p className="text-3xl font-black text-emerald-600">Rp 10.000</p>
                  <p className="text-xs text-gray-400">per KK / Bulan</p>
                </div>
                <ul className="text-sm space-y-3 text-gray-600">
                  <li className="flex gap-2"><CheckCircle2 size={16} className="text-emerald-500 shrink-0"/> Batas bayar tgl 15 tiap bulan.</li>
                  <li className="flex gap-2"><CheckCircle2 size={16} className="text-emerald-500 shrink-0"/> Mulai Januari 2026.</li>
                  <li className="flex gap-2"><AlertCircle size={16} className="text-amber-500 shrink-0"/> Telat {'>'}30 hari dapat teguran.</li>
                  <li className="flex gap-2"><Info size={16} className="text-blue-500 shrink-0"/> Bayar transfer/tunai ke Bendahara.</li>
                </ul>
              </div>

              {/* Penggunaan */}
              <div className="p-8">
                <h4 className="font-bold text-gray-900 flex items-center gap-2 mb-4">
                  <FileText className="text-blue-500" size={20}/> Pasal 4: Penggunaan
                </h4>
                <div className="space-y-4">
                  <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                    <p className="text-sm font-bold text-blue-800 mb-2">Tujuan Dana:</p>
                    <div className="flex flex-wrap gap-2">
                      <span className="bg-white text-blue-600 px-2 py-1 rounded text-xs border border-blue-200">Santunan Kematian</span>
                      <span className="bg-white text-blue-600 px-2 py-1 rounded text-xs border border-blue-200">Rawat Inap</span>
                      <span className="bg-white text-blue-600 px-2 py-1 rounded text-xs border border-blue-200">Darurat Sosial</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Pencairan wajib diketahui Ketua & Bendahara. Penggunaan di luar tujuan sosial harus melalui musyawarah. Laporan transparan per 3 bulan.
                  </p>
                </div>
              </div>

              {/* Penanggung Jawab */}
              <div className="p-8 bg-gradient-to-b from-white to-gray-50">
                <h4 className="font-bold text-gray-900 flex items-center gap-2 mb-4">
                  <Users className="text-purple-500" size={20}/> Pasal 5: Keuangan
                </h4>
                <div className="space-y-4 text-sm text-gray-700">
                  <p><strong>Bendahara</strong> bertanggung jawab atas pencatatan, penyimpanan, dan pelaporan dana.</p>
                  <div className="p-4 bg-amber-50 rounded-xl border border-amber-100 text-amber-800 flex gap-3 items-start">
                    <AlertTriangle size={18} className="shrink-0 mt-0.5"/>
                    <p className="text-xs font-medium">Setiap transaksi di atas <strong>Rp 500.000</strong> harus diketahui oleh Ketua.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* BAB III: KEAMANAN INTERNAL */}
        <section className="scroll-mt-20">
          <SectionHeader 
            icon={<Shield size={24} />} 
            title="BAB III: Jaga Keamanan Internal" 
            color="bg-slate-100 text-slate-700"
          />
          <div className="grid md:grid-cols-3 gap-6">
            <ArticleCard title="Pasal 6: Siskamling">
              <p className="text-sm text-gray-600 mb-3">Pengawasan dilakukan warga secara bergiliran (Siskamling Mandiri).</p>
              <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
                <li>Jadwal diatur Sie. Keamanan.</li>
                <li>Wajib lapor kejadian mencurigakan.</li>
              </ul>
            </ArticleCard>
            <ArticleCard title="Pasal 7: Tamu">
              <ul className="list-disc pl-5 space-y-2 text-sm text-gray-700">
                <li><strong>Menginap 1x24 Jam:</strong> Wajib lapor & serahkan fotokopi KTP.</li>
                <li><strong>Menginap {'>'} 3 Hari:</strong> Wajib lapor tertulis.</li>
                <li>Pemilik rumah bertanggung jawab penuh.</li>
              </ul>
            </ArticleCard>
            <ArticleCard title="Pasal 8: Akses Masuk">
              <div className="bg-red-50 p-3 rounded-lg border border-red-100 mb-3">
                <div className="flex items-center gap-2 text-red-700 font-bold text-sm">
                  <Clock size={16}/> Portal Tutup: 23.00 WIB
                </div>
              </div>
              <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
                <li>Akses warga tetap buka (kunci/pass).</li>
                <li>Tamu {'>'} 22.00 WIB wajib lapor.</li>
                <li>Parkir tamu dilarang halangi akses darurat.</li>
              </ul>
            </ArticleCard>
          </div>
        </section>

        {/* BAB IV: KETERTIBAN UMUM */}
        <section className="scroll-mt-20">
          <SectionHeader 
            icon={<Bell size={24} />} 
            title="BAB IV: Ketertiban Umum" 
            color="bg-amber-100 text-amber-700"
          />
          <div className="bg-white rounded-3xl border border-gray-200 p-8 shadow-sm">
            <div className="grid md:grid-cols-2 gap-10">
              <div>
                <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Volume2 size={20} className="text-gray-400"/> Pasal 9: Jam Tenang
                </h4>
                <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <div className="bg-white p-3 rounded-lg shadow-sm font-black text-xl text-gray-800">
                    22.00 - 06.00
                  </div>
                  <p className="text-sm text-gray-600">Dilarang membuat kegaduhan / musik keras. Pengecualian acara khusus (Info H-3).</p>
                </div>
              </div>
              
              <div>
                <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <AlertTriangle size={20} className="text-gray-400"/> Pasal 10: Pengaturan Parkir
                </h4>
                <ul className="list-disc pl-5 space-y-2 text-sm text-gray-700">
                  <li><strong>Wajib di Carport</strong> masing-masing (Prioritas).</li>
                  <li>Parkir di area umum:
                    <ul className="list-disc pl-5 mt-1 text-xs text-gray-500">
                      <li>Tidak ganggu akses/pandangan.</li>
                      <li>Izin Sie. Sosial/Humas.</li>
                      <li>Bersifat sementara.</li>
                    </ul>
                  </li>
                  <li>Dilarang parkir permanen di jalan utama.</li>
                  <li>Parkir liar {'>'} 7 hari akan ditegur.</li>
                </ul>
              </div>
            </div>
            <div className="mt-8 pt-8 border-t border-gray-100">
              <h4 className="font-bold text-gray-900 mb-2">Pasal 11: Kebersihan Lingkungan</h4>
              <p className="text-sm text-gray-600">Wajib jaga kebersihan depan rumah. Sampah dibuang di tempatnya. <strong>Dilarang</strong> buang limbah ke saluran air umum.</p>
            </div>
          </div>
        </section>

        {/* BAB V: HEWAN PELIHARAAN (SPECIAL SECTION) */}
        <section className="scroll-mt-20">
          <div className="bg-gradient-to-br from-rose-50 to-orange-50 rounded-[3rem] border border-rose-100 overflow-hidden">
            <div className="bg-rose-100/50 p-6 md:p-8 border-b border-rose-200 flex items-center gap-4">
              <div className="bg-white p-3 rounded-2xl shadow-sm text-rose-600">
                <Dog size={28}/>
              </div>
              <div>
                <h3 className="text-xl md:text-2xl font-black text-rose-900">BAB V: Ketertiban Hewan Peliharaan</h3>
                <p className="text-rose-700 font-medium text-sm">Demi kenyamanan bertetangga (Ayam, Unggas, Anjing, Kucing)</p>
              </div>
            </div>
            
            <div className="p-8 grid md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <h4 className="font-bold text-rose-900 mb-3 flex items-center gap-2">
                    <Info size={18}/> Pasal 12: Ketentuan Umum
                  </h4>
                  <ul className="space-y-2 text-sm text-rose-900/80">
                    <li className="flex gap-2"><div className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-2"></div> Pastikan tidak mengganggu (suara/bau).</li>
                    <li className="flex gap-2"><div className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-2"></div> <strong>DILARANG</strong> berkeliaran bebas di luar pagar.</li>
                    <li className="flex gap-2"><div className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-2"></div> <strong>WAJIB</strong> bersihkan kotoran di area umum seketika.</li>
                    <li className="flex gap-2"><div className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-2"></div> Hewan harus sehat & terawat.</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-bold text-rose-900 mb-3 flex items-center gap-2">
                    <Gavel size={18}/> Pasal 15: Sanksi
                  </h4>
                  <div className="flex flex-col gap-2">
                    <div className="bg-white/60 p-2 rounded-lg border border-rose-200 text-xs font-bold text-rose-800 flex justify-between">
                      <span>1. Pelanggaran Pertama</span> <span>Teguran Lisan</span>
                    </div>
                    <div className="bg-white/60 p-2 rounded-lg border border-rose-200 text-xs font-bold text-rose-800 flex justify-between">
                      <span>2. Pelanggaran Kedua</span> <span>Teguran Tertulis</span>
                    </div>
                    <div className="bg-white/60 p-2 rounded-lg border border-rose-200 text-xs font-bold text-rose-800 flex justify-between">
                      <span>3. Berulang</span> <span>Musyawarah Warga</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-white p-5 rounded-2xl border border-rose-100 shadow-sm">
                  <h5 className="font-bold text-gray-800 mb-2">Pasal 13: Unggas (Ayam/Bebek)</h5>
                  <ul className="list-disc pl-5 space-y-1 text-sm text-gray-600">
                    <li><strong>Dilarang ternak komersil</strong> skala besar.</li>
                    <li>Wajib kandang (tidak dilepasliarkan).</li>
                    <li>Kandang wajib bersih & tidak bau.</li>
                    <li>Maksimal <strong>10 ekor</strong> per rumah.</li>
                  </ul>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-rose-100 shadow-sm">
                  <h5 className="font-bold text-gray-800 mb-2">Pasal 14: Anjing & Kucing</h5>
                  <ul className="list-disc pl-5 space-y-1 text-sm text-gray-600">
                    <li>Jalan di umum <strong>WAJIB tali penuntun (leash)</strong>.</li>
                    <li>Kendalikan gonggongan di jam tenang.</li>
                    <li>Anjing galak/besar wajib pakai muzzle.</li>
                    <li>Kucing wajib vaksin & dikandangkan jika liar.</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* BAB VI & VII: KEANGGOTAAN & RAPAT */}
        <div className="grid md:grid-cols-2 gap-8">
          <section className="scroll-mt-20">
            <SectionHeader 
              icon={<Users size={24} />} 
              title="BAB VI: Keanggotaan" 
              color="bg-indigo-100 text-indigo-700"
            />
            <div className="space-y-4">
              <ArticleCard title="Pasal 16-18: Hak & Kewajiban">
                <p className="text-sm text-gray-600 mb-2"><strong>Anggota:</strong> Seluruh warga yang menempati rumah (1 suara/KK). Aktif setelah bayar iuran pertama.</p>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="bg-indigo-50 p-3 rounded-lg">
                    <p className="font-bold text-indigo-800 mb-1">Hak:</p>
                    <ul className="list-disc pl-4 text-indigo-700 text-xs space-y-1">
                      <li>Berpendapat</li>
                      <li>Perlindungan</li>
                      <li>Info Keuangan</li>
                      <li>Dipilih/Memilih</li>
                    </ul>
                  </div>
                  <div className="bg-indigo-50 p-3 rounded-lg">
                    <p className="font-bold text-indigo-800 mb-1">Kewajiban:</p>
                    <ul className="list-disc pl-4 text-indigo-700 text-xs space-y-1">
                      <li>Patuhi AD/ART</li>
                      <li>Bayar Iuran</li>
                      <li>Jaga Ketertiban</li>
                      <li>Hormati Tetangga</li>
                    </ul>
                  </div>
                </div>
              </ArticleCard>
            </div>
          </section>

          <section className="scroll-mt-20">
            <SectionHeader 
              icon={<MessageSquare size={24} />} 
              title="BAB VII: Musyawarah" 
              color="bg-violet-100 text-violet-700"
            />
            <div className="space-y-4">
              <ArticleCard title="Pasal 19-20: Mekanisme">
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex justify-between border-b border-gray-100 pb-1">
                    <span>Musyawarah Tahunan</span> <span className="font-bold">2x / tahun</span>
                  </li>
                  <li className="flex justify-between border-b border-gray-100 pb-1">
                    <span>Rapat Pengurus</span> <span className="font-bold">1x / bulan (stlh tgl 15)</span>
                  </li>
                  <li className="flex justify-between border-b border-gray-100 pb-1">
                    <span>Konsultasi Warga</span> <span className="font-bold">Per 3 bulan</span>
                  </li>
                  <li className="flex justify-between border-b border-gray-100 pb-1">
                    <span>Musyawarah Khusus</span> <span className="font-bold">Jika mendesak</span>
                  </li>
                </ul>
                <div className="mt-3 bg-violet-50 p-3 rounded-lg text-xs text-violet-800 font-medium text-center">
                  Kuorum: 60% KK | Keputusan: Mufakat / Voting
                </div>
              </ArticleCard>
            </div>
          </section>
        </div>

        {/* BAB VIII: STRUKTUR PENGURUS */}
        <section className="scroll-mt-20">
          <SectionHeader 
            icon={<Users size={24} />} 
            title="BAB VIII: Struktur Pengurus" 
            color="bg-teal-100 text-teal-700"
          />
          <div className="bg-white rounded-3xl border border-gray-200 p-8 shadow-sm text-center">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-gray-800">Struktur & Personalia Pengurus</h3>
              <p className="text-gray-500 text-sm">Detail nama dan kontak pengurus dapat dilihat pada halaman Struktur.</p>
            </div>
            
            <div className="inline-flex items-center gap-2 bg-teal-50 text-teal-700 px-6 py-3 rounded-full font-bold cursor-default border border-teal-100 hover:bg-teal-100 transition-colors">
              Lihat Halaman Struktur Pengurus <ArrowRight size={18} />
            </div>

            <div className="mt-8 text-left grid md:grid-cols-2 gap-6">
               <div className="bg-gray-50 p-4 rounded-xl text-sm border border-gray-100">
                  <h5 className="font-bold text-gray-800 mb-2">Pasal 22: Masa Bakti</h5>
                  <ul className="list-disc pl-5 space-y-1 text-gray-600">
                    <li>Hingga terbentuk RT Definitif.</li>
                    <li>Dapat dipilih kembali maks 2 periode.</li>
                    <li>Penggantian di luar jadwal hanya kondisi khusus.</li>
                  </ul>
               </div>
               <div className="bg-gray-50 p-4 rounded-xl text-sm border border-gray-100">
                  <h5 className="font-bold text-gray-800 mb-2">Pasal 23: Tugas & Wewenang</h5>
                  <ul className="list-disc pl-5 space-y-1 text-gray-600">
                    <li><strong>Ketua:</strong> Memimpin & koordinasi.</li>
                    <li><strong>Sekretaris:</strong> Admin & korespondensi.</li>
                    <li><strong>Bendahara:</strong> Keuangan & laporan.</li>
                    <li><strong>Sie Bidang:</strong> Sesuai tupoksi masing-masing.</li>
                  </ul>
               </div>
            </div>
          </div>
        </section>

        {/* BAB IX & X: SANKSI & PENUTUP */}
        <section className="scroll-mt-20">
          <SectionHeader 
            icon={<Gavel size={24} />} 
            title="BAB IX & X: Penyelesaian & Penutup" 
            color="bg-gray-100 text-gray-700"
          />
          <div className="grid md:grid-cols-2 gap-6">
            <ArticleCard title="Pasal 24-25: Sanksi & Perselisihan">
              <div className="mb-3">
                 <p className="text-xs font-bold text-gray-500 uppercase mb-1">Jenis Sanksi:</p>
                 <div className="flex flex-wrap gap-2 text-xs">
                    <span className="bg-gray-100 px-2 py-1 rounded">Teguran Lisan</span>
                    <span className="bg-gray-100 px-2 py-1 rounded">Teguran Tertulis</span>
                    <span className="bg-gray-100 px-2 py-1 rounded">Pembatasan Hak</span>
                    <span className="bg-gray-100 px-2 py-1 rounded">Musyawarah Khusus</span>
                 </div>
              </div>
              <ul className="list-disc pl-5 space-y-2 text-sm text-gray-700">
                <li>Perselisihan diselesaikan kekeluargaan melalui pengurus.</li>
                <li>Jika buntu, dibawa ke musyawarah warga.</li>
                <li>Prinsip: <strong>Musyawarah untuk mufakat</strong> & toleransi.</li>
              </ul>
            </ArticleCard>
            <ArticleCard title="Pasal 26-28: Perubahan & Penutup">
              <ul className="list-disc pl-5 space-y-2 text-sm text-gray-700">
                <li>Perubahan AD/ART: Musyawarah (Kuorum 60%, Setuju 2/3).</li>
                <li>Usulan perubahan min. 7 hari sebelum rapat.</li>
                <li>Pembubaran: Musyawarah (Kuorum 75%). Aset diserahkan ke RT.</li>
                <li>Hal belum diatur ditetapkan kemudian via musyawarah.</li>
                <li>Tujuan: Keharmonisan, ketertiban, kenyamanan.</li>
              </ul>
            </ArticleCard>
          </div>
        </section>

      </div>

      {/* --- FOOTER --- */}
      <div className="mt-20 border-t border-gray-200 pt-10 text-center">
        <p className="text-gray-400 text-sm font-medium uppercase tracking-widest mb-2">Dokumen Resmi Paguyuban Cluster Beryl</p>
        <p className="text-gray-300 text-xs">Disahkan pada 3 Januari 2026 • Versi Digital 1.0</p>
      </div>
    </div>
  );
};

// --- Sub Components ---

const SectionHeader = ({ icon, title, color }: { icon: React.ReactNode, title: string, color: string }) => (
  <div className="flex items-center gap-4 mb-6">
    <div className={`p-3 rounded-2xl ${color} shadow-sm`}>
      {icon}
    </div>
    <h2 className="text-2xl font-black text-gray-800 tracking-tight">{title}</h2>
  </div>
);

const ArticleCard = ({ title, children }: { title: string, children: React.ReactNode }) => (
  <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
    <h4 className="font-bold text-gray-900 mb-3 text-lg border-b border-gray-50 pb-2">{title}</h4>
    {children}
  </div>
);
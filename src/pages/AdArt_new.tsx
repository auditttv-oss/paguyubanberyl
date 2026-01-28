import React, { useState } from 'react';
import html2pdf from 'html2pdf.js';
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
  ArrowRight,
  Search,
  Download,
  Eye,
  ChevronDown,
  ChevronUp,
  Star,
  Award,
  Target,
  Zap,
  Building,
  Car,
  TreePine,
  Loader2
} from 'lucide-react';

export const AdArtNew = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownloadPDF = async () => {
    setIsDownloading(true);
    
    // Expand all sections for PDF
    const originalExpanded = expandedSection;
    setExpandedSection('expand-all-for-pdf');
    
    // Wait a moment for sections to expand
    setTimeout(async () => {
      const element = document.getElementById('adart-content');
      if (element) {
        const opt = {
          margin: 10,
          filename: 'AD_ART_Paguyuban_Cluster_Beryl.pdf',
          image: { type: 'jpeg' as const, quality: 0.98 },
          html2canvas: { scale: 2 },
          jsPDF: { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const }
        };
        
        try {
          await html2pdf().set(opt).from(element).save();
        } catch (error) {
          console.error('Error generating PDF:', error);
          alert('Gagal membuat PDF. Silakan coba lagi.');
        }
      }
      
      // Restore original expanded state
      setExpandedSection(originalExpanded);
      setIsDownloading(false);
    }, 1000);
  };

  const categories = [
    { id: 'all', name: 'Semua', icon: <BookOpen size={16} /> },
    { id: 'struktur', name: 'Struktur', icon: <Users size={16} /> },
    { id: 'keuangan', name: 'Keuangan', icon: <DollarSign size={16} /> },
    { id: 'keamanan', name: 'Keamanan', icon: <Shield size={16} /> },
    { id: 'lingkungan', name: 'Lingkungan', icon: <TreePine size={16} /> },
    { id: 'sosial', name: 'Sosial', icon: <Heart size={16} /> }
  ];

  const adArtContent = [
    {
      id: 'bab1',
      category: 'struktur',
      title: 'BAB I: NAMA, KEDUDUKAN, DAN SIFAT',
      icon: <Building size={24} />,
      color: 'from-blue-500 to-blue-600',
      articles: [
        {
          number: 'Pasal 1',
          title: 'Nama dan Kedudukan',
          content: [
            'Organisasi ini bernama Paguyuban Cluster Beryl.',
            'Berkedudukan di Cluster Beryl Permata Mutiara Maja, Desa Curug Badak, Kecamatan Maja, Kabupaten Lebak, Provinsi Banten.',
            'Paguyuban ini merupakan wadah musyawarah dan kerja sama warga Cluster Beryl.'
          ],
          important: true
        },
        {
          number: 'Pasal 2',
          title: 'Sifat dan Jangka Waktu',
          content: [
            'Bersifat SEMENTARA (TEMPORARY) sebagai masa transisi hingga terbentuknya RT definitif.',
            'Berfungsi sebagai forum komunikasi, koordinasi, dan pemberdayaan warga.',
            'Tidak berorientasi profit dan bersifat independen.'
          ],
          status: 'warning'
        }
      ]
    },
    {
      id: 'bab2',
      category: 'keuangan',
      title: 'BAB II: JAGA WARGA (DANA SOSIAL)',
      icon: <Heart size={24} />,
      color: 'from-rose-500 to-rose-600',
      articles: [
        {
          number: 'Pasal 3',
          title: 'Iuran Wajib',
          content: [
            'Iuran Wajib: Rp 10.000 per KK / bulan.',
            'Batas pembayaran tanggal 15 setiap bulannya dimulai sejak Januari 2026.',
            'Iuran dapat dibayarkan melalui transfer atau tunai kepada Bendahara.',
            'Keterlambatan pembayaran lebih dari 30 hari akan mendapatkan teguran tertulis.'
          ],
          important: true,
          amount: 'Rp 10.000'
        },
        {
          number: 'Pasal 4',
          title: 'Penggunaan Dana Sosial',
          content: [
            'Tujuan Dana: Santunan kematian, bantuan rawat inap, dan darurat sosial warga.',
            'Mekanisme pencairan dana wajib diketahui dan disetujui oleh Ketua dan Bendahara.',
            'Penggunaan dana di luar tujuan sosial harus melalui musyawarah warga.',
            'Laporan keuangan akan disampaikan setiap 3 bulan secara transparan.'
          ],
          status: 'info'
        },
        {
          number: 'Pasal 5',
          title: 'Penanggung Jawab Keuangan',
          content: [
            'Bendahara bertanggung jawab atas pencatatan, penyimpanan, dan pelaporan dana.',
            'Setiap transaksi di atas Rp 500.000 harus diketahui oleh Ketua.'
          ],
          status: 'alert'
        }
      ]
    },
    {
      id: 'bab3',
      category: 'keamanan',
      title: 'BAB III: JAGA KEAMANAN INTERNAL',
      icon: <Shield size={24} />,
      color: 'from-slate-500 to-slate-600',
      articles: [
        {
          number: 'Pasal 6',
          title: 'Sistem Keamanan Lingkungan',
          content: [
            'Pengawasan lingkungan dilakukan warga secara bergiliran (Siskamling Mandiri).',
            'Jadwal siskamling akan diatur oleh Sie. Keamanan dan disebarkan ke semua warga.',
            'Setiap warga wajib melaporkan kejadian mencurigakan kepada Sie. Keamanan.'
          ],
          important: true
        },
        {
          number: 'Pasal 7',
          title: 'Pengaturan Tamu',
          content: [
            'Tamu Menginap 1x24 Jam: Wajib lapor pengurus dan menyerahkan fotokopi KTP.',
            'Tamu yang menginap lebih dari 3 hari wajib melapor secara tertulis.',
            'Pemilik rumah bertanggung jawab penuh atas tamunya.'
          ],
          status: 'warning'
        },
        {
          number: 'Pasal 8',
          title: 'Pengaturan Akses',
          content: [
            'Portal/Gerbang ditutup pukul 23.00 WIB (akses warga tetap dibuka dengan kunci/password).',
            'Setiap tamu yang masuk setelah pukul 22.00 WIB wajib dilaporkan.',
            'Parkir kendaraan tamu tidak boleh menghalangi akses darurat.'
          ],
          status: 'alert'
        }
      ]
    },
    {
      id: 'bab4',
      category: 'lingkungan',
      title: 'BAB IV: KETERTIBAN UMUM',
      icon: <Bell size={24} />,
      color: 'from-amber-500 to-amber-600',
      articles: [
        {
          number: 'Pasal 9',
          title: 'Jam Tenang',
          content: [
            'Jam Tenang: Pukul 22.00 - 06.00 WIB.',
            'Dilarang membuat kegaduhan, musik keras, atau aktivitas yang mengganggu ketenangan.',
            'Pengecualian untuk acara khusus dengan pemberitahuan minimal 3 hari sebelumnya.'
          ],
          important: true
        },
        {
          number: 'Pasal 10',
          title: 'Pengaturan Parkir',
          content: [
            'Kendaraan wajib diparkir di carport masing-masing sebagai prioritas utama.',
            'Dalam kondisi khusus dimana tidak tersedia tempat parkir pribadi, pemilik kendaraan dapat memarkir di area umum dengan ketentuan:',
            'Tidak mengganggu akses jalan utama dan kendaraan lain;',
            'Tidak menghalangi pandangan atau akses darurat;',
            'Harus memperoleh izin terlebih dahulu dari Sie. Sosial/Humas;',
            'Bersifat sementara dan dapat dipindahkan sewaktu-waktu atas permintaan pengurus.',
            'Dilarang parkir permanen di jalan utama atau menghalangi akses tetangga.',
            'Kendaraan yang parkir lebih dari 7 hari tanpa pemberitahuan akan ditegur.'
          ],
          status: 'warning'
        },
        {
          number: 'Pasal 11',
          title: 'Kebersihan Lingkungan',
          content: [
            'Setiap warga bertanggung jawab atas kebersihan depan rumah masing-masing.',
            'Sampah rumah tangga hanya boleh dibuang pada tempat yang telah disediakan.',
            'Dilarang membuang sampah atau limbah ke saluran air umum.'
          ],
          status: 'info'
        }
      ]
    },
    {
      id: 'bab5',
      category: 'lingkungan',
      title: 'BAB V: KETERTIBAN & PEMELIHARAAN HEWAN',
      icon: <Dog size={24} />,
      color: 'from-purple-500 to-purple-600',
      articles: [
        {
          number: 'Pasal 12',
          title: 'Ketentuan Umum Hewan Peliharaan',
          content: [
            '⚠️ PERHATIAN KHUSUS: Bagian ini mengatur tentang Ayam, Unggas, Anjing, dan Kucing demi kenyamanan bertetangga.',
            'Pemilik hewan wajib memastikan peliharaannya tidak mengganggu tetangga (suara, bau, kotoran).',
            'Hewan peliharaan DILARANG dibiarkan berkeliaran bebas di luar pagar rumah tanpa pengawasan.',
            'Pemilik WAJIB membersihkan kotoran hewannya yang tercecer di area umum (jalan/taman) seketika itu juga.',
            'Setiap hewan peliharaan harus dalam kondisi sehat dan terawat.'
          ],
          important: true
        },
        {
          number: 'Pasal 13',
          title: 'Aturan Unggas (Ayam/Bebek)',
          content: [
            'Larangan Ternak Komersil: Rumah tinggal dilarang dijadikan peternakan skala besar.',
            'Wajib Kandang: Ayam/Unggas wajib dikandangkan di dalam area rumah, tidak boleh dilepasliarkan di jalanan cluster.',
            'Kebersihan: Kandang wajib dibersihkan rutin agar tidak menimbulkan bau ke tetangga sebelah.',
            'Jumlah maksimal unggas yang dipelihara adalah 10 ekor per rumah.'
          ],
          status: 'warning'
        },
        {
          number: 'Pasal 14',
          title: 'Aturan Anjing & Kucing',
          content: [
            'Tali Penuntun (Leash): Saat membawa anjing berjalan di area umum, WAJIB menggunakan tali penuntun.',
            'Suara: Pemilik wajib mengendalikan gonggongan anjing terutama di jam istirahat (22.00 - 06.00).',
            'Anjing galak atau berukuran besar harus menggunakan muzzle saat di area umum.',
            'Kucing harus divaksinasi dan dikandangkan jika memiliki kebiasaan berkeliaran.'
          ],
          status: 'alert'
        },
        {
          number: 'Pasal 15',
          title: 'Sanksi Pelanggaran Aturan Hewan',
          content: [
            'Pelanggaran pertama: Teguran lisan dari pengurus.',
            'Pelanggaran kedua: Teguran tertulis.',
            'Pelanggaran berulang: Akan dibahas dalam musyawarah warga untuk sanksi lebih lanjut.'
          ],
          status: 'alert'
        }
      ]
    },
    {
      id: 'bab6',
      category: 'sosial',
      title: 'BAB VI: KEANGGOTAAN, HAK DAN KEWAJIBAN',
      icon: <Users size={24} />,
      color: 'from-emerald-500 to-emerald-600',
      articles: [
        {
          number: 'Pasal 16',
          title: 'Anggota Paguyuban',
          content: [
            'Anggota paguyuban adalah seluruh warga Cluster Beryl yang telah menempati rumah.',
            'Setiap kepala keluarga memiliki 1 (satu) hak suara dalam musyawarah.',
            'Keanggotaan aktif setelah membayar iuran pertama.'
          ],
          important: true
        },
        {
          number: 'Pasal 17',
          title: 'Hak Anggota',
          content: [
            'Mengikuti musyawarah dan menyampaikan pendapat.',
            'Mendapatkan perlindungan dan bantuan sosial sesuai ketentuan.',
            'Mengakses informasi keuangan paguyuban.',
            'Memilih dan dipilih sebagai pengurus.'
          ],
          status: 'info'
        },
        {
          number: 'Pasal 18',
          title: 'Kewajiban Anggota',
          content: [
            'Mematuhi AD/ART yang telah disahkan.',
            'Membayar iuran tepat waktu.',
            'Menjaga ketertiban, keamanan, dan kebersihan lingkungan.',
            'Menghormati hak dan kenyamanan tetangga.'
          ],
          status: 'warning'
        }
      ]
    },
    {
      id: 'bab7',
      category: 'sosial',
      title: 'BAB VII: MUSYAWARAH DAN RAPAT',
      icon: <MessageSquare size={24} />,
      color: 'from-blue-500 to-blue-600',
      articles: [
        {
          number: 'Pasal 19',
          title: 'Jenis Musyawarah',
          content: [
            'Musyawarah Tahunan: Dilaksanakan 2 x dalam 1 tahun untuk evaluasi dan penyusunan program kerja.',
            'Musyawarah Khusus: Dilaksanakan jika diperlukan untuk hal-hal mendesak.',
            'Rapat Pengurus: Dilaksanakan secara rutin minimal satu (1) bulan sekali, dengan waktu pelaksanaan setelah tanggal 15 setiap bulannya.',
            'Konsultasi Warga: Dilaksanakan berkala setiap 3 bulan sekali sebagai sarana komunikasi dan penyerapan aspirasi warga.'
          ],
          important: true
        },
        {
          number: 'Pasal 20',
          title: 'Kuorum dan Pengambilan Keputusan',
          content: [
            'Kuorum musyawarah warga adalah 60% dari total kepala keluarga.',
            'Keputusan diambil dengan musyawarah untuk mufakat.',
            'Jika musyawarah tidak mencapai mufakat, dapat dilakukan voting dengan suara terbanyak.',
            'Hasil musyawarah dicatat dalam notulen dan disahkan oleh peserta.'
          ],
          status: 'info'
        }
      ]
    },
    {
      id: 'bab8',
      category: 'struktur',
      title: 'BAB VIII: STRUKTUR PENGURUS DAN TUGAS',
      icon: <Award size={24} />,
      color: 'from-orange-500 to-orange-600',
      articles: [
        {
          number: 'Info',
          title: 'Struktur Pengurus',
          content: [
            'Lihat struktur lengkap pada halaman Struktur Pengurus.'
          ],
          important: true
        },
        {
          number: 'Pasal 22',
          title: 'Masa Bakti Pengurus',
          content: [
            'Masa bakti pengurus Paguyuban Beryl sampai terbentuknya RT definitif.',
            'Pengurus dapat dipilih kembali maksimal untuk 2 (dua) periode berikutnya.',
            'Penggantian pengurus di luar musyawarah tahunan hanya dilakukan dalam kondisi khusus.'
          ],
          status: 'info'
        },
        {
          number: 'Pasal 23',
          title: 'Tugas dan Wewenang',
          content: [
            'Ketua: Memimpin paguyuban, mewakili ke luar, dan mengkoordinasi pengurus.',
            'Sekretaris: Menangani administrasi, korespondensi, dan dokumentasi.',
            'Bendahara: Mengelola keuangan dan membuat laporan keuangan.',
            'Sie. Keamanan: Menjaga keamanan lingkungan dan mengatur siskamling.',
            'Sie. Sosial: Menangani kegiatan sosial dan kemasyarakatan.',
            'Sie. Komunikasi: Menjalin komunikasi antar warga dan media informasi.'
          ],
          status: 'info'
        }
      ]
    },
    {
      id: 'bab9',
      category: 'sosial',
      title: 'BAB IX: SANKSI DAN PENYELESAIAN PERSELISIHAN',
      icon: <Gavel size={24} />,
      color: 'from-red-500 to-red-600',
      articles: [
        {
          number: 'Pasal 24',
          title: 'Jenis Sanksi',
          content: [
            'Teguran Lisan: Untuk pelanggaran ringan pertama kali.',
            'Teguran Tertulis: Untuk pelanggaran berulang atau sedang.',
            'Pembatasan Hak: Untuk pelanggaran berat yang merugikan warga lain.',
            'Dibawa ke Musyawarah Khusus: Untuk penyelesaian masalah kompleks.'
          ],
          important: true
        },
        {
          number: 'Pasal 25',
          title: 'Penyelesaian Perselisihan',
          content: [
            'Perselisihan antar warga diselesaikan secara kekeluargaan melalui pengurus.',
            'Jika tidak tercapai kesepakatan, dibawa ke musyawarah warga.',
            'Prinsip utama adalah musyawarah untuk mufakat dengan mengutamakan toleransi.'
          ],
          status: 'warning'
        }
      ]
    },
    {
      id: 'bab10',
      category: 'struktur',
      title: 'BAB X: PERUBAHAN AD/ART DAN PENUTUP',
      icon: <CheckCircle2 size={24} />,
      color: 'from-gray-500 to-gray-600',
      articles: [
        {
          number: 'Pasal 26',
          title: 'Perubahan AD/ART',
          content: [
            'Perubahan AD/ART hanya dapat dilakukan melalui musyawarah warga.',
            'Usulan perubahan harus disampaikan secara tertulis minimal 7 hari sebelum musyawarah.',
            'Persetujuan perubahan memerlukan kuorum 60% dan disetujui 2/3 yang hadir.'
          ],
          status: 'info'
        },
        {
          number: 'Pasal 27',
          title: 'Masa Berlaku dan Pembubaran',
          content: [
            'AD/ART ini berlaku sejak tanggal disahkan hingga terbentuknya RT definitif.',
            'Pembubaran paguyuban hanya dapat dilakukan melalui musyawarah warga dengan kuorum 75%.',
            'Jika paguyuban dibubarkan, aset dan dana yang tersisa akan diserahkan kepada RT yang terbentuk.'
          ],
          status: 'warning'
        },
        {
          number: 'Pasal 28',
          title: 'Penutup',
          content: [
            'Hal-hal yang belum diatur dalam AD/ART ini akan ditetapkan kemudian melalui musyawarah warga.',
            'AD/ART ini dibuat dalam rangka menjaga keharmonisan, ketertiban, dan kenyamanan bersama.'
          ],
          important: true
        }
      ]
    }
  ];

  const filteredContent = adArtContent.filter(section => {
    const matchesSearch = section.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         section.articles.some(article => 
                           article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           article.content.some(content => 
                             content.toLowerCase().includes(searchTerm.toLowerCase())
                           )
                         );
    const matchesCategory = selectedCategory === 'all' || section.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleSection = (sectionId: string) => {
    // Don't toggle if in PDF mode
    if (expandedSection === 'expand-all-for-pdf') return;
    console.log('Toggling section:', sectionId, 'Current expanded:', expandedSection);
    setExpandedSection(expandedSection === sectionId ? null : sectionId);
  };

  const getStatusColor = (status?: string) => {
    switch(status) {
      case 'warning': return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'alert': return 'text-red-600 bg-red-50 border-red-200';
      case 'info': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status?: string) => {
    switch(status) {
      case 'warning': return <AlertTriangle size={16} />;
      case 'alert': return <AlertCircle size={16} />;
      case 'info': return <Info size={16} />;
      default: return <CheckCircle2 size={16} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl text-white shadow-lg">
                <BookOpen size={32} />
              </div>
              <div>
                <h1 className="text-2xl md:text-4xl font-black tracking-tight mb-4 leading-tight text-center">
                  ANGGARAN DASAR &<br/>RUMAH TANGGA
                </h1>
              
                <p className="text-emerald-200 font-bold uppercase tracking-[0.2em] text-sm md:text-base mb-6 text-center">
                  PAGUYUBAN CLUSTER BERYL
                </p>
              
                <p className="text-emerald-300 font-medium text-sm text-center mb-8">
                  Disahkan: 3 Januari 2026
                </p>
              
                <p className="text-emerald-400 text-xs text-center mb-8">
                  Masa Transisi (Pra-RT) • Cluster Beryl Permata Mutiara Maja, Lebak - Banten
                </p>
              
                <p className="text-emerald-500 text-xs text-center font-medium">
                  Berlaku hingga terbentuk RT Definitif
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <a
                href="/structure"
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <Users size={16} />
                <span>Lihat Struktur</span>
                <ExternalLink size={14} />
              </a>
              <button 
                onClick={handleDownloadPDF}
                disabled={isDownloading}
                className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDownloading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Mendownload...</span>
                  </>
                ) : (
                  <>
                    <Download size={16} />
                    <span>Download PDF</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-4 shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total BAB</p>
                <p className="text-2xl font-bold text-gray-900">10</p>
              </div>
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText size={20} className="text-blue-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Pasal</p>
                <p className="text-2xl font-bold text-gray-900">15</p>
              </div>
              <div className="p-2 bg-emerald-100 rounded-lg">
                <Gavel size={20} className="text-emerald-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Iuran Bulanan</p>
                <p className="text-2xl font-bold text-gray-900">Rp 10K</p>
              </div>
              <div className="p-2 bg-amber-100 rounded-lg">
                <DollarSign size={20} className="text-amber-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Update Terakhir</p>
                <p className="text-2xl font-bold text-gray-900">2026</p>
              </div>
              <div className="p-2 bg-purple-100 rounded-lg">
                <Calendar size={20} className="text-purple-600" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Cari pasal, bab, atau kata kunci..."
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2 overflow-x-auto">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-200 whitespace-nowrap ${
                  selectedCategory === category.id
                    ? 'bg-emerald-600 text-white shadow-lg'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {category.icon}
                <span>{category.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div id="adart-content" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="space-y-6">
          {filteredContent.map((section) => (
            <div
              key={section.id}
              className="bg-white rounded-2xl shadow-sm border overflow-hidden hover:shadow-lg transition-all duration-300"
            >
              {/* Section Header */}
              <div
                onClick={() => toggleSection(section.id)}
                className={`bg-gradient-to-r ${section.color} p-6 cursor-pointer`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-white/20 rounded-xl text-white">
                      {section.icon}
                    </div>
                    <div className="text-white">
                      <h2 className="text-xl lg:text-2xl font-bold">{section.title}</h2>
                      <p className="text-white/80 text-sm">{section.articles.length} Pasal</p>
                    </div>
                  </div>
                  <div className="text-white">
                    {expandedSection === section.id ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
                  </div>
                </div>
              </div>

              {/* Section Content */}
              {(() => {
                const shouldShow = expandedSection === section.id || expandedSection === 'expand-all-for-pdf';
                console.log('Section:', section.id, 'Should show content:', shouldShow, 'Expanded:', expandedSection);
                return shouldShow;
              })() && (
                <div className="p-6 space-y-4">
                  {section.articles.map((article, index) => {
                    console.log('Rendering article:', article.number, article.title);
                    return (
                    <div
                      key={index}
                      className={`border rounded-xl p-4 ${
                        article.important 
                          ? 'border-emerald-200 bg-emerald-50' 
                          : 'border-gray-200 bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${
                            article.important 
                              ? 'bg-emerald-600 text-white' 
                              : 'bg-gray-600 text-white'
                          }`}>
                            {getStatusIcon(article.status)}
                          </div>
                          <div>
                            <h3 className="font-bold text-gray-900">{article.number}</h3>
                            <h4 className="text-lg font-semibold text-gray-800">{article.title}</h4>
                          </div>
                        </div>
                        {article.amount && (
                          <div className="text-right">
                            <p className="text-sm text-gray-500">Nominal</p>
                            <p className="text-xl font-bold text-emerald-600">{article.amount}</p>
                          </div>
                        )}
                      </div>
                      
                      <ul className="space-y-2">
                        {article.content.map((item, itemIndex) => (
                          <li key={itemIndex} className="flex items-start gap-2">
                            <div className={`w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0 ${
                              article.important ? 'bg-emerald-500' : 'bg-gray-400'
                            }`} />
                            <span className="text-gray-700">{item}</span>
                          </li>
                        ))}
                      </ul>

                      {article.status && (
                        <div className={`mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-lg text-sm font-medium ${getStatusColor(article.status)}`}>
                          {getStatusIcon(article.status)}
                          <span>
                            {article.status === 'warning' && 'Penting'}
                            {article.status === 'alert' && 'Kritikal'}
                            {article.status === 'info' && 'Informasi'}
                          </span>
                        </div>
                      )}
                    </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-gray-500 text-sm">
              Dokumen Resmi Paguyuban Cluster Beryl • Disahkan pada 3 Januari 2026 • Versi Digital 2.0
            </p>
            <p className="text-gray-400 text-xs mt-2">
              Berlaku hingga terbentuknya RT Definitif • Update Terakhir: Januari 2026
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

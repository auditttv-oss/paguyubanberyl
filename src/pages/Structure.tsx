import React from 'react';
import { 
  Shield, 
  User, 
  Users, 
  Phone, 
  Award,
  Briefcase,
  FileText,
  Wallet,
  ShieldCheck,
  HeartHandshake,
  MessageSquare,
  Crown,
  Star,
  Trophy,
  MapPin,
  Clock,
  ExternalLink,
  Leaf,
  BookOpen
} from 'lucide-react';

export const Structure: React.FC = () => {
  const leadership = [
    { 
      title: "Penasihat", 
      people: [
        { name: "Ko Peter", address: "", phone: "" },
        { name: "Pak Encep", address: "", phone: "" }
      ],
      icon: <Crown className="text-amber-600" size={24}/>,
      bgColor: "bg-gradient-to-br from-amber-50 to-amber-100",
      borderColor: "border-amber-200",
      textColor: "text-amber-800"
    },
    { 
      title: "Ketua", 
      people: [
        { name: "M. Wahyu Heriyanto", address: "C5/09", phone: "0896-7200-3771" }
      ],
      icon: <Award className="text-emerald-600" size={24}/>,
      bgColor: "bg-gradient-to-br from-emerald-50 to-emerald-100",
      borderColor: "border-emerald-200",
      textColor: "text-emerald-800"
    },
    { 
      title: "Wakil Ketua", 
      people: [
        { name: "Pak Adam", address: "C4/17", phone: "0896-7828-7281" }
      ],
      icon: <Briefcase className="text-blue-600" size={24}/>,
      bgColor: "bg-gradient-to-br from-blue-50 to-blue-100",
      borderColor: "border-blue-200",
      textColor: "text-blue-800"
    },
    { 
      title: "Sekretaris", 
      people: [
        { name: "Pak Candra", address: "A1/03", phone: "0823-1299-3730" }
      ],
      icon: <FileText className="text-purple-600" size={24}/>,
      bgColor: "bg-gradient-to-br from-purple-50 to-purple-100",
      borderColor: "border-purple-200",
      textColor: "text-purple-800"
    },
    { 
      title: "Bendahara", 
      people: [
        { name: "Pak Ryan", address: "A4/11", phone: "0812-9293-5807" },
        { name: "Ibu Yanto", address: "C2/07", phone: "082310089897" }
      ],
      icon: <Wallet className="text-green-600" size={24}/>,
      bgColor: "bg-gradient-to-br from-green-50 to-green-100",
      borderColor: "border-green-200",
      textColor: "text-green-800"
    },
  ];

  const sections = [
    { 
      title: "Sie. Keamanan", 
      icon: <ShieldCheck className="text-red-600" size={24}/>,
      bgColor: "bg-gradient-to-br from-red-50 to-red-100",
      borderColor: "border-red-200",
      description: "Bertugas menjaga keamanan lingkungan dan mengatur siskamling",
      members: [
        { name: "Pk Kris", address: "C4/18", phone: "085217362940" },
        { name: "Pk Samsul", address: "C4/09", phone: "085321449877" },
        { name: "Pk Dimas", address: "C3/05", phone: "087885736770" },
        { name: "Pk Markina", address: "C5/07", phone: "085883835299" }
      ]
    },
    { 
      title: "Sie. Sosial", 
      icon: <HeartHandshake className="text-teal-600" size={24}/>,
      bgColor: "bg-gradient-to-br from-teal-50 to-teal-100",
      borderColor: "border-teal-200",
      description: "Menangani kegiatan sosial dan kemasyarakatan",
      members: [
        { name: "Pk Angga", address: "C5/02", phone: "082122826030" },
        { name: "Pk Aan", address: "B6/24", phone: "085643774807" },
        { name: "Pk Usman", address: "C5/08", phone: "085883180500" },
        { name: "Pk Dedi", address: "D3/35", phone: "0881010328853" }
      ]
    },
    { 
      title: "Sie. Komunikasi & LH", 
      fullTitle: "Sie. Komunikasi dan Lingkungan Hidup",
      icon: <Leaf className="text-lime-600" size={24}/>,
      bgColor: "bg-gradient-to-br from-lime-50 to-lime-100",
      borderColor: "border-lime-200",
      description: "Menjalin komunikasi antar warga dan media informasi",
      members: [
        { name: "Pk Didin", address: "C5/17", phone: "08979167707" },
        { name: "Mama Ken", address: "D3/05", phone: "087775970479" },
        { name: "Pk Surya", address: "C2/08", phone: "087884583725" },
        { name: "PK DE LAS", address: "C2/04", phone: "085290610922" }
      ]
    },
  ];

  const quickStats = [
    { label: "Total Pengurus", value: "17", color: "text-emerald-600", icon: <Users className="text-emerald-500" size={18}/> },
    { label: "Masa Bakti", value: "Transisi", color: "text-blue-600", icon: <Clock className="text-blue-500" size={18}/> },
    { label: "Tim Bidang", value: "3", color: "text-purple-600", icon: <Briefcase className="text-purple-500" size={18}/> },
    { label: "Kontak Darurat", value: "4", color: "text-red-600", icon: <Phone className="text-red-500" size={18}/> },
  ];

  // Helper to format phone number for WhatsApp
  const getWaLink = (phone: string) => {
    const cleanNumber = phone.replace(/[^0-9]/g, '');
    if (cleanNumber.startsWith('0')) {
      return `https://wa.me/62${cleanNumber.slice(1)}`;
    }
    return `https://wa.me/${cleanNumber}`;
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8 md:space-y-12 pb-12 px-2 md:px-0">
      
      {/* Header */}
      <div className="text-center space-y-4 pt-4">
        <div className="inline-flex items-center justify-center gap-3 mb-2 animate-fade-in-down">
          <div className="bg-gradient-to-br from-emerald-100 to-teal-50 p-3 rounded-2xl shadow-sm">
            <Trophy className="text-emerald-600" size={32}/>
          </div>
        </div>
        <h2 className="text-3xl md:text-5xl font-black text-gray-800 tracking-tight">
          Struktur Pengurus
        </h2>
        <p className="text-gray-500 text-lg md:text-xl font-medium">Paguyuban Cluster Beryl - Periode Transisi</p>
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-full text-sm font-medium border border-emerald-100">
          <MapPin size={16}/>
          <span>Berlaku hingga terbentuknya RT definitif</span>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
        {quickStats.map((stat, i) => (
          <div key={i} className="bg-white p-4 md:p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">{stat.label}</p>
                <p className={`text-2xl md:text-3xl font-black ${stat.color}`}>{stat.value}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center">
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Leadership Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6">
        {leadership.map((leader, i) => (
          <div 
            key={i} 
            className={`${leader.bgColor} rounded-3xl border ${leader.borderColor} shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group`}
          >
            {/* Decoration */}
            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white opacity-20 rounded-full blur-xl group-hover:scale-150 transition-transform"></div>

            <div className="p-5 md:p-6 flex flex-col h-full">
              <div className="flex items-center gap-3 mb-4">
                <div className={`p-3 rounded-2xl bg-white shadow-sm text-gray-700 border border-gray-100`}>
                  {leader.icon}
                </div>
                <h3 className={`text-sm font-black uppercase tracking-wider ${leader.textColor}`}>
                  {leader.title}
                </h3>
              </div>
              
              <div className="space-y-4 flex-grow">
                {leader.people.map((person, idx) => (
                  <div key={idx} className="bg-white/60 backdrop-blur-sm rounded-xl p-3 border border-white/50">
                    <p className="font-bold text-gray-800 text-base">{person.name}</p>
                    
                    <div className="mt-2 space-y-1.5">
                      {person.address && (
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                          <HomeIcon size={12} className="text-gray-400"/>
                          <span className="font-medium bg-white/50 px-1.5 py-0.5 rounded text-gray-600 border border-gray-200">
                            {person.address}
                          </span>
                        </div>
                      )}
                      
                      {person.phone && (
                        <a 
                          href={getWaLink(person.phone)} 
                          target="_blank" 
                          rel="noreferrer"
                          className="flex items-center gap-2 text-xs text-gray-500 hover:text-green-600 transition-colors group/link"
                        >
                          <Phone size={12} className="text-gray-400 group-hover/link:text-green-500"/>
                          <span>{person.phone}</span>
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Sections / Tim Bidang */}
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-gray-900 text-white shadow-lg">
              <Users size={24}/>
            </div>
            <div>
              <h3 className="text-2xl font-black text-gray-800">Tim Bidang Khusus</h3>
              <p className="text-gray-500 text-sm font-medium">Koordinator kegiatan lingkungan</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200">
            <Clock size={14}/>
            <span>Aktif & Responsif</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {sections.map((section, i) => (
            <div 
              key={i} 
              className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col"
            >
              {/* Card Header */}
              <div className={`p-6 ${section.bgColor} border-b ${section.borderColor}`}>
                <div className="flex justify-between items-start mb-2">
                  <div className="p-3 rounded-2xl bg-white shadow-sm border border-white/50">
                    {section.icon}
                  </div>
                  <span className="text-xs font-bold bg-white/60 px-2 py-1 rounded-lg text-gray-600 border border-white/40">
                    {section.members.length} Anggota
                  </span>
                </div>
                <h4 className="font-bold text-gray-800 text-lg md:text-xl leading-tight mb-1">
                  {section.fullTitle || section.title}
                </h4>
                <p className="text-xs md:text-sm text-gray-600 opacity-90 line-clamp-2">
                  {section.description}
                </p>
              </div>

              {/* Members List */}
              <div className="p-4 flex-grow bg-gray-50/50">
                <div className="grid gap-3">
                  {section.members.map((member, idx) => (
                    <div 
                      key={idx} 
                      className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-100 shadow-sm hover:border-blue-200 hover:shadow-md transition-all group/member"
                    >
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-gray-500 font-bold text-sm shrink-0 border border-white shadow-inner">
                        {member.name.charAt(0)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <p className="font-bold text-gray-800 text-sm truncate">{member.name}</p>
                          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100 shrink-0">
                            AKTIF
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-3 mt-1">
                           <div className="flex items-center gap-1 text-xs text-gray-500">
                              <HomeIcon size={10} className="text-gray-400"/>
                              <span className="bg-gray-100 px-1 rounded text-[10px] font-medium">{member.address}</span>
                           </div>
                        </div>
                      </div>

                      <a 
                        href={getWaLink(member.phone)}
                        target="_blank"
                        rel="noreferrer" 
                        className="w-8 h-8 rounded-lg bg-green-50 text-green-600 flex items-center justify-center hover:bg-green-500 hover:text-white transition-colors"
                        title="Chat WhatsApp"
                      >
                        <MessageSquare size={16} />
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Info & Duties */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-3xl p-6 md:p-10 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500 opacity-10 rounded-full blur-3xl -mr-16 -mt-16"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500 opacity-10 rounded-full blur-3xl -ml-16 -mb-16"></div>

        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10">
              <FileText className="text-emerald-300" size={28}/>
            </div>
            <div className="flex-1">
              <h3 className="text-xl md:text-2xl font-bold">Tugas & Wewenang</h3>
              <p className="text-slate-400 text-sm">Berdasarkan BAB VIII AD/ART Paguyuban</p>
            </div>
            <a
              href="/ad-art"
              className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
            >
              <BookOpen size={16} />
              <span>Lihat AD/ART Lengkap</span>
              <ExternalLink size={14} />
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <DutyCard 
              title="Ketua" 
              desc="Memimpin paguyuban, mewakili ke luar, dan mengkoordinasi pengurus."
              color="border-emerald-500/30"
            />
            <DutyCard 
              title="Sekretaris & Bendahara" 
              desc="Menangani administrasi, korespondensi, dan pengelolaan keuangan."
              color="border-purple-500/30"
            />
            <DutyCard 
              title="Tim Bidang" 
              desc="Bertanggung jawab penuh pada bidang keamanan, sosial, dan komunikasi."
              color="border-blue-500/30"
            />
          </div>

          <div className="mt-8 pt-6 border-t border-white/10 text-center md:text-left text-slate-400 text-sm leading-relaxed">
            <span className="text-emerald-400 font-bold">Catatan:</span> Pengurus dapat dipilih kembali maksimal untuk 2 (dua) periode berikutnya. Masa bakti saat ini berlaku hingga terbentuknya RT definitif.
          </div>
        </div>
      </div>

      {/* Emergency Contacts Footer */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-200 shadow-lg text-center">
        <h4 className="text-xl font-black text-gray-800 mb-6 flex items-center justify-center gap-2">
          <Shield className="text-red-500" />
          Kontak Penting & Darurat
        </h4>
        
        <div className="flex flex-wrap justify-center gap-4 md:gap-6">
          <ContactPill 
            label="Ketua" 
            value="0896-7200-3771" 
            color="emerald"
            icon={<User size={16}/>}
          />
          <ContactPill 
            label="Bendahara" 
            value="0812-9293-5807" 
            color="blue"
            icon={<Wallet size={16}/>}
          />
          <a 
            href="https://chat.whatsapp.com/ENw6WsFpL3vLQYQUtcEJu5"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-3 bg-red-50 hover:bg-red-100 pl-4 pr-5 py-3 rounded-2xl border border-red-100 transition-all group"
          >
            <div className="bg-white p-2 rounded-xl text-red-500 shadow-sm">
              <ShieldCheck size={18}/>
            </div>
            <div className="text-left">
              <p className="text-xs font-bold text-red-400 uppercase tracking-wider">Keamanan</p>
              <p className="text-sm font-bold text-red-700 flex items-center gap-1">
                Grup WhatsApp <ExternalLink size={12}/>
              </p>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
};

// --- Sub Components for cleaner code ---

const HomeIcon = ({ size, className }: { size: number, className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
    <polyline points="9 22 9 12 15 12 15 22"></polyline>
  </svg>
);

const DutyCard = ({ title, desc, color }: { title: string, desc: string, color: string }) => (
  <div className={`p-5 rounded-2xl bg-white/5 border ${color} hover:bg-white/10 transition-colors`}>
    <h5 className="font-bold text-white mb-2 text-lg">{title}</h5>
    <p className="text-slate-300 text-sm leading-relaxed">{desc}</p>
  </div>
);

const ContactPill = ({ label, value, color, icon }: { label: string, value: string, color: string, icon: React.ReactNode }) => {
  const getWaLink = (phone: string) => {
    const cleanNumber = phone.replace(/[^0-9]/g, '');
    return `https://wa.me/${cleanNumber.startsWith('0') ? '62'+cleanNumber.slice(1) : cleanNumber}`;
  };

  const colorClasses: Record<string, string> = {
    emerald: "bg-emerald-50 hover:bg-emerald-100 border-emerald-100 text-emerald-600 text-emerald-800 text-emerald-400",
    blue: "bg-blue-50 hover:bg-blue-100 border-blue-100 text-blue-600 text-blue-800 text-blue-400",
    red: "bg-red-50 hover:bg-red-100 border-red-100 text-red-600 text-red-800 text-red-400",
  };
  
  // Extract classes based on color key
  const [bg, border, iconColor, textColor, labelColor] = colorClasses[color].split(" ");

  return (
    <a 
      href={getWaLink(value)}
      target="_blank"
      rel="noreferrer"
      className={`flex items-center gap-3 ${bg} ${border} pl-4 pr-5 py-3 rounded-2xl border transition-all group`}
    >
      <div className={`bg-white p-2 rounded-xl ${iconColor} shadow-sm`}>
        {icon}
      </div>
      <div className="text-left">
        <p className={`text-xs font-bold ${labelColor} uppercase tracking-wider`}>{label}</p>
        <p className={`text-sm font-bold ${textColor}`}>{value}</p>
      </div>
    </a>
  );
};
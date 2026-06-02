import React, { useState, useEffect } from 'react';
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
  MapPin,
  Clock,
  ExternalLink,
  Leaf,
  Plus,
  X,
  Edit2,
  Trash2,
  Save,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface Person {
  name: string;
  address: string;
  phone: string;
}

interface PositionGroup {
  id: string;
  title: string;
  people: Person[];
  bgColor: string;
  borderColor: string;
  textColor: string;
}

interface Division {
  id: string;
  title: string;
  description: string;
  members: Person[];
  bgColor: string;
  borderColor: string;
}

const DEFAULT_LEADERSHIP: PositionGroup[] = [
  { 
    id: "penasihat",
    title: "Penasihat", 
    people: [
      { name: "Ko Peter", address: "C5/01", phone: "081234567890" },
      { name: "Pak Encep", address: "C5/02", phone: "081298765432" }
    ],
    bgColor: "bg-gradient-to-br from-amber-50 to-amber-100",
    borderColor: "border-amber-200",
    textColor: "text-amber-800"
  },
  { 
    id: "ketua",
    title: "Ketua", 
    people: [
      { name: "M. Wahyu Heriyanto", address: "C5/09", phone: "089672003771" }
    ],
    bgColor: "bg-gradient-to-br from-emerald-50 to-emerald-100",
    borderColor: "border-emerald-200",
    textColor: "text-emerald-800"
  },
  { 
    id: "wakil_ketua",
    title: "Wakil Ketua", 
    people: [
      { name: "Pak Adam", address: "C4/17", phone: "089678287281" }
    ],
    bgColor: "bg-gradient-to-br from-blue-50 to-blue-100",
    borderColor: "border-blue-200",
    textColor: "text-blue-800"
  },
  { 
    id: "sekretaris",
    title: "Sekretaris", 
    people: [
      { name: "Pak Candra", address: "A1/03", phone: "082312993730" }
    ],
    bgColor: "bg-gradient-to-br from-purple-50 to-purple-100",
    borderColor: "border-purple-200",
    textColor: "text-purple-800"
  },
  { 
    id: "bendahara",
    title: "Bendahara", 
    people: [
      { name: "Pak Ryan", address: "A4/11", phone: "081292935807" },
      { name: "Ibu Yanto", address: "C2/07", phone: "082310089897" }
    ],
    bgColor: "bg-gradient-to-br from-green-50 to-green-100",
    borderColor: "border-green-200",
    textColor: "text-green-800"
  }
];

const DEFAULT_DIVISIONS: Division[] = [
  { 
    id: "keamanan",
    title: "Sie. Keamanan", 
    description: "Bertugas menjaga keamanan lingkungan dan mengatur siskamling",
    bgColor: "bg-gradient-to-br from-red-50 to-red-100",
    borderColor: "border-red-200",
    members: [
      { name: "Pk Kris", address: "C4/18", phone: "085217362940" },
      { name: "Pk Samsul", address: "C4/09", phone: "085321449877" },
      { name: "Pk Dimas", address: "C3/05", phone: "087885736770" },
      { name: "Pk Markina", address: "C5/07", phone: "085883835299" }
    ]
  },
  { 
    id: "sosial",
    title: "Sie. Sosial", 
    description: "Menangani kegiatan sosial, gotong royong, dan kemasyarakatan",
    bgColor: "bg-gradient-to-br from-teal-50 to-teal-100",
    borderColor: "border-teal-200",
    members: [
      { name: "Pk Angga", address: "C5/02", phone: "082122826030" },
      { name: "Pk Aan", address: "B6/24", phone: "085643774807" },
      { name: "Pk Usman", address: "C5/08", phone: "085883180500" },
      { name: "Pk Dedi", address: "D3/35", phone: "0881010328853" }
    ]
  },
  { 
    id: "komunikasi_lh",
    title: "Sie. Komunikasi & LH", 
    description: "Menjalin hubungan antar-warga dan mengelola kebersihan lingkungan hidup",
    bgColor: "bg-gradient-to-br from-lime-50 to-lime-100",
    borderColor: "border-lime-200",
    members: [
      { name: "Pk Didin", address: "C5/17", phone: "08979167707" },
      { name: "Mama Ken", address: "D3/05", phone: "087775970479" },
      { name: "Pk Surya", address: "C2/08", phone: "087884583725" },
      { name: "PK DE LAS", address: "C2/04", phone: "085290610922" }
    ]
  }
];

export const Structure: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = !!user;

  // State
  const [leadership, setLeadership] = useState<PositionGroup[]>(() => {
    const local = localStorage.getItem('beryl_leadership_struct');
    return local ? JSON.parse(local) : DEFAULT_LEADERSHIP;
  });

  const [divisions, setDivisions] = useState<Division[]>(() => {
    const local = localStorage.getItem('beryl_divisions_struct');
    return local ? JSON.parse(local) : DEFAULT_DIVISIONS;
  });

  // Editor states
  const [editingGroup, setEditingGroup] = useState<PositionGroup | null>(null);
  const [editingDivision, setEditingDivision] = useState<Division | null>(null);
  const [isAddingGroup, setIsAddingGroup] = useState(false);
  const [isAddingDivision, setIsAddingDivision] = useState(false);

  // Form states
  const [groupForm, setGroupForm] = useState({ title: '', people: [] as Person[] });
  const [divisionForm, setDivisionForm] = useState({ title: '', description: '', members: [] as Person[] });
  const [newPerson, setNewPerson] = useState({ name: '', address: '', phone: '' });

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('beryl_leadership_struct', JSON.stringify(leadership));
  }, [leadership]);

  useEffect(() => {
    localStorage.setItem('beryl_divisions_struct', JSON.stringify(divisions));
  }, [divisions]);

  const handleResetToDefault = () => {
    if (window.confirm("Apakah Anda yakin ingin mengembalikan struktur organisasi ke setelan awal? Semua perubahan kustom Anda akan hilang.")) {
      setLeadership(DEFAULT_LEADERSHIP);
      setDivisions(DEFAULT_DIVISIONS);
    }
  };

  const saveGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupForm.title.trim()) return;

    if (editingGroup) {
      setLeadership(prev => prev.map(g => g.id === editingGroup.id ? { ...g, title: groupForm.title, people: groupForm.people } : g));
      setEditingGroup(null);
    } else {
      const newGroup: PositionGroup = {
        id: `group_${Date.now()}`,
        title: groupForm.title,
        people: groupForm.people,
        bgColor: "bg-gradient-to-br from-indigo-50 to-indigo-100",
        borderColor: "border-indigo-200",
        textColor: "text-indigo-800"
      };
      setLeadership(prev => [...prev, newGroup]);
      setIsAddingGroup(false);
    }
    setGroupForm({ title: '', people: [] });
    setNewPerson({ name: '', address: '', phone: '' });
  };

  const deleteGroup = (id: string) => {
    if (window.confirm("Hapus kelompok jabatan ini beserta seluruh anggotanya?")) {
      setLeadership(prev => prev.filter(g => g.id !== id));
    }
  };

  const saveDivision = (e: React.FormEvent) => {
    e.preventDefault();
    if (!divisionForm.title.trim()) return;

    if (editingDivision) {
      setDivisions(prev => prev.map(d => d.id === editingDivision.id ? { ...d, title: divisionForm.title, description: divisionForm.description, members: divisionForm.members } : d));
      setEditingDivision(null);
    } else {
      const newDiv: Division = {
        id: `div_${Date.now()}`,
        title: divisionForm.title,
        description: divisionForm.description,
        bgColor: "bg-gradient-to-br from-gray-50 to-gray-100",
        borderColor: "border-gray-200",
        members: divisionForm.members
      };
      setDivisions(prev => [...prev, newDiv]);
      setIsAddingDivision(false);
    }
    setDivisionForm({ title: '', description: '', members: [] });
    setNewPerson({ name: '', address: '', phone: '' });
  };

  const deleteDivision = (id: string) => {
    if (window.confirm("Hapus seksi bidang ini beserta seluruh anggotanya?")) {
      setDivisions(prev => prev.filter(d => d.id !== id));
    }
  };

  const addPersonToForm = () => {
    if (!newPerson.name.trim()) return alert("Nama personil wajib diisi!");
    
    if (editingGroup || isAddingGroup) {
      setGroupForm(prev => ({ ...prev, people: [...prev.people, { ...newPerson }] }));
    } else {
      setDivisionForm(prev => ({ ...prev, members: [...prev.members, { ...newPerson }] }));
    }
    setNewPerson({ name: '', address: '', phone: '' });
  };

  const removePersonFromForm = (idx: number) => {
    if (editingGroup || isAddingGroup) {
      setGroupForm(prev => ({ ...prev, people: prev.people.filter((_, i) => i !== idx) }));
    } else {
      setDivisionForm(prev => ({ ...prev, members: prev.members.filter((_, i) => i !== idx) }));
    }
  };

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
        <div className="inline-flex items-center justify-center gap-3 mb-2">
          <div className="bg-gradient-to-br from-emerald-100 to-teal-50 p-3 rounded-2xl shadow-sm">
            <Users className="text-emerald-600" size={32}/>
          </div>
        </div>
        <h2 className="text-3xl md:text-5xl font-black text-gray-800 tracking-tight">
          Struktur Pengurus
        </h2>
        <p className="text-gray-500 text-lg md:text-xl font-medium">Paguyuban Cluster Beryl - Periode Transisi</p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-full text-sm font-medium border border-emerald-100">
            <MapPin size={16}/>
            <span>Berlaku hingga terbentuknya RT definitif</span>
          </div>
          
          {isAdmin && (
            <div className="flex gap-2">
              <button 
                onClick={() => {
                  setGroupForm({ title: '', people: [] });
                  setIsAddingGroup(true);
                }} 
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg flex items-center gap-1.5"
              >
                <Plus size={14}/> Tambah Jabatan
              </button>
              <button 
                onClick={() => {
                  setDivisionForm({ title: '', description: '', members: [] });
                  setIsAddingDivision(true);
                }} 
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg flex items-center gap-1.5"
              >
                <Plus size={14}/> Tambah Seksi
              </button>
              <button 
                onClick={handleResetToDefault} 
                className="px-3 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs font-bold rounded-lg flex items-center gap-1.5"
                title="Reset to Default"
              >
                <RefreshCw size={14}/> Reset
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Editor Modal for Leadership Position Group */}
      {(isAddingGroup || editingGroup) && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">
                {editingGroup ? 'Edit Kelompok Jabatan' : 'Tambah Kelompok Jabatan'}
              </h3>
              <button onClick={() => { setIsAddingGroup(false); setEditingGroup(null); }} className="p-2 hover:bg-gray-100 rounded-full"><X size={20}/></button>
            </div>

            <form onSubmit={saveGroup} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Nama Kelompok / Jabatan *</label>
                <input 
                  type="text" 
                  required
                  placeholder="Contoh: Ketua, Wakil Ketua, Humas, Penasihat" 
                  className="w-full border rounded-xl p-3 focus:ring-2 focus:ring-emerald-500 outline-none"
                  value={groupForm.title}
                  onChange={e => setGroupForm({ ...groupForm, title: e.target.value })}
                />
              </div>

              {/* Sub-form to add person inside this group */}
              <div className="border p-4 rounded-2xl bg-gray-50/50 space-y-3">
                <p className="text-xs font-bold text-gray-400 uppercase">Input Personil</p>
                <div className="grid grid-cols-2 gap-2">
                  <input 
                    type="text" 
                    placeholder="Nama Lengkap" 
                    className="border rounded-lg p-2 text-sm bg-white"
                    value={newPerson.name}
                    onChange={e => setNewPerson({ ...newPerson, name: e.target.value })}
                  />
                  <input 
                    type="text" 
                    placeholder="Blok Rumah (Contoh: A4/11)" 
                    className="border rounded-lg p-2 text-sm bg-white"
                    value={newPerson.address}
                    onChange={e => setNewPerson({ ...newPerson, address: e.target.value })}
                  />
                </div>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="Nomor WA (Contoh: 081292935807)" 
                    className="flex-1 border rounded-lg p-2 text-sm bg-white"
                    value={newPerson.phone}
                    onChange={e => setNewPerson({ ...newPerson, phone: e.target.value })}
                  />
                  <button 
                    type="button" 
                    onClick={addPersonToForm}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-bold text-xs hover:bg-emerald-700"
                  >
                    Tambah
                  </button>
                </div>
              </div>

              {/* Person list within this form */}
              <div className="space-y-2">
                <p className="text-xs font-bold text-gray-500">Daftar Personil Terpilih:</p>
                {groupForm.people.length === 0 ? (
                  <p className="text-xs text-gray-400 italic">Belum ada personil dimasukkan</p>
                ) : (
                  <div className="divide-y border rounded-xl overflow-hidden bg-white">
                    {groupForm.people.map((p, idx) => (
                      <div key={idx} className="p-3 flex items-center justify-between text-xs hover:bg-gray-50">
                        <div>
                          <p className="font-bold text-gray-800">{p.name}</p>
                          <p className="text-gray-500">{p.address} • {p.phone}</p>
                        </div>
                        <button type="button" onClick={() => removePersonFromForm(idx)} className="text-red-500 p-1 hover:bg-red-50 rounded-lg"><Trash2 size={14}/></button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button 
                type="submit" 
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2"
              >
                <Save size={18}/> Simpan Struktur Jabatan
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Editor Modal for Division (Seksi) */}
      {(isAddingDivision || editingDivision) && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">
                {editingDivision ? 'Edit Seksi Bidang' : 'Tambah Seksi Bidang'}
              </h3>
              <button onClick={() => { setIsAddingDivision(false); setEditingDivision(null); }} className="p-2 hover:bg-gray-100 rounded-full"><X size={20}/></button>
            </div>

            <form onSubmit={saveDivision} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Nama Seksi / Divisi *</label>
                <input 
                  type="text" 
                  required
                  placeholder="Contoh: Sie. Keamanan, Sie. Sosial, Humas" 
                  className="w-full border rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none"
                  value={divisionForm.title}
                  onChange={e => setDivisionForm({ ...divisionForm, title: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Deskripsi Kerja</label>
                <textarea 
                  rows={2}
                  placeholder="Deskripsi tugas dan tanggung jawab seksi bidang..." 
                  className="w-full border rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                  value={divisionForm.description}
                  onChange={e => setDivisionForm({ ...divisionForm, description: e.target.value })}
                />
              </div>

              {/* Sub-form to add person inside this division */}
              <div className="border p-4 rounded-2xl bg-gray-50/50 space-y-3">
                <p className="text-xs font-bold text-gray-400 uppercase">Input Anggota Seksi</p>
                <div className="grid grid-cols-2 gap-2">
                  <input 
                    type="text" 
                    placeholder="Nama Lengkap" 
                    className="border rounded-lg p-2 text-sm bg-white"
                    value={newPerson.name}
                    onChange={e => setNewPerson({ ...newPerson, name: e.target.value })}
                  />
                  <input 
                    type="text" 
                    placeholder="Blok Rumah (Contoh: C4/09)" 
                    className="border rounded-lg p-2 text-sm bg-white"
                    value={newPerson.address}
                    onChange={e => setNewPerson({ ...newPerson, address: e.target.value })}
                  />
                </div>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="Nomor WA (Contoh: 085217362940)" 
                    className="flex-1 border rounded-lg p-2 text-sm bg-white"
                    value={newPerson.phone}
                    onChange={e => setNewPerson({ ...newPerson, phone: e.target.value })}
                  />
                  <button 
                    type="button" 
                    onClick={addPersonToForm}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg font-bold text-xs hover:bg-blue-700"
                  >
                    Tambah
                  </button>
                </div>
              </div>

              {/* Person list within this division form */}
              <div className="space-y-2">
                <p className="text-xs font-bold text-gray-500">Daftar Anggota Terpilih:</p>
                {divisionForm.members.length === 0 ? (
                  <p className="text-xs text-gray-400 italic">Belum ada personil dimasukkan</p>
                ) : (
                  <div className="divide-y border rounded-xl overflow-hidden bg-white">
                    {divisionForm.members.map((p, idx) => (
                      <div key={idx} className="p-3 flex items-center justify-between text-xs hover:bg-gray-50">
                        <div>
                          <p className="font-bold text-gray-800">{p.name}</p>
                          <p className="text-gray-500">{p.address} • {p.phone}</p>
                        </div>
                        <button type="button" onClick={() => removePersonFromForm(idx)} className="text-red-500 p-1 hover:bg-red-50 rounded-lg"><Trash2 size={14}/></button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button 
                type="submit" 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2"
              >
                <Save size={18}/> Simpan Struktur Seksi
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Main Leadership Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6">
        {leadership.map((leader) => (
          <div 
            key={leader.id} 
            className={`${leader.bgColor} rounded-3xl border ${leader.borderColor} shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group`}
          >
            {/* Admin Controls */}
            {isAdmin && (
              <div className="absolute top-2 right-2 flex gap-1 bg-white/80 p-1 rounded-xl shadow-sm opacity-0 group-hover:opacity-100 transition-opacity z-10">
                <button 
                  onClick={() => {
                    setEditingGroup(leader);
                    setGroupForm({ title: leader.title, people: [...leader.people] });
                  }} 
                  className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"
                >
                  <Edit2 size={14}/>
                </button>
                <button onClick={() => deleteGroup(leader.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg">
                  <Trash2 size={14}/>
                </button>
              </div>
            )}

            <div className="p-5 flex flex-col h-full">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-white rounded-xl shadow-sm text-gray-700 border border-gray-100 flex items-center justify-center">
                  {leader.title.toLowerCase().includes('ketua') ? <Award className="text-emerald-600" size={18}/> : 
                   leader.title.toLowerCase().includes('bendahara') ? <Wallet className="text-green-600" size={18}/> : 
                   leader.title.toLowerCase().includes('sekretaris') ? <FileText className="text-purple-600" size={18}/> : 
                   <Crown className="text-amber-600" size={18}/>}
                </div>
                <h3 className={`text-sm font-black uppercase tracking-wider ${leader.textColor}`}>
                  {leader.title}
                </h3>
              </div>
              
              <div className="space-y-3 flex-grow">
                {leader.people.map((person, idx) => (
                  <div key={idx} className="bg-white/60 backdrop-blur-sm rounded-xl p-3 border border-white/50">
                    <p className="font-bold text-gray-800 text-sm">{person.name}</p>
                    
                    <div className="mt-2 space-y-1">
                      {person.address && (
                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                          <MapPin size={11} className="text-gray-400"/>
                          <span className="font-medium">{person.address}</span>
                        </div>
                      )}
                      
                      {person.phone && (
                        <a 
                          href={getWaLink(person.phone)} 
                          target="_blank" 
                          rel="noreferrer"
                          className="flex items-center gap-1.5 text-xs text-emerald-600 hover:text-emerald-700 font-bold"
                        >
                          <Phone size={11} className="text-emerald-500"/>
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
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-gray-900 text-white shadow-lg">
              <Users size={24}/>
            </div>
            <div>
              <h3 className="text-2xl font-black text-gray-800">Tim Bidang Khusus</h3>
              <p className="text-gray-500 text-sm font-medium">Koordinator kegiatan dan urusan teknis cluster</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200">
            <Clock size={14}/>
            <span>Aktif & Tanggap</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {divisions.map((section) => (
            <div 
              key={section.id} 
              className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col relative group"
            >
              {/* Admin Controls */}
              {isAdmin && (
                <div className="absolute top-2 right-2 flex gap-1 bg-white/80 p-1 rounded-xl shadow-sm opacity-0 group-hover:opacity-100 transition-opacity z-10">
                  <button 
                    onClick={() => {
                      setEditingDivision(section);
                      setDivisionForm({ title: section.title, description: section.description, members: [...section.members] });
                    }} 
                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"
                  >
                    <Edit2 size={14}/>
                  </button>
                  <button onClick={() => deleteDivision(section.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg">
                    <Trash2 size={14}/>
                  </button>
                </div>
              )}

              {/* Card Header */}
              <div className={`p-6 ${section.bgColor} border-b ${section.borderColor}`}>
                <div className="flex justify-between items-start mb-2">
                  <div className="p-3 rounded-2xl bg-white shadow-sm border border-white/50 flex items-center justify-center">
                    {section.title.toLowerCase().includes('keamanan') ? <ShieldCheck className="text-red-600" size={20}/> : 
                     section.title.toLowerCase().includes('sosial') ? <HeartHandshake className="text-teal-600" size={20}/> : 
                     <Leaf className="text-lime-600" size={20}/>}
                  </div>
                  <span className="text-[10px] font-bold bg-white/60 px-2 py-1 rounded-lg text-gray-600 border border-white/40">
                    {section.members.length} Personil
                  </span>
                </div>
                <h4 className="font-bold text-gray-800 text-lg md:text-xl leading-tight mb-1">
                  {section.title}
                </h4>
                <p className="text-xs md:text-sm text-gray-500 opacity-90">
                  {section.description}
                </p>
              </div>

              {/* Members List */}
              <div className="p-4 flex-grow bg-gray-50/50">
                <div className="grid gap-3">
                  {section.members.map((member, idx) => (
                    <div 
                      key={idx} 
                      className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-100 shadow-sm hover:border-emerald-200 hover:shadow-md transition-all group/member"
                    >
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-gray-500 font-black text-xs shrink-0 border border-white shadow-inner">
                        {member.name.charAt(0)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <p className="font-bold text-gray-800 text-xs truncate">{member.name}</p>
                          <span className="text-[8px] font-bold text-emerald-600 bg-emerald-50 px-1 py-0.5 rounded border border-emerald-100 shrink-0">
                            AKTIF
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-3 mt-1">
                           <div className="flex items-center gap-1 text-[10px] text-gray-500">
                              <MapPin size={10} className="text-gray-400"/>
                              <span className="bg-gray-100 px-1 rounded font-medium">{member.address}</span>
                           </div>
                        </div>
                      </div>

                      {member.phone && (
                        <a 
                          href={getWaLink(member.phone)}
                          target="_blank"
                          rel="noreferrer" 
                          className="w-8 h-8 rounded-lg bg-green-50 text-green-600 flex items-center justify-center hover:bg-green-500 hover:text-white transition-colors"
                          title="Hubungi WhatsApp"
                        >
                          <MessageSquare size={14} />
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
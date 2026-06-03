import React, { useState, useEffect } from 'react';
import { 
  X, 
  Save, 
  Home, 
  Shield, 
  Phone, 
  User, 
  CheckCircle2, 
  Gift, 
  Clipboard, 
  Briefcase, 
  Car, 
  Users, 
  Plus, 
  Trash2, 
  Loader2 
} from 'lucide-react';
import toast from 'react-hot-toast';
import { 
  createResident, 
  updateResident, 
  fetchAllPayments, 
  updateResidentPayment,
  serializeExtendedFields,
  deserializeExtendedFields
} from '../services/dataService';
import { OccupancyStatus, Resident, FamilyMember } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';

interface Props {
  resident: Resident | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const MONTHS = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

export const ResidentModal: React.FC<Props> = ({ resident, isOpen, onClose, onSuccess }) => {
  const { user, isBendahara } = useAuth();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  
  // Kepala Keluarga States
  const [fullName, setFullName] = useState('');
  const [blockNumber, setBlockNumber] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [occupancyStatus, setOccupancyStatus] = useState<OccupancyStatus>('Menetap');
  const [eventDuesAmount, setEventDuesAmount] = useState(0);

  // Extended fields states
  const [idRumah, setIdRumah] = useState('');
  const [jenisKelamin, setJenisKelamin] = useState('Laki-Laki');
  const [peranKeluarga, setPeranKeluarga] = useState('Kepala Keluarga');
  const [tempatTglLahir, setTempatTglLahir] = useState('');
  const [agama, setAgama] = useState('Islam');
  const [golonganDarah, setGolonganDarah] = useState('O');
  const [pekerjaan, setPekerjaan] = useState('');
  const [statusWarga, setStatusWarga] = useState('Tetap');
  const [tanggalBergabung, setTanggalBergabung] = useState('');

  // Rumah & Kendaraan states
  const [namaPemilikAsli, setNamaPemilikAsli] = useState('');
  const [noHpPemilikAsli, setNoHpPemilikAsli] = useState('');
  const [tglMulaiHuni, setTglMulaiHuni] = useState('');
  const [jenisKendaraan, setJenisKendaraan] = useState('Tidak Ada');
  const [platNomor, setPlatNomor] = useState('');
  const [keteranganWarnaMerk, setKeteranganWarnaMerk] = useState('');

  // DAFTAR KELUARGA SERUMAH LENGKAP (COMPREHENSIVE NESTED PROFILE)
  const [familyList, setFamilyList] = useState<any[]>([]);
  
  // Form input untuk anggota keluarga baru
  const [fName, setFName] = useState('');
  const [fRelation, setFRelation] = useState<'Istri' | 'Anak' | 'Mertua' | 'Ayah' | 'Ibu' | 'Lainnya'>('Istri');
  const [fPhone, setFPhone] = useState('');
  const [fGender, setFGender] = useState('Perempuan');
  const [fBirthPlace, setFBirthPlace] = useState('');
  const [fReligion, setFReligion] = useState('Islam');
  const [fBloodType, setFBloodType] = useState('O');
  const [fJob, setFJob] = useState('');

  const [rawNotesText, setRawNotesText] = useState('');
  const [paymentYear] = useState(new Date().getFullYear());
  const [selectedMonths, setSelectedMonths] = useState<number[]>([]);

  // ALGORITME KEAMANAN PEMBATASAN INPUT FINANSIAL: Hanya Bendahara/Admin terautentikasi yang diizinkan mengisi kas
  const canEditFinances = !!user && isBendahara;

  // Fetch all payments to populate month payments
  const { data: payments = [] } = useQuery({
    queryKey: ['allPayments'],
    queryFn: fetchAllPayments,
    enabled: isOpen && !!resident,
  });

  // Load and configure form
  useEffect(() => {
    if (isOpen) {
      if (resident) {
        setFullName(resident.fullName || '');
        setBlockNumber(resident.blockNumber || '');
        setWhatsapp(resident.whatsapp || '');
        setOccupancyStatus(resident.occupancyStatus || 'Menetap');
        setEventDuesAmount(resident.eventDuesAmount || 0);

        // Deserialisasi extended fields dari notes
        const { fields, rawNotes } = deserializeExtendedFields(resident.notes, !!user);
        setIdRumah(fields.id_rumah || resident.blockNumber || '');
        setJenisKelamin(fields.jenis_kelamin || 'Laki-Laki');
        setPeranKeluarga(fields.peran_keluarga || 'Kepala Keluarga');
        setTempatTglLahir(fields.tempat_tgl_lahir || '');
        setAgama(fields.agama || 'Islam');
        setGolonganDarah(fields.golongan_darah || 'O');
        setPekerjaan(fields.pekerjaan || '');
        setStatusWarga(fields.status_warga || 'Tetap');
        setTanggalBergabung(fields.tanggal_bergabung || '');

        setNamaPemilikAsli(fields.nama_pemilik_asli || '');
        setNoHpPemilikAsli(fields.no_hp_pemilik_asli || '');
        setTglMulaiHuni(fields.tgl_mulai_huni || '');
        setJenisKendaraan(fields.jenis_kendaraan || 'Tidak Ada');
        setPlatNomor(fields.plat_nomor || '');
        setKeteranganWarnaMerk(fields.keterangan_warna_merk || '');

        // Load list keluarga serumah terstruktur
        const castedFields = fields as any;
        setFamilyList(castedFields.family_members_list || []);

        setRawNotesText(rawNotes || '');

        // Preset payments
        const prePaid = payments
          .filter(p => p.resident_id === resident.id && p.year === paymentYear)
          .map(p => p.month);
        setSelectedMonths(prePaid);
      } else {
        // Reset states
        setFullName('');
        setBlockNumber('');
        setWhatsapp('');
        setOccupancyStatus('Menetap');
        setEventDuesAmount(0);

        setIdRumah('');
        setJenisKelamin('Laki-Laki');
        setPeranKeluarga('Kepala Keluarga');
        setTempatTglLahir('');
        setAgama('Islam');
        setGolonganDarah('O');
        setPekerjaan('');
        setStatusWarga('Tetap');
        setTanggalBergabung('');

        setNamaPemilikAsli('');
        setNoHpPemilikAsli('');
        setTglMulaiHuni('');
        setJenisKendaraan('Tidak Ada');
        setPlatNomor('');
        setKeteranganWarnaMerk('');
        setFamilyList([]);

        // Reset subform keluarga
        setFName('');
        setFRelation('Istri');
        setFPhone('');
        setFGender('Perempuan');
        setFBirthPlace('');
        setFReligion('Islam');
        setFBloodType('O');
        setFJob('');

        setRawNotesText('');
        setSelectedMonths([]);
      }
      setErrors({});
    }
  }, [resident, isOpen, payments, paymentYear, user]);

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    if (!fullName.trim()) newErrors.fullName = 'Nama wajib diisi';
    if (!blockNumber.trim()) newErrors.blockNumber = 'Blok rumah wajib diisi';
    if (!whatsapp.trim()) newErrors.whatsapp = 'Nomor WhatsApp wajib diisi';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleMonthToggle = (monthNum: number) => {
    if (!canEditFinances) return;
    setSelectedMonths(prev => 
      prev.includes(monthNum) 
        ? prev.filter(m => m !== monthNum) 
        : [...prev, monthNum]
    );
  };

  // FUNGSI TAMBAH ANGGOTA KELUARGA DENGAN DATA SUPER LENGKAP
  const addFamilyMember = () => {
    if (!fName.trim()) {
      toast.error('Nama lengkap anggota keluarga wajib diisi!');
      return;
    }

    const newMember = {
      name: fName.trim(),
      relation: fRelation,
      phone: fPhone.trim() || '-',
      gender: fGender,
      birth_place: fBirthPlace.trim() || '-',
      religion: fReligion,
      blood_type: fBloodType,
      job: fJob.trim() || '-'
    };

    setFamilyList(prev => [...prev, newMember]);
    
    // Reset form input keluarga
    setFName('');
    setFPhone('');
    setFBirthPlace('');
    setFJob('');
    toast.success(`${fName.trim()} berhasil didaftarkan.`);
  };

  const removeFamilyMember = (idx: number) => {
    setFamilyList(prev => prev.filter((_, i) => i !== idx));
  };

  // RESOLUSI BUG ENTER SUBMIT: Mematikan submit tak sengaja saat menekan tombol Enter
  const handleFamilyInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault(); 
      addFamilyMember(); 
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      const serializedNotes = serializeExtendedFields({
        id_rumah: idRumah || blockNumber,
        jenis_kelamin: jenisKelamin,
        peran_keluarga: peranKeluarga,
        tempat_tgl_lahir: tempatTglLahir,
        agama: agama,
        golongan_darah: golonganDarah,
        pekerjaan: pekerjaan,
        status_warga: statusWarga,
        tanggal_bergabung: tanggalBergabung,
        nama_pemilik_asli: namaPemilikAsli,
        no_hp_pemilik_asli: noHpPemilikAsli,
        tgl_mulai_huni: tglMulaiHuni,
        jenis_kendaraan: jenisKendaraan,
        plat_nomor: platNomor,
        keterangan_warna_merk: keteranganWarnaMerk,
        family_members_list: familyList 
      }, rawNotesText);

      const formattedData = {
        fullName: fullName.trim(),
        blockNumber: blockNumber.trim(),
        whatsapp: whatsapp.replace(/\D/g, '').replace(/^0+/, '62'),
        occupancyStatus: occupancyStatus,
        // SENSOR PENYIMPANAN FINANSIAL: Hanya simpan nominal jika pengguna memiliki wewenang bendahara
        eventDuesAmount: canEditFinances ? (Number(eventDuesAmount) || 0) : 0, 
        notes: serializedNotes
      };

      if (resident?.id) {
        await updateResident({ ...formattedData, id: resident.id });
      } else {
        await createResident(formattedData);
      }

      // Sync bulan iuran wajib (Hanya jika Bendahara/Admin berwewenang)
      if (resident?.id && canEditFinances) {
        for (let m = 1; m <= 12; m++) {
          const wasPaid = payments.some(p => p.resident_id === resident.id && p.month === m && p.year === paymentYear);
          const isSelected = selectedMonths.includes(m);
          
          if (wasPaid && !isSelected) {
            await updateResidentPayment(resident.id, false, m, paymentYear);
          } else if (!wasPaid && isSelected) {
            await updateResidentPayment(resident.id, true, m, paymentYear);
          }
        }
      }

      toast.success('✅ Seluruh data warga & keluarga berhasil disimpan!');
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      console.error(err);
      toast.error(`❌ Gagal: ${err.message || 'Error simpan data'}`);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 overflow-y-auto font-sans">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in duration-200">
        
        {/* HEADER */}
        <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 p-6 text-white shrink-0">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-xl">
                <User size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold">
                  {resident ? 'Edit Profil Warga' : 'Form Data Warga Baru'}
                </h3>
                <p className="text-emerald-100 text-xs">Pencatatan data kependudukan dan keluarga serumah</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition-colors">
              <X size={24} />
            </button>
          </div>
        </div>

        {/* FORM BODY */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto flex-1">
          
          {/* BAGIAN 1: TAB WARGA */}
          <div className="space-y-4">
            <h4 className="text-xs font-black uppercase text-emerald-800 tracking-wider flex items-center gap-1.5">
              <User size={14}/> I. Data Kependudukan Warga Utama
            </h4>
            
            <div className="space-y-2">
              <label className="block text-xs font-bold text-gray-700 uppercase">Nama Lengkap Kepala Keluarga *</label>
              <input
                type="text"
                required
                className="w-full px-4 py-2.5 rounded-xl border focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500 outline-none text-sm bg-white"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                placeholder="Nama Kepala Keluarga"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase">ID Rumah (Blok/No)</label>
                <input
                  type="text"
                  className="w-full px-4 py-2.5 rounded-xl border focus:ring-2 focus:ring-emerald-200 outline-none text-sm font-bold text-emerald-800 bg-white"
                  value={idRumah}
                  onChange={e => setIdRumah(e.target.value)}
                  placeholder="ID Rumah (C5/09)"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase">No. HP / WA Utama *</label>
                <input
                  type="tel"
                  required
                  className="w-full px-4 py-2.5 rounded-xl border focus:ring-2 focus:ring-emerald-200 outline-none text-sm bg-white"
                  value={whatsapp}
                  onChange={e => setWhatsapp(e.target.value)}
                  placeholder="081234567890"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase">Jenis Kelamin</label>
                <select
                  className="w-full px-4 py-2.5 rounded-xl border focus:ring-2 focus:ring-emerald-200 outline-none text-sm font-semibold bg-white"
                  value={jenisKelamin}
                  onChange={e => setJenisKelamin(e.target.value)}
                >
                  <option value="Laki-Laki">Laki-Laki</option>
                  <option value="Perempuan">Perempuan</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase">Peran Keluarga Utama</label>
                <select
                  className="w-full px-4 py-2.5 rounded-xl border focus:ring-2 focus:ring-emerald-200 outline-none text-sm font-semibold bg-white"
                  value={peranKeluarga}
                  onChange={e => setPeranKeluarga(e.target.value)}
                >
                  <option value="Kepala Keluarga">Kepala Keluarga</option>
                  <option value="Istri">Istri</option>
                  <option value="Anak">Anak</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase">Tempat, Tgl Lahir</label>
                <input
                  type="text"
                  className="w-full px-4 py-2.5 rounded-xl border focus:ring-2 focus:ring-emerald-200 outline-none text-sm bg-white"
                  value={tempatTglLahir}
                  onChange={e => setTempatTglLahir(e.target.value)}
                  placeholder="Jakarta, 12-05-1990"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase">Agama</label>
                <select
                  className="w-full px-4 py-2.5 rounded-xl border focus:ring-2 focus:ring-emerald-200 outline-none text-sm font-semibold bg-white"
                  value={agama}
                  onChange={e => setAgama(e.target.value)}
                >
                  <option value="Islam">Islam</option>
                  <option value="Kristen">Kristen</option>
                  <option value="Katolik">Katolik</option>
                  <option value="Hindu">Hindu</option>
                  <option value="Buddha">Buddha</option>
                  <option value="Konghucu">Konghucu</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase">Gol. Darah</label>
                <select
                  className="w-full px-4 py-2.5 rounded-xl border focus:ring-2 focus:ring-emerald-200 outline-none text-sm font-semibold bg-white"
                  value={golonganDarah}
                  onChange={e => setGolonganDarah(e.target.value)}
                >
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="AB">AB</option>
                  <option value="O">O</option>
                  <option value="Tidak Tahu">Tidak Tahu</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase">Pekerjaan</label>
                <input
                  type="text"
                  className="w-full px-4 py-2.5 rounded-xl border focus:ring-2 focus:ring-emerald-200 outline-none text-sm bg-white"
                  value={pekerjaan}
                  onChange={e => setPekerjaan(e.target.value)}
                  placeholder="Karyawan Swasta / PNS / dll."
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase">Status Warga</label>
                <select
                  className="w-full px-4 py-2.5 rounded-xl border focus:ring-2 focus:ring-emerald-200 outline-none text-sm font-semibold bg-white"
                  value={statusWarga}
                  onChange={e => setStatusWarga(e.target.value)}
                >
                  <option value="Tetap">Tetap</option>
                  <option value="Kontrak">Kontrak</option>
                  <option value="Sementara">Sementara</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase">Tanggal Bergabung</label>
                <input
                  type="date"
                  className="w-full px-4 py-2.5 rounded-xl border focus:ring-2 focus:ring-emerald-200 outline-none text-sm bg-white"
                  value={tanggalBergabung}
                  onChange={e => setTanggalBergabung(e.target.value)}
                />
              </div>
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* BAGIAN 2: DATA ANGGOTA KELUARGA SERUMAH (LENGKAP SESUAI PERMINTAAN USER) */}
          <div className="space-y-4 bg-gray-50/70 p-4 rounded-2xl border">
            <h4 className="text-xs font-black uppercase text-emerald-800 tracking-wider flex items-center gap-1.5">
              <Users size={14}/> II. Anggota Keluarga Lain Serumah (Profil Lengkap)
            </h4>
            
            {/* Form Input Anggota Baru */}
            <div className="space-y-3 bg-white p-3 rounded-xl border space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[9px] font-black text-gray-400 uppercase mb-1">Nama Lengkap *</label>
                  <input
                    type="text"
                    placeholder="Nama Lengkap Anggota"
                    className="w-full border rounded-xl p-2.5 text-xs bg-white focus:ring-2 focus:ring-emerald-100 outline-none"
                    value={fName}
                    onChange={e => setFName(e.target.value)}
                    onKeyDown={handleFamilyInputKeyDown}
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-black text-gray-400 uppercase mb-1">Hubungan Keluarga</label>
                  <select
                    className="w-full border rounded-xl p-2.5 text-xs bg-white focus:ring-2 focus:ring-emerald-100 outline-none font-bold"
                    value={fRelation}
                    onChange={e => setFRelation(e.target.value as any)}
                  >
                    <option value="Istri">Istri</option>
                    <option value="Anak">Anak</option>
                    <option value="Mertua">Mertua</option>
                    <option value="Ayah">Ayah</option>
                    <option value="Ibu">Ibu</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[9px] font-black text-gray-400 uppercase mb-1">No. HP (Opsional)</label>
                  <input
                    type="tel"
                    placeholder="081xxx"
                    className="w-full border rounded-xl p-2.5 text-xs bg-white focus:ring-2 focus:ring-emerald-100 outline-none"
                    value={fPhone}
                    onChange={e => setFPhone(e.target.value)}
                    onKeyDown={handleFamilyInputKeyDown}
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-black text-gray-400 uppercase mb-1">Jenis Kelamin</label>
                  <select
                    className="w-full border rounded-xl p-2.5 text-xs bg-white focus:ring-2 focus:ring-emerald-100 outline-none font-bold"
                    value={fGender}
                    onChange={e => setFGender(e.target.value)}
                  >
                    <option value="Laki-Laki">Laki-Laki</option>
                    <option value="Perempuan">Perempuan</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[9px] font-black text-gray-400 uppercase mb-1">Tempat, Tgl Lahir</label>
                  <input
                    type="text"
                    placeholder="Cirebon, 12-05-1995"
                    className="w-full border rounded-xl p-2.5 text-xs bg-white focus:ring-2 focus:ring-emerald-100 outline-none"
                    value={fBirthPlace}
                    onChange={e => setFBirthPlace(e.target.value)}
                    onKeyDown={handleFamilyInputKeyDown}
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-black text-gray-400 uppercase mb-1">Agama</label>
                  <select
                    className="w-full border rounded-xl p-2.5 text-xs bg-white focus:ring-2 focus:ring-emerald-100 outline-none font-bold"
                    value={fReligion}
                    onChange={e => setFReligion(e.target.value)}
                  >
                    <option value="Islam">Islam</option>
                    <option value="Kristen">Kristen</option>
                    <option value="Katolik">Katolik</option>
                    <option value="Hindu">Hindu</option>
                    <option value="Buddha">Buddha</option>
                    <option value="Konghucu">Konghucu</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[9px] font-black text-gray-400 uppercase mb-1">Gol. Darah</label>
                  <select
                    className="w-full border rounded-xl p-2.5 text-xs bg-white focus:ring-2 focus:ring-emerald-100 outline-none font-bold"
                    value={fBloodType}
                    onChange={e => setFBloodType(e.target.value)}
                  >
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="AB">AB</option>
                    <option value="O">O</option>
                    <option value="Tidak Tahu">Tidak Tahu</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[9px] font-black text-gray-400 uppercase mb-1">Pekerjaan</label>
                  <input
                    type="text"
                    placeholder="Pelajar, Ibu Rumah Tangga, Swasta"
                    className="w-full border rounded-xl p-2.5 text-xs bg-white focus:ring-2 focus:ring-emerald-100 outline-none"
                    value={fJob}
                    onChange={e => setFJob(e.target.value)}
                    onKeyDown={handleFamilyInputKeyDown}
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={addFamilyMember}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-md"
              >
                <Plus size={14}/> Tambah Anggota Keluarga
              </button>
            </div>

            {/* List Anggota Keluarga yang dimasukkan */}
            <div className="space-y-2 pt-2">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Anggota Serumah Terdaftar ({familyList.length})</p>
              {familyList.length === 0 ? (
                <p className="text-xs text-gray-400 italic">Belum ada anggota keluarga serumah dimasukkan.</p>
              ) : (
                <div className="space-y-2.5">
                  {familyList.map((f, idx) => (
                    <div key={idx} className="p-4 bg-white rounded-2xl border border-gray-100 shadow-sm relative group">
                      <button 
                        type="button" 
                        onClick={() => removeFamilyMember(idx)} 
                        className="absolute top-2 right-2 text-rose-500 p-1.5 hover:bg-rose-50 rounded-xl transition-colors"
                        title="Hapus"
                      >
                        <Trash2 size={16}/>
                      </button>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
                        <div className="col-span-2 flex items-center gap-2 border-b pb-1.5 mb-1.5">
                          <p className="font-black text-gray-900 text-sm">{f.name}</p>
                          <span className="bg-emerald-100 text-emerald-800 font-black text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider">{f.relation}</span>
                        </div>
                        <div>
                          <p className="text-[10px] text-gray-400 uppercase font-bold">HP/WA</p>
                          <p className="font-semibold text-gray-700">{f.phone || '-'}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-gray-400 uppercase font-bold">Jenis Kelamin</p>
                          <p className="font-semibold text-gray-700">{f.gender || 'Perempuan'}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-gray-400 uppercase font-bold">Tempat, Tgl Lahir</p>
                          <p className="font-semibold text-gray-700">{f.birth_place || '-'}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-gray-400 uppercase font-bold">Agama</p>
                          <p className="font-semibold text-gray-700">{f.religion || 'Islam'}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-gray-400 uppercase font-bold">Gol. Darah</p>
                          <p className="font-semibold text-gray-700 text-rose-600">{f.blood_type || 'O'}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-gray-400 uppercase font-bold">Pekerjaan</p>
                          <p className="font-semibold text-gray-700">{f.job || '-'}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* BAGIAN 3: TAB RUMAH */}
          <div className="space-y-4">
            <h4 className="text-xs font-black uppercase text-blue-800 tracking-wider flex items-center gap-1.5">
              <Home size={14}/> III. Data Rumah Tinggal
            </h4>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase">Blok / No Rumah *</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2.5 rounded-xl border focus:ring-2 focus:ring-emerald-200 outline-none text-sm font-bold bg-white"
                  value={blockNumber}
                  onChange={e => setBlockNumber(e.target.value)}
                  placeholder="A4/11"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase">Status Hunian</label>
                <select
                  className="w-full px-4 py-2.5 rounded-xl border focus:ring-2 focus:ring-emerald-200 outline-none text-sm font-semibold bg-white"
                  value={occupancyStatus}
                  onChange={e => setOccupancyStatus(e.target.value as any)}
                >
                  <option value="Menetap">Menetap</option>
                  <option value="Penyewa">Penyewa</option>
                  <option value="Kunjungan">Kunjungan</option>
                  <option value="Ditempati 2026">Ditempati 2026</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase">Nama Pemilik Asli</label>
                <input
                  type="text"
                  className="w-full px-4 py-2.5 rounded-xl border focus:ring-2 focus:ring-emerald-200 outline-none text-sm bg-white"
                  value={namaPemilikAsli}
                  onChange={e => setNamaPemilikAsli(e.target.value)}
                  placeholder="Pemilik Asli Rumah"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase">No. HP Pemilik Asli</label>
                <input
                  type="text"
                  className="w-full px-4 py-2.5 rounded-xl border focus:ring-2 focus:ring-emerald-200 outline-none text-sm bg-white"
                  value={noHpPemilikAsli}
                  onChange={e => setNoHpPemilikAsli(e.target.value)}
                  placeholder="Kontak Pemilik"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase">Mulai Huni</label>
              <input
                type="date"
                className="w-full px-4 py-2.5 rounded-xl border focus:ring-2 focus:ring-emerald-200 outline-none text-sm bg-white"
                value={tglMulaiHuni}
                onChange={e => setTglMulaiHuni(e.target.value)}
              />
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* BAGIAN 4: TAB KENDARAAN */}
          <div className="space-y-4">
            <h4 className="text-xs font-black uppercase text-indigo-800 tracking-wider flex items-center gap-1.5">
              <Car size={14}/> IV. Data Inventaris Kendaraan
            </h4>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase">Jenis Kendaraan</label>
                <select
                  className="w-full px-4 py-2.5 rounded-xl border focus:ring-2 focus:ring-emerald-200 outline-none text-sm bg-white"
                  value={jenisKendaraan}
                  onChange={e => setJenisKendaraan(e.target.value)}
                >
                  <option value="Tidak Ada">Tidak Ada</option>
                  <option value="Mobil">Mobil</option>
                  <option value="Motor">Motor</option>
                  <option value="Sepeda">Sepeda</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase">Plat Nomor</label>
                <input
                  type="text"
                  className="w-full px-4 py-2.5 rounded-xl border focus:ring-2 focus:ring-emerald-200 outline-none text-sm font-mono font-bold bg-white"
                  value={platNomor}
                  onChange={e => setPlatNomor(e.target.value.toUpperCase())}
                  placeholder="B 1234 ABC"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase">Keterangan (Warna / Merk)</label>
              <input
                type="text"
                className="w-full px-4 py-2.5 rounded-xl border focus:ring-2 focus:ring-emerald-200 outline-none text-sm bg-white"
                value={keteranganWarnaMerk}
                onChange={e => setKeteranganWarnaMerk(e.target.value)}
                placeholder="Contoh: Honda Vario Hitam"
              />
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* BAGIAN 5: KAS BULANAN & ACARA (TERKUNCI UNTUK GUEST/NON-BENDAHARA) */}
          <div className="space-y-4">
            <h4 className="text-xs font-black uppercase text-gray-400 tracking-wider flex items-center gap-1.5">
              <Clipboard size={14}/> V. Kas & Riwayat Iuran { !canEditFinances && '🔒 (Terkunci)' }
            </h4>
            
            {resident ? (
              <div className="bg-gray-50 p-4 rounded-2xl border">
                <div className="flex justify-between items-center mb-2">
                  <p className="text-xs font-bold text-gray-700">Iuran Kas Wajib 10rb (Pilih Bulan)</p>
                  <span className="text-[10px] font-black bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">Tahun {paymentYear}</span>
                </div>
                <div className="grid grid-cols-4 gap-1.5">
                  {MONTHS.map((m, idx) => {
                    const monthNum = idx + 1;
                    const isChecked = selectedMonths.includes(monthNum);
                    return (
                      <button
                        key={monthNum}
                        type="button"
                        disabled={!canEditFinances} // KUNCI MODUL KAS WAJIB UNTUK GUEST
                        onClick={() => handleMonthToggle(monthNum)}
                        className={`py-1.5 rounded-lg text-[9px] font-bold border transition-all flex items-center justify-center gap-1 ${
                          isChecked 
                            ? 'bg-emerald-600 text-white border-emerald-700' 
                            : 'bg-white text-gray-400 border-gray-200'
                        } disabled:opacity-75 disabled:cursor-not-allowed`}
                      >
                        {m.substring(0, 3)}
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="bg-amber-50 text-amber-800 p-3 rounded-xl text-[11px] border border-amber-100 leading-normal">
                Menu pembayaran iuran wajib bulanan akan aktif setelah data warga baru disimpan untuk pertama kali.
              </div>
            )}

            <div className="space-y-2">
              <label className="block text-xs font-bold text-gray-700 uppercase">Iuran Kas Acara (Sukarela)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-gray-400 text-sm">Rp</span>
                <input
                  type="number"
                  disabled={!canEditFinances} // KUNCI MODUL KAS ACARA UNTUK GUEST
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border focus:ring-2 focus:ring-emerald-200 outline-none font-bold text-emerald-800 text-sm bg-white disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
                  value={eventDuesAmount}
                  onChange={e => setEventDuesAmount(Number(e.target.value) || 0)}
                  placeholder="0"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-gray-700 uppercase">Catatan / Keterangan Tambahan</label>
              <textarea
                rows={2}
                className="w-full px-4 py-2.5 rounded-xl border focus:ring-2 focus:ring-emerald-200 outline-none text-sm resize-none bg-white"
                value={rawNotesText}
                onChange={e => setRawNotesText(e.target.value)}
                placeholder="Tulis catatan atau keperluan iuran acara di sini..."
              />
            </div>
          </div>

          {/* BUTTON ACTIONS */}
          <div className="flex gap-3 pt-4 border-t shrink-0">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 py-3 border rounded-xl font-bold text-gray-600 hover:bg-gray-50 transition-colors text-sm"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/25 text-sm"
            >
              {loading ? <Loader2 className="animate-spin" size={18}/> : <Save size={18}/>}
              Simpan Data
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
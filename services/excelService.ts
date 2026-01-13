import * as XLSX from 'xlsx';
import { Resident, OccupancyStatus } from '../types';

export const parseResidentsExcel = async (file: File): Promise<Resident[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(worksheet);

        const residents: Resident[] = json.map((row: any) => {
          // Mapping columns flexible to case, but assuming structure
          
          const fullName = row['Nama Lengkap'] || row['Nama'] || 'Tanpa Nama';
          const blockNumber = row['Blok & No. Rumah'] || row['Blok'] || row['Alamat'] || '??';
          const whatsapp = row['No. WA'] || row['WA'] || row['Telepon'] || '';
          
          // Parse status
          let status: OccupancyStatus = 'Menetap';
          const statusRaw = (row['Status Hunian'] || row['Status'] || '').toString().toLowerCase();
          
          if (statusRaw.includes('sewa') || statusRaw.includes('kontrak')) {
            status = 'Penyewa';
          } else if (statusRaw.includes('kunjung')) {
            status = 'Kunjungan';
          } else if (statusRaw.includes('2026') || statusRaw.includes('kosong')) {
            status = 'Ditempati 2026';
          }

          // Parse monthly dues (Boolean)
          const isPaidMonthly = (val: any) => {
             const v = String(val).toLowerCase();
             return v.includes('sudah') || v.includes('lunas') || v.includes('ok') || v == '10000';
          };
          
          // Parse event dues (Amount/Number)
          const parseEventAmount = (val: any): number => {
            if (!val) return 0;
            // Clean string from non-numeric chars except digits if string
            const cleaned = String(val).replace(/[^0-9]/g, '');
            const num = parseInt(cleaned);
            return isNaN(num) ? 0 : num;
          };

          return {
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            fullName,
            blockNumber,
            whatsapp,
            occupancyStatus: status,
            monthlyDuesPaid: isPaidMonthly(row['Iuran Wajib Bulanan 10.000'] || row['Iuran Wajib'] || ''),
            eventDuesAmount: parseEventAmount(row['Iuran Acara'] || row['Iuran Sukarela'] || 0),
            notes: row['Catatan'] || '',
            updatedAt: Date.now()
          };
        });

        resolve(residents);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = (error) => reject(error);
    reader.readAsBinaryString(file);
  });
};

export const downloadTemplate = () => {
  const ws = XLSX.utils.json_to_sheet([
    {
      "Nama Lengkap": "Contoh Nama",
      "Blok & No. Rumah": "A1-01",
      "No. WA": "0812345678",
      "Status Hunian": "Menetap",
      "Iuran Wajib Bulanan 10.000": "Sudah",
      "Iuran Acara": "25000",
      "Catatan": "Lunas semua"
    }
  ]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Data Warga");
  XLSX.writeFile(wb, "Template_Data_Warga_Beryl.xlsx");
};
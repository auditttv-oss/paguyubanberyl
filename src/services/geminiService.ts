import { GoogleGenerativeAI } from "@google/generative-ai";
import { Resident, Expense } from "../types";

// Interface untuk struktur respons yang lebih terorganisir
interface FinancialAnalysis {
  summary: string;
  healthStatus: string;
  suggestions: string[];
  efficiencyTips: string[];
  rawText?: string;
}

export const analyzeFinances = async (
  residents: Resident[],
  expenses: Expense[],
  payments: any[] // Tambahkan parameter payments
): Promise<FinancialAnalysis | string> => {
  // 1. Ambil API Key dengan cara yang benar untuk Vite
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  if (!apiKey || apiKey === "your_api_key_here" || apiKey.trim() === "") {
    console.error("API Key Missing: Cek file .env anda, pastikan bernama VITE_GEMINI_API_KEY");
    console.error("Current API Key (masked):", apiKey ? `${apiKey.substring(0, 5)}...` : "undefined");
    
    // Fallback response tanpa AI
    return {
      summary: "⚠️ **Analisis Keuangan (Mode Fallback)**",
      healthStatus: "**Status:** Tidak dapat menghubungi AI. Silakan periksa konfigurasi API Key.",
      suggestions: [
        "1. Pastikan VITE_GEMINI_API_KEY telah diisi di file .env",
        "2. Restart server development setelah mengubah .env"
      ],
      efficiencyTips: ["Hubungi developer untuk bantuan konfigurasi"],
      rawText: "API Key tidak ditemukan"
    };
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // PERBAIKAN: Gunakan model yang lebih stabil
    // Alternatif: 'gemini-pro', 'gemini-1.0-pro', atau 'gemini-1.5-pro'
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.0-pro", // Model yang lebih stabil
      generationConfig: {
        temperature: 0.7,
        topP: 0.8,
        topK: 40,
        maxOutputTokens: 1024,
      }
    });

    // 2. Siapkan Data Ringkasan yang lebih detail
    const totalWarga = residents.length;
    
    // Hitung warga yang sudah bayar iuran dari data payments
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();
    const currentPayments = payments.filter(p => 
      p.month === currentMonth && p.year === currentYear
    );
    const paidMonthlyCount = currentPayments.length;
    const unpaidMonthlyCount = totalWarga - paidMonthlyCount;
    
    // Hitung persentase pembayaran
    const paymentPercentage = totalWarga > 0 ? (paidMonthlyCount / totalWarga) * 100 : 0;
    
    // Hitung total pengeluaran
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    
    // Hitung potensi pendapatan jika semua warga bayar
    const MONTHLY_DUES_AMOUNT = 10000; // Default amount
    const potentialMonthlyIncome = totalWarga * MONTHLY_DUES_AMOUNT;
    const actualMonthlyIncome = paidMonthlyCount * MONTHLY_DUES_AMOUNT;
    const incomeGap = potentialMonthlyIncome - actualMonthlyIncome;
    
    // Kategorikan pengeluaran
    const categorizedExpenses: Record<string, number> = {};
    expenses.forEach(expense => {
      const category = expense.category || "Lainnya";
      categorizedExpenses[category] = (categorizedExpenses[category] || 0) + expense.amount;
    });
    
    // Format kategori untuk prompt
    const expenseCategories = Object.entries(categorizedExpenses)
      .map(([category, amount]) => `  • ${category}: Rp ${amount.toLocaleString('id-ID')}`)
      .join('\n');

    // 3. Format Prompt yang lebih terstruktur
    const prompt = `
      Bertindaklah sebagai Konsultan Keuangan Perumahan yang ahli.
      Berikut adalah data keuangan Cluster Beryl saat ini:
      
      **STATUS KEUANGAN:**
      - Total Warga: ${totalWarga} KK
      - Warga Telah Bayar: ${paidMonthlyCount} KK (${paymentPercentage.toFixed(1)}%)
      - Warga Belum Bayar: ${unpaidMonthlyCount} KK
      
      **PENDAPATAN POTENSIAL:**
      - Potensi Bulanan: Rp ${potentialMonthlyIncome.toLocaleString('id-ID')}
      - Pendapatan Aktual: Rp ${actualMonthlyIncome.toLocaleString('id-ID')}
      - Selisih: Rp ${incomeGap.toLocaleString('id-ID')}
      
      **PENGELUARAN (Total: Rp ${totalExpenses.toLocaleString('id-ID')}):**
      ${expenseCategories}
      
      **TUGAS ANDA SEBAGAI KONSULTAN:**
      1. **ANALISIS KESEHATAN KEUANGAN** (1 paragraf)
         - Berikan penilaian kesehatan keuangan berdasarkan data di atas
         - Gunakan metrik seperti cash flow, likuiditas, dan sustainability
      
      2. **SARAN TINGKATKAN PARTISIPASI** (2-3 saran konkret)
         - Saran taktis untuk meningkatkan pembayaran iuran
         - Strategi komunikasi dan engagement dengan warga
      
      3. **TIPS EFISIENSI BIAYA** (jika pengeluaran > 0)
         - Identifikasi area penghematan potensial
         - Rekomendasi optimisasi anggaran
      
      4. **REKOMENDASI PRIORITAS** (1-2 prioritas utama)
         - Apa yang harus dilakukan dalam 30 hari ke depan
      
      **FORMAT OUTPUT:**
      - Gunakan bahasa Indonesia yang profesional namun mudah dipahami
      - Sertakan angka dan persentase dalam analisis
      - Berikan analisis yang realistic dan dapat ditindaklanjuti
      
      **TULISKAN ANALISIS DALAM BENTUK:**
      - **Analisis Kesehatan:** [isi analisis di sini]
      - **Saran Partisipasi:** 
        1. [saran 1]
        2. [saran 2]
        3. [saran 3]
      - **Tips Efisiensi:**
        1. [tips 1]
        2. [tips 2]
      - **Rekomendasi Prioritas:**
        1. [prioritas 1]
        2. [prioritas 2]
    `;

    console.log("Mengirim request ke Gemini AI...");
    console.log("Menggunakan model:", model.model);
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const analysisText = response.text();
    
    console.log("Analisis AI diterima:", analysisText.substring(0, 200) + "...");
    
    // Parsing respons untuk struktur yang lebih baik
    try {
      const lines = analysisText.split('\n').filter(line => line.trim());
      
      // Ekstrak bagian-bagian
      const summary = lines.join('\n');
      const healthStatus = extractSection(lines, ['analisis kesehatan', 'kesehatan keuangan']);
      const suggestions = extractList(lines, ['saran partisipasi', 'saran']);
      const efficiencyTips = extractList(lines, ['tips efisiensi', 'efisiensi', 'hemat']);
      
      return {
        summary: summary.substring(0, 500) + (summary.length > 500 ? '...' : ''),
        healthStatus: healthStatus || "Analisis kesehatan tidak tersedia",
        suggestions: suggestions.length > 0 ? suggestions : ["Tidak ada saran spesifik"],
        efficiencyTips: efficiencyTips.length > 0 ? efficiencyTips : ["Tidak ada tips efisiensi"],
        rawText: analysisText
      };
    } catch (parseError) {
      console.warn("Gagal parsing respons AI, menggunakan full text:", parseError);
      return {
        summary: analysisText.substring(0, 500) + (analysisText.length > 500 ? '...' : ''),
        healthStatus: "Analisis kesehatan tersedia dalam ringkasan",
        suggestions: ["Lihat ringkasan untuk saran lengkap"],
        efficiencyTips: ["Lihat ringkasan untuk tips efisiensi"],
        rawText: analysisText
      };
    }
    
  } catch (error: any) {
    console.error("Gemini Error Details:", {
      message: error.message,
      status: error.status,
      stack: error.stack
    });
    
    // PERBAIKAN: Cek berbagai jenis error
    if (error.message?.includes("model") || error.message?.includes("not found") || error.message?.includes("not supported")) {
      return {
        summary: "⚠️ **Error Model AI**",
        healthStatus: `**Status:** Model AI tidak ditemukan. Error: ${error.message.split(':')[0]}`,
        suggestions: [
          "1. Coba ganti model di kode geminiService.ts",
          "2. Gunakan model alternatif: 'gemini-1.0-pro' atau 'gemini-pro'",
          "3. Cek model yang tersedia di Google AI Studio"
        ],
        efficiencyTips: ["Gunakan analisis manual sementara"],
        rawText: "Model error: " + error.message.substring(0, 200)
      };
    }
    
    if (error.message?.includes("API key") || error.message?.includes("API_KEY")) {
      return {
        summary: "⚠️ **Error Autentikasi API**",
        healthStatus: "**Status:** API Key Gemini tidak valid atau telah kedaluwarsa.",
        suggestions: [
          "1. Periksa kembali API Key di file .env",
          "2. Pastikan API Key memiliki quota yang cukup",
          "3. Verifikasi API Key di Google AI Studio"
        ],
        efficiencyTips: ["Hubungi administrator untuk pembaruan API Key"],
        rawText: "API Key error: " + error.message
      };
    }
    
    if (error.message?.includes("quota") || error.message?.includes("rate limit")) {
      return {
        summary: "⚠️ **Batas Kuota Terlampaui**",
        healthStatus: "**Status:** Kuota API Gemini telah habis untuk bulan ini.",
        suggestions: [
          "1. Tunggu hingga kuota bulanan reset",
          "2. Upgrade ke plan berbayar jika diperlukan",
          "3. Gunakan analisis manual sementara"
        ],
        efficiencyTips: ["Optimalkan penggunaan API untuk kebutuhan kritis saja"],
        rawText: "Quota exceeded: " + error.message
      };
    }
    
    if (error.message?.includes("network") || error.message?.includes("internet")) {
      return {
        summary: "⚠️ **Koneksi Gagal**",
        healthStatus: "**Status:** Tidak dapat menghubungi server Gemini AI.",
        suggestions: [
          "1. Periksa koneksi internet Anda",
          "2. Coba lagi dalam beberapa menit",
          "3. Gunakan fitur analisis offline jika tersedia"
        ],
        efficiencyTips: ["Cek status server Gemini AI di status.cloud.google.com"],
        rawText: "Network error: " + error.message
      };
    }
    
    // Fallback untuk error lainnya
    return {
      summary: "⚠️ **Error Sistem AI**",
      healthStatus: `**Status:** Terjadi kesalahan pada sistem AI. ${error.message?.substring(0, 100)}`,
      suggestions: [
        "1. Coba refresh halaman",
        "2. Gunakan fitur analisis manual",
        "3. Hubungi administrator sistem"
      ],
      efficiencyTips: ["Gunakan data statistik dashboard untuk analisis manual"],
      rawText: "Unknown error: " + error.message
    };
  }
};

// Helper functions untuk parsing
function extractSection(lines: string[], keywords: string[]): string {
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].toLowerCase();
    if (keywords.some(keyword => line.includes(keyword))) {
      let section = lines[i];
      // Ambil beberapa baris berikutnya
      for (let j = i + 1; j < Math.min(i + 5, lines.length); j++) {
        if (lines[j].trim() && !lines[j].toLowerCase().includes('saran') && 
            !lines[j].toLowerCase().includes('tips') && 
            !lines[j].toLowerCase().includes('rekomendasi')) {
          section += '\n' + lines[j];
        } else {
          break;
        }
      }
      return section.trim();
    }
  }
  return "";
}

function extractList(lines: string[], keywords: string[]): string[] {
  const items: string[] = [];
  let inSection = false;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].toLowerCase();
    
    if (keywords.some(keyword => line.includes(keyword))) {
      inSection = true;
      continue;
    }
    
    if (inSection) {
      // Hentikan jika menemukan section baru
      if (line.includes('analisis') || line.includes('rekomendasi') || 
          line.includes('prioritas') || (i > 0 && lines[i-1].trim() === '' && line.includes(':'))) {
        break;
      }
      
      // Ambil item list (dimulai dengan angka atau bullet)
      if (line.match(/^(\d+\.|\•|\-)\s/) || line.trim().match(/^[▶→✓]/)) {
        items.push(lines[i].trim());
      }
    }
  }
  
  return items.length > 0 ? items : extractListFallback(lines, keywords);
}

function extractListFallback(lines: string[], keywords: string[]): string[] {
  const items: string[] = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].toLowerCase();
    if (keywords.some(keyword => line.includes(keyword))) {
      // Coba ambil 3-5 baris berikutnya sebagai saran
      for (let j = i + 1; j < Math.min(i + 6, lines.length); j++) {
        if (lines[j].trim() && lines[j].trim().length > 10) {
          items.push(lines[j].trim());
          if (items.length >= 3) break;
        }
      }
      break;
    }
  }
  
  return items;
}

// Fungsi tambahan untuk fallback jika AI tidak tersedia
export const getFallbackAnalysis = (residents: Resident[], expenses: Expense[], payments: any[]): FinancialAnalysis => {
  const totalWarga = residents.length;
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();
  const currentPayments = payments.filter(p => 
    p.month === currentMonth && p.year === currentYear
  );
  const paidMonthlyCount = currentPayments.length;
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  
  return {
    summary: "📊 **Analisis Keuangan Dasar (Mode Manual)**",
    healthStatus: `**Status:** ${paidMonthlyCount}/${totalWarga} warga (${((paidMonthlyCount/totalWarga)*100).toFixed(1)}%) telah membayar iuran.\nTotal pengeluaran: Rp ${totalExpenses.toLocaleString('id-ID')}`,
    suggestions: [
      "**1. Transparansi Laporan:** Bagikan laporan keuangan bulanan ke grup WhatsApp",
      "**2. Reminder Rutin:** Kirim pengingat 3 hari sebelum jatuh tempo",
      "**3. Metode Pembayaran:** Sediakan multiple payment options (QRIS, Transfer, Cash)"
    ],
    efficiencyTips: [
      "**Review Kontrak Rutin:** Negosiasi ulang kontrak layanan tahunan",
      "**Bulk Purchasing:** Beli kebutuhan rutin dalam jumlah besar untuk diskon",
      "**Energy Audit:** Cek pemakaian listrik area common untuk efisiensi"
    ],
    rawText: "Fallback analysis - AI service unavailable"
  };
};

// Fungsi baru untuk versi sederhana (untuk Dashboard.tsx)
export const analyzeFinancesSimple = async (summaryText: string): Promise<string> => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  if (!apiKey || apiKey === "your_api_key_here" || apiKey.trim() === "") {
    return "⚠️ **Analisis AI Tidak Tersedia**\n\nAPI Key Gemini tidak dikonfigurasi. Silakan periksa file .env atau hubungi administrator.";
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.0-pro",
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 800,
      }
    });

    const prompt = `
      Anda adalah konsultan keuangan paguyuban perumahan.
      Berikut adalah ringkasan data keuangan yang diberikan:
      
      ${summaryText}
      
      Berikan analisis singkat (maksimal 300 kata) dengan format:
      1. **Status Kesehatan Keuangan** (1-2 kalimat)
      2. **Rekomendasi Utama** (2-3 poin)
      3. **Aksi Prioritas** (1-2 aksi untuk 30 hari ke depan)
      
      Gunakan bahasa Indonesia yang jelas dan mudah dipahami.
      Fokus pada insights yang dapat ditindaklanjuti.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
    
  } catch (error: any) {
    console.error("Simple Gemini Error:", error.message);
    
    if (error.message?.includes("model")) {
      // Coba dengan model alternatif
      try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ 
          model: "gemini-pro", // Alternatif lain
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 500,
          }
        });
        
        const result = await model.generateContent(`Analisis singkat: ${summaryText.substring(0, 500)}`);
        const response = await result.response;
        return response.text();
      } catch (fallbackError) {
        return `⚠️ **Analisis Gagal**\n\nError: ${fallbackError.message?.substring(0, 100) || 'Unknown error'}\n\nGunakan statistik dashboard untuk analisis manual.`;
      }
    }
    
    return `⚠️ **Analisis Gagal**\n\nError: ${error.message?.substring(0, 100) || 'Unknown error'}\n\nGunakan statistik dashboard untuk analisis manual.`;
  }
};
import { GoogleGenAI } from "@google/genai";
import { Resident, Expense } from "../types";
import { MONTHLY_DUES_AMOUNT } from "../constants";

export const analyzeFinances = async (
  residents: Resident[],
  expenses: Expense[]
): Promise<string> => {
  if (!process.env.API_KEY) {
    return "API Key Gemini belum dikonfigurasi. Silakan tambahkan API Key untuk menggunakan fitur ini.";
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // Calculate summary for context
    const totalMonthly = residents.filter(r => r.monthlyDuesPaid).length * MONTHLY_DUES_AMOUNT;
    const totalEvent = residents.reduce((sum, r) => sum + (r.eventDuesAmount || 0), 0);
    const totalIncome = totalMonthly + totalEvent;
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    const balance = totalIncome - totalExpenses;
    
    const notPaidMonthlyCount = residents.filter(r => !r.monthlyDuesPaid).length;
    const notPaidEventCount = residents.filter(r => !r.eventDuesAmount || r.eventDuesAmount === 0).length;

    const prompt = `
      Bertindaklah sebagai Bendahara Profesional untuk Cluster Beryl.
      Analisis data keuangan berikut dan berikan laporan singkat, saran, dan status kesehatan keuangan dalam Bahasa Indonesia yang sopan dan jelas.
      
      Data:
      - Total Pemasukan Kas Bulanan: Rp ${totalMonthly.toLocaleString('id-ID')}
      - Total Pemasukan Acara (Sukarela): Rp ${totalEvent.toLocaleString('id-ID')}
      - Total Pengeluaran: Rp ${totalExpenses.toLocaleString('id-ID')}
      - Saldo Akhir: Rp ${balance.toLocaleString('id-ID')}
      - Warga Belum Bayar Kas: ${notPaidMonthlyCount} orang
      - Warga Belum Bayar/Partisipasi Acara: ${notPaidEventCount} orang
      
      Berikan output dalam format Markdown. Fokus pada kecukupan dana acara (dana sukarela) dan saran pengelolaan.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return response.text || "Gagal mendapatkan analisis.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Terjadi kesalahan saat menganalisis data. Pastikan koneksi internet lancar.";
  }
};
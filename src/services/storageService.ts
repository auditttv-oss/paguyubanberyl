import * as dataService from './dataService';
import { Resident, Expense, Payment, Comment, BackupInfo } from '../types';

export const getResidents = dataService.fetchResidents;
export const getExpenses = dataService.fetchExpenses;
export const getAllMonthlyPayments = dataService.fetchAllPayments;
export const getComments = dataService.fetchComments;
export const saveComment = dataService.createComment;
export const deleteComment = dataService.deleteComment;

export const getBackupInfo = async (): Promise<BackupInfo> => {
  const [res, exp, pay, com] = await Promise.all([
    dataService.fetchResidents(),
    dataService.fetchExpenses(),
    dataService.fetchAllPayments(),
    dataService.fetchComments()
  ]);
  return {
    backupDate: new Date().toLocaleDateString('id-ID'),
    totalResidents: res.length,
    totalExpenses: exp.length,
    totalPayments: pay.length,
    totalComments: com.length,
    totalEventDues: `Rp ${res.reduce((s, r) => s + r.eventDuesAmount, 0).toLocaleString('id-ID')}`,
    totalExpensesAmount: `Rp ${exp.reduce((s, e) => s + e.amount, 0).toLocaleString('id-ID')}`,
    version: "2.0.0", size: res.length + exp.length
  };
};

export const restoreDatabase = async (d: any) => console.log(d);
export const getDatabaseBackup = dataService.exportDataToJSON;
export const clearAllData = async () => localStorage.clear();

// FIX ERROR TS1192: Tambahkan default export
const storageService = {
  getResidents, getExpenses, getAllMonthlyPayments, getComments,
  saveComment, deleteComment, getBackupInfo, getDatabaseBackup,
  restoreDatabase, clearAllData
};
export default storageService;
import { supabase } from '../supabaseClient';
import { Resident, Expense } from '../types';

// --- RESIDENTS SERVICE ---

export const getResidents = async (): Promise<Resident[]> => {
  try {
    const { data, error } = await supabase
      .from('residents')
      .select('*')
      .order('block_number', { ascending: true });

    if (error) {
      console.error('Error fetching residents:', error);
      return [];
    }

    // Mapping dari snake_case (Database) ke camelCase (Aplikasi)
    return (data || []).map((item: any) => ({
      id: item.id,
      fullName: item.full_name,
      blockNumber: item.block_number,
      whatsapp: item.whatsapp || '',
      occupancyStatus: item.occupancy_status,
      monthlyDuesPaid: item.monthly_dues_paid,
      eventDuesAmount: Number(item.event_dues_amount) || 0,
      notes: item.notes || '',
      updatedAt: Number(item.updated_at)
    }));
  } catch (error) {
    console.error("Connection error:", error);
    return [];
  }
};

export const saveResident = async (resident: Omit<Resident, 'id'>) => {
  const payload = {
    full_name: resident.fullName,
    block_number: resident.blockNumber,
    whatsapp: resident.whatsapp,
    occupancy_status: resident.occupancyStatus,
    monthly_dues_paid: resident.monthlyDuesPaid,
    event_dues_amount: resident.eventDuesAmount,
    notes: resident.notes,
    updated_at: Date.now()
  };

  const { data, error } = await supabase
    .from('residents')
    .insert([payload])
    .select()
    .single();

  if (error) throw error;
  
  // Return format aplikasi
  return {
    ...resident,
    id: data.id,
    updatedAt: data.updated_at
  } as Resident;
};

export const updateResident = async (resident: Resident) => {
  const payload = {
    full_name: resident.fullName,
    block_number: resident.blockNumber,
    whatsapp: resident.whatsapp,
    occupancy_status: resident.occupancyStatus,
    monthly_dues_paid: resident.monthlyDuesPaid,
    event_dues_amount: resident.eventDuesAmount,
    notes: resident.notes,
    updated_at: Date.now()
  };

  const { error } = await supabase
    .from('residents')
    .update(payload)
    .eq('id', resident.id);

  if (error) throw error;
  return resident;
};

export const deleteResident = async (id: string) => {
  const { error } = await supabase
    .from('residents')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

// --- EXPENSES SERVICE ---

export const getExpenses = async (): Promise<Expense[]> => {
  const { data, error } = await supabase
    .from('expenses')
    .select('*')
    .order('date', { ascending: false });

  if (error) {
    console.error('Error fetching expenses:', error);
    return [];
  }

  return (data || []).map((item: any) => ({
    id: item.id,
    description: item.description,
    amount: Number(item.amount),
    date: Number(item.date),
    category: item.category
  }));
};

export const saveExpense = async (expense: Omit<Expense, 'id'>) => {
  const { data, error } = await supabase
    .from('expenses')
    .insert([{
      description: expense.description,
      amount: expense.amount,
      date: expense.date,
      category: expense.category
    }])
    .select()
    .single();

  if (error) throw error;

  return {
    ...expense,
    id: data.id
  } as Expense;
};

export const deleteExpense = async (id: string) => {
  const { error } = await supabase
    .from('expenses')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

// Bulk Import untuk Excel
export const bulkImportResidents = async (residents: Omit<Resident, 'id'>[]) => {
  const payload = residents.map(r => ({
    full_name: r.fullName,
    block_number: r.blockNumber,
    whatsapp: r.whatsapp,
    occupancy_status: r.occupancyStatus,
    monthly_dues_paid: r.monthlyDuesPaid,
    event_dues_amount: r.eventDuesAmount,
    notes: r.notes,
    updated_at: Date.now()
  }));

  const { error } = await supabase.from('residents').insert(payload);
  if (error) throw error;
};
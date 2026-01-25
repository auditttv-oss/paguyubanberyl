// Validation utilities for security and data integrity

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePhoneNumber = (phone: string): boolean => {
  // Indonesian phone number validation
  const phoneRegex = /^(\+62|62|0)[0-9]{9,13}$/;
  const cleanPhone = phone.replace(/[\s-]/g, '');
  return phoneRegex.test(cleanPhone);
};

export const sanitizeInput = (input: string): string => {
  // Remove potentially dangerous characters
  return input
    .replace(/[<>]/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '')
    .trim();
};

export const validateBlockNumber = (blockNumber: string): boolean => {
  // Valid block number format: A1, B3-12, etc.
  const blockRegex = /^[A-Za-z]+\d+([/-]\d+)?$/;
  return blockRegex.test(blockNumber.trim());
};

export const validateAmount = (amount: number): boolean => {
  return amount >= 0 && amount <= 1000000000 && !isNaN(amount);
};

export const validateResidentData = (data: {
  fullName: string;
  blockNumber: string;
  whatsapp?: string;
}): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!data.fullName || data.fullName.trim().length < 2) {
    errors.push('Nama lengkap harus diisi minimal 2 karakter');
  }

  if (!data.blockNumber || !validateBlockNumber(data.blockNumber)) {
    errors.push('Format nomor blok tidak valid (contoh: A1, B3-12)');
  }

  if (data.whatsapp && !validatePhoneNumber(data.whatsapp)) {
    errors.push('Nomor WhatsApp tidak valid');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateExpenseData = (data: {
  description: string;
  amount: number;
  category: string;
  date: number;
}): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!data.description || data.description.trim().length < 3) {
    errors.push('Deskripsi pengeluaran harus diisi minimal 3 karakter');
  }

  if (!validateAmount(data.amount)) {
    errors.push('Jumlah pengeluaran tidak valid');
  }

  if (!data.category) {
    errors.push('Kategori pengeluaran harus dipilih');
  }

  if (!data.date || data.date > Date.now()) {
    errors.push('Tanggal pengeluaran tidak valid');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

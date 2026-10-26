export interface User {
  id: string;
  email: string;
  name: string | null;
  defaultCurrency: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}

export interface Category {
  id: string;
  name: string;
  isDefault: boolean;
  userId: string | null;
}

export type PaymentMethod = 'CASH' | 'CARD' | 'UPI' | 'BANK_TRANSFER' | 'OTHER';

export const PAYMENT_METHODS: { value: PaymentMethod; label: string }[] = [
  { value: 'CASH', label: 'Cash' },
  { value: 'CARD', label: 'Card' },
  { value: 'UPI', label: 'UPI' },
  { value: 'BANK_TRANSFER', label: 'Bank transfer' },
  { value: 'OTHER', label: 'Other' },
];

export interface Expense {
  id: string;
  amount: number;
  date: string;
  note: string | null;
  paymentMethod: PaymentMethod;
  categoryId: string;
  category: { id: string; name: string };
}

export interface ExpenseInput {
  amount: number;
  date: string;
  categoryId: string;
  note?: string;
  paymentMethod: PaymentMethod;
}

export interface Income {
  id: string;
  amount: number;
  date: string;
  source: string | null;
  note: string | null;
}

export interface IncomeInput {
  amount: number;
  date: string;
  source?: string;
  note?: string;
}

export interface PageMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface Paginated<T> {
  data: T[];
  meta: PageMeta;
}

export interface ExpenseFilters {
  page?: number;
  limit?: number;
  from?: string;
  to?: string;
  categoryId?: string;
  search?: string;
}

export interface IncomeFilters {
  page?: number;
  limit?: number;
  from?: string;
  to?: string;
}

export interface Summary {
  month: string;
  spent: number;
  income: number;
  balance: number;
}

export interface CategoryTotal {
  categoryId: string;
  name: string;
  total: number;
  percentage: number;
}

export interface TrendPoint {
  month: string;
  spent: number;
  income: number;
}

export type RecentTransaction =
  | {
      type: 'expense';
      id: string;
      amount: number;
      date: string;
      note: string | null;
      category: { id: string; name: string };
      paymentMethod: PaymentMethod;
    }
  | {
      type: 'income';
      id: string;
      amount: number;
      date: string;
      note: string | null;
      source: string | null;
    };

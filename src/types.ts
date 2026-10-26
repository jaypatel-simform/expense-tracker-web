export interface User {
  id: string;
  email: string;
  name: string;
}

export interface Category {
  id: string;
  name: string;
}

export interface Expense {
  id: string;
  /** Prisma Decimal is serialised as a string */
  amount: string;
  description: string;
  note: string | null;
  /** ISO datetime, e.g. 2025-01-31T00:00:00.000Z */
  date: string;
  categoryId: string;
  category: Category;
}

export interface Paginated<T> {
  data: T[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

export interface Summary {
  from: string;
  to: string;
  total: number;
  count: number;
  byCategory: { categoryId: string; name: string; total: number; count: number }[];
}

export interface MonthlyTotal {
  month: string;
  total: number;
}

export interface ExpenseInput {
  amount: number;
  description: string;
  note?: string;
  date: string;
  categoryId: string;
}

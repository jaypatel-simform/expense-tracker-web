import { api } from './client';
import type { Expense, ExpenseFilters, ExpenseInput, Paginated } from './types';

export const listExpenses = (filters: ExpenseFilters) =>
  api.get<Paginated<Expense>>('/expenses', { params: filters }).then((r) => r.data);

export const createExpense = (input: ExpenseInput) =>
  api.post<Expense>('/expenses', input).then((r) => r.data);

export const updateExpense = (id: string, input: Partial<ExpenseInput>) =>
  api.patch<Expense>(`/expenses/${id}`, input).then((r) => r.data);

export const deleteExpense = (id: string) =>
  api.delete(`/expenses/${id}`).then(() => undefined);

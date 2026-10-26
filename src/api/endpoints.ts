import { api } from './client';
import type {
  Category,
  Expense,
  ExpenseInput,
  MonthlyTotal,
  Paginated,
  Summary,
  User,
} from '../types';

export interface AuthResponse {
  accessToken: string;
  user: User;
}

export const authApi = {
  login: (body: { email: string; password: string }) =>
    api.post<AuthResponse>('/auth/login', body).then((r) => r.data),
  register: (body: { name: string; email: string; password: string }) =>
    api.post<AuthResponse>('/auth/register', body).then((r) => r.data),
  me: () => api.get<User>('/auth/me').then((r) => r.data),
};

export const categoriesApi = {
  list: () => api.get<Category[]>('/categories').then((r) => r.data),
  create: (name: string) => api.post<Category>('/categories', { name }).then((r) => r.data),
  remove: (id: string) => api.delete(`/categories/${id}`),
};

export interface ExpenseFilters {
  from?: string;
  to?: string;
  categoryId?: string;
  page: number;
  limit: number;
}

const clean = <T extends object>(obj: T) =>
  Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== '' && v !== undefined));

export const expensesApi = {
  list: (filters: ExpenseFilters) =>
    api.get<Paginated<Expense>>('/expenses', { params: clean(filters) }).then((r) => r.data),
  create: (body: ExpenseInput) => api.post<Expense>('/expenses', body).then((r) => r.data),
  update: (id: string, body: Partial<ExpenseInput>) =>
    api.patch<Expense>(`/expenses/${id}`, body).then((r) => r.data),
  remove: (id: string) => api.delete(`/expenses/${id}`),
};

export const reportsApi = {
  summary: (params: { from?: string; to?: string }) =>
    api.get<Summary>('/reports/summary', { params: clean(params) }).then((r) => r.data),
  monthly: (months = 6) =>
    api.get<MonthlyTotal[]>('/reports/monthly', { params: { months } }).then((r) => r.data),
};

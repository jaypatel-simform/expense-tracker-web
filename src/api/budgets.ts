import { api } from './client';
import type { Budget, BudgetStatus } from './types';

export const listBudgets = () => api.get<Budget[]>('/budgets').then((r) => r.data);

export const setCategoryBudget = (categoryId: string, amount: number) =>
  api.put<Budget>(`/budgets/${categoryId}`, { amount }).then((r) => r.data);

export const clearCategoryBudget = (categoryId: string) =>
  api.delete(`/budgets/${categoryId}`).then(() => undefined);

export const setOverallBudget = (amount: number) =>
  api.put<{ amount: number }>('/budgets/overall', { amount }).then((r) => r.data);

export const clearOverallBudget = () => api.delete('/budgets/overall').then(() => undefined);

export const getBudgetStatus = (month: string) =>
  api.get<BudgetStatus>('/budgets/status', { params: { month } }).then((r) => r.data);

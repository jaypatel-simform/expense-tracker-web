import { api } from './client';
import type { Income, IncomeFilters, IncomeInput, Paginated } from './types';

export const listIncome = (filters: IncomeFilters) =>
  api.get<Paginated<Income>>('/income', { params: filters }).then((r) => r.data);

export const createIncome = (input: IncomeInput) =>
  api.post<Income>('/income', input).then((r) => r.data);

export const updateIncome = (id: string, input: Partial<IncomeInput>) =>
  api.patch<Income>(`/income/${id}`, input).then((r) => r.data);

export const deleteIncome = (id: string) => api.delete(`/income/${id}`).then(() => undefined);

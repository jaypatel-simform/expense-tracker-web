import { api } from './client';
import type { Category } from './types';

export const listCategories = () => api.get<Category[]>('/categories').then((r) => r.data);

export const createCategory = (name: string) =>
  api.post<Category>('/categories', { name }).then((r) => r.data);

export const updateCategory = (id: string, name: string) =>
  api.patch<Category>(`/categories/${id}`, { name }).then((r) => r.data);

export const deleteCategory = (id: string) =>
  api.delete(`/categories/${id}`).then(() => undefined);

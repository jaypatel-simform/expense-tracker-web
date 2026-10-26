import { api } from './client';
import type { CategoryTotal, RecentTransaction, Summary, TrendPoint } from './types';

export const getSummary = (month: string) =>
  api.get<Summary>('/dashboard/summary', { params: { month } }).then((r) => r.data);

export const getByCategory = (month: string) =>
  api.get<CategoryTotal[]>('/dashboard/by-category', { params: { month } }).then((r) => r.data);

export const getTrend = (months: number, to: string) =>
  api.get<TrendPoint[]>('/dashboard/trend', { params: { months, to } }).then((r) => r.data);

export const getRecent = (limit = 10) =>
  api.get<RecentTransaction[]>('/dashboard/recent', { params: { limit } }).then((r) => r.data);

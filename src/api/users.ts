import { api } from './client';
import type { User } from './types';

export const getMe = () => api.get<User>('/users/me').then((r) => r.data);

export const updateMe = (input: { name?: string; defaultCurrency?: string }) =>
  api.patch<User>('/users/me', input).then((r) => r.data);

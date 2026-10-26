import { api } from './client';
import type { AuthResponse } from './types';

export const login = (email: string, password: string) =>
  api.post<AuthResponse>('/auth/login', { email, password }).then((r) => r.data);

export const signup = (input: { email: string; password: string; name?: string }) =>
  api.post<AuthResponse>('/auth/signup', input).then((r) => r.data);

export const logout = () => api.post('/auth/logout').then(() => undefined);

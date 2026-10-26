import axios, { AxiosError } from 'axios';

export const TOKEN_KEY = 'expense-tracker.token';

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (token: string) => localStorage.setItem(TOKEN_KEY, token);
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api',
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Credential errors on these routes are shown on the form, not treated as an expired session.
const AUTH_PATHS = ['/auth/login', '/auth/signup'];

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const url = error.config?.url ?? '';
    if (error.response?.status === 401 && !AUTH_PATHS.includes(url)) {
      clearToken();
      if (window.location.pathname !== '/login') {
        window.location.assign('/login');
      }
    }
    return Promise.reject(error);
  },
);

interface ApiErrorBody {
  message?: string | string[];
}

/** Human-readable messages from a NestJS error response. */
export function getErrorMessages(error: unknown, fallback = 'Something went wrong'): string[] {
  if (axios.isAxiosError<ApiErrorBody>(error)) {
    const message = error.response?.data?.message;
    if (Array.isArray(message)) return message;
    if (typeof message === 'string') return [message];
    if (!error.response) return ['Cannot reach the server. Is the backend running?'];
  }
  return [fallback];
}

export const getErrorMessage = (error: unknown, fallback?: string) =>
  getErrorMessages(error, fallback).join('. ');

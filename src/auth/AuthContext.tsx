import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { TOKEN_KEY } from '../api/client';
import { authApi, type AuthResponse } from '../api/endpoints';
import type { User } from '../types';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(() => !!localStorage.getItem(TOKEN_KEY));

  useEffect(() => {
    if (!localStorage.getItem(TOKEN_KEY)) return;
    authApi
      .me()
      .then(setUser)
      .catch(() => localStorage.removeItem(TOKEN_KEY))
      .finally(() => setLoading(false));
  }, []);

  const onAuth = useCallback(
    (res: AuthResponse) => {
      localStorage.setItem(TOKEN_KEY, res.accessToken);
      queryClient.clear();
      setUser(res.user);
    },
    [queryClient],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      login: async (email, password) => onAuth(await authApi.login({ email, password })),
      register: async (name, email, password) =>
        onAuth(await authApi.register({ name, email, password })),
      logout: () => {
        localStorage.removeItem(TOKEN_KEY);
        queryClient.clear();
        setUser(null);
      },
    }),
    [user, loading, onAuth, queryClient],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}

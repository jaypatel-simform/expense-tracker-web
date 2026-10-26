import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import * as authApi from '../api/auth';
import { clearToken, getToken, setToken } from '../api/client';
import type { AuthResponse, User } from '../api/types';
import { getMe } from '../api/users';
import { AuthContext, type AuthContextValue } from './authContext';

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [token, setTokenState] = useState<string | null>(() => getToken());
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(() => getToken() !== null);

  // Restore the session on start.
  useEffect(() => {
    if (!getToken()) return;
    let cancelled = false;
    getMe()
      .then((me) => {
        if (!cancelled) setUser(me);
      })
      .catch(() => {
        // The response interceptor already cleared the token on 401.
        if (!cancelled && !getToken()) setTokenState(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const accept = useCallback(
    (res: AuthResponse) => {
      queryClient.clear();
      setToken(res.accessToken);
      setTokenState(res.accessToken);
      setUser(res.user);
    },
    [queryClient],
  );

  const login = useCallback(
    async (email: string, password: string) => accept(await authApi.login(email, password)),
    [accept],
  );

  const signup = useCallback(
    async (input: { email: string; password: string; name?: string }) =>
      accept(await authApi.signup(input)),
    [accept],
  );

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // Stateless JWT: clear local state even if the server call fails.
    }
    clearToken();
    setTokenState(null);
    setUser(null);
    queryClient.clear();
  }, [queryClient]);

  const value = useMemo<AuthContextValue>(
    () => ({ token, user, loading, login, signup, logout, setUser }),
    [token, user, loading, login, signup, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

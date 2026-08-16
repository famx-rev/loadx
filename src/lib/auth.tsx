import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import {
  forgotPassword as apiForgot,
  getMe,
  login as apiLogin,
  resetPassword as apiReset,
  signup as apiSignup,
  ApiError,
} from './api';
import type { AuthUser } from './api';

const TOKEN_KEY = 'loadbar_token';
const USER_KEY = 'loadbar_user';

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, username: string) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, newPassword: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function readToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

function writeToken(token: string | null) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* ignore */
  }
}

function readUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}

function writeUser(u: AuthUser | null) {
  try {
    if (u) localStorage.setItem(USER_KEY, JSON.stringify(u));
    else localStorage.removeItem(USER_KEY);
  } catch {
    /* ignore */
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const stored = readToken();
    if (!stored) {
      setLoading(false);
      return;
    }
    setToken(stored);
    const cached = readUser();
    if (cached && active) setUser(cached);
    getMe(stored)
      .then((u) => {
        if (active) {
          setUser(u);
          writeUser(u);
        }
      })
      .catch(() => {
        if (active) {
          writeToken(null);
          writeUser(null);
          setToken(null);
          setUser(null);
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const persist = useCallback((t: string, u: AuthUser) => {
    writeToken(t);
    writeUser(u);
    setToken(t);
    setUser(u);
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      const res = await apiLogin(email, password);
      persist(res.token, res.user);
    },
    [persist],
  );

  const signup = useCallback(
    async (email: string, password: string, username: string) => {
      const res = await apiSignup(email, password, username);
      persist(res.token, res.user);
    },
    [persist],
  );

  const forgotPassword = useCallback(async (email: string) => {
    await apiForgot(email);
  }, []);

  const resetPassword = useCallback(async (t: string, newPassword: string) => {
    await apiReset(t, newPassword);
  }, []);

  const logout = useCallback(() => {
    writeToken(null);
    writeUser(null);
    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      loading,
      isAuthenticated: Boolean(user && token),
      login,
      signup,
      forgotPassword,
      resetPassword,
      logout,
    }),
    [user, token, loading, login, signup, forgotPassword, resetPassword, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}

export { ApiError };

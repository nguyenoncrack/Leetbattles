import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { ApiError, tokenStore } from "../api/client";
import { AuthAPI } from "../api/endpoints";
import { signInWithGoogle, signOutFirebase } from "../lib/firebase";
import type { UserDTO } from "../types/api";

interface AuthContextValue {
  user: UserDTO | null;
  loading: boolean;
  login: (emailOrUsername: string, password: string) => Promise<void>;
  register: (data: {
    email: string;
    username: string;
    displayName: string;
    password: string;
  }) => Promise<void>;
  loginWithGoogle: () => Promise<{ created: boolean }>;
  logout: () => void;
  refresh: () => Promise<void>;
  setUser: (u: UserDTO | null) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserDTO | null>(null);
  const [loading, setLoading] = useState<boolean>(!!tokenStore.get());

  const refresh = useCallback(async () => {
    if (!tokenStore.get()) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const { user } = await AuthAPI.me();
      setUser(user);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        tokenStore.clear();
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Keep the signed-in user fresh: re-fetch on tab focus and react to token
  // changes from other tabs (sign-in / sign-out elsewhere). This makes state
  // like a freshly connected LeetCode profile survive refreshes and stay
  // consistent across multiple tabs.
  useEffect(() => {
    if (typeof window === "undefined") return;

    const onFocus = () => {
      if (tokenStore.get()) refresh();
    };
    const onVisible = () => {
      if (document.visibilityState === "visible" && tokenStore.get()) {
        refresh();
      }
    };
    const onStorage = (e: StorageEvent) => {
      if (e.key === null || e.key === "codeclash_token") {
        refresh();
      }
    };

    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("storage", onStorage);

    return () => {
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("storage", onStorage);
    };
  }, [refresh]);

  const login: AuthContextValue["login"] = useCallback(
    async (emailOrUsername, password) => {
      const { token, user } = await AuthAPI.login({ emailOrUsername, password });
      tokenStore.set(token);
      setUser(user);
      // Backend already returns a fully-hydrated user (with LeetCode profile
      // and badges), but we re-query /me in the background as a safety net
      // so e.g. a recently-awarded badge always surfaces without waiting for
      // the next focus event.
      refresh().catch(() => {});
    },
    [refresh]
  );

  const register: AuthContextValue["register"] = useCallback(
    async (data) => {
      const { token, user } = await AuthAPI.register(data);
      tokenStore.set(token);
      setUser(user);
      refresh().catch(() => {});
    },
    [refresh]
  );

  const loginWithGoogle: AuthContextValue["loginWithGoogle"] = useCallback(
    async () => {
      const { idToken } = await signInWithGoogle();
      const { token, user, created } = await AuthAPI.firebase({ idToken });
      tokenStore.set(token);
      setUser(user);
      refresh().catch(() => {});
      return { created };
    },
    [refresh]
  );

  const logout = useCallback(() => {
    tokenStore.clear();
    setUser(null);
    signOutFirebase().catch(() => {});
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      login,
      register,
      loginWithGoogle,
      logout,
      refresh,
      setUser,
    }),
    [user, loading, login, register, loginWithGoogle, logout, refresh]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}

"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { getMe, refreshToken } from "@/lib/api";

interface User {
  id: string;
  username: string;
  email: string | null;
  avatar_url: string | null;
  role: string;
  is_active: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  refreshTokenValue: string | null;
  login: (token: string, refreshTokenVal: string, user: User) => void;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [refreshTokenValue, setRefreshTokenValue] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem("access_token");
    const storedRefresh = localStorage.getItem("refresh_token");
    const storedUser = localStorage.getItem("user");

    if (storedToken && storedRefresh && storedUser) {
      setToken(storedToken);
      setRefreshTokenValue(storedRefresh);
      setUser(JSON.parse(storedUser));
      verifyToken(storedToken, storedRefresh);
    } else {
      setLoading(false);
    }
  }, []);

  async function verifyToken(tok: string, ref: string) {
    try {
      const data = await getMe(tok);
      setUser(data.data);
      localStorage.setItem("user", JSON.stringify(data.data));
    } catch {
      try {
        const data = await refreshToken(ref);
        const newToken = data.access_token;
        const newRefresh = data.refresh_token;
        setToken(newToken);
        setRefreshTokenValue(newRefresh);
        localStorage.setItem("access_token", newToken);
        localStorage.setItem("refresh_token", newRefresh);

        const meData = await getMe(newToken);
        setUser(meData.data);
        localStorage.setItem("user", JSON.stringify(meData.data));
      } catch {
        clearAuth();
      }
    } finally {
      setLoading(false);
    }
  }

  function login(tok: string, ref: string, u: User) {
    setToken(tok);
    setRefreshTokenValue(ref);
    setUser(u);
    localStorage.setItem("access_token", tok);
    localStorage.setItem("refresh_token", ref);
    localStorage.setItem("user", JSON.stringify(u));
  }

  function clearAuth() {
    setToken(null);
    setRefreshTokenValue(null);
    setUser(null);
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");
  }

  function handleLogout() {
    clearAuth();
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        refreshTokenValue,
        login,
        logout: handleLogout,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

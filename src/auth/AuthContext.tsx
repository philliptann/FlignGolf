// src/auth/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { apiGet, apiPostJson, apiPatchJson } from "../api/client";
import { saveTokens, clearTokens } from "./tokenStore";

type User = {
  id: number;
  username: string;
  email: string;
  display_name?: string;
  profile?: {
    display_name?: string;
    country?: string;
    is_player?: boolean;
    is_club_admin?: boolean;
    is_platform_admin?: boolean;
    consent_accepted?: boolean;
    consent_accepted_at?: string | null;
  };
};

type RegisterPayload = {
  username: string;
  password: string;
  consent_accepted: boolean;
  email?: string;
  display_name?: string;
  country?: string; // 2-letter, e.g. "GB"
};

type UpdateMePayload = {
  email?: string;
  display_name?: string;
  country?: string;
};

type AuthContextType = {
  user: User | null;

  /** True only during initial app bootstrap (/me check) */
  booting: boolean;

  /** True while login/register/update is in progress (use for button spinners/disable) */
  authBusy: boolean;

  login: (username: string, password: string) => Promise<void>;
  register: (data: RegisterPayload) => Promise<void>;
  
  updateMe: (data: {
  email?: string;
  first_name?: string;
  last_name?: string;
  display_name?: string;
  country?: string;
}) => Promise<void>;

  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [booting, setBooting] = useState(true);
  const [authBusy, setAuthBusy] = useState(false);

  // Debug (optional)
  useEffect(() => {
    console.log("AUTH state:", {
      booting,
      authBusy,
      user: user?.username ?? null,
    });
  }, [booting, authBusy, user]);

  // Bootstrap
  useEffect(() => {
    apiGet<User>("/api/auth/me/")
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setBooting(false));
  }, []);

  async function login(username: string, password: string) {
    setAuthBusy(true);
    try {
      const tokens = await apiPostJson<{ access: string; refresh: string }>(
        "/api/auth/login/",
        { username, password }
      );

      await saveTokens(tokens.access, tokens.refresh);

      const me = await apiGet<User>("/api/auth/me/");
      setUser(me);
    } finally {
      setAuthBusy(false);
    }
  }

  async function register(data: RegisterPayload) {
    setAuthBusy(true);
    try {
      // Create user
      await apiPostJson("/api/auth/register/", data);

      // Auto-login
      const tokens = await apiPostJson<{ access: string; refresh: string }>(
        "/api/auth/login/",
        { username: data.username, password: data.password }
      );

      await saveTokens(tokens.access, tokens.refresh);

      const me = await apiGet<User>("/api/auth/me/");
      setUser(me);
    } finally {
      setAuthBusy(false);
    }
  }

  async function updateMe(data: UpdateMePayload) {
    setAuthBusy(true);
    try {
      const updated = await apiPatchJson<User>("/api/auth/me/", data);
      setUser(updated);
    } finally {
      setAuthBusy(false);
    }
  }

  async function logout() {
    setAuthBusy(true);
    try {
      await clearTokens();
      setUser(null);
    } finally {
      setAuthBusy(false);
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        booting,
        authBusy,
        login,
        register,
        updateMe,
        logout,
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

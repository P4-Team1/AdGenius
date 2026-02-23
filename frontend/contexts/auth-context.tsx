"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useRouter } from "next/navigation";
import { authAPI } from "@/lib/api";
import type { User } from "@/types";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: {
    username: string;
    email: string;
    password: string;
    business_type: string;
  }) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 앱 시작 시 토큰 확인하여 로그인 상태 복원
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    const savedUser = localStorage.getItem("user");

    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("user");
      }
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      const result = await authAPI.login(email, password);

      localStorage.setItem("access_token", result.access_token);
      if (result.refresh_token) {
        localStorage.setItem("refresh_token", result.refresh_token);
      }

      const userInfo = await authAPI.getMe();
      const userData: User = {
        id: userInfo.id,
        username: userInfo.username,
        email: userInfo.email,
        business_type: userInfo.business_type,
        is_verified: userInfo.is_verified,
        is_active: userInfo.is_active,
      };

      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);
      router.push("/");
    },
    [router],
  );

  const register = useCallback(
    async (userData: {
      username: string;
      email: string;
      password: string;
      business_type: string;
    }) => {
      await authAPI.register(userData);
      router.push("/login");
    },
    [router],
  );

  const logout = useCallback(() => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");
    setUser(null);
    router.push("/");
  }, [router]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        register,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth는 AuthProvider 안에서 사용해야 합니다");
  }
  return context;
}

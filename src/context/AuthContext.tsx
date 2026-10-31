import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types/index.ts';
import { api, getStoredToken, setStoredToken, removeStoredToken } from '../services/api.ts';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  register: (data: { name: string; email: string; password: string; phone?: string }) => Promise<void>;
  logout: () => void;
  demoLogin: (role: UserRole) => Promise<void>;
  refreshUser: () => Promise<void>;
  isAdmin: boolean;
  isModerator: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchCurrentUser = async () => {
    const token = getStoredToken();
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const res = await api.auth.getMe();
      if (res.success && res.user) {
        setUser(res.user);
      } else {
        removeStoredToken();
        setUser(null);
      }
    } catch {
      removeStoredToken();
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const login = async (credentials: { email: string; password: string }) => {
    const res = await api.auth.login(credentials);
    if (res.token) {
      setStoredToken(res.token);
      setUser(res.user);
    }
  };

  const register = async (data: { name: string; email: string; password: string; phone?: string }) => {
    const res = await api.auth.register(data);
    if (res.token) {
      setStoredToken(res.token);
      setUser(res.user);
    }
  };

  const logout = () => {
    removeStoredToken();
    setUser(null);
    api.auth.logout().catch(() => {});
  };

  const demoLogin = async (role: UserRole) => {
    let email = 'rahim@example.com';
    let password = 'user123456';

    if (role === 'admin') {
      email = 'admin@scamalertbd.com';
      password = 'admin123456';
    } else if (role === 'moderator') {
      email = 'moderator@scamalertbd.com';
      password = 'moderator123456';
    }

    await login({ email, password });
  };

  const refreshUser = async () => {
    await fetchCurrentUser();
  };

  const isAdmin = user?.role === 'admin';
  const isModerator = user?.role === 'moderator' || user?.role === 'admin';
  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        demoLogin,
        refreshUser,
        isAdmin,
        isModerator,
        isAuthenticated,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

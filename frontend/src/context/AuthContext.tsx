import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, getAuthToken, setAuthToken, clearAuthToken, getStoredUser, setStoredUser } from '../api/client';

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: 'citizen' | 'facilitator' | 'authority' | 'admin';
  phone?: string;
  preferred_language?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  demoLogin: (role: 'citizen' | 'facilitator' | 'authority' | 'admin') => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(getStoredUser());
  const [token, setToken] = useState<string | null>(getAuthToken());
  const [loading, setLoading] = useState<boolean>(true);

  const refreshUser = async () => {
    try {
      const data = await api.me();
      if (data && data.user) {
        setUser(data.user);
        setStoredUser(data.user);
      }
    } catch {
      logout();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      refreshUser();
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const res = await api.login({ email, password });
      setAuthToken(res.access_token);
      setToken(res.access_token);
      setUser(res.user);
      setStoredUser(res.user);
    } finally {
      setLoading(false);
    }
  };

  const demoLogin = async (role: 'citizen' | 'facilitator' | 'authority' | 'admin') => {
    const credentials = {
      citizen: { email: 'citizen@gramsaksham.in', password: 'Citizen@123' },
      facilitator: { email: 'facilitator@gramsaksham.in', password: 'Facilitator@123' },
      authority: { email: 'authority@gramsaksham.in', password: 'Authority@123' },
      admin: { email: 'admin@gramsaksham.in', password: 'Admin@123' },
    };
    const cred = credentials[role];
    await login(cred.email, cred.password);
  };

  const register = async (data: any) => {
    setLoading(true);
    try {
      const res = await api.register(data);
      setAuthToken(res.access_token);
      setToken(res.access_token);
      setUser(res.user);
      setStoredUser(res.user);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    clearAuthToken();
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        demoLogin,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

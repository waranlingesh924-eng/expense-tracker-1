import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isAdmin: boolean;
  login: (identifier: string, pass: string) => Promise<void>;
  register: (data: { username: string; email: string; password: string; fullName: string; phone?: string; occupation?: string }) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<void>;
  setCurrency: (code: string) => Promise<void>;
  switchUser: (role: 'user' | 'admin') => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEMO_USER: User = {
  id: 'usr-demo-1',
  username: 'alex_morgan',
  email: 'alex.morgan@example.com',
  fullName: 'Alex Morgan',
  role: 'user',
  avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
  currency: 'USD',
  createdAt: '2026-08-15T12:30:00Z',
  isActive: true,
  phone: '+1 (555) 438-9921',
  occupation: 'Senior Product Designer'
};

const DEMO_ADMIN: User = {
  id: 'usr-admin-1',
  username: 'admin',
  email: 'admin@fintrack.io',
  fullName: 'System Administrator',
  role: 'admin',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  currency: 'USD',
  createdAt: '2026-08-01T10:00:00Z',
  isActive: true,
  phone: '+1 (555) 019-2834',
  occupation: 'Lead Solutions Architect'
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('fintrack_user');
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return DEMO_USER;
  });

  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('fintrack_token') || 'demo-auth-token-12345';
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (user) {
      localStorage.setItem('fintrack_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('fintrack_user');
    }
  }, [user]);

  useEffect(() => {
    if (token) {
      localStorage.setItem('fintrack_token', token);
    } else {
      localStorage.removeItem('fintrack_token');
    }
  }, [token]);

  const login = async (identifier: string, pass: string) => {
    setIsLoading(true);
    try {
      const res = await api.login(identifier, pass);
      setUser(res.user);
      setToken(res.token);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: { username: string; email: string; password: string; fullName: string; phone?: string; occupation?: string }) => {
    setIsLoading(true);
    try {
      const res = await api.register(data);
      setUser(res.user);
      setToken(res.token);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('fintrack_user');
    localStorage.removeItem('fintrack_token');
  };

  const updateProfile = async (data: Partial<User>) => {
    const res = await api.updateProfile(data);
    setUser(res.user);
  };

  const setCurrency = async (code: string) => {
    if (user) {
      const updatedUser = { ...user, currency: code };
      setUser(updatedUser);
      localStorage.setItem('fintrack_user', JSON.stringify(updatedUser));
      try {
        await api.updateProfile({ currency: code });
      } catch (e) {
        console.warn('Failed to sync currency to server:', e);
      }
    }
  };

  const switchUser = (role: 'user' | 'admin') => {
    if (role === 'admin') {
      setUser(DEMO_ADMIN);
      setToken('admin-token-xyz');
    } else {
      setUser(DEMO_USER);
      setToken('demo-auth-token-12345');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        isAdmin: user?.role === 'admin',
        login,
        register,
        logout,
        updateProfile,
        setCurrency,
        switchUser
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

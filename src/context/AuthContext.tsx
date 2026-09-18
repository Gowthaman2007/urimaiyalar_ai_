import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Business } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  business: Business | null;
  token: string | null;
  loading: boolean;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, pass: string) => Promise<void>;
  loginDemo: () => Promise<void>;
  loginAsDemo: () => Promise<void>;
  register: (nameOrData: any, email?: string, pass?: string, businessName?: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  updateBusinessProfile: (data: Partial<Business>) => Promise<void>;
  updateBusiness: (data: Partial<Business>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  business: null,
  token: null,
  loading: true,
  isLoading: true,
  isAuthenticated: false,
  login: async () => {},
  loginDemo: async () => {},
  loginAsDemo: async () => {},
  register: async () => {},
  logout: () => {},
  refreshUser: async () => {},
  updateBusinessProfile: async () => {},
  updateBusiness: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [business, setBusiness] = useState<Business | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('urimaiyalar_token'));
  const [loading, setLoading] = useState<boolean>(true);

  const refreshUser = async () => {
    try {
      if (!localStorage.getItem('urimaiyalar_token')) {
        setUser(null);
        setBusiness(null);
        setLoading(false);
        return;
      }
      const data = await api.getMe();
      setUser(data.user);
      setBusiness(data.business);
    } catch (err) {
      console.warn('Session check failed, clearing token.');
      localStorage.removeItem('urimaiyalar_token');
      setUser(null);
      setBusiness(null);
      setToken(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (email: string, pass: string) => {
    const data = await api.login({ email, password: pass });
    localStorage.setItem('urimaiyalar_token', data.token);
    setToken(data.token);
    setUser(data.user);
    setBusiness(data.business);
  };

  const loginDemo = async () => {
    await login('demo@urimaiyalar.ai', 'password123');
  };

  const register = async (nameOrData: any, email?: string, pass?: string, businessName?: string) => {
    const payload =
      typeof nameOrData === 'object'
        ? nameOrData
        : {
            name: nameOrData,
            email,
            password: pass,
            businessName,
          };
    const data = await api.register(payload);
    localStorage.setItem('urimaiyalar_token', data.token);
    setToken(data.token);
    setUser(data.user);
    setBusiness(data.business);
  };

  const logout = () => {
    localStorage.removeItem('urimaiyalar_token');
    setToken(null);
    setUser(null);
    setBusiness(null);
  };

  const updateBusinessProfile = async (data: Partial<Business>) => {
    const updated = await api.updateBusiness(data);
    setBusiness(updated);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        business,
        token,
        loading,
        isLoading: loading,
        isAuthenticated: !!user,
        login,
        loginDemo,
        loginAsDemo: loginDemo,
        register,
        logout,
        refreshUser,
        updateBusinessProfile,
        updateBusiness: updateBusinessProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

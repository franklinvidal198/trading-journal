import { useState, useEffect, createContext, useContext } from 'react';
import { authAPI, User } from '@/lib/api';
import { toast } from 'sonner';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

import React from 'react';
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      authAPI.getProfile()
        .then(setUser)
        .catch(() => {
          localStorage.removeItem('token');
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await authAPI.login(email, password);
      localStorage.setItem('token', response.access_token);
      const user = await authAPI.getProfile();
      setUser(user);
      toast.success('Welcome back!', {
        description: 'You have successfully logged in.',
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || 'Invalid credentials';
      toast.error('Login failed', {
        description: errorMessage,
      });
      throw error;
    }
  };

  // ...existing code...
    const signup = async (name: string, email: string, password: string) => {
      try {
        const response = await authAPI.signup(name, email, password);
        localStorage.setItem('token', response.access_token);
        const user = await authAPI.getProfile();
        setUser(user);
        toast.success('Account created!', {
          description: 'Welcome to TradeJournal 2090.',
        });
      } catch (error: any) {
        const errorMessage = error.response?.data?.detail || 'Failed to create account';
        toast.error('Signup failed', {
          description: errorMessage,
        });
        throw error;
      }
    };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    toast.success('Logged out', {
      description: 'You have been successfully logged out.',
    });
  };

  return React.createElement(
    AuthContext.Provider,
    {
      value: {
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        signup,
        logout,
      }
    },
    children
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
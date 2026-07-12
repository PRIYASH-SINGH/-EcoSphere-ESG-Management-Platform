import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { authService } from '../services/authService';
import type { SafeUser } from '../services/authService';

interface AuthContextType {
  user: SafeUser | null;
  token: string | null;
  login: (token: string, user: SafeUser) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const mockUser: SafeUser = {
    id: 1,
    email: 'admin@ecosphere.com',
    name: 'Admin User',
    role: 'admin',
    departmentId: 1
  };

  const [user, setUser] = useState<SafeUser | null>(mockUser);
  const [token, setToken] = useState<string | null>('dummy_token');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Skipped actual auth fetching to bypass login
  }, []);

  const login = (newToken: string, newUser: SafeUser) => {
    localStorage.setItem('esg_token', newToken);
    localStorage.setItem('esg_user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  };

  const logout = () => {
    localStorage.removeItem('esg_token');
    localStorage.removeItem('esg_user');
    setToken(null);
    setUser(null);
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

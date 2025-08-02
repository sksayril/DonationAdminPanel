import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import apiService from '../services/apiService';

interface AdminData {
  id: string;
  adminId: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  permissions: string[];
}

interface AuthContextType {
  isAuthenticated: boolean;
  adminData: AdminData | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminData, setAdminData] = useState<AdminData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state - but don't auto-login from stored data
  useEffect(() => {
    const initializeAuth = () => {
      // Always start with unauthenticated state
      // User must manually login each time
      setIsAuthenticated(false);
      setAdminData(null);
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await apiService.login(email, password);
      
      console.log('AuthContext - Login response:', response); // Debug log
      
      if (response.success && response.data) {
        console.log('AuthContext - Setting authenticated state'); // Debug log
        setIsAuthenticated(true);
        setAdminData(response.data.admin);
        return { success: true };
      } else {
        console.log('AuthContext - Login failed:', response.error); // Debug log
        return { success: false, error: response.error || 'Login failed' };
      }
    } catch (error) {
      console.error('AuthContext - Login error:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  };

  const logout = () => {
    apiService.logout();
    setIsAuthenticated(false);
    setAdminData(null);
  };

  const contextValue: AuthContextType = {
    isAuthenticated,
    adminData,
    login,
    logout,
    isLoading,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
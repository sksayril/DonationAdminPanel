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

  // Initialize auth state - check for existing token and admin data
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = apiService.getStoredToken();
        const storedAdminData = apiService.getStoredAdminData();
        
        console.log('Initializing auth - Token exists:', !!token);
        console.log('Initializing auth - Admin data exists:', !!storedAdminData);
        
        if (token && storedAdminData) {
          // Verify the token is still valid by making a test API call
          try {
            const response = await apiService.getAdminProfile();
            
            if (response.success) {
              // Token is valid, restore the session
              console.log('Token is valid, restoring session');
              setIsAuthenticated(true);
              setAdminData(storedAdminData);
            } else {
              // Token is invalid, clear stored data
              console.log('Token is invalid, clearing stored data');
              apiService.removeAuthToken();
              setIsAuthenticated(false);
              setAdminData(null);
            }
          } catch (error) {
            // API call failed, assume token is invalid
            console.error('Token validation failed:', error);
            apiService.removeAuthToken();
            setIsAuthenticated(false);
            setAdminData(null);
          }
        } else {
          // No token or admin data, user needs to login
          console.log('No token or admin data found, user needs to login');
          setIsAuthenticated(false);
          setAdminData(null);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        setIsAuthenticated(false);
        setAdminData(null);
      } finally {
        setIsLoading(false);
      }
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
    console.log('User explicitly logged out');
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
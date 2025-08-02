// API Service Configuration
// Base URL for the Express backend server
const BASE_URL = 'https://7cvccltb-3100.inc1.devtunnels.ms/api/admin';

// API endpoints configuration
const API_ENDPOINTS = {
  // Authentication endpoints
  auth: {
    login: '/login',
    logout: '/logout',
    verify: '/verify',
  },
  
  // Admin endpoints
  admin: {
    profile: '/profile',
  },
  
  // Student management endpoints
  students: {
    getAll: '/api/students',
    getById: '/api/students/:id',
    create: '/api/students',
    update: '/api/students/:id',
    delete: '/api/students/:id',
    search: '/api/students/search',
  },
  
  // Dashboard endpoints
  dashboard: {
    getStats: '/api/dashboard/stats',
    getRecentActivities: '/api/dashboard/activities',
  },
};

// Response interface matching the API structure
interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    admin: {
      id: string;
      adminId: string;
      firstName: string;
      lastName: string;
      email: string;
      role: string;
      permissions: string[];
    };
    token: string;
  };
}

// Generic API response interface
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// HTTP request methods
type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

// API request configuration interface
interface ApiRequestConfig {
  method?: HttpMethod;
  headers?: Record<string, string>;
  body?: any;
}

// Main API service class
class ApiService {
  private baseUrl: string;
  private defaultHeaders: Record<string, string>;

  constructor() {
    this.baseUrl = BASE_URL;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
  }

  // Set authorization token
  setAuthToken(token: string): void {
    this.defaultHeaders['Authorization'] = `Bearer ${token}`;
    // Store token in localStorage
    localStorage.setItem('authToken', token);
  }

  // Remove authorization token
  removeAuthToken(): void {
    delete this.defaultHeaders['Authorization'];
    // Remove token from localStorage
    localStorage.removeItem('authToken');
    localStorage.removeItem('adminData');
  }

  // Get stored auth token
  getStoredToken(): string | null {
    return localStorage.getItem('authToken');
  }

  // Initialize auth token from localStorage
  initializeAuth(): void {
    const token = this.getStoredToken();
    if (token) {
      this.defaultHeaders['Authorization'] = `Bearer ${token}`;
    }
  }

  // Store admin data in localStorage
  storeAdminData(adminData: any): void {
    localStorage.setItem('adminData', JSON.stringify(adminData));
  }

  // Get stored admin data
  getStoredAdminData(): any | null {
    const data = localStorage.getItem('adminData');
    return data ? JSON.parse(data) : null;
  }

  // Generic request method
  private async request<T = any>(
    endpoint: string,
    config: ApiRequestConfig = {}
  ): Promise<ApiResponse<T>> {
    try {
      const {
        method = 'GET',
        headers = {},
        body,
      } = config;

      const url = `${this.baseUrl}${endpoint}`;
      const requestHeaders = { ...this.defaultHeaders, ...headers };

      const requestConfig: RequestInit = {
        method,
        headers: requestHeaders,
      };

      // Add body for non-GET requests
      if (body && method !== 'GET') {
        if (body instanceof FormData) {
          // Remove Content-Type header for FormData (browser will set it)
          delete requestHeaders['Content-Type'];
          requestConfig.body = body;
        } else {
          requestConfig.body = JSON.stringify(body);
        }
      }

      const response = await fetch(url, requestConfig);
      
      // Handle different response types
      let responseData;
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        responseData = await response.json();
      } else {
        responseData = await response.text();
      }

      if (!response.ok) {
        return {
          success: false,
          error: responseData.message || responseData || 'Request failed',
        };
      }

      return {
        success: true,
        data: responseData,
        message: responseData.message,
      };
    } catch (error) {
      console.error('API Request Error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error occurred',
      };
    }
  }

  // Convenience methods for different HTTP methods
  async get<T = any>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T = any>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'POST', body });
  }

  async put<T = any>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'PUT', body });
  }

  async delete<T = any>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  // Authentication methods
  async login(email: string, password: string): Promise<ApiResponse<LoginResponse['data']>> {
    const response = await this.post(API_ENDPOINTS.auth.login, {
      email,
      password
    });

    console.log('Login API Response:', response); // Debug log

    if (response.success && response.data) {
      // The API response structure is: { success, message, data: { admin, token } }
      const loginData = response.data as LoginResponse;
      
      // Check if we have the login data structure
      if (loginData.success && loginData.data && loginData.data.token && loginData.data.admin) {
        // Store token and admin data
        this.setAuthToken(loginData.data.token);
        this.storeAdminData(loginData.data.admin);
        
        console.log('Login successful, token stored:', loginData.data.token); // Debug log
        
        // Return the data part of the response
        return {
          success: true,
          data: loginData.data,
          message: loginData.message
        };
      }
    }

    console.log('Login failed, response:', response); // Debug log
    return {
      success: false,
      error: response.error || 'Login failed'
    };
  }

  async logout(): Promise<void> {
    try {
      // Call logout endpoint if it exists
      await this.post(API_ENDPOINTS.auth.logout);
    } catch (error) {
      console.error('Logout API call failed:', error);
    } finally {
      // Always remove local auth data
      this.removeAuthToken();
    }
  }

  // Get admin profile
  async getAdminProfile(): Promise<ApiResponse<any>> {
    return this.get(API_ENDPOINTS.admin.profile);
  }

  // Get all students
  async getAllStudents(): Promise<ApiResponse<any>> {
    return this.get('/students');
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    const token = this.getStoredToken();
    const adminData = this.getStoredAdminData();
    return !!(token && adminData);
  }
}

// Create and export API service instance
export const apiService = new ApiService();

// Initialize auth on app load
apiService.initializeAuth();

// Export API endpoints for easy access
export { API_ENDPOINTS };

// Export types
export type { ApiResponse, LoginResponse };

// Default export
export default apiService;
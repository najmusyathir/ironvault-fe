import { RegisterRequest, LoginRequest, AuthResponse, ApiError, User } from '@/types/auth';

// API base URL - configurable via environment variable
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

// Device detection for session tracking
const getDeviceInfo = (): string => {
  const userAgent = navigator.userAgent;
  const platform = navigator.platform;

  if (userAgent.includes('Windows')) return `Windows (${platform})`;
  if (userAgent.includes('Mac')) return `Mac (${platform})`;
  if (userAgent.includes('Linux')) return `Linux (${platform})`;
  if (userAgent.includes('Android')) return `Android (${platform})`;
  if (userAgent.includes('iPhone') || userAgent.includes('iPad')) return `iOS (${platform})`;

  return `Unknown (${platform})`;
};

// Token management
export const getToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('auth_token');
  }
  return null;
};

export const setToken = (token: string): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('auth_token', token);
  }
};

export const removeToken = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('auth_token');
  }
};

export const getUser = (): User | null => {
  if (typeof window !== 'undefined') {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }
  return null;
};

export const setUser = (user: User): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('user', JSON.stringify(user));
  }
};

export const removeUser = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('user');
  }
};

// API request helper
class ApiClient {
  private baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;

    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // Add authorization header if token exists
    const token = getToken();
    if (token) {
      config.headers = {
        ...config.headers,
        'Authorization': `Bearer ${token}`,
      };
    }

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const error: ApiError = {
          message: errorData.message || `HTTP error! status: ${response.status}`,
          field: errorData.field,
          code: errorData.code,
        };
        throw error;
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw { message: error.message } as ApiError;
      }
      throw error;
    }
  }

  async post<T>(endpoint: string, data: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'GET',
    });
  }

  async put<T>(endpoint: string, data: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
    });
  }
}

// Create API client instance
const api = new ApiClient();

// Auth API functions
export const authApi = {
  // Register user
  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const registerData = {
      ...data,
      device: data.device || getDeviceInfo(),
    };

    const response = await api.post<AuthResponse>('/users/register', registerData);

    // Store token and user data
    setToken(response.access_token);
    setUser(response.user);

    return response;
  },

  // Login user
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const loginData = {
      ...data,
      device: data.device || getDeviceInfo(),
    };

    const response = await api.post<AuthResponse>('/users/login', loginData);

    // Store token and user data
    setToken(response.access_token);
    setUser(response.user);

    return response;
  },

  // Logout user
  logout: async (): Promise<void> => {
    try {
      await api.post('/users/logout', {});
    } catch (error) {
      // Even if logout fails on server, clear local storage
      console.error('Logout error:', error);
    } finally {
      removeToken();
      removeUser();
    }
  },

  // Get current user
  getCurrentUser: async (): Promise<User> => {
    return api.get<User>('/users/me');
  },

  // Refresh token
  refreshToken: async (): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/users/refresh', {});
    setToken(response.access_token);
    setUser(response.user);
    return response;
  },

  // Get all users (superadmin only)
  getAllUsers: async () => {
    return api.get('/users/list');
  },
};

// Form validation helpers
export const validationHelpers = {
  // Email validation
  isValidEmail: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  // Simple password validation - basic length requirement
  isStrongPassword: (password: string): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (!password || password.trim() === '') {
      errors.push('Password is required');
    } else if (password.length < 3) {
      errors.push('Password must be at least 3 characters long');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  },

  // Username validation
  isValidUsername: (username: string): boolean => {
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    return usernameRegex.test(username);
  },

  // Phone validation
  isValidPhone: (phone: string): boolean => {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
  },

  // NRIC validation (Malaysian format)
  isValidNRIC: (nric: string): boolean => {
    const nricRegex = /^[0-9]{6}[0-9]{2}[0-9]$/;
    return nricRegex.test(nric.replace(/[\s\-]/g, ''));
  },
};

export default api;
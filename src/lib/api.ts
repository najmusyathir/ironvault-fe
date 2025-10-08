import { RegisterRequest, LoginRequest, AuthResponse, ApiError, User } from '@/types/auth';
import { UpdateRoomRequest } from '@/types/rooms';
import {
  RoomFile,
  FileUploadRequest,
  FileUploadResponse,
  FileListResponse,
  FileSearchFilters,
  FileDownloadResponse,
  FileDeleteRequest,
  FileDeleteResponse,
  FileStats
} from '@/types/files';

// API base URL - configurable via environment variable
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

// Device detection for session tracking
const getDeviceInfo = (): string => {
  if (typeof window === 'undefined' || !navigator) {
    return 'Unknown (Server)';
  }

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

    // Authorization is now optional - only add header if token exists
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

  async patch<T>(endpoint: string, data: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
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
  logout: (): void => {
    // Simply clear local storage - no API call needed
    removeToken();
    removeUser();
  },

  // Get current user
  getCurrentUser: async (): Promise<User> => {
    return api.get<User>('/users/me');
  },

  // Update profile
  updateProfile: async (data: Partial<User>): Promise<User> => {
    const response = await api.put<User>('/users/me', data);
    setUser(response);
    return response;
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

  // Update any user (superadmin only)
  updateUser: async (userId: number, data: Partial<User>) => {
    return api.put(`/users/${userId}`, data);
  },

  // Room management functions
  getRooms: async () => {
    return api.get('/rooms/');
  },

  createRoom: async (data: { name: string; description?: string; max_members: number }) => {
    return api.post('/rooms/', data);
  },

  getRoomDetails: async (roomId: number) => {
    return api.get(`/rooms/${roomId}`);
  },

  updateRoom: async (roomId: number, data: UpdateRoomRequest) => {
    return api.put(`/rooms/${roomId}`, data);
  },

  createRoomInvite: async (roomId: number, data: { invitee_email: string; message?: string }) => {
    return api.post(`/rooms/${roomId}/invite`, data);
  },

  // Create invite code (new endpoint)
  createRoomInviteCode: async (roomId: number, data: { max_uses?: number; expires_hours?: number }) => {
    return api.post(`/rooms/${roomId}/invite-codes`, data);
  },

  // Get room invite codes (new endpoint)
  getRoomInviteCodes: async (roomId: number) => {
    return api.get(`/rooms/${roomId}/invite-codes`);
  },

  // Join room with invite code
  joinRoom: async (inviteCode: string) => {
    return api.post(`/rooms/join/${inviteCode}`, {});
  },

  // Room member management functions
  getRoomMembers: async (roomId: number) => {
    return api.get(`/rooms/${roomId}/members`);
  },

  addMember: async (roomId: number, userId: number) => {
    return api.post(`/rooms/${roomId}/members`, { user_id: userId });
  },

  removeMember: async (roomId: number, userId: number) => {
    return api.delete(`/rooms/${roomId}/members/${userId}`);
  },

  // Invitation management functions (not implemented yet in backend)
  // acceptInvitation: async (invitationId: number) => {
  //   return api.post(`/rooms/invitations/${invitationId}/accept`);
  // },

  // rejectInvitation: async (invitationId: number) => {
  //   return api.post(`/rooms/invitations/${invitationId}/reject`);
  // },

  getReceivedInvitations: async () => {
    return api.get('/rooms/invitations/received');
  },

  // Room management functions
  deleteRoom: async (roomId: number) => {
    return api.delete(`/rooms/${roomId}`);
  },

  // File management functions
  uploadFile: async (roomId: number, file: File, description?: string, isEncrypted?: boolean, visibility?: "private" | "public"): Promise<FileUploadResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    if (description) formData.append('description', description);
    if (isEncrypted) formData.append('is_encrypted', isEncrypted.toString());
    if (visibility) formData.append('visibility', visibility);

    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/rooms/${roomId}/files/`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });

    if (!response.ok) throw await response.json();
    return await response.json();
  },


  getRoomFiles: async (roomId: number, filters?: FileSearchFilters): Promise<FileListResponse> => {
    const params = new URLSearchParams();

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });
    }

    const queryString = params.toString();
    const endpoint = `/rooms/${roomId}/files${queryString ? `?${queryString}` : ''}`;

    return api.get(endpoint);
  },

  downloadFile: async (roomId: number, fileId: number): Promise<FileDownloadResponse> => {
    return api.get(`/rooms/${roomId}/files/${fileId}/download`);
  },

  deleteFile: async (roomId: number, fileId: number): Promise<{ message: string }> => {
    return api.delete(`/rooms/${roomId}/files/${fileId}`);
  },

  bulkDeleteFiles: async (roomId: number, fileIds: number[]): Promise<FileDeleteResponse> => {
    return api.post(`/rooms/${roomId}/files/bulk-delete`, { file_ids: fileIds });
  },

  getRoomFileStats: async (roomId: number): Promise<FileStats> => {
    return api.get(`/rooms/${roomId}/files/stats`);
  },

  toggleFileVisibility: async (roomId: number, fileId: number, visibility: "private" | "public"): Promise<{message: string; file_id: number; visibility: string}> => {
    return api.patch(`/rooms/${roomId}/files/${fileId}/visibility`, { visibility });
  },

  // Delete invite code
  deleteInviteCode: async (roomId: number, codeId: number): Promise<{ message: string }> => {
    return api.delete(`/rooms/${roomId}/invite-codes/${codeId}`);
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

// Public API functions (no authentication required)
export const publicApi = {
  // Get all rooms (public access)
  getRooms: async () => {
    return api.get('/rooms/');
  },

  // Get room details (public access)
  getRoomDetails: async (roomId: number) => {
    return api.get(`/rooms/${roomId}`);
  },

  // Join room with invite code (public access)
  joinRoom: async (inviteCode: string) => {
    return api.post(`/rooms/join/${inviteCode}`, {});
  },
};

export default api;
export { api };
// Auth types for Iron Vault application

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  phone?: string;
  full_name: string;
  nickname?: string;
  nric?: string;
  birth_date?: string;
  device?: string;
}

export interface LoginRequest {
  username?: string;
  email?: string;
  password: string;
  device?: string;
}

export interface AuthResponse {
  message: string;
  access_token: string;
  token_type: string;
  user: User;
}

export interface User {
  id: number;
  username: string;
  email: string;
  phone?: string;
  full_name: string;
  nickname?: string;
  nric?: string;
  birth_date?: string;
  role: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ApiError {
  message: string;
  field?: string;
  code?: string;
}

export interface FormState {
  isLoading: boolean;
  error: string | null;
  success: string | null;
}

export interface RegisterFormState extends FormState {
  formData: RegisterRequest;
  formErrors: Partial<Record<keyof RegisterRequest, string>>;
}

export interface LoginFormState extends FormState {
  formData: LoginRequest;
  formErrors: Partial<Record<keyof LoginRequest, string>>;
}
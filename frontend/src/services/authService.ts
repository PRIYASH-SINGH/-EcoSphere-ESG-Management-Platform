import api from './api';

export interface LoginPayload { email: string; password: string; }
export interface SignupPayload { email: string; password: string; name: string; }
export interface SafeUser {
  id: number; email: string; name: string;
  role: string; departmentId: number | null;
  totalXp: number; isActive: boolean;
  createdAt: string; updatedAt: string;
}
export interface AuthResponse { token: string; user: SafeUser; }

export const authService = {
  login:      (data: LoginPayload)  => api.post<{ success: boolean; data: AuthResponse }>('/auth/login', data),
  signup:     (data: SignupPayload) => api.post<{ success: boolean; data: SafeUser }>('/auth/signup', data),
  getProfile: ()                    => api.get<{ success: boolean; data: SafeUser }>('/auth/profile'),
};

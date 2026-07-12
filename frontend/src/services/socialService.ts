import api from './api';

export interface CsrActivity {
  id: number;
  title: string;
  description: string;
  categoryId: number | null;
  startDate: string;
  endDate: string;
  status: string;
  createdAt: string;
}

export interface EmployeeParticipation {
  id: number;
  userId: number;
  csrActivityId: number;
  proof: string | null;
  status: string;
  pointsEarned: number;
  approvedBy: number | null;
  createdAt: string;
}

export const socialService = {
  getActivities: () => api.get<{ success: boolean; data: CsrActivity[] }>('/social/csr-activities'),
  createActivity: (data: Partial<CsrActivity>) => api.post<{ success: boolean; data: CsrActivity }>('/social/csr-activities', data),
  getParticipations: () => api.get<{ success: boolean; data: EmployeeParticipation[] }>('/social/participations'),
  participate: (data: { csrActivityId: number; proof?: string }) => api.post<{ success: boolean; data: EmployeeParticipation }>('/social/participate', data),
};

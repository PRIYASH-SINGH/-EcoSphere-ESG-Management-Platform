import api from './api';

export interface EnvironmentalGoal {
  id: number;
  title: string;
  targetValue: number;
  currentValue: number;
  departmentId: number;
  deadline: string;
  status: string;
  createdAt: string;
}

export interface CarbonTransaction {
  id: number;
  source: string;
  emissionFactorId: number;
  value: number;
  carbonEmitted: number;
  departmentId: number;
  date: string;
  createdBy: number;
  createdAt: string;
}

export const environmentalService = {
  getGoals: () => api.get<{ success: boolean; data: EnvironmentalGoal[] }>('/environmental/goals'),
  createGoal: (data: Partial<EnvironmentalGoal>) => api.post<{ success: boolean; data: EnvironmentalGoal }>('/environmental/goals', data),
  getTransactions: () => api.get<{ success: boolean; data: CarbonTransaction[] }>('/environmental/transactions'),
  logTransaction: (data: Partial<CarbonTransaction>) => api.post<{ success: boolean; data: CarbonTransaction }>('/environmental/transactions', data),
};

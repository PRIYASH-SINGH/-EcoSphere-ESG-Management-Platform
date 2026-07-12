import api from './api';

export const reportsService = {
  getDashboardScores: (departmentId?: number) => {
    const params = departmentId ? { departmentId } : {};
    return api.get<{ success: boolean; data: any[] }>('/reports/department-scores', { params });
  }
};

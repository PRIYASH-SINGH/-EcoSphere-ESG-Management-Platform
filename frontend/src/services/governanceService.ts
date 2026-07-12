import api from './api';

export interface Audit {
  id: number;
  title: string;
  departmentId: number;
  auditor: string;
  auditDate: string;
  findings: string | null;
  status: string;
  createdAt: string;
}

export interface ComplianceIssue {
  id: number;
  auditId: number | null;
  severity: string;
  description: string;
  owner: string;
  dueDate: string;
  status: string;
  createdAt: string;
}

export const governanceService = {
  getAudits: () => api.get<{ success: boolean; data: Audit[] }>('/governance/audits'),
  createAudit: (data: Partial<Audit>) => api.post<{ success: boolean; data: Audit }>('/governance/audits', data),
  getIssues: () => api.get<{ success: boolean; data: ComplianceIssue[] }>('/governance/compliance-issues'),
  createIssue: (data: Partial<ComplianceIssue>) => api.post<{ success: boolean; data: ComplianceIssue }>('/governance/compliance-issues', data),
};

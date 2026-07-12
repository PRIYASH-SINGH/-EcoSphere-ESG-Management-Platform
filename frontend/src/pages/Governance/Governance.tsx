import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { governanceService, Audit, ComplianceIssue } from '../../services/governanceService';
import toast from 'react-hot-toast';

export function Governance() {
  const queryClient = useQueryClient();

  // Queries
  const { data: auditsData, isLoading: loadingAudits } = useQuery({
    queryKey: ['audits'],
    queryFn: async () => {
      const res = await governanceService.getAudits();
      return res.data.data;
    }
  });

  const { data: issuesData, isLoading: loadingIssues } = useQuery({
    queryKey: ['complianceIssues'],
    queryFn: async () => {
      const res = await governanceService.getIssues();
      return res.data.data;
    }
  });

  // Mutations
  const createAuditMutation = useMutation({
    mutationFn: (data: Partial<Audit>) => governanceService.createAudit(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['audits'] });
      toast.success('Audit created successfully');
      setAuditForm({ title: '', departmentId: 1, auditor: '', auditDate: '' });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error || 'Failed to create audit');
    }
  });

  const createIssueMutation = useMutation({
    mutationFn: (data: Partial<ComplianceIssue>) => governanceService.createIssue(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['complianceIssues'] });
      toast.success('Compliance issue logged successfully');
      setIssueForm({ auditId: '', severity: 'low', description: '', owner: '', dueDate: '' });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error || 'Failed to log compliance issue');
    }
  });

  // Local State
  const [auditForm, setAuditForm] = useState({ title: '', departmentId: 1, auditor: '', auditDate: '' });
  const [issueForm, setIssueForm] = useState({ auditId: '', severity: 'low', description: '', owner: '', dueDate: '' });

  const handleCreateAudit = (e: React.FormEvent) => {
    e.preventDefault();
    createAuditMutation.mutate({
      ...auditForm,
      auditDate: new Date(auditForm.auditDate).toISOString(),
    });
  };

  const handleCreateIssue = (e: React.FormEvent) => {
    e.preventDefault();
    createIssueMutation.mutate({
      ...issueForm,
      auditId: issueForm.auditId ? Number(issueForm.auditId) : null,
      dueDate: new Date(issueForm.dueDate).toISOString(),
    });
  };

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-gray-800">Governance Dashboard</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Audits Section */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-xl font-bold mb-4">Audits</h2>
          
          <form onSubmit={handleCreateAudit} className="mb-6 space-y-4 bg-gray-50 p-4 rounded border">
            <h3 className="font-semibold text-sm text-gray-700">Schedule Audit</h3>
            <div className="grid grid-cols-1 gap-4">
              <input type="text" placeholder="Title" required className="border p-2 rounded" value={auditForm.title} onChange={e => setAuditForm({...auditForm, title: e.target.value})} />
              <div className="grid grid-cols-2 gap-4">
                <input type="number" placeholder="Department ID" required className="border p-2 rounded" value={auditForm.departmentId || ''} onChange={e => setAuditForm({...auditForm, departmentId: Number(e.target.value)})} />
                <input type="text" placeholder="Auditor Name" required className="border p-2 rounded" value={auditForm.auditor} onChange={e => setAuditForm({...auditForm, auditor: e.target.value})} />
              </div>
              <input type="datetime-local" required className="border p-2 rounded" value={auditForm.auditDate} onChange={e => setAuditForm({...auditForm, auditDate: e.target.value})} />
            </div>
            <button disabled={createAuditMutation.isPending} type="submit" className="bg-amber-600 text-white px-4 py-2 rounded hover:bg-amber-700 disabled:opacity-50">Schedule Audit</button>
          </form>

          {loadingAudits ? <p>Loading audits...</p> : (
            auditsData?.length === 0 ? <p className="text-gray-500">No audits found.</p> :
            <ul className="space-y-3 max-h-96 overflow-y-auto">
              {auditsData?.map(audit => (
                <li key={audit.id} className="p-3 border rounded flex justify-between items-center">
                  <div>
                    <p className="font-semibold">{audit.title}</p>
                    <p className="text-sm text-gray-500">Auditor: {audit.auditor} | {new Date(audit.auditDate).toLocaleDateString()}</p>
                  </div>
                  <div className="text-xs bg-gray-100 px-2 py-1 rounded">{audit.status}</div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Compliance Issues Section */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-xl font-bold mb-4">Compliance Issues</h2>

          <form onSubmit={handleCreateIssue} className="mb-6 space-y-4 bg-gray-50 p-4 rounded border">
            <h3 className="font-semibold text-sm text-gray-700">Log Issue</h3>
            <div className="grid grid-cols-1 gap-4">
              <input type="text" placeholder="Description" required className="border p-2 rounded" value={issueForm.description} onChange={e => setIssueForm({...issueForm, description: e.target.value})} />
              <div className="grid grid-cols-2 gap-4">
                <input type="number" placeholder="Audit ID (Optional)" className="border p-2 rounded" value={issueForm.auditId} onChange={e => setIssueForm({...issueForm, auditId: e.target.value})} />
                <select className="border p-2 rounded" value={issueForm.severity} onChange={e => setIssueForm({...issueForm, severity: e.target.value})}>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <input type="text" placeholder="Owner" required className="border p-2 rounded" value={issueForm.owner} onChange={e => setIssueForm({...issueForm, owner: e.target.value})} />
                <input type="date" required className="border p-2 rounded" value={issueForm.dueDate} onChange={e => setIssueForm({...issueForm, dueDate: e.target.value})} />
              </div>
            </div>
            <button disabled={createIssueMutation.isPending} type="submit" className="bg-amber-600 text-white px-4 py-2 rounded hover:bg-amber-700 disabled:opacity-50">Log Issue</button>
          </form>

          {loadingIssues ? <p>Loading issues...</p> : (
            issuesData?.length === 0 ? <p className="text-gray-500">No issues found.</p> :
            <ul className="space-y-3 max-h-96 overflow-y-auto">
              {issuesData?.map(issue => (
                <li key={issue.id} className="p-3 border rounded flex justify-between items-center">
                  <div>
                    <p className="font-semibold">{issue.description}</p>
                    <p className="text-sm text-gray-500">Owner: {issue.owner} | Due: {new Date(issue.dueDate).toLocaleDateString()}</p>
                  </div>
                  <div className={`text-xs px-2 py-1 rounded ${
                    issue.severity === 'critical' ? 'bg-red-100 text-red-800' : 
                    issue.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                    issue.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {issue.severity.toUpperCase()}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

      </div>
    </div>
  );
}

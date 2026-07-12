import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reportsService } from '../../services/reportsService';
import api from '../../services/api';
import toast from 'react-hot-toast';

export function Reports() {
  const queryClient = useQueryClient();
  const [departmentId, setDepartmentId] = useState('');

  // Queries
  const { data: scoresData, isLoading: loadingScores } = useQuery({
    queryKey: ['departmentScores', departmentId],
    queryFn: async () => {
      const res = await reportsService.getDashboardScores(departmentId ? Number(departmentId) : undefined);
      return res.data.data;
    }
  });

  // Mutations
  const calculateScoresMutation = useMutation({
    mutationFn: () => api.post('/reports/calculate-scores'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departmentScores'] });
      toast.success('Scores calculated successfully');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error || 'Failed to calculate scores');
    }
  });

  const handleExportCsv = async (reportType: string) => {
    try {
      // In a real app we'd want date pickers, hardcoding a wide range for demo
      const startDate = new Date('2020-01-01').toISOString();
      const endDate = new Date().toISOString();
      const url = `/reports/export/csv?reportType=${reportType}&startDate=${startDate}&endDate=${endDate}${departmentId ? `&departmentId=${departmentId}` : ''}`;
      
      const response = await api.get(url, { responseType: 'blob' });
      
      const blob = new Blob([response.data], { type: 'text/csv' });
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `${reportType}-report.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Export successful');
    } catch (err: any) {
      toast.error('Failed to export CSV');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Reports & Analytics</h1>
        <button 
          onClick={() => calculateScoresMutation.mutate()}
          disabled={calculateScoresMutation.isPending}
          className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 disabled:opacity-50"
        >
          {calculateScoresMutation.isPending ? 'Calculating...' : 'Calculate Latest Scores'}
        </button>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Department Scores</h2>
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Filter by Dept ID:</label>
            <input 
              type="number" 
              className="border p-1 rounded w-20" 
              value={departmentId} 
              onChange={e => setDepartmentId(e.target.value)} 
              placeholder="All"
            />
          </div>
        </div>

        {loadingScores ? <p>Loading scores...</p> : (
          scoresData?.length === 0 ? <p className="text-gray-500">No scores found.</p> :
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-700 border-b">
                <tr>
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium">Dept ID</th>
                  <th className="px-4 py-3 font-medium">Environmental</th>
                  <th className="px-4 py-3 font-medium">Social</th>
                  <th className="px-4 py-3 font-medium">Governance</th>
                  <th className="px-4 py-3 font-medium">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {scoresData?.map(score => (
                  <tr key={score.id}>
                    <td className="px-4 py-3">{new Date(score.date).toLocaleDateString()}</td>
                    <td className="px-4 py-3">{score.departmentId}</td>
                    <td className="px-4 py-3 text-emerald-600 font-semibold">{score.environmental}</td>
                    <td className="px-4 py-3 text-sky-600 font-semibold">{score.social}</td>
                    <td className="px-4 py-3 text-amber-600 font-semibold">{score.governance}</td>
                    <td className="px-4 py-3 font-bold">{score.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h2 className="text-xl font-bold mb-4">Export Reports (CSV)</h2>
        <div className="flex space-x-4">
          <button onClick={() => handleExportCsv('environmental')} className="bg-emerald-100 text-emerald-700 px-4 py-2 rounded hover:bg-emerald-200 font-medium">Environmental</button>
          <button onClick={() => handleExportCsv('social')} className="bg-sky-100 text-sky-700 px-4 py-2 rounded hover:bg-sky-200 font-medium">Social</button>
          <button onClick={() => handleExportCsv('governance')} className="bg-amber-100 text-amber-700 px-4 py-2 rounded hover:bg-amber-200 font-medium">Governance</button>
          <button onClick={() => handleExportCsv('scores')} className="bg-indigo-100 text-indigo-700 px-4 py-2 rounded hover:bg-indigo-200 font-medium">Scores</button>
        </div>
      </div>

    </div>
  );
}

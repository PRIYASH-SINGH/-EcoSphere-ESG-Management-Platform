import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { environmentalService } from '../../services/environmentalService';
import type { EnvironmentalGoal, CarbonTransaction } from '../../services/environmentalService';
import toast from 'react-hot-toast';

export function Environmental() {
  const queryClient = useQueryClient();

  // Queries
  const { data: goalsData, isLoading: loadingGoals } = useQuery({
    queryKey: ['environmentalGoals'],
    queryFn: async () => {
      const res = await environmentalService.getGoals();
      return res.data.data;
    }
  });

  const { data: transactionsData, isLoading: loadingTransactions } = useQuery({
    queryKey: ['carbonTransactions'],
    queryFn: async () => {
      const res = await environmentalService.getTransactions();
      return res.data.data;
    }
  });

  // Mutations
  const createGoalMutation = useMutation({
    mutationFn: (data: Partial<EnvironmentalGoal>) => environmentalService.createGoal(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['environmentalGoals'] });
      toast.success('Goal created successfully');
      setGoalForm({ title: '', targetValue: 0, departmentId: 1, deadline: '' });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error || 'Failed to create goal');
    }
  });

  const logTransactionMutation = useMutation({
    mutationFn: (data: Partial<CarbonTransaction>) => environmentalService.logTransaction(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['carbonTransactions'] });
      toast.success('Transaction logged successfully');
      setTransactionForm({ source: '', emissionFactorId: 1, value: 0, departmentId: 1, date: '' });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error || 'Failed to log transaction');
    }
  });

  // Local State
  const [goalForm, setGoalForm] = useState({ title: '', targetValue: 0, departmentId: 1, deadline: '' });
  const [transactionForm, setTransactionForm] = useState({ source: '', emissionFactorId: 1, value: 0, departmentId: 1, date: '' });

  const handleCreateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    createGoalMutation.mutate(goalForm);
  };

  const handleLogTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    logTransactionMutation.mutate(transactionForm);
  };

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-gray-800">Environmental Dashboard</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Goals Section */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-xl font-bold mb-4">Environmental Goals</h2>
          
          <form onSubmit={handleCreateGoal} className="mb-6 space-y-4 bg-gray-50 p-4 rounded border">
            <h3 className="font-semibold text-sm text-gray-700">Create New Goal</h3>
            <div className="grid grid-cols-2 gap-4">
              <input type="text" placeholder="Title" required className="border p-2 rounded" value={goalForm.title} onChange={e => setGoalForm({...goalForm, title: e.target.value})} />
              <input type="number" placeholder="Target Value" required className="border p-2 rounded" value={goalForm.targetValue || ''} onChange={e => setGoalForm({...goalForm, targetValue: Number(e.target.value)})} />
              <input type="number" placeholder="Department ID" required className="border p-2 rounded" value={goalForm.departmentId || ''} onChange={e => setGoalForm({...goalForm, departmentId: Number(e.target.value)})} />
              <input type="date" required className="border p-2 rounded" value={goalForm.deadline} onChange={e => setGoalForm({...goalForm, deadline: e.target.value})} />
            </div>
            <button disabled={createGoalMutation.isPending} type="submit" className="bg-emerald-600 text-white px-4 py-2 rounded hover:bg-emerald-700 disabled:opacity-50">Add Goal</button>
          </form>

          {loadingGoals ? <p>Loading goals...</p> : (
            goalsData?.length === 0 ? <p className="text-gray-500">No goals found.</p> :
            <ul className="space-y-3">
              {goalsData?.map(goal => (
                <li key={goal.id} className="p-3 border rounded flex justify-between items-center">
                  <div>
                    <p className="font-semibold">{goal.title}</p>
                    <p className="text-sm text-gray-500">Target: {goal.targetValue} | Status: {goal.status}</p>
                  </div>
                  <div className="text-xs bg-gray-100 px-2 py-1 rounded">Dept {goal.departmentId}</div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Transactions Section */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-xl font-bold mb-4">Carbon Transactions</h2>

          <form onSubmit={handleLogTransaction} className="mb-6 space-y-4 bg-gray-50 p-4 rounded border">
            <h3 className="font-semibold text-sm text-gray-700">Log Transaction</h3>
            <div className="grid grid-cols-2 gap-4">
              <input type="text" placeholder="Source (e.g. Electricity)" required className="border p-2 rounded" value={transactionForm.source} onChange={e => setTransactionForm({...transactionForm, source: e.target.value})} />
              <input type="number" placeholder="Emission Factor ID" required className="border p-2 rounded" value={transactionForm.emissionFactorId || ''} onChange={e => setTransactionForm({...transactionForm, emissionFactorId: Number(e.target.value)})} />
              <input type="number" placeholder="Value (e.g. kWh)" required className="border p-2 rounded" value={transactionForm.value || ''} onChange={e => setTransactionForm({...transactionForm, value: Number(e.target.value)})} />
              <input type="number" placeholder="Department ID" required className="border p-2 rounded" value={transactionForm.departmentId || ''} onChange={e => setTransactionForm({...transactionForm, departmentId: Number(e.target.value)})} />
              <input type="datetime-local" required className="border p-2 rounded" value={transactionForm.date} onChange={e => setTransactionForm({...transactionForm, date: e.target.value})} />
            </div>
            <button disabled={logTransactionMutation.isPending} type="submit" className="bg-emerald-600 text-white px-4 py-2 rounded hover:bg-emerald-700 disabled:opacity-50">Log Transaction</button>
          </form>

          {loadingTransactions ? <p>Loading transactions...</p> : (
            transactionsData?.length === 0 ? <p className="text-gray-500">No transactions found.</p> :
            <ul className="space-y-3 max-h-96 overflow-y-auto">
              {transactionsData?.map(tx => (
                <li key={tx.id} className="p-3 border rounded flex justify-between items-center">
                  <div>
                    <p className="font-semibold">{tx.source}</p>
                    <p className="text-sm text-gray-500">Value: {tx.value} | Emitted: {tx.carbonEmitted} kg CO2e</p>
                  </div>
                  <div className="text-xs bg-gray-100 px-2 py-1 rounded">{new Date(tx.date).toLocaleDateString()}</div>
                </li>
              ))}
            </ul>
          )}
        </div>

      </div>
    </div>
  );
}

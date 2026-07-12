import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { socialService } from '../../services/socialService';
import type { CsrActivity } from '../../services/socialService';
import toast from 'react-hot-toast';

export function Social() {
  const queryClient = useQueryClient();

  // Queries
  const { data: activitiesData, isLoading: loadingActivities } = useQuery({
    queryKey: ['csrActivities'],
    queryFn: async () => {
      const res = await socialService.getActivities();
      return res.data.data;
    }
  });

  const { data: participationsData, isLoading: loadingParticipations } = useQuery({
    queryKey: ['participations'],
    queryFn: async () => {
      const res = await socialService.getParticipations();
      return res.data.data;
    }
  });

  // Mutations
  const createActivityMutation = useMutation({
    mutationFn: (data: Partial<CsrActivity>) => socialService.createActivity(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['csrActivities'] });
      toast.success('Activity created successfully');
      setActivityForm({ title: '', description: '', startDate: '', endDate: '' });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error || 'Failed to create activity');
    }
  });

  const participateMutation = useMutation({
    mutationFn: (data: { csrActivityId: number; proof?: string }) => socialService.participate(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['participations'] });
      toast.success('Participation logged successfully');
      setParticipateForm({ csrActivityId: 0, proof: '' });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error || 'Failed to log participation');
    }
  });

  // Local State
  const [activityForm, setActivityForm] = useState({ title: '', description: '', startDate: '', endDate: '' });
  const [participateForm, setParticipateForm] = useState({ csrActivityId: 0, proof: '' });

  const handleCreateActivity = (e: React.FormEvent) => {
    e.preventDefault();
    createActivityMutation.mutate({
      ...activityForm,
      startDate: new Date(activityForm.startDate).toISOString(),
      endDate: new Date(activityForm.endDate).toISOString(),
    });
  };

  const handleParticipate = (e: React.FormEvent) => {
    e.preventDefault();
    participateMutation.mutate(participateForm);
  };

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-gray-800">Social Dashboard</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Activities Section */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-xl font-bold mb-4">CSR Activities</h2>
          
          <form onSubmit={handleCreateActivity} className="mb-6 space-y-4 bg-gray-50 p-4 rounded border">
            <h3 className="font-semibold text-sm text-gray-700">Create New Activity</h3>
            <div className="grid grid-cols-1 gap-4">
              <input type="text" placeholder="Title" required className="border p-2 rounded" value={activityForm.title} onChange={e => setActivityForm({...activityForm, title: e.target.value})} />
              <textarea placeholder="Description" required className="border p-2 rounded" value={activityForm.description} onChange={e => setActivityForm({...activityForm, description: e.target.value})} />
              <div className="grid grid-cols-2 gap-4">
                <input type="datetime-local" required className="border p-2 rounded" value={activityForm.startDate} onChange={e => setActivityForm({...activityForm, startDate: e.target.value})} />
                <input type="datetime-local" required className="border p-2 rounded" value={activityForm.endDate} onChange={e => setActivityForm({...activityForm, endDate: e.target.value})} />
              </div>
            </div>
            <button disabled={createActivityMutation.isPending} type="submit" className="bg-sky-600 text-white px-4 py-2 rounded hover:bg-sky-700 disabled:opacity-50">Add Activity</button>
          </form>

          {loadingActivities ? <p>Loading activities...</p> : (
            activitiesData?.length === 0 ? <p className="text-gray-500">No activities found.</p> :
            <ul className="space-y-3 max-h-96 overflow-y-auto">
              {activitiesData?.map(activity => (
                <li key={activity.id} className="p-3 border rounded flex justify-between items-center">
                  <div>
                    <p className="font-semibold">{activity.title}</p>
                    <p className="text-sm text-gray-500">{activity.status} | {new Date(activity.startDate).toLocaleDateString()}</p>
                  </div>
                  <button 
                    onClick={() => setParticipateForm({ ...participateForm, csrActivityId: activity.id })}
                    className="text-xs bg-sky-100 text-sky-700 px-2 py-1 rounded hover:bg-sky-200"
                  >
                    Select
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Participations Section */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-xl font-bold mb-4">My Participations</h2>

          <form onSubmit={handleParticipate} className="mb-6 space-y-4 bg-gray-50 p-4 rounded border">
            <h3 className="font-semibold text-sm text-gray-700">Log Participation</h3>
            <div className="grid grid-cols-1 gap-4">
              <input type="number" placeholder="Activity ID (Select from left)" required className="border p-2 rounded" value={participateForm.csrActivityId || ''} onChange={e => setParticipateForm({...participateForm, csrActivityId: Number(e.target.value)})} />
              <input type="text" placeholder="Proof (URL or description)" className="border p-2 rounded" value={participateForm.proof} onChange={e => setParticipateForm({...participateForm, proof: e.target.value})} />
            </div>
            <button disabled={participateMutation.isPending || !participateForm.csrActivityId} type="submit" className="bg-sky-600 text-white px-4 py-2 rounded hover:bg-sky-700 disabled:opacity-50">Submit Participation</button>
          </form>

          {loadingParticipations ? <p>Loading participations...</p> : (
            participationsData?.length === 0 ? <p className="text-gray-500">No participations found.</p> :
            <ul className="space-y-3 max-h-96 overflow-y-auto">
              {participationsData?.map(p => (
                <li key={p.id} className="p-3 border rounded flex justify-between items-center">
                  <div>
                    <p className="font-semibold">Activity ID: {p.csrActivityId}</p>
                    <p className="text-sm text-gray-500">Status: {p.status} | Points: {p.pointsEarned}</p>
                  </div>
                  <div className="text-xs bg-gray-100 px-2 py-1 rounded">{new Date(p.createdAt).toLocaleDateString()}</div>
                </li>
              ))}
            </ul>
          )}
        </div>

      </div>
    </div>
  );
}

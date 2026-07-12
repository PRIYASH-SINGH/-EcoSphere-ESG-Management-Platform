import React from 'react';

interface MetricCardProps {
  label: string;
  value: number | string;
  trend: string;
}

export function MetricCard({ label, value, trend }: MetricCardProps) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
      <h3 className="text-gray-500 font-medium">{label}</h3>
      <div className="flex items-baseline gap-2 mt-2">
        <p className="text-3xl font-bold text-slate-900">{value}</p>
        <span className="text-sm font-medium text-emerald-600">{trend}</span>
      </div>
    </div>
  );
}

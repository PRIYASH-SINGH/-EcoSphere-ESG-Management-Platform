

interface MetricCardProps {
  label: string;
  value: number | string;
  trend: string;
}

export function MetricCard({ label, value, trend }: MetricCardProps) {
  return (
    <div className="panel" style={{ padding: '20px' }}>
      <h3 className="eyebrow">{label}</h3>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '12px' }}>
        <p style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>{value}</p>
        <span style={{ fontSize: '1rem', fontWeight: '600', color: 'var(--accent-green)' }}>{trend}</span>
      </div>
    </div>
  );
}

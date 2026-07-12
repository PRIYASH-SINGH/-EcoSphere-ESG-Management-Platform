import { LucideIcon } from "lucide-react";

type MetricCardProps = {
  label: string;
  value: string;
  change: string;
  icon: LucideIcon;
  tone: "gold" | "green" | "red";
};

export function MetricCard({ label, value, change, icon: Icon, tone }: MetricCardProps) {
  return (
    <article className="metric-card">
      <div className={`metric-icon ${tone}`}>
        <Icon size={22} aria-hidden="true" />
      </div>
      <p>{label}</p>
      <strong>{value}</strong>
      <span className={`trend ${tone === "red" ? "warn" : "up"}`}>{change}</span>
    </article>
  );
}

import { alerts } from "../services/dashboardData";

export function AlertList() {
  return (
    <div className="alert-list">
      {alerts.map((alert) => (
        <div className={`alert-item ${alert.critical ? "critical" : ""}`} key={alert.title}>
          <span />
          <div>
            <strong>{alert.title}</strong>
            <p>{alert.detail}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

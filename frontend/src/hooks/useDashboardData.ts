import { alerts, facilityRows, metrics } from "../services/dashboardData";

export function useDashboardData() {
  return {
    alerts,
    facilityRows,
    metrics,
  };
}

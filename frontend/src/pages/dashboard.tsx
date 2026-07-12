import { AlertList } from "../components/AlertList";
import { EnergyChart } from "../components/EnergyChart";
import { FacilityTable } from "../components/FacilityTable";
import { MetricCard } from "../components/MetricCard";
import { SourceBalance } from "../components/SourceBalance";
import { useDashboardData } from "../hooks/useDashboardData";

export function Dashboard() {
  const { metrics } = useDashboardData();

  return (
    <>
      <section className="metric-grid" aria-label="Performance metrics">
        {metrics.map((metric) => (
          <MetricCard key={metric.label} {...metric} />
        ))}
      </section>

      <section className="content-grid">
        <article className="panel energy-panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Resource trend</p>
              <h2>Energy and recovery index</h2>
            </div>
            <div className="segmented" role="tablist" aria-label="Chart range">
              <button type="button">Day</button>              <button className="selected" type="button">Week</button>
              <button type="button">Month</button>
            </div>
          </div>
          <EnergyChart />
        </article>

        <article className="panel">
          <div className="panel-header compact">
            <div>
              <p className="eyebrow">System mix</p>
              <h2>Source balance</h2>
            </div>
          </div>
          <SourceBalance />
        </article>

        <article className="panel table-panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Facilities</p>
              <h2>Site performance</h2>
            </div>
            <button className="ghost-button" type="button">
              Export
            </button>
          </div>
          <FacilityTable />
        </article>

        <article className="panel alerts-panel">
          <div className="panel-header compact">
            <div>
              <p className="eyebrow">Priority queue</p>
              <h2>Alerts</h2>
            </div>
          </div>
          <AlertList />
        </article>
      </section>
    </>
  );
}
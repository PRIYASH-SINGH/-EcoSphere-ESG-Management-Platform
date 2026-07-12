export function SourceBalance() {
  return (
    <div className="donut-layout">
      <div
        className="donut"
        role="img"
        aria-label="Source balance: renewable 68 percent, recovered 22 percent, grid 10 percent"
      >
        <span>68%</span>
      </div>
      <div className="legend">
        <span>
          <i className="legend-gold" />
          Renewable
        </span>
        <span>
          <i className="legend-green" />
          Recovered
        </span>
        <span>
          <i className="legend-red" />
          Grid alert
        </span>
      </div>
    </div>
  );
}

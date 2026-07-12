import { facilityRows } from "../services/dashboardData";

export function FacilityTable() {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Site</th>
            <th>Efficiency</th>
            <th>Load</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {facilityRows.map((row) => (
            <tr key={row.site}>
              <td>{row.site}</td>
              <td>{row.efficiency}</td>
              <td>{row.load}</td>
              <td>
                <span className={`pill ${row.status.toLowerCase()}`}>{row.status}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

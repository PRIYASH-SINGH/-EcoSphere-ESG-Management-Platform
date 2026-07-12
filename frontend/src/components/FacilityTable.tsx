

export function FacilityTable() {
  return (
    <div className="mt-4 border border-gray-200 rounded-lg overflow-hidden">
      <table className="w-full text-left text-sm">
        <thead className="bg-slate-50 text-slate-700">
          <tr>
            <th className="px-4 py-3 font-medium">Facility</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium">Score</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          <tr>
            <td className="px-4 py-3">Headquarters</td>
            <td className="px-4 py-3"><span className="text-emerald-600 font-medium">Optimal</span></td>
            <td className="px-4 py-3">92</td>
          </tr>
          <tr>
            <td className="px-4 py-3">Manufacturing Plant A</td>
            <td className="px-4 py-3"><span className="text-amber-600 font-medium">Warning</span></td>
            <td className="px-4 py-3">78</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

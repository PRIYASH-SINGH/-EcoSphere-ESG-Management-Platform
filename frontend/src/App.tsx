import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <div className="flex h-screen bg-gray-100 font-sans">
        {/* Navigation Sidebar */}
        <aside className="w-64 bg-slate-900 text-white flex flex-col">
          <div className="p-5 text-xl font-bold tracking-wider border-b border-slate-800">
            🌱 EcoSphere ESG
          </div>
          <nav className="flex-1 p-4 space-y-2">
            <Link to="/" className="block px-4 py-2.5 rounded hover:bg-slate-800 transition">📊 Dashboard</Link>
            <Link to="/environmental" className="block px-4 py-2.5 rounded hover:bg-slate-800 transition font-medium text-emerald-400">💧 Environmental</Link>
            <Link to="/social" className="block px-4 py-2.5 rounded hover:bg-slate-800 transition font-medium text-sky-400">👥 Social</Link>
            <Link to="/governance" className="block px-4 py-2.5 rounded hover:bg-slate-800 transition font-medium text-amber-400">🏛️ Governance</Link>
          </nav>
        </aside>

        {/* Main Content Window */}
        <main className="flex-1 p-8 overflow-y-auto">
          <Routes>
            <Route path="/" element={<DashboardPlaceholder />} />
            <Route path="/environmental" element={<EnvironmentalPlaceholder />} />
            <Route path="/social" element={<div className="text-2xl font-bold">Social Module</div>} />
            <Route path="/governance" element={<div className="text-2xl font-bold">Governance Module</div>} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

// Temporary layout templates to test layout and API connectivity immediately
function DashboardPlaceholder() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">ESG Dashboard Overview</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-gray-500 font-medium">Environmental Score</h3>
          <p className="text-3xl font-bold text-emerald-600 mt-2">A+</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-gray-500 font-medium">Social Performance</h3>
          <p className="text-3xl font-bold text-sky-600 mt-2">B</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-gray-500 font-medium">Governance Risk</h3>
          <p className="text-3xl font-bold text-amber-600 mt-2">Low</p>
        </div>
      </div>
    </div>
  );
}

function EnvironmentalPlaceholder() {
  const triggerBackendFetch = async () => {
    try {
      const response = await fetch('/api/health');
      const data = await response.json();
      alert("Connected to backend successfully! Health status: " + data.data.status);
      console.log("Data from backend health check:", data);
    } catch (err) {
      console.error("Error communicating with backend:", err);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-4">Environmental Metrics</h1>
      <button 
        onClick={triggerBackendFetch}
        className="px-4 py-2 bg-emerald-600 text-white font-semibold rounded-lg shadow hover:bg-emerald-700 transition"
      >
        Test Live Backend Connection
      </button>
    </div>
  );
}

export default App;
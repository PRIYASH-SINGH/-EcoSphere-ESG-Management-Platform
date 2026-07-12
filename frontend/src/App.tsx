import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAuth } from './context/AuthContext';
import { AppLayout } from './layouts/AppLayout';
import { Login } from './pages/Login/Login';
import { Dashboard } from './pages/dashboard';

import { Environmental } from './pages/Environmental/Environmental';
import { Social } from './pages/Social/Social';
import { Governance } from './pages/Governance/Governance';
import { Reports } from './pages/Reports/Reports';

// Protect routes
function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth();
  
  if (isLoading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  
  return <AppLayout>{children}</AppLayout>;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        {/* Protected Routes */}
        <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/environmental" element={<ProtectedRoute><Environmental /></ProtectedRoute>} />
        <Route path="/social" element={<ProtectedRoute><Social /></ProtectedRoute>} />
        <Route path="/governance" element={<ProtectedRoute><Governance /></ProtectedRoute>} />
        <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><div className="p-8">Settings (Not Implemented)</div></ProtectedRoute>} />
        
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
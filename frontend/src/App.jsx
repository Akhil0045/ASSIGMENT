import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import Daily from './pages/Daily';
import Summary from './pages/Summary';
import Stats from './pages/Stats';
import BudgetsPage from './pages/BudgetsPage';
import Login from './pages/Login';
import Register from './pages/Register';
import AddEditTransaction from './pages/AddEditTransaction';
import AdminUsers from './pages/AdminUsers';
import AdminStats from './pages/AdminStats';

// Admin-only route guard
const AdminRoute = ({ children }) => {
  const { user } = useContext(AuthContext);
  if (user?.role !== 'admin') return <Navigate to="/" replace />;
  return children;
};

// Write-access route guard (Blocks Analyst)
const WriteRoute = ({ children }) => {
  const { user } = useContext(AuthContext);
  if (user?.role === 'analyst') return <Navigate to="/" replace />;
  return children;
};

const ProtectedLayout = ({ children }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="text-center">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mx-auto mb-4 animate-pulse">
            <span className="text-white font-black text-lg">F</span>
          </div>
          <p className="text-slate-400 font-medium">Loading FinanceOS...</p>
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
};

const AppRoutes = () => (
  <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/*"
        element={
          <ProtectedLayout>
            <Routes>
              <Route path="/" element={<Navigate to="/daily" replace />} />
              <Route path="/daily" element={<Daily />} />
              <Route path="/summary" element={<Summary />} />
              <Route path="/stats" element={<Stats />} />
              <Route path="/budgets" element={<BudgetsPage />} />
              <Route path="/add-transaction" element={<WriteRoute><AddEditTransaction /></WriteRoute>} />
              <Route path="/edit-transaction/:id" element={<WriteRoute><AddEditTransaction /></WriteRoute>} />
              {/* Admin Routes */}
              <Route path="/admin" element={<AdminRoute><AdminUsers /></AdminRoute>} />
              <Route path="/admin/stats" element={<AdminRoute><AdminStats /></AdminRoute>} />
            </Routes>
          </ProtectedLayout>
        }
      />
    </Routes>
  </Router>
);

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;

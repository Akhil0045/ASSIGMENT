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

const ProtectedLayout = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-slate-500 font-medium">Loading Application...</div>;
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header logic later if needed */}
        <main className="flex-1 overflow-y-auto w-full">
          <div className="min-h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route 
          path="/*"
          element={
            <ProtectedLayout>
              <Routes>
                <Route path="/daily" element={<Daily />} />
                <Route path="/summary" element={<Summary />} />
                <Route path="/stats" element={<Stats />} />
                <Route path="/budgets" element={<BudgetsPage />} />
                <Route path="/add-transaction" element={<AddEditTransaction />} />
                <Route path="/edit-transaction/:id" element={<AddEditTransaction />} />
                <Route path="/" element={<Navigate to="/daily" replace />} />
              </Routes>
            </ProtectedLayout>
          }
        />
      </Routes>
    </Router>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;

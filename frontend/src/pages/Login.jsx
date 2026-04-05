import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const DEMO_ACCOUNTS = [
  { role: 'Admin', email: 'admin@finance.com', password: 'Admin@123', color: 'from-violet-500 to-purple-600', icon: '👑' },
  { role: 'Analyst', email: 'analyst@finance.com', password: 'Analyst@123', color: 'from-blue-500 to-cyan-500', icon: '🔬' },
  { role: 'Viewer', email: 'viewer@finance.com', password: 'Viewer@123', color: 'from-emerald-500 to-teal-500', icon: '👁️' },
];

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const fillDemo = (account) => {
    setEmail(account.email);
    setPassword(account.password);
    setError('');
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-center px-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 to-purple-600/20" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <span className="text-white text-lg font-bold">F</span>
            </div>
            <span className="text-white text-xl font-bold">FinanceTracker</span>
          </div>
          <h1 className="text-5xl font-black text-white leading-tight mb-6">
            Manage Your<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
              Finances Smart
            </span>
          </h1>
          <p className="text-slate-400 text-lg mb-12">
            Track income, control expenses, set budgets, and visualize your financial health in real-time.
          </p>

          {/* Demo Account Cards */}
          <div className="space-y-3">
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-4">Quick Login — Demo Accounts</p>
            {DEMO_ACCOUNTS.map((acc) => (
              <button
                key={acc.role}
                onClick={() => fillDemo(acc)}
                className={`w-full flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r ${acc.color} bg-opacity-10 border border-white/10 hover:border-white/30 transition-all group text-left`}
              >
                <span className="text-2xl">{acc.icon}</span>
                <div className="flex-1">
                  <p className="text-white font-bold text-sm">{acc.role}</p>
                  <p className="text-white/60 text-xs font-mono">{acc.email}</p>
                </div>
                <span className="text-white/40 group-hover:text-white/80 text-xs transition-colors">Click to fill →</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel — Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <span className="text-white font-bold">F</span>
            </div>
            <span className="text-white text-lg font-bold">FinanceTracker</span>
          </div>

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
            <div className="mb-8">
              <h2 className="text-3xl font-black text-white mb-2">Welcome back</h2>
              <p className="text-slate-400">Sign in to your account</p>
            </div>

            {error && (
              <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm font-medium flex items-center gap-2">
                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">Email address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  placeholder="you@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  placeholder="••••••••"
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-lg shadow-indigo-900/50 transition-all transform hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>
                    Signing in...
                  </span>
                ) : 'Sign In'}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-500">
              Don't have an account?{' '}
              <Link to="/register" className="font-semibold text-indigo-400 hover:text-indigo-300">
                Register here
              </Link>
            </p>
          </div>

          {/* Mobile demo accounts */}
          <div className="mt-6 lg:hidden space-y-2">
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-3 text-center">Demo Accounts</p>
            {DEMO_ACCOUNTS.map((acc) => (
              <button key={acc.role} onClick={() => fillDemo(acc)}
                className="w-full flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-all text-left">
                <span>{acc.icon}</span>
                <div>
                  <p className="text-white text-sm font-semibold">{acc.role}</p>
                  <p className="text-slate-500 text-xs">{acc.email}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

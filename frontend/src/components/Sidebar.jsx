import React, { useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const ROLE_BADGE = {
  admin:   { label: 'Admin',   bg: 'bg-violet-100', text: 'text-violet-700' },
  analyst: { label: 'Analyst', bg: 'bg-blue-100',   text: 'text-blue-700'   },
  viewer:  { label: 'Viewer',  bg: 'bg-slate-100',  text: 'text-slate-600'  },
};

const NavItem = ({ to, icon, label, end = true }) => (
  <NavLink
    to={to}
    end={end}
    className={({ isActive }) =>
      `flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all ${
        isActive
          ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
          : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
      }`
    }
  >
    {icon}
    <span>{label}</span>
  </NavLink>
);

const Sidebar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const badge = ROLE_BADGE[user?.role] || ROLE_BADGE.viewer;

  const handleLogout = () => { logout(); navigate('/login'); };
  const canWrite = user?.role === 'admin' || user?.role === 'viewer';

  return (
    <aside className="w-60 bg-white border-r border-slate-100 h-full flex flex-col hidden md:flex shrink-0 shadow-sm">
      {/* Header Profile Area */}
      <div className="px-5 pt-6 pb-6 border-b border-slate-100">
        <div className="flex items-center gap-2.5 mb-8">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-200">
            <span className="text-white text-sm font-black">F</span>
          </div>
          <span className="font-black text-slate-900 text-lg tracking-tight">Finance<span className="text-indigo-600">OS</span></span>
        </div>

        {/* User Card */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-bold text-sm shrink-0">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="font-bold text-slate-800 text-sm truncate">{user?.name}</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className={`text-xs font-bold px-1.5 py-0.5 rounded-md ${badge.bg} ${badge.text}`}>
                {badge.label}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-6 overflow-y-auto">
        <div className="mb-8 space-y-1">
          <p className="px-3 text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Overview</p>
          <NavItem to="/daily" label="Financial Records" icon={
            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
          } />
          <NavItem to="/summary" label="Dashboard Overview" icon={
            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"/></svg>
          } />
          <NavItem to="/stats" label="Analytics" icon={
            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"/></svg>
          } />
        </div>

        <div className="mb-8 space-y-1">
          <p className="px-3 text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Finance</p>
          <NavItem to="/budgets" label="Budget Control" icon={
            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          } />
          {canWrite && (
            <NavItem to="/add-transaction" label="Log Entry" icon={
              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/></svg>
            } />
          )}
        </div>

        {/* Admin Section */}
        {user?.role === 'admin' && (
          <div className="mb-4 space-y-1">
            <p className="px-3 text-xs font-bold text-violet-400 uppercase tracking-widest mb-3">Admin</p>
            <NavItem to="/admin" label="User Management" icon={
              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg>
            } />
            <NavItem to="/admin/stats" label="Platform Analytics" icon={
              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
            } />
          </div>
        )}
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-slate-100">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-rose-500 hover:bg-rose-50 transition-colors"
        >
          <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
          Sign out
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;

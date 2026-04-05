import React, { useState, useEffect } from 'react';
import api from '../services/api';

const StatCard = ({ label, value, sub, colorClass, icon }) => (
  <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
    <div className="flex items-center justify-between mb-4">
      <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">{label}</p>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colorClass}`}>{icon}</div>
    </div>
    <p className="text-3xl font-black text-slate-900">{value}</p>
    {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
  </div>
);

const AdminStats = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/stats').then(r => { setStats(r.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-12 text-center text-slate-400 font-medium">Loading system stats...</div>;

  const fmt = (n) => `$${(n || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`;

  return (
    <div className="flex flex-col h-full bg-slate-50 p-6 md:p-8 space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-slate-900 tracking-tight">System Statistics</h2>
        <p className="text-slate-500 mt-1">Platform-wide financial overview across all users.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard label="Total Users" value={stats?.totalUsers ?? 0}
          colorClass="bg-indigo-50 text-indigo-600"
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg>}
        />
        <StatCard label="Total Transactions" value={stats?.totalTransactions ?? 0}
          colorClass="bg-slate-100 text-slate-600"
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>}
        />
        <StatCard label="Total Income" value={fmt(stats?.totalIncome)}
          colorClass="bg-emerald-50 text-emerald-600"
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/></svg>}
        />
        <StatCard label="Total Expenses" value={fmt(stats?.totalExpenses)}
          colorClass="bg-rose-50 text-rose-600"
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4"/></svg>}
        />
        <StatCard label="Net Balance" value={fmt(stats?.netBalance)}
          sub={stats?.netBalance >= 0 ? 'Platform is profitable' : 'Platform is in deficit'}
          colorClass={stats?.netBalance >= 0 ? 'bg-blue-50 text-blue-600' : 'bg-orange-50 text-orange-600'}
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>}
        />
      </div>
    </div>
  );
};

export default AdminStats;

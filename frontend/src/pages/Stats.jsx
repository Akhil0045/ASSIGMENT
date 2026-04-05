import React, { useState, useEffect, useCallback, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import CategoryPieChart from '../components/CategoryPieChart';
import TrendBarChart from '../components/TrendBarChart';
import UserFilter from '../components/UserFilter';

const TIMEFRAMES = [
  { label: 'Daily',   value: 'Daily'   },
  { label: 'Weekly',  value: 'Weekly'  },
  { label: 'Monthly', value: 'Monthly' },
  { label: 'Yearly',  value: 'Yearly'  },
  { label: 'Custom',  value: 'Custom', icon: true },
];

const toYMD = (d) => d.toISOString().split('T')[0];

const getDateRange = (tf) => {
  const today = new Date();
  if (tf === 'Daily')   { const d = new Date(); d.setDate(today.getDate() - 1);         return { startDate: toYMD(d), endDate: toYMD(today) }; }
  if (tf === 'Weekly')  { const d = new Date(); d.setDate(today.getDate() - 7);         return { startDate: toYMD(d), endDate: toYMD(today) }; }
  if (tf === 'Monthly') { const d = new Date(); d.setDate(today.getDate() - 30);        return { startDate: toYMD(d), endDate: toYMD(today) }; }
  if (tf === 'Yearly')  { const d = new Date(); d.setFullYear(today.getFullYear() - 1); return { startDate: toYMD(d), endDate: toYMD(today) }; }
  return { startDate: '', endDate: '' };
};

const Stats = () => {
  const { user } = useContext(AuthContext);
  const [chartData, setChartData]   = useState({ expensesByCategory: [], trends: [] });
  const [loading, setLoading]       = useState(true);
  const [timeframe, setTimeframe]   = useState('Monthly');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd]   = useState('');
  const [error, setError]           = useState('');
  const [filterEmail, setFilterEmail] = useState('');  // analyst/admin user filter

  const fetchCharts = useCallback(async (startDate, endDate, email) => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (startDate) params.startDate = startDate;
      if (endDate)   params.endDate   = endDate;
      if (email)     params.email     = email;

      const resCharts = await api.get('/analytics/charts', { params });
      setChartData({
        expensesByCategory: resCharts.data.expensesByCategory || [],
        trends:             resCharts.data.trends             || [],
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load chart data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (timeframe !== 'Custom') {
      const { startDate, endDate } = getDateRange(timeframe);
      fetchCharts(startDate, endDate, filterEmail);
    }
  }, [timeframe, fetchCharts, filterEmail]);

  const handleCustomQuery = () => {
    if (!customStart || !customEnd) { setError('Please select both a Start and End date.'); return; }
    if (new Date(customStart) > new Date(customEnd)) { setError('Start date cannot be after end date.'); return; }
    setError('');
    fetchCharts(customStart, customEnd, filterEmail);
  };

  const totalExpenses = chartData.expensesByCategory.reduce((s, d) => s + d.value, 0);
  const totalIncome   = chartData.trends.reduce((s, d) => s + d.income, 0);

  return (
    <div className="flex flex-col bg-slate-50 p-6 md:p-8 gap-5 min-h-full">

      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Analytics</h2>
          <p className="text-slate-500 mt-1">
            Category-wise breakdown and trend analysis
            {filterEmail ? <span className="ml-1 text-indigo-600 font-semibold">for {filterEmail}</span> : ' across all financial records'}.
          </p>
        </div>

        {/* Timeframe pill group */}
        <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-2xl p-1.5 shadow-sm self-start">
          {TIMEFRAMES.map((tf) => {
            const isActive = timeframe === tf.value;
            return (
              <button key={tf.value} onClick={() => setTimeframe(tf.value)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 whitespace-nowrap ${
                  isActive ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {tf.icon && (
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                  </svg>
                )}
                {tf.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* User Filter — Analyst / Admin only */}
      <UserFilter
        activeEmail={filterEmail}
        onFilter={(email) => setFilterEmail(email)}
        onClear={() => setFilterEmail('')}
      />

      {/* Custom Date Range Panel */}
      {timeframe === 'Custom' && (
        <div className="flex flex-wrap items-end gap-4 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">From</label>
            <input type="date" value={customStart} onChange={e => setCustomStart(e.target.value)}
              className="h-10 px-3 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-400"/>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">To</label>
            <input type="date" value={customEnd} onChange={e => setCustomEnd(e.target.value)}
              className="h-10 px-3 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-400"/>
          </div>
          <button onClick={handleCustomQuery}
            className="h-10 px-6 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl transition-colors shadow">
            Apply Range
          </button>
        </div>
      )}

      {/* Error Banner */}
      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2">
          <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          {error}
        </div>
      )}

      {/* Summary Metric Cards */}
      {!loading && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Expenses', value: totalExpenses,               color: 'rose'   },
            { label: 'Total Income',   value: totalIncome,                  color: 'emerald'},
            { label: 'Net Balance',    value: totalIncome - totalExpenses,  color: (totalIncome - totalExpenses) >= 0 ? 'indigo' : 'rose' },
            { label: 'Categories',     value: chartData.expensesByCategory.length, color: 'amber', isCnt: true },
          ].map(card => (
            <div key={card.label} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">{card.label}</p>
              <p className={`text-2xl font-bold text-${card.color}-600`}>
                {card.isCnt ? card.value : `$${Math.abs(card.value).toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Charts */}
      {loading ? (
        <div className="flex flex-1 items-center justify-center py-24 bg-white rounded-2xl border border-slate-100 shadow-sm">
          <p className="text-slate-400 animate-pulse font-medium text-lg">Loading analytics...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="text-base font-bold text-slate-800 mb-1">Expenses by Category</h3>
            <p className="text-xs text-slate-400 mb-6">Proportional spend breakdown per category</p>
            {chartData.expensesByCategory.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-slate-300">
                <svg className="w-14 h-14 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"/></svg>
                <p className="text-sm font-medium">No expenses in this timeframe</p>
              </div>
            ) : (
              <CategoryPieChart data={chartData.expensesByCategory} />
            )}
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="text-base font-bold text-slate-800 mb-1">Income vs Expense Trend</h3>
            <p className="text-xs text-slate-400 mb-6">Daily comparison across selected timeframe</p>
            {chartData.trends.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-slate-300">
                <svg className="w-14 h-14 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
                <p className="text-sm font-medium">No trend data in this timeframe</p>
              </div>
            ) : (
              <TrendBarChart data={chartData.trends} />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Stats;

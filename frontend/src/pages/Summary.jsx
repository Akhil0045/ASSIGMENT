import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import DailyTrendChart from '../components/DailyTrendChart';
import UserFilter from '../components/UserFilter';

const Summary = () => {
  const { user } = useContext(AuthContext);
  const [dailyData, setDailyData]     = useState([]);
  const [summary, setSummary]         = useState({ income: 0, expenses: 0, balance: 0 });
  const [loading, setLoading]         = useState(true);
  const [activeIndex, setActiveIndex] = useState(29);
  const [filterEmail, setFilterEmail] = useState('');

  const generateLast30Days = () => {
    const dates  = [];
    const today  = new Date();
    for (let i = 29; i >= 0; i--) {
      const d          = new Date(today);
      d.setDate(today.getDate() - i);
      const isoFormat  = d.toISOString().split('T')[0];
      const monthStr   = d.toLocaleString('en-US', { month: 'short' }).toUpperCase();
      const dayStr     = d.getDate().toString();
      const fullDateStr = d.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
      dates.push({ id: isoFormat, axisLabel: `${dayStr}|${monthStr}`, fullDateString: fullDateStr, dayStr, monthStr, income: 0, expense: 0 });
    }
    return dates;
  };

  const fetchData = async (email) => {
    setLoading(true);
    try {
      const params = { limit: 1000 };
      if (email) params.email = email;

      const [txnRes, sumRes] = await Promise.all([
        api.get('/transactions', { params }),
        // Summary endpoint only for analyst/admin
        (user?.role === 'analyst' || user?.role === 'admin')
          ? api.get('/analytics/summary', { params: email ? { email } : {} })
          : Promise.resolve({ data: { income: 0, expenses: 0, balance: 0 } }),
      ]);

      // Build 30-day chart buckets
      const buckets = generateLast30Days();
      txnRes.data.transactions.forEach(t => {
        const tDate       = new Date(t.date).toISOString().split('T')[0];
        const bucketIndex = buckets.findIndex(b => b.id === tDate);
        if (bucketIndex !== -1) {
          if (t.type === 'income')  buckets[bucketIndex].income  += t.amount;
          else                      buckets[bucketIndex].expense += t.amount;
        }
      });

      setDailyData(buckets);
      setSummary(sumRes.data);
    } catch (err) {
      console.error('Failed to fetch summary data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(filterEmail); }, [filterEmail]);

  const selectedNode = dailyData[activeIndex];
  const canSeeGlobal = user?.role === 'analyst' || user?.role === 'admin';

  if (loading) return (
    <div className="p-12 flex flex-col items-center justify-center gap-3 text-slate-400">
      <div className="w-8 h-8 border-2 border-slate-200 border-t-indigo-500 rounded-full animate-spin"/>
      <p className="text-sm font-medium">Loading overview...</p>
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-slate-50 p-6 md:p-8 space-y-4">
      <div className="mb-1">
        <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Dashboard Overview</h2>
        <p className="text-slate-500 mt-1">
          30-day financial activity
          {filterEmail
            ? <span className="ml-1 text-indigo-600 font-semibold">for {filterEmail}</span>
            : ' across all recorded income and expense entries'}.
        </p>
      </div>

      {/* User Filter — Analyst / Admin only */}
      <UserFilter
        activeEmail={filterEmail}
        onFilter={setFilterEmail}
        onClear={() => setFilterEmail('')}
      />

      {/* Summary KPI Cards — Analyst + Admin only */}
      {canSeeGlobal && (
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Total Income',   value: summary.income,   color: 'emerald', sign: '+' },
            { label: 'Total Expenses', value: summary.expenses, color: 'rose',    sign: '-' },
            { label: 'Net Balance',    value: summary.balance,  color: summary.balance >= 0 ? 'indigo' : 'rose', sign: summary.balance >= 0 ? '+' : '' },
          ].map(card => (
            <div key={card.label} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">{card.label}</p>
              <p className={`text-2xl font-black text-${card.color}-600`}>
                {card.sign}${Math.abs(card.value).toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Daily Chart */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex-1 min-h-[500px] flex flex-col">
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100">
          <div className="flex items-center px-4 py-2 bg-slate-100 rounded-xl text-sm font-semibold text-slate-700 shadow-inner">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
            {dailyData.length > 0 && `${dailyData[0].monthStr} ${dailyData[0].dayStr} — ${dailyData[29].monthStr} ${dailyData[29].dayStr}`}
          </div>
          <span className="text-xs text-slate-400 font-medium">Click a bar to see details</span>
        </div>

        <div className="w-full relative px-2">
          <DailyTrendChart data={dailyData} activeIndex={activeIndex} onBarClick={setActiveIndex} />
        </div>

        {selectedNode && (
          <div className="mt-6 bg-slate-50 border border-slate-200 rounded-xl p-5 mx-2">
            <h3 className="text-sm font-bold text-slate-700 mb-4">{selectedNode.fullDateString}</h3>
            <div className="flex justify-between items-center">
              <div>
                <div className="flex items-center text-slate-500 text-xs mb-1 font-medium">
                  <div className="w-2.5 h-2.5 bg-emerald-400 rounded-sm mr-2 shrink-0"/>Income
                </div>
                <span className="text-xl font-black text-emerald-600">${selectedNode.income.toLocaleString()}</span>
              </div>
              <div className="text-right">
                <div className="flex items-center justify-end text-slate-500 text-xs mb-1 font-medium">
                  <div className="w-2.5 h-2.5 bg-rose-400 rounded-sm mr-2 shrink-0"/>Expense
                </div>
                <span className="text-xl font-black text-rose-500">${selectedNode.expense.toLocaleString()}</span>
              </div>
              <div className="text-right">
                <div className="flex items-center justify-end text-slate-500 text-xs mb-1 font-medium">Net</div>
                <span className={`text-xl font-black ${selectedNode.income - selectedNode.expense >= 0 ? 'text-indigo-600' : 'text-rose-600'}`}>
                  ${(selectedNode.income - selectedNode.expense).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-center items-center space-x-6 mt-4 pb-2 text-xs font-semibold text-slate-400">
          <div className="flex items-center"><span className="w-2.5 h-2.5 rounded-full bg-emerald-400 mr-2"/>Income</div>
          <div className="flex items-center"><span className="w-2.5 h-2.5 rounded-full bg-rose-400 mr-2"/>Expense</div>
        </div>
      </div>
    </div>
  );
};

export default Summary;

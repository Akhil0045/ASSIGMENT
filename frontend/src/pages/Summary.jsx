import React, { useState, useEffect } from 'react';
import api from '../services/api';
import DailyTrendChart from '../components/DailyTrendChart';

const Summary = () => {
  const [dailyData, setDailyData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(29); // default to today
  
  const generateLast30Days = () => {
    const dates = [];
    const today = new Date();
    // Generate empty array
    for (let i = 29; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const isoFormat = d.toISOString().split('T')[0];
      const monthStr = d.toLocaleString('en-US', { month: 'short' }).toUpperCase();
      const dayStr = d.getDate().toString();
      const fullDateStr = d.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
      
      dates.push({
        id: isoFormat,
        axisLabel: `${dayStr}|${monthStr}`,
        fullDateString: fullDateStr,
        dayStr,
        monthStr,
        income: 0,
        expense: 0
      });
    }
    return dates;
  };

  useEffect(() => {
    const fetchAndMapData = async () => {
      try {
        const buckets = generateLast30Days();
        
        // Fetch raw data (assuming your API provides a limit large enough to cover the month)
        const res = await api.get('/transactions', { params: { limit: 1000 } });
        const txns = res.data.transactions;
        
        // Map transactions
        txns.forEach(t => {
          const tDate = new Date(t.date).toISOString().split('T')[0];
          const bucketIndex = buckets.findIndex(b => b.id === tDate);
          if (bucketIndex !== -1) {
            if (t.type === 'income') {
              buckets[bucketIndex].income += t.amount;
            } else {
              buckets[bucketIndex].expense += t.amount;
            }
          }
        });
        
        setDailyData(buckets);
        setLoading(false);
      } catch (err) {
        console.error('Failed to map dynamic summary array', err);
        setLoading(false);
      }
    };
    fetchAndMapData();
  }, []);

  const selectedNode = dailyData[activeIndex];

  if (loading) return <div className="p-8 text-slate-500">Processing chronological arrays...</div>;

  return (
    <div className="flex flex-col h-full bg-slate-50 p-6 md:p-8 space-y-6">
      <div className="mb-2">
        <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Timeline Summary</h2>
        <p className="text-slate-500 mt-1">Deep visual mapping of your spending across the active chronological matrix.</p>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex-1 min-h-[500px] flex flex-col">
        {/* Top Header Filter Mimic */}
        <div className="flex justify-between items-center mb-10 pb-4 border-b border-slate-100">
          <div className="flex items-center px-4 py-2 bg-slate-100 rounded-xl text-sm font-semibold text-slate-700 shadow-inner">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
            {dailyData.length > 0 && `${dailyData[0].monthStr} ${dailyData[0].dayStr} - ${dailyData[29].monthStr} ${dailyData[29].dayStr}`}
            <svg className="w-4 h-4 ml-3 opacity-50 cursor-pointer hover:opacity-100" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </div>

          <button className="px-4 py-2 bg-slate-100 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-200 transition-colors flex items-center">
            <svg className="w-4 h-4 mr-2 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
            Export
          </button>
        </div>

        {/* The Interactive Wrapper */}
        <div className="w-full relative px-2">
          <DailyTrendChart 
            data={dailyData} 
            activeIndex={activeIndex} 
            onBarClick={(index) => setActiveIndex(index)} 
          />
        </div>

        {/* Dynamic Gray Interactive Panel */}
        {selectedNode && (
          <div className="mt-8 bg-slate-100 border border-slate-200 rounded-xl p-5 mx-6 shadow-sm transition-all relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4 opacity-5 bg-slate-900 w-32 h-32 rounded-full -mr-16 -mt-16"></div>
             
             <h3 className="text-lg font-bold text-slate-800 tracking-tight mb-4">{selectedNode.fullDateString}</h3>
             
             <div className="flex justify-between items-center relative z-10">
               <div>
                 <div className="flex items-center text-slate-500 text-sm mb-1 font-medium">
                   <div className="w-3 h-3 bg-emerald-400 rounded-sm mr-2 flex-shrink-0"></div>
                   Income
                 </div>
                 <span className="text-2xl font-bold text-emerald-600 block leading-none">
                   ${selectedNode.income.toLocaleString()}
                 </span>
               </div>
               
               <div className="text-right">
                 <div className="flex items-center justify-end text-slate-500 text-sm mb-1 font-medium">
                   Expense
                 </div>
                 <span className="text-2xl font-bold text-rose-500 block leading-none relative">
                   <span className="absolute -left-4 top-1/2 -translate-y-1/2 w-3 h-3 bg-rose-400 rounded-sm mr-2 flex-shrink-0"></span>
                   ${selectedNode.expense.toLocaleString()}
                 </span>
               </div>
             </div>
          </div>
        )}
        
        {/* Footnote legend */}
        <div className="flex justify-center items-center space-x-6 mt-6 pb-2 text-xs font-semibold text-slate-400">
           <div className="flex items-center"><span className="w-2.5 h-2.5 rounded-full bg-emerald-400 mr-2"></span> Income</div>
           <div className="flex items-center"><span className="w-2.5 h-2.5 rounded-full bg-rose-400 mr-2"></span> Expense</div>
        </div>

      </div>
    </div>
  );
};

export default Summary;

import React, { useState, useEffect } from 'react';
import api from '../services/api';
import BudgetProgress from './BudgetProgress';

const BudgetManager = () => {
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Form State
  const [category, setCategory] = useState('');
  const [limit, setLimit] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchBudgets = async () => {
    try {
      const res = await api.get('/budget/status');
      setBudgets(res.data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch budgets:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBudgets();
  }, []);

  const handleSetBudget = async (e) => {
    e.preventDefault();
    if (!category || !limit) return;
    
    setIsSubmitting(true);
    try {
      await api.post('/budget', {
        category,
        limit: Number(limit)
      });
      setCategory('');
      setLimit('');
      await fetchBudgets(); // Refresh stats!
    } catch (error) {
      console.error('Failed to set budget', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-full flex flex-col">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-slate-800 tracking-tight">Category Budgets</h3>
        <p className="text-sm text-slate-500 mt-1">Track spending against your set limits.</p>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 mb-6 relative min-h-[200px]">
        {loading ? (
          <p className="text-slate-500 italic text-center py-8">Loading budgets...</p>
        ) : budgets.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 h-full text-center">
            <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center mb-3">
              <svg className="w-6 h-6 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            </div>
            <p className="text-slate-500 font-medium">No budgets created yet.</p>
            <p className="text-xs text-slate-400 mt-1">Add a limit below to start tracking.</p>
          </div>
        ) : (
          budgets.map((b) => <BudgetProgress key={b.id} budget={b} />)
        )}
      </div>

      {/* Set Budget Form */}
      <form onSubmit={handleSetBudget} className="mt-auto pt-4 border-t border-slate-100 flex flex-col sm:flex-row gap-3">
        <input 
          type="text" 
          placeholder="Category (e.g. Groceries)" 
          required 
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="flex-1 px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50 focus:bg-white transition-colors text-sm"
        />
        <input 
          type="number" 
          placeholder="Limit $" 
          required 
          min="1"
          step="0.01"
          value={limit}
          onChange={(e) => setLimit(e.target.value)}
          className="w-full sm:w-28 px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50 focus:bg-white transition-colors text-sm"
        />
        <button 
          type="submit" 
          disabled={isSubmitting}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-medium rounded-xl transition-colors disabled:opacity-50 text-sm whitespace-nowrap"
        >
          {isSubmitting ? 'Saving' : 'Set Limit'}
        </button>
      </form>
    </div>
  );
};

export default BudgetManager;

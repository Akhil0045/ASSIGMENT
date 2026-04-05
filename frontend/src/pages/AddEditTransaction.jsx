import { useNavigate, useParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import React, { useState, useEffect, useContext } from 'react';
import api from '../services/api';
import SearchableSelect from '../components/SearchableSelect';

const INCOME_CATEGORIES = ['Revenue', 'Salary', 'Business', 'Investments', 'Freelance', 'Loan', 'Insurance', 'Other'];
const EXPENSE_CATEGORIES = ['Operations', 'Rent', 'Utilities', 'Transportation', 'Software', 'Healthcare', 'Marketing', 'Equipment', 'Other'];

const AddEditTransaction = () => {
  const { user } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    amount: '',
    type: 'expense',
    category: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    targetUserEmail: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  useEffect(() => {
    if (isEditMode) {
      const fetchTransaction = async () => {
        try {
          const res = await api.get('/transactions', { params: { limit: 100 } });
          const txn = res.data.transactions.find((t) => t.id === id);
          if (txn) {
            setFormData({
              amount: txn.amount,
              type: txn.type,
              category: txn.category,
              description: txn.description || '',
              date: new Date(txn.date).toISOString().split('T')[0],
              targetUserEmail: ''
            });
          }
        } catch (err) {
          console.error(err);
        }
      };
      fetchTransaction();
    }
  }, [id, isEditMode]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.category) {
      setError('Please select a category from the popover.');
      return;
    }
    setError('');
    setIsLoading(true);
    try {
      const payload = {
        ...formData,
        amount: Number(formData.amount)
      };
      
      // If the admin is empty or they aren't an admin, we don't pass the email 
      if (user?.role !== 'admin' || isEditMode) {
        delete payload.targetUserEmail;
      }

      if (isEditMode) {
        await api.put(`/transactions/${id}`, payload);
      } else {
        await api.post('/transactions', payload);
      }
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save transaction');
      setIsLoading(false);
    }
  };

  const categoryOptions = formData.type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  return (
    <div className="max-w-3xl mx-auto py-6 flex flex-col justify-center min-h-[85vh]">
      <div className="bg-white p-8 sm:p-12 rounded-3xl shadow-xl border border-slate-100 flex-1 flex flex-col justify-center">
        <div className="mb-10 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-50 text-indigo-600 mb-4">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            {isEditMode ? 'Edit Financial Record' : 'Log Financial Entry'}
          </h2>
          <p className="text-slate-500 mt-2 text-lg">Record income or expenses with category, amount, and date.</p>
        </div>

        {error && <div className="mb-8 p-4 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 text-sm font-semibold text-center">{error}</div>}
        
        <form onSubmit={handleSubmit} className="space-y-8 max-w-xl mx-auto w-full">
          {/* Type Toggle using Pills */}
          <div className="flex p-1 bg-slate-100 rounded-xl max-w-sm mx-auto shadow-inner">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, type: 'expense', category: '' })}
              className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${formData.type === 'expense' ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Expense
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, type: 'income', category: '' })}
              className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${formData.type === 'income' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Income
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">Category</label>
              <SearchableSelect 
                options={categoryOptions}
                value={formData.category}
                onChange={handleChange}
                placeholder="Select category..."
              />
            </div>
            
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">Amount ($)</label>
              <input 
                type="number" 
                step="0.01" 
                name="amount" 
                value={formData.amount} 
                onChange={handleChange} 
                required 
                min="0.01" 
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow shadow-sm text-lg font-bold text-slate-800 placeholder-slate-300"
                placeholder="0.00"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">Date</label>
            <input 
              type="date" 
              name="date" 
              value={formData.date} 
              onChange={handleChange} 
              required 
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow shadow-sm font-medium text-slate-700"
            />
          </div>

          {user?.role === 'admin' && !isEditMode && (
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">Target User Email</label>
              <input 
                type="email" 
                name="targetUserEmail" 
                value={formData.targetUserEmail} 
                onChange={handleChange} 
                required 
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow shadow-sm font-medium text-slate-700"
                placeholder="Target viewer email (e.g. eve@finapp.com)"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">Note (Optional)</label>
            <input 
              type="text"
              name="description" 
              value={formData.description} 
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow shadow-sm"
              placeholder="E.g. Monthly internet bill..."
            />
          </div>

          <div className="flex gap-4 pt-4">
            <button 
              type="button" 
              onClick={() => navigate('/')}
              className="flex-1 py-4 rounded-xl text-slate-700 font-bold hover:bg-slate-100 transition-colors border border-slate-200"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={isLoading}
              className="flex-[2] py-4 rounded-xl text-white font-bold bg-slate-900 hover:bg-black shadow-xl transition-all transform hover:-translate-y-1 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLoading ? 'Processing...' : (isEditMode ? 'Update Record' : 'Save Entry')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEditTransaction;

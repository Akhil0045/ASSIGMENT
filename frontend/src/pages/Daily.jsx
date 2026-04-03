import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import SearchableSelect from '../components/SearchableSelect';
import { Link } from 'react-router-dom';

const INCOME_CATEGORIES = ['All Categories', 'Salary', 'Business', 'Investments', 'Extra income', 'Loan', 'Parental leave', 'Insurance payout', 'Other'];
const EXPENSE_CATEGORIES = ['All Categories', 'Groceries', 'Rent', 'Utilities', 'Transportation', 'Entertainment', 'Healthcare', 'Dining Out', 'Shopping', 'Other'];

const Daily = () => {
  const { user } = useContext(AuthContext);
  const [transactions, setTransactions] = useState([]);
  const [filterType, setFilterType] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [searchNotes, setSearchNotes] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchTransactions = async () => {
    try {
      const params = { page, limit: 10 };
      if (filterType && filterType !== 'All Types') params.type = filterType;
      if (filterCategory && filterCategory !== 'All Categories') params.category = filterCategory;

      const res = await api.get('/transactions', { params });
      setTransactions(res.data.transactions);
      setTotalPages(res.data.pages);
    } catch (err) {
      console.error('Failed to fetch transactions');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      await api.delete(`/transactions/${id}`);
      fetchTransactions();
    }
  };

  const handleExportCSV = async () => {
    try {
      // Fetch completely unabridged list for Excel export!
      const res = await api.get('/transactions', { params: { limit: 1000 } });
      const fullSet = res.data.transactions;
      
      const header = ['Category', 'Note', 'Wallet', 'Type', 'Amount', 'Date'];
      const rows = fullSet.map(t => [
        t.category,
        `"${(t.description || '').replace(/"/g, '""')}"`, // escape quotes for CSV
        'DEFAULT',
        t.type,
        t.amount,
        new Date(t.date).toLocaleDateString()
      ]);
      
      const csvContent = [header, ...rows].map(e => e.join(",")).join("\n");
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'Daily_Transactions_Export.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Failed to export dataset", error);
      alert("Failed to export to CSV.");
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [page, filterType, filterCategory]);

  const categoryOptions = filterType === 'income' ? INCOME_CATEGORIES : (filterType === 'expense' ? EXPENSE_CATEGORIES : [...new Set([...INCOME_CATEGORIES, ...EXPENSE_CATEGORIES])]);

  return (
    <div className="flex flex-col h-full bg-slate-50 p-6 md:p-8 space-y-6">
      <div className="mb-2">
        <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Daily ledger</h2>
        <p className="text-slate-500 mt-1">Add inputs directly at exact points in time.</p>
      </div>

      {/* Top Filter Bar */}
      <div className="flex flex-col xl:flex-row gap-4 mb-2">
        <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
          <div className="relative h-full">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            <input 
              type="text" 
              placeholder="Search..." 
              value={searchNotes}
              onChange={(e) => setSearchNotes(e.target.value)}
              className="w-full h-11 pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm shadow-sm transition-colors"
            />
          </div>
          <div className="h-11">
             <SearchableSelect options={['All Types', 'income', 'expense']} value={filterType || 'All Types'} onChange={(e) => { setFilterType(e.target.value); setPage(1); }} placeholder="All Types" />
          </div>
          <div className="h-11">
             <SearchableSelect options={categoryOptions} value={filterCategory || 'All Categories'} onChange={(e) => { setFilterCategory(e.target.value); setPage(1); }} placeholder="All Categories" />
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex items-center gap-3 mb-6">
        <Link to="/add-transaction" className="px-5 py-2.5 bg-orange-700 hover:bg-orange-800 text-white rounded-xl text-sm font-bold shadow transition-colors flex items-center">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
          Add
        </Link>
        <button onClick={handleExportCSV} className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors flex items-center group">
          <svg className="w-4 h-4 mr-2 text-emerald-600 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
          Export CSV
        </button>
      </div>

      {/* Main Table Area */}
      <div className="bg-white border flex-1 border-slate-200 rounded-2xl overflow-hidden flex flex-col">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 bg-slate-50 hidden md:table-row">
                <th className="px-6 py-4 font-semibold w-12 text-center">
                  <input type="checkbox" className="rounded text-indigo-600 border-slate-300 focus:ring-indigo-500" />
                </th>
                <th className="px-6 py-4 font-semibold text-left">Category</th>
                <th className="px-6 py-4 font-semibold text-left">Note</th>
                <th className="px-6 py-4 font-semibold text-right">Amount</th>
                <th className="px-6 py-4 font-semibold text-left">Date</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-slate-500">
                    No transactions found.
                  </td>
                </tr>
              ) : (
                transactions.map((t) => {
                  const isIncome = t.type === 'income';
                  return (
                    <tr key={t._id} className="hover:bg-slate-50 transition-colors group">
                      <td className="px-6 py-4 hidden md:table-cell text-center">
                        <input type="checkbox" className="rounded text-indigo-600 border-slate-300" />
                      </td>
                      <td className="px-6 py-4 text-left">
                        <div className="flex items-center">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center mr-3 shrink-0 ${isIncome ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-600'}`}>
                            {isIncome ? (
                              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                            ) : (
                              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
                            )}
                          </div>
                          <span className="font-semibold text-slate-800 capitalize truncate">{t.category}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-500 text-sm max-w-[200px] truncate text-left">{t.description || '-'}</td>
                      <td className={`px-6 py-4 text-right font-bold tracking-tight whitespace-nowrap ${isIncome ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {isIncome ? '+' : '-'}${t.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="px-6 py-4 text-slate-500 text-sm whitespace-nowrap text-left">{new Date(t.date).toLocaleDateString()}</td>
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <div className="flex justify-end space-x-2 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                          <Link to={`/edit-transaction/${t._id}`} className="p-2 text-slate-400 hover:text-indigo-600 bg-white rounded-lg border border-transparent hover:border-indigo-100 transition-all">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                          </Link>
                          <button onClick={() => handleDelete(t._id)} className="p-2 text-slate-400 hover:text-rose-600 bg-white rounded-lg border border-transparent hover:border-rose-100 transition-all">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        
        <div className="bg-white border-t border-slate-100 p-4 flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400 tracking-wide uppercase">Showing transactions on Page {page}</span>
          {totalPages > 1 && (
            <div className="flex space-x-2">
              <button disabled={page === 1} onClick={() => setPage((p) => p - 1)} className="px-3 py-1 bg-slate-50 border border-slate-200 rounded text-slate-600 disabled:opacity-50 text-sm">Prev</button>
              <button disabled={page === totalPages} onClick={() => setPage((p) => p + 1)} className="px-3 py-1 bg-slate-50 border border-slate-200 rounded text-slate-600 disabled:opacity-50 text-sm">Next</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Daily;

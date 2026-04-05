/**
 * UserFilter Component
 * Visible only to analyst and admin roles.
 * Lets them search by email to filter data to a specific user.
 * Viewer role: never shown, always sees own data.
 */
import React, { useState, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';

const UserFilter = ({ onFilter, onClear, activeEmail }) => {
  const { user } = useContext(AuthContext);
  const canFilter = user?.role === 'analyst' || user?.role === 'admin';

  const [emailInput, setEmailInput] = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  if (!canFilter) return null;

  const handleApply = async (e) => {
    e.preventDefault();
    if (!emailInput.trim()) return;
    setLoading(true);
    setError('');
    try {
      // Verify user exists by hitting any scoped endpoint
      await api.get('/transactions', { params: { email: emailInput.trim(), limit: 1 } });
      onFilter(emailInput.trim());
      setEmailInput('');
    } catch (err) {
      const msg = err.response?.data?.message || 'User not found';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setEmailInput('');
    setError('');
    onClear();
  };

  return (
    <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-6 h-6 rounded-lg bg-indigo-100 flex items-center justify-center">
          <svg className="w-3.5 h-3.5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
          </svg>
        </div>
        <p className="text-xs font-bold text-indigo-700 uppercase tracking-widest">
          Filter by User
          <span className="ml-2 font-normal text-indigo-400 normal-case tracking-normal">
            ({user?.role === 'admin' ? 'Admin' : 'Analyst'} view)
          </span>
        </p>
      </div>

      {/* Active filter badge */}
      {activeEmail && (
        <div className="flex items-center gap-2 mb-3 p-2.5 bg-indigo-600 rounded-xl">
          <svg className="w-4 h-4 text-indigo-200 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z"/>
          </svg>
          <span className="text-sm font-bold text-white flex-1 truncate">
            Showing data for: <span className="font-mono">{activeEmail}</span>
          </span>
          <button
            onClick={handleClear}
            className="shrink-0 text-indigo-200 hover:text-white transition-colors text-xs font-semibold bg-indigo-700 hover:bg-indigo-800 px-2 py-1 rounded-lg"
          >
            Clear ×
          </button>
        </div>
      )}

      {!activeEmail && (
        <form onSubmit={handleApply} className="flex gap-2">
          <div className="relative flex-1">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
            <input
              type="email"
              value={emailInput}
              onChange={e => { setEmailInput(e.target.value); setError(''); }}
              placeholder="Search by user email..."
              className="w-full h-9 pl-9 pr-3 text-sm bg-white border border-indigo-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 text-slate-700 placeholder-indigo-300"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !emailInput.trim()}
            className="h-9 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
          >
            {loading ? '...' : 'Apply'}
          </button>
          <button
            type="button"
            onClick={handleClear}
            className="h-9 px-3 text-indigo-500 hover:text-indigo-700 text-sm font-semibold hover:bg-indigo-100 rounded-xl transition-colors"
          >
            All Users
          </button>
        </form>
      )}

      {error && (
        <p className="mt-2 text-xs font-semibold text-rose-600 flex items-center gap-1">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          {error}
        </p>
      )}

      {!activeEmail && (
        <p className="mt-2 text-xs text-indigo-400">
          Leave empty to view aggregated data across all users.
        </p>
      )}
    </div>
  );
};

export default UserFilter;

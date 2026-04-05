import React, { useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';

const ROLES = ['viewer', 'analyst', 'admin'];

const ROLE_STYLE = {
  admin:   'bg-violet-100 text-violet-700 border-violet-200',
  analyst: 'bg-blue-100 text-blue-700 border-blue-200',
  viewer:  'bg-slate-100 text-slate-600 border-slate-200',
};

const AdminUsers = () => {
  const { user: me } = useContext(AuthContext);
  const [users, setUsers]   = useState([]);
  const [total, setTotal]   = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ role: '', isActive: '' });
  const [toast, setToast]   = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filter.role) params.role = filter.role;
      if (filter.isActive !== '') params.isActive = filter.isActive;
      const res = await api.get('/admin/users', { params });
      setUsers(res.data.users);
      setTotal(res.data.total);
    } catch {
      showToast('Failed to load users', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, [filter]);

  const handleRoleChange = async (id, role) => {
    try {
      await api.put(`/admin/users/${id}/role`, { role });
      showToast(`Role updated to ${role}`);
      fetchUsers();
    } catch (e) {
      showToast(e.response?.data?.message || 'Failed to update role', 'error');
    }
  };

  const handleToggleStatus = async (id, current) => {
    try {
      await api.put(`/admin/users/${id}/status`, { isActive: !current });
      showToast(`User ${!current ? 'activated' : 'deactivated'}`);
      fetchUsers();
    } catch (e) {
      showToast(e.response?.data?.message || 'Failed to update status', 'error');
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 p-6 md:p-8 space-y-6">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-xl font-semibold text-sm shadow-lg ${toast.type === 'error' ? 'bg-rose-600 text-white' : 'bg-emerald-600 text-white'}`}>
          {toast.msg}
        </div>
      )}

      <div>
        <h2 className="text-3xl font-bold text-slate-900 tracking-tight">User Management</h2>
        <p className="text-slate-500 mt-1">Manage user roles, status, and access permissions. <span className="font-semibold text-slate-700">{total} total users</span></p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <select value={filter.role} onChange={e => setFilter(f => ({ ...f, role: e.target.value }))}
          className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-400">
          <option value="">All Roles</option>
          {ROLES.map(r => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
        </select>
        <select value={filter.isActive} onChange={e => setFilter(f => ({ ...f, isActive: e.target.value }))}
          className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-400">
          <option value="">All Status</option>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>
        <button onClick={fetchUsers} className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors">
          Refresh
        </button>
      </div>

      {/* User Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm flex-1">
        {loading ? (
          <div className="flex items-center justify-center h-64 text-slate-400 font-medium">Loading users...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-500">
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Transactions</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {users.map(u => (
                  <tr key={u.id} className={`hover:bg-slate-50 transition-colors ${!u.isActive ? 'opacity-50' : ''}`}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-bold text-sm shrink-0">
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800 text-sm">{u.name}</p>
                          <p className="text-xs text-slate-400">{u.email}</p>
                        </div>
                        {u.id === me?.id && <span className="text-xs text-indigo-500 font-bold bg-indigo-50 px-2 py-0.5 rounded-lg">You</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 font-medium">{u._count?.transactions ?? 0}</td>
                    <td className="px-6 py-4">
                      {u.id === me?.id ? (
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${ROLE_STYLE[u.role]}`}>{u.role}</span>
                      ) : (
                        <select
                          value={u.role}
                          onChange={e => handleRoleChange(u.id, e.target.value)}
                          className={`text-xs font-bold px-2 py-1 rounded-lg border cursor-pointer focus:outline-none ${ROLE_STYLE[u.role]}`}
                        >
                          {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${u.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-600'}`}>
                        {u.isActive ? '● Active' : '○ Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {u.id !== me?.id && (
                        <button
                          onClick={() => handleToggleStatus(u.id, u.isActive)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${u.isActive ? 'bg-rose-50 text-rose-600 hover:bg-rose-100' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'}`}
                        >
                          {u.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr><td colSpan="5" className="px-6 py-12 text-center text-slate-400">No users found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUsers;

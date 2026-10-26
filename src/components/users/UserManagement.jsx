import React, { useState, useEffect, useMemo } from 'react';
import { Users, Search, Phone, Mail, Calendar, ShieldCheck, UserCheck } from 'lucide-react';
import API from '../../services/api'; // Adjust path if necessary to match your project structure

const UserManagement = () => {
  // Initialize state from sessionStorage for instant zero-delay loading
  const [users, setUsers] = useState(() => {
    const cached = sessionStorage.getItem('users_cache');
    return cached ? JSON.parse(cached) : [];
  });
  
  const [loading, setLoading] = useState(() => !sessionStorage.getItem('users_cache'));
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch users from API using Axios with background revalidation
  const fetchUsers = async (isBackground = false) => {
    try {
      if (!isBackground && users.length === 0) setLoading(true);
      setError(null);
      
      const response = await API.get('/api/users');
      
      // Handle Laravel pagination or direct array responses safely
      let rawData = response.data.data || response.data.users || response.data;
      if (rawData && !Array.isArray(rawData) && Array.isArray(rawData.data)) {
        rawData = rawData.data; // Unpack Laravel pagination wrapper
      }
      
      const validUsers = Array.isArray(rawData) ? rawData : [];
      
      setUsers(validUsers);
      sessionStorage.setItem('users_cache', JSON.stringify(validUsers)); // Cache for instant future loads
      setError(null);
    } catch (err) {
      console.error('Error fetching users:', err);
      setUsers((currentUsers) => {
        if (currentUsers.length === 0) {
          setError('Unable to sync users from the backend server.');
        }
        return currentUsers;
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(users.length > 0);
  }, []);

  // Optimized filtering using useMemo
  const filteredUsers = useMemo(() => {
    return users.filter(u => 
      (u.name || u.fullName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.mobile || u.phone || '').includes(searchQuery)
    );
  }, [users, searchQuery]);

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col space-y-4">
      {/* Header & Stats */}
      <div className="flex-none flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-800">User Management</h1>
          <p className="text-xs text-slate-500 mt-0.5">Track and view registered customers and app users</p>
        </div>
        <div className="bg-teal-50 border border-teal-200 text-teal-800 px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-2">
          <Users size={14} className="text-teal-600" />
          <span>Total Users: {users.length}</span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex-none bg-white p-3.5 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search users by name, email, or mobile number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-teal-500 transition-colors"
          />
        </div>
      </div>

      {error && (
        <div className="flex-none bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl text-sm">
          {error}
        </div>
      )}

      {/* Table Container with Internal Scroll */}
      <div className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col min-h-0">
        <div className="flex-1 overflow-y-auto">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-slate-50 z-10 shadow-sm">
              <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3.5 px-5">User Name</th>
                <th className="py-3.5 px-5">Contact Details</th>
                <th className="py-3.5 px-5">Registered Date</th>
                <th className="py-3.5 px-5 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {loading && users.length === 0 ? (
                <tr>
                  <td colSpan="4" className="py-16 text-center text-slate-400 font-medium">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <div className="w-6 h-6 border-2 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
                      <p className="text-xs text-slate-500">Waking up Render server & fetching users...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="4" className="py-12 text-center text-slate-400 font-medium">
                    No users found.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr key={u.id || u._id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-5 font-semibold text-slate-800">
                      <div className="flex items-center space-x-3">
                        <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold text-xs">
                          {(u.name || u.fullName || 'U').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div>{u.name || u.fullName || 'Unnamed User'}</div>
                          <div className="text-xs text-slate-400 font-normal">ID: {u.id || u._id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-5 text-slate-600">
                      <div className="flex items-center space-x-1.5 text-xs">
                        <Phone size={13} className="text-slate-400" />
                        <span>{u.mobile || u.phone || 'N/A'}</span>
                      </div>
                      <div className="flex items-center space-x-1.5 text-xs mt-0.5">
                        <Mail size={13} className="text-slate-400" />
                        <span>{u.email || 'N/A'}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-5 text-slate-600 text-xs">
                      <div className="flex items-center space-x-1">
                        <Calendar size={13} className="text-slate-400" />
                        <span>{u.createdAt || u.created_at || 'Recent'}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <span className="inline-flex items-center space-x-1 bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full text-xs font-semibold">
                        <UserCheck size={13} />
                        <span>Active</span>
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;
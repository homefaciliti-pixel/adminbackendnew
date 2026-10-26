import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { Search, ChevronLeft, ChevronRight, Calendar, Clock, User, CheckCircle2, Eye } from 'lucide-react';

const AmcVisits = () => {
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  const fetchAmcVisits = async () => {
    try {
      setLoading(true);
      // Endpoint for visits list with optional search and status parameters
      const response = await API.get('/api/amc/dashboard/today-visits', {
        params: {
          page,
          limit,
          search: searchQuery || undefined,
          status: statusFilter !== 'all' ? statusFilter : undefined
        }
      });

      const resData = response.data?.data || response.data;
      if (Array.isArray(resData)) {
        setVisits(resData);
        setTotalPages(1);
      } else {
        setVisits(resData.visits || resData.docs || resData.items || []);
        setTotalPages(resData.totalPages || resData.pages || 1);
      }
    } catch (err) {
      console.error('Error fetching AMC visits:', err);
      // Fallback to empty array if endpoint fails or isn't built yet
      setVisits([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAmcVisits();
  }, [page, searchQuery, statusFilter]);

  return (
    <div className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col min-h-0">
      {/* Header & Controls */}
      <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-800">AMC Visit History & Schedule</h2>
          <p className="text-xs text-slate-500">Monitor technician visit schedules, pending maintenance, and completed logs</p>
        </div>

        <div className="flex items-center space-x-3 w-full sm:w-auto">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-teal-500 transition-colors"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
            <option value="today">Today's Visits</option>
          </select>

          {/* Search Bar */}
          <div className="relative w-full sm:w-64">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search customer, partner..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-teal-500 transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Table Content */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-6 h-6 border-2 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs text-slate-400 mt-2">Loading visit schedules...</p>
          </div>
        ) : visits.length === 0 ? (
          <div className="text-center py-20 text-slate-400 text-xs">No visit records found matching criteria.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-100 text-slate-500 font-semibold">
                  <th className="p-4">Customer Name</th>
                  <th className="p-4">Service Name</th>
                  <th className="p-4">Assigned Partner</th>
                  <th className="p-4">Scheduled Date</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {visits.map((vis, idx) => (
                  <tr key={vis.id || vis._id || idx} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 font-semibold text-slate-800">
                      {vis.customerName || 'N/A'}
                      <div className="text-[11px] font-normal text-slate-400">
                        {vis.mobile || vis.phone || ''}
                      </div>
                    </td>
                    <td className="p-4 text-slate-600 font-medium">
                      {vis.serviceName || 'Maintenance Check'}
                    </td>
                    <td className="p-4 text-slate-700">
                      <div className="flex items-center space-x-1">
                        <User size={12} className="text-teal-600" />
                        <span>{vis.partnerName || 'Unassigned'}</span>
                      </div>
                    </td>
                    <td className="p-4 text-slate-600">
                      <div className="flex items-center space-x-1">
                        <Calendar size={12} className="text-slate-400" />
                        <span>{vis.visitDate || vis.date || 'N/A'}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                        vis.status === 'completed' 
                          ? 'bg-emerald-50 text-emerald-700' 
                          : 'bg-amber-50 text-amber-700'
                      }`}>
                        {vis.status === 'completed' ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                        <span className="capitalize">{vis.status || 'Pending'}</span>
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => alert(`View visit details: ${vis.id || vis._id}`)}
                        className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition-colors inline-flex items-center"
                        title="View Details"
                      >
                        <Eye size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination Footer */}
      <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 bg-white">
        <div>Page {page} of {totalPages || 1}</div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            disabled={page === 1}
            className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft size={14} />
          </button>
          <button
            onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
            disabled={page >= totalPages}
            className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AmcVisits;
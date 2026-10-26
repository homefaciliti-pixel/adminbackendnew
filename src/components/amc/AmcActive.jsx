import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { Search, ChevronLeft, ChevronRight, Phone, Building2, Calendar, ShieldCheck, Eye, RefreshCw, XCircle } from 'lucide-react';

const AmcActive = () => {
  const [activeAmcs, setActiveAmcs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  // Fetch active AMCs with search and pagination params
  const fetchActiveAmcs = async () => {
    try {
      setLoading(true);
      const response = await API.get('/api/amc/active', {
        params: {
          page,
          limit,
          search: searchQuery || undefined
        }
      });

      const resData = response.data?.data || response.data;
      // Handle array or paginated object structure
      if (Array.isArray(resData)) {
        setActiveAmcs(resData);
        setTotalPages(1);
      } else {
        setActiveAmcs(resData.amcs || resData.docs || resData.items || []);
        setTotalPages(resData.totalPages || resData.pages || 1);
      }
    } catch (err) {
      console.error('Error fetching active AMC contracts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveAmcs();
  }, [page, searchQuery]);

  return (
    <div className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col min-h-0">
      {/* Header & Search Bar */}
      <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-800">Active AMC Contracts</h2>
          <p className="text-xs text-slate-500">Manage and track currently running maintenance agreements</p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by customer, mobile..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1); // reset to first page on search
            }}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-teal-500 transition-colors"
          />
        </div>
      </div>

      {/* Table Content */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-6 h-6 border-2 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs text-slate-400 mt-2">Loading active contracts...</p>
          </div>
        ) : activeAmcs.length === 0 ? (
          <div className="text-center py-20 text-slate-400 text-xs">No active AMC contracts found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-100 text-slate-500 font-semibold">
                  <th className="p-4">Customer Name</th>
                  <th className="p-4">Contact</th>
                  <th className="p-4">Category / Service</th>
                  <th className="p-4">Valid Till</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {activeAmcs.map((item, idx) => (
                  <tr key={item.id || item._id || idx} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 font-semibold text-slate-800">
                      {item.customerName || item.name || 'N/A'}
                      <div className="text-[11px] font-normal text-slate-400 flex items-center space-x-1 mt-0.5">
                        <Building2 size={12} />
                        <span>{item.city || item.address || 'Standard Location'}</span>
                      </div>
                    </td>
                    <td className="p-4 text-slate-600">
                      <div className="flex items-center space-x-1">
                        <Phone size={12} className="text-slate-400" />
                        <span>{item.mobile || item.phone || 'N/A'}</span>
                      </div>
                    </td>
                    <td className="p-4 text-slate-600 font-medium">
                      {item.category || item.serviceName || 'General AMC'}
                    </td>
                    <td className="p-4 text-slate-600">
                      <div className="flex items-center space-x-1 text-teal-700 font-medium">
                        <Calendar size={12} />
                        <span>{item.expiryDate || item.endDate || 'N/A'}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center space-x-1 bg-teal-50 text-teal-700 px-2.5 py-1 rounded-full text-[11px] font-semibold">
                        <ShieldCheck size={12} />
                        <span>Active</span>
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <button 
                        onClick={() => alert(`View details for contract: ${item.id || item._id}`)}
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

export default AmcActive;
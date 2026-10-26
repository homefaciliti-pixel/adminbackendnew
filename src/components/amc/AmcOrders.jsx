import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { Search, ChevronLeft, ChevronRight, ShoppingBag, Calendar, IndianRupee, Eye } from 'lucide-react';

const AmcOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  const fetchAmcOrders = async () => {
    try {
      setLoading(true);
      // Using dashboard recent orders or dedicated amc orders endpoint
      const response = await API.get('/api/amc/dashboard/recent-orders', {
        params: {
          page,
          limit,
          search: searchQuery || undefined
        }
      });

      const resData = response.data?.data || response.data;
      if (Array.isArray(resData)) {
        setOrders(resData);
        setTotalPages(1);
      } else {
        setOrders(resData.orders || resData.docs || resData.items || []);
        setTotalPages(resData.totalPages || resData.pages || 1);
      }
    } catch (err) {
      console.error('Error fetching AMC orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAmcOrders();
  }, [page, searchQuery]);

  return (
    <div className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col min-h-0">
      {/* Header & Search Bar */}
      <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-800">AMC Orders & Bookings</h2>
          <p className="text-xs text-slate-500">Track service requests and bookings generated via AMC contracts</p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by order ID, customer..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
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
            <p className="text-xs text-slate-400 mt-2">Loading AMC orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-20 text-slate-400 text-xs">No AMC orders found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-100 text-slate-500 font-semibold">
                  <th className="p-4">Request / Order #</th>
                  <th className="p-4">Customer Name</th>
                  <th className="p-4">Service Name</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.map((ord, idx) => (
                  <tr key={ord.id || ord._id || idx} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 font-semibold text-teal-700">
                      {ord.serviceRequestNumber || `#AMC-${ord.id || ord._id}`}
                    </td>
                    <td className="p-4 font-medium text-slate-800">
                      {ord.customerName || 'N/A'}
                    </td>
                    <td className="p-4 text-slate-600">
                      {ord.serviceName || 'Maintenance Service'}
                    </td>
                    <td className="p-4 font-bold text-slate-800">
                      ₹{ord.amount || ord.serviceAmount || 0}
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center space-x-1 bg-teal-50 text-teal-700 px-2.5 py-1 rounded-full text-[11px] font-semibold">
                        {ord.status || 'Completed'}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => alert(`View order details: ${ord.id || ord._id}`)}
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

export default AmcOrders;
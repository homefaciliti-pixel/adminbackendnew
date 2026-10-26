import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { IndianRupee, Search, Calendar } from 'lucide-react';

const BookingEarnings = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [stats, setStats] = useState({
    totalEarnings: 0,
    totalTransactions: 0,
    filteredEarnings: 0,
    filteredTransactions: 0
  });
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch booking earnings data matching the exact backend response structure
  const fetchBookings = async (search = '') => {
    try {
      setLoading(true);
      // Use the absolute URL directly to test if proxy is the issue
      const baseUrl = 'https://adminbackend-1-h03r.onrender.com/api/earnings/bookings';
      const url = search 
        ? `${baseUrl}?query=${encodeURIComponent(search)}` 
        : baseUrl;
      
      const response = await axios.get(url);
      
      if (response.data && response.data.success) {
        setData(response.data.data || []);
        setStats({
          totalEarnings: response.data.totalBookingEarnings || 0,
          totalTransactions: response.data.totalTransactions || 0,
          filteredEarnings: response.data.filteredBookingEarnings || 0,
          filteredTransactions: response.data.filteredTransactions || 0
        });
      }
    } catch (err) {
      console.error('Error fetching booking earnings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleSearch = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    fetchBookings(query);
  };

  return (
    <div className="p-6 space-y-6 bg-slate-900 min-h-screen text-slate-100">
      {/* Header & Metric Summary Cards */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Calendar className="text-teal-400" size={24} />
            Booking Earnings
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Monitor and filter all service booking transactions and earnings.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-slate-800 border border-slate-700/80 px-4 py-3 rounded-xl shadow-md">
            <span className="text-xs font-medium text-slate-400 block">Total Earnings</span>
            <span className="text-lg font-bold text-emerald-400 flex items-center mt-0.5">
              <IndianRupee size={16} className="mr-0.5" />
              {Number(stats.filteredEarnings).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
            </span>
          </div>
          <div className="bg-slate-800 border border-slate-700/80 px-4 py-3 rounded-xl shadow-md">
            <span className="text-xs font-medium text-slate-400 block">Transactions</span>
            <span className="text-lg font-bold text-teal-400 mt-0.5 block">
              {stats.filteredTransactions}
            </span>
          </div>
        </div>
      </div>

      {/* Search Input Bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input
          type="text"
          placeholder="Search by transaction ID, payment method, date..."
          value={searchQuery}
          onChange={handleSearch}
          className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-200 placeholder-slate-400 focus:outline-none focus:border-teal-500 transition-colors"
        />
      </div>

      {/* Data Table */}
      <div className="bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-700 bg-slate-800/80 text-slate-400 font-medium text-xs uppercase tracking-wider">
                <th className="py-3.5 px-4">Transaction ID</th>
                <th className="py-3.5 px-4">User Details</th>
                <th className="py-3.5 px-4">Service Amt</th>
                <th className="py-3.5 px-4">Extra Amt</th>
                <th className="py-3.5 px-4">Payment Method</th>
                <th className="py-3.5 px-4">Total Amount</th>
                <th className="py-3.5 px-4">Order Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-400">
                    <div className="flex justify-center items-center gap-2">
                      <div className="w-5 h-5 border-2 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
                      Loading booking earnings...
                    </div>
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-400">
                    No booking earnings found matching your search.
                  </td>
                </tr>
              ) : (
                data.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-700/30 transition-colors">
                    <td className="py-3.5 px-4 font-mono text-xs text-teal-400 font-medium">
                      {row.transactionId}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-slate-200">
                        {row.userDetails?.name || 'Guest User'}
                      </div>
                      <div className="text-xs text-slate-400">
                        {row.userDetails?.mobile ? `${row.userDetails.countryCode || '+91'} ${row.userDetails.mobile}` : 'No Mobile'}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-300">
                      ₹{Number(row.serviceAmount || 0).toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4 text-slate-300">
                      ₹{Number(row.extraServiceAmount || 0).toLocaleString('en-IN')}
                      {row.extraServicePaymentMethod && row.extraServicePaymentMethod !== '-' && (
                        <span className="block text-[10px] text-slate-400">({row.extraServicePaymentMethod})</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-700/60 text-slate-300 border border-slate-600/50">
                        {row.paymentMethod}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-emerald-400">
                      ₹{Number(row.totalAmount || 0).toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4 text-slate-300 text-xs">
                      {row.orderDate}
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

export default BookingEarnings;
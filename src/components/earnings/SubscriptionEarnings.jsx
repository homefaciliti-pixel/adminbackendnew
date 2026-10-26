import React, { useState, useEffect } from 'react';
import { ShieldCheck, Search, Calendar, CreditCard } from 'lucide-react';
import API from '../../services/api';

const SubscriptionEarnings = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [stats, setStats] = useState({
    totalEarnings: 0,
    totalPlans: 0,
    filteredEarnings: 0,
    filteredPlans: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch subscription earnings data matching the backend API keys
  const fetchSubscriptions = async (search = '') => {
    try {
      setLoading(true);
      setError(null);
      
      const url = search 
        ? `/api/earnings/subscriptions?query=${encodeURIComponent(search)}` 
        : '/api/earnings/subscriptions';
      
      const response = await API.get(url);
      
      if (response.data && response.data.success) {
        setSubscriptions(response.data.data || []);
        setStats({
          totalEarnings: response.data.totalSubscriptionsEarnings || 0,
          totalPlans: response.data.totalPlans || 0,
          filteredEarnings: response.data.filteredSubscriptionsEarnings || 0,
          filteredPlans: response.data.filteredPlans || 0
        });
      }
    } catch (err) {
      console.error('Error fetching subscription earnings:', err);
      setError('Unable to sync partner subscriptions from the backend server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const handleSearch = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    fetchSubscriptions(query);
  };

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col space-y-4">
      {/* Header & Stats */}
      <div className="flex-none flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Partner Subscriptions</h1>
          <p className="text-xs text-slate-500 mt-0.5">History of all active partner subscription revenue</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-teal-50 border border-teal-200 text-teal-800 px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-2">
            <ShieldCheck size={14} className="text-teal-600" />
            <span>Total Revenue: ₹{Number(stats.filteredEarnings).toLocaleString('en-IN')}</span>
          </div>
          <div className="bg-slate-100 border border-slate-200 text-slate-700 px-3.5 py-1.5 rounded-xl text-xs font-semibold">
            Plans: {stats.filteredPlans}
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex-none bg-white p-3.5 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by partner name, email, or payment method..."
            value={searchQuery}
            onChange={handleSearch}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-teal-500 transition-colors"
          />
        </div>
      </div>

      {error && (
        <div className="flex-none bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl text-sm">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col min-h-0">
        <div className="flex-1 overflow-y-auto">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-slate-50 z-10 shadow-sm">
              <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3.5 px-5">ID / Date</th>
                <th className="py-3.5 px-5">Partner Details</th>
                <th className="py-3.5 px-5">Payment Method</th>
                <th className="py-3.5 px-5">Status</th>
                <th className="py-3.5 px-5 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {loading ? (
                <tr>
                  <td colSpan="5" className="py-16 text-center text-slate-400 font-medium">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <div className="w-6 h-6 border-2 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
                      <p className="text-xs text-slate-500">Fetching partner subscriptions...</p>
                    </div>
                  </td>
                </tr>
              ) : subscriptions.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-12 text-center text-slate-400 font-medium">
                    No subscriptions found matching your search.
                  </td>
                </tr>
              ) : (
                subscriptions.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-5 font-semibold text-slate-800">
                      <div className="text-teal-700">#{item.id}</div>
                      <div className="text-xs text-slate-400 font-normal flex items-center space-x-1 mt-0.5">
                        <Calendar size={12} />
                        <span>{item.purchaseDate || 'N/A'}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-5 text-slate-700">
                      <div className="font-medium">{item.partnerName || item.partnerDetails?.name || 'Partner'}</div>
                      <div className="text-xs text-slate-400">
                        {item.partnerDetails?.mobile ? `+91 ${item.partnerDetails.mobile}` : 'No Mobile'}
                        {item.partnerDetails?.email ? ` • ${item.partnerDetails.email}` : ''}
                      </div>
                    </td>
                    <td className="py-3.5 px-5 text-slate-600 text-xs">
                      <span className="inline-flex items-center space-x-1 bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg font-medium">
                        <CreditCard size={12} className="mr-1 text-slate-500" />
                        <span>{item.paymentMethod || 'Razorpay'}</span>
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-xs">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full font-medium ${item.status === 'Paid' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                        {item.status || 'Paid'}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-right font-bold text-emerald-600">
                      +₹{Number(item.amount || 0).toLocaleString('en-IN')}
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

export default SubscriptionEarnings;
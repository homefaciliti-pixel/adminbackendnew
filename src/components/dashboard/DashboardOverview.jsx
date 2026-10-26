import React, { useState, useEffect } from 'react';
import { 
  Users, 
  FolderTree, 
  Settings, 
  ShieldCheck, 
  ShoppingBag, 
  Calendar, 
  IndianRupee, 
  CheckCircle, 
  XCircle, 
  Clock, 
  UserCheck 
} from 'lucide-react';
import API from '../../services/api';

const DashboardOverview = () => {
  const [statsData, setStatsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        setLoading(true);
        const response = await API.get('/api/dashboard');
        
        console.log('Live Dashboard API Result:', response.data);
        
        const resultData = response.data?.data || response.data;
        setStatsData(Array.isArray(resultData) ? resultData : []);
        setError(null);
      } catch (err) {
        console.error('Error fetching dashboard statistics:', err);
        setError('Unable to sync live statistics from the backend server.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  // Helper function to find the exact metric by name from your backend array
  const getStatItem = (metricName) => {
    if (!Array.isArray(statsData) || statsData.length === 0) return null;
    return statsData.find(item => 
      item.name?.toLowerCase().trim() === metricName.toLowerCase().trim()
    );
  };

  // Configuration mapping backend names to clean Lucide icons & styling
  const statsConfig = [
    { title: 'Total Users', isCurrency: false, icon: <Users size={22} className="text-teal-600" />, bg: 'bg-teal-50' },
    { title: 'Total Categories', isCurrency: false, icon: <FolderTree size={22} className="text-blue-600" />, bg: 'bg-blue-50' },
    { title: 'Total Services', isCurrency: false, icon: <Settings size={22} className="text-indigo-600" />, bg: 'bg-indigo-50' },
    { title: 'Total Partners', isCurrency: false, icon: <ShieldCheck size={22} className="text-emerald-600" />, bg: 'bg-emerald-50' },
    { title: 'Total Orders', isCurrency: false, icon: <ShoppingBag size={22} className="text-purple-600" />, bg: 'bg-purple-50' },
    { title: 'Today Orders', isCurrency: false, icon: <Calendar size={22} className="text-amber-600" />, bg: 'bg-amber-50' },
    { title: 'Complete Orders', isCurrency: false, icon: <CheckCircle size={22} className="text-green-600" />, bg: 'bg-green-50' },
    { title: 'Assigned Orders', isCurrency: false, icon: <Users size={22} className="text-cyan-600" />, bg: 'bg-cyan-50' },
    { title: 'In Progress Orders', isCurrency: false, icon: <Clock size={22} className="text-orange-600" />, bg: 'bg-orange-50' },
    { title: 'Cancel Orders', isCurrency: false, icon: <XCircle size={22} className="text-rose-600" />, bg: 'bg-rose-50' },
    { title: 'Total Supporters', isCurrency: false, icon: <UserCheck size={22} className="text-teal-600" />, bg: 'bg-teal-50' },
    { title: 'Subscription Earnings', isCurrency: true, icon: <IndianRupee size={22} className="text-emerald-600" />, bg: 'bg-emerald-50' },
    { title: 'Order Earnings', isCurrency: true, icon: <IndianRupee size={22} className="text-blue-600" />, bg: 'bg-blue-50' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Dashboard Overview</h1>
          <p className="text-xs text-slate-500 mt-0.5">Real-time performance metrics</p>
        </div>
        {loading && (
          <div className="flex bg-teal-50 items-center space-x-2 border border-teal-200 px-3 py-1 rounded-full">
            <span className="w-2 h-2 rounded-full bg-teal-500 animate-ping"></span>
            <span className="text-xs text-teal-700 font-medium">Syncing live data...</span>
          </div>
        )}
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl text-sm shadow-sm">
          {error}
        </div>
      )}
      
      {/* Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {statsConfig.map((config, index) => {
          const matchedItem = getStatItem(config.title);
          const rawValue = matchedItem ? matchedItem.totalAmount : 0;
          const displayValue = config.isCurrency ? `₹${rawValue.toLocaleString()}` : rawValue.toLocaleString();

          return (
            <div 
              key={index} 
              className="p-5 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between hover:shadow-md transition-all duration-200 group"
            >
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider group-hover:text-slate-600 transition-colors">
                  {config.title}
                </p>
                <h3 className="text-2xl font-black text-slate-800 mt-1">
                  {loading && statsData.length === 0 ? (
                    <div className="w-14 h-7 bg-slate-100 animate-pulse rounded-md mt-1"></div>
                  ) : (
                    displayValue
                  )}
                </h3>
              </div>

              {/* Robust Lucide Icon */}
              <div className={`p-3 rounded-xl ${config.bg} flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform`}>
                {config.icon}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DashboardOverview;
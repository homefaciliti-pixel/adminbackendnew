import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { ShieldCheck, AlertCircle, Clock, IndianRupee, ShoppingBag, Calendar, Activity, CheckCircle2 } from 'lucide-react';

const AmcDashboard = () => {
  const [stats, setStats] = useState({
    totalAmc: 0,
    activeAmc: '0',
    expiredAmc: '0',
    totalVisits: 0,
    todayVisits: '0',
    pendingVisits: '3',
    revenue: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [todayVisitsList, setTodayVisitsList] = useState([]);
  const [renewAlerts, setRenewAlerts] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [statsRes, ordersRes, visitsRes, alertsRes, activitiesRes] = await Promise.all([
          API.get('/api/amc/dashboard').catch(() => ({ data: {} })),
          API.get('/amc/dashboard/recent-orders').catch(() => ({ data: [] })),
          API.get('/amc/dashboard/today-visits').catch(() => ({ data: [] })),
          API.get('/amc/dashboard/renew-alerts').catch(() => ({ data: [] })),
          API.get('/amc/dashboard/recent-activities').catch(() => ({ data: [] }))
        ]);

        // Map stats based on the exact backend structure
        const dashboardData = statsRes.data.data || statsRes.data;
        if (dashboardData) {
          setStats({
            totalAmc: dashboardData.totalAmc || 0,
            activeAmc: dashboardData.activeAmc || '0',
            expiredAmc: dashboardData.expiredAmc || '0',
            totalVisits: dashboardData.totalVisits || 0,
            todayVisits: dashboardData.todayVisits || '0',
            pendingVisits: dashboardData.pendingVisits || '0',
            revenue: dashboardData.revenue || 0
          });
        }

        setRecentOrders(ordersRes.data.data || ordersRes.data || []);
        setTodayVisitsList(visitsRes.data.data || visitsRes.data || []);
        setRenewAlerts(alertsRes.data.data || alertsRes.data || []);
        setRecentActivities(activitiesRes.data.data || activitiesRes.data || []);
        setError(null);
      } catch (err) {
        console.error('Error loading AMC dashboard:', err);
        setError('Failed to load dashboard metrics.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-20">
        <div className="w-6 h-6 border-2 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs text-slate-500 mt-2">Loading AMC Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 overflow-y-auto pb-6">
      <div>
        <h2 className="text-lg font-bold text-slate-800">AMC Dashboard</h2>
        <p className="text-xs text-slate-500">Overview of active maintenance contracts, visit schedules, and revenue metrics</p>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl text-xs">
          {error}
        </div>
      )}

      {/* Stats Cards Grid matching backend keys */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center space-x-4">
          <div className="p-3 bg-teal-50 text-teal-600 rounded-xl">
            <ShieldCheck size={24} />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Active / Total AMCs</p>
            <h3 className="text-xl font-bold text-slate-800">{stats.activeAmc} <span className="text-xs text-slate-400 font-normal">/ {stats.totalAmc}</span></h3>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center space-x-4">
          <div className="p-3 bg-rose-50 text-rose-600 rounded-xl">
            <AlertCircle size={24} />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Expired Contracts</p>
            <h3 className="text-xl font-bold text-slate-800">{stats.expiredAmc}</h3>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center space-x-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <Clock size={24} />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Today's / Pending Visits</p>
            <h3 className="text-xl font-bold text-slate-800">{stats.todayVisits} <span className="text-xs text-amber-600 font-normal">({stats.pendingVisits} pending)</span></h3>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center space-x-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <IndianRupee size={24} />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">AMC Revenue</p>
            <h3 className="text-lg font-bold text-slate-800">₹{Number(stats.revenue).toLocaleString('en-IN', { maximumFractionDigits: 2 })}</h3>
          </div>
        </div>
      </div>

      {/* Grid Sections: Today's Visits & Renewal Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Today Visits */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-800 flex items-center space-x-2">
              <Calendar size={16} className="text-teal-600" />
              <span>Today's Scheduled Visits</span>
            </h3>
            <span className="text-xs font-semibold bg-teal-50 text-teal-700 px-2.5 py-0.5 rounded-full">
              {todayVisitsList.length} Visits
            </span>
          </div>
          <div className="divide-y divide-slate-100 overflow-y-auto max-h-60 mt-2">
            {todayVisitsList.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-8">No visits scheduled for today.</p>
            ) : (
              todayVisitsList.map((v, idx) => (
                <div key={v.id || idx} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-semibold text-slate-800">{v.customerName || v.name}</div>
                    <div className="text-[11px] text-slate-400">{v.serviceName}</div>
                  </div>
                  <span className="font-medium text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg">
                    {v.partnerName || 'Unassigned'}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Renewal Alerts */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-800 flex items-center space-x-2">
              <AlertCircle size={16} className="text-rose-600" />
              <span>Renewal Alerts (Next 30 Days)</span>
            </h3>
            <span className="text-xs font-semibold bg-rose-50 text-rose-700 px-2.5 py-0.5 rounded-full">
              {renewAlerts.length} Expiring
            </span>
          </div>
          <div className="divide-y divide-slate-100 overflow-y-auto max-h-60 mt-2">
            {renewAlerts.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-8">No renewal alerts found.</p>
            ) : (
              renewAlerts.map((alert, idx) => (
                <div key={alert.id || idx} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-semibold text-slate-800">{alert.customerName}</div>
                    <div className="text-[11px] text-slate-400">Mobile: {alert.mobile}</div>
                  </div>
                  <span className="font-semibold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-lg">
                    Expires: {alert.expiryDate}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AmcDashboard;
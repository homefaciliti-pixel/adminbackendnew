import React, { useState, useEffect, useMemo } from 'react';
import { 
  Sliders, Search, MapPin, Building, Navigation, 
  Percent, Star, Bell, Image, CheckCircle2 
} from 'lucide-react';
import API from '../../services/api';

const SettingsManagement = ({ currentSubTab }) => {
  const [activeTab, setActiveTab] = useState(currentSubTab || 'banner');
  
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Map your sidebar sub-tabs to the correct settings endpoints
  const getEndpoint = (tab) => {
    switch (tab) {
      case 'banner': return '/api/banners';
      case 'state': return '/api/settings/states';
      case 'city': return '/api/settings/cities';
      case 'locality': return '/api/settings/localities';
      case 'commission': return '/api/settings/commission';
      case 'reviews': return '/api/settings/reviews';
      case 'notifications': return '/api/settings/notifications';
      default: return '/api/settings';
    }
  };

  const cacheKey = `settings_${activeTab}_cache`;

  const fetchData = async (isBackground = false) => {
    try {
      const cached = sessionStorage.getItem(cacheKey);
      if (cached && !isBackground) {
        setItems(JSON.parse(cached));
        setLoading(false);
      } else if (!isBackground) {
        setLoading(true);
      }

      setError(null);
      const endpoint = getEndpoint(activeTab);
      const response = await API.get(endpoint);

      let rawData = response.data.data || response.data.result || response.data;
      if (rawData && !Array.isArray(rawData) && Array.isArray(rawData.data)) {
        rawData = rawData.data;
      }

      const validData = Array.isArray(rawData) ? rawData : [];
      setItems(validData);
      sessionStorage.setItem(cacheKey, JSON.stringify(validData));
    } catch (err) {
      console.error(`Error fetching ${activeTab}:`, err);
      const cached = sessionStorage.getItem(cacheKey);
      if (!cached) {
        setError(`Unable to sync ${activeTab} data from the backend server.`);
        setItems([]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setActiveTab(currentSubTab || 'banner');
  }, [currentSubTab]);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const filteredItems = useMemo(() => {
    return items.filter(item => 
      Object.values(item).some(val => 
        String(val || '').toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
  }, [items, searchQuery]);

  const getTabIcon = (tab) => {
    switch (tab) {
      case 'banner': return <Image size={16} className="text-teal-600" />;
      case 'state': return <MapPin size={16} className="text-teal-600" />;
      case 'city': return <Building size={16} className="text-teal-600" />;
      case 'locality': return <Navigation size={16} className="text-teal-600" />;
      case 'commission': return <Percent size={16} className="text-teal-600" />;
      case 'reviews': return <Star size={16} className="text-teal-600" />;
      case 'notifications': return <Bell size={16} className="text-teal-600" />;
      default: return <Sliders size={16} className="text-teal-600" />;
    }
  };

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col space-y-4">
      {/* Header & Stats */}
      <div className="flex-none flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-800 capitalize">{activeTab} Management</h1>
          <p className="text-xs text-slate-500 mt-0.5">Configure platform parameters, regions, and rules for {activeTab}</p>
        </div>
        <div className="bg-teal-50 border border-teal-200 text-teal-800 px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-2">
          {getTabIcon(activeTab)}
          <span className="capitalize">Total {activeTab}: {items.length}</span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex-none bg-white p-3.5 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder={`Search ${activeTab} records...`}
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

      {/* Table Container */}
      <div className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col min-h-0">
        <div className="flex-1 overflow-y-auto">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-slate-50 z-10 shadow-sm">
              <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3.5 px-5">Record ID / Info</th>
                <th className="py-3.5 px-5">Details / Value</th>
                <th className="py-3.5 px-5">Created / Updated</th>
                <th className="py-3.5 px-5 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {loading && items.length === 0 ? (
                <tr>
                  <td colSpan="4" className="py-16 text-center text-slate-400 font-medium">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <div className="w-6 h-6 border-2 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
                      <p className="text-xs text-slate-500">Syncing {activeTab} data via Axios...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredItems.length === 0 ? (
                <tr>
                  <td colSpan="4" className="py-12 text-center text-slate-400 font-medium">
                    No {activeTab} records found.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item, idx) => (
                  <tr key={item.id || item._id || idx} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-5 font-semibold text-slate-800">
                      <div>{item.title || item.name || item.stateName || item.cityName || item.localityName || `Record #${item.id || idx + 1}`}</div>
                      <div className="text-xs text-slate-400 font-normal">ID: {item.id || item._id || 'N/A'}</div>
                    </td>
                    <td className="py-3.5 px-5 text-slate-600 text-xs">
                      {item.value || item.rate || item.description || item.message || item.city || item.state || 'Standard Config'}
                    </td>
                    <td className="py-3.5 px-5 text-slate-500 text-xs">
                      {item.createdAt || item.created_at || 'Recent'}
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <span className="inline-flex items-center space-x-1 bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full text-xs font-semibold">
                        <CheckCircle2 size={13} />
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

export default SettingsManagement;
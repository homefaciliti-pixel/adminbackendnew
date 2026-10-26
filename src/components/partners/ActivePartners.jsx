import React, { useState, useEffect, useMemo } from 'react';
import { UserCheck, Search, Phone, Mail, MapPin } from 'lucide-react';
import API from '../../services/api'; // Adjust path to your centralized api.js file

const ActivePartners = () => {
  // Initialize state from sessionStorage for instant zero-delay loading
  const [partners, setPartners] = useState(() => {
    const cached = sessionStorage.getItem('active_partners_cache');
    return cached ? JSON.parse(cached) : [];
  });
  
  const [loading, setLoading] = useState(() => !sessionStorage.getItem('active_partners_cache'));
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch active partners via Axios with background revalidation
  const fetchActivePartners = async (isBackground = false) => {
    try {
      if (!isBackground && partners.length === 0) setLoading(true);
      setError(null);

      // Using centralized Axios instance
      const response = await API.get('/api/partners/active');
      
      // Handle Laravel pagination or direct array responses safely
      let rawData = response.data.data || response.data.partners || response.data;
      if (rawData && !Array.isArray(rawData) && Array.isArray(rawData.data)) {
        rawData = rawData.data;
      }

      const validPartners = Array.isArray(rawData) ? rawData : [];
      setPartners(validPartners);
      sessionStorage.setItem('active_partners_cache', JSON.stringify(validPartners));
      setError(null);
    } catch (err) {
      console.error('Error fetching active partners:', err);
      setPartners((currentPartners) => {
        if (currentPartners.length === 0) {
          setError('Unable to sync active partners from the backend server.');
        }
        return currentPartners;
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivePartners(partners.length > 0);
  }, []);

  // Optimized filtering using useMemo
  const filteredPartners = useMemo(() => {
    return partners.filter(p => 
      (p.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.mobile || p.phone || '').includes(searchQuery) ||
      (p.city || '').toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [partners, searchQuery]);

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col space-y-4">
      {/* Header & Stats */}
      <div className="flex-none flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Active Partners</h1>
          <p className="text-xs text-slate-500 mt-0.5">Currently active service partners online and fulfilling jobs</p>
        </div>
        <div className="bg-teal-50 border border-teal-200 text-teal-800 px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-2">
          <UserCheck size={14} className="text-teal-600" />
          <span>Active Online: {partners.length}</span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex-none bg-white p-3.5 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search active partners by name, mobile, or city..."
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
                <th className="py-3.5 px-5">Partner Name</th>
                <th className="py-3.5 px-5">Contact Details</th>
                <th className="py-3.5 px-5">Category</th>
                <th className="py-3.5 px-5">Location</th>
                <th className="py-3.5 px-5 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {loading && partners.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-16 text-center text-slate-400 font-medium">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <div className="w-6 h-6 border-2 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
                      <p className="text-xs text-slate-500">Fetching active partners via Axios...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredPartners.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-12 text-center text-slate-400 font-medium">
                    No active partners found.
                  </td>
                </tr>
              ) : (
                filteredPartners.map((partner) => (
                  <tr key={partner._id || partner.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3.5 px-5 font-semibold text-slate-800">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold overflow-hidden flex-shrink-0">
                          {partner.image && !partner.image.includes('default') ? (
                            <img 
                              src={partner.image.startsWith('http') ? partner.image : `https://adminbackend-1-h03r.onrender.com/uploads/${partner.image}`} 
                              alt={partner.name} 
                              className="w-full h-full object-cover" 
                            />
                          ) : (
                            (partner.name || 'P').charAt(0).toUpperCase()
                          )}
                        </div>
                        <div>
                          <div>{partner.name}</div>
                          <div className="text-xs text-slate-400 font-normal">ID: {partner.category || partner._category}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-5 text-slate-600">
                      <div className="flex items-center space-x-1.5 text-xs">
                        <Phone size={13} className="text-slate-400" />
                        <span>{partner.mobile || partner.phone || 'N/A'}</span>
                      </div>
                      <div className="flex items-center space-x-1.5 text-xs mt-0.5">
                        <Mail size={13} className="text-slate-400" />
                        <span>{partner.email || 'N/A'}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-5 text-slate-700 font-medium">
                      {partner.categoryName || partner.category || 'General'}
                    </td>
                    <td className="py-3.5 px-5 text-slate-600 text-xs">
                      <div className="flex items-center space-x-1">
                        <MapPin size={13} className="text-slate-400" />
                        <span>{partner.city || 'N/A'}, {partner.state || ''}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <span className="inline-flex items-center space-x-1.5 bg-teal-50 text-teal-700 px-2.5 py-1 rounded-full text-xs font-semibold">
                        <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse"></span>
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

export default ActivePartners;
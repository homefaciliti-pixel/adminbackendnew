import React, { useState, useEffect, useMemo } from 'react';
import { Clock, Search, Phone, MapPin, CheckCircle2, Layers, Eye } from 'lucide-react';
import API from '../../services/api';
import PartnerDetailsModal from './PartnerDetailsModal';

const PendingPartners = () => {
  const [pendingPartners, setPendingPartners] = useState(() => {
    const cached = sessionStorage.getItem('pending_partners_cache');
    return cached ? JSON.parse(cached) : [];
  });
  
  const [loading, setLoading] = useState(() => !sessionStorage.getItem('pending_partners_cache'));
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState(null);

  // Modal States
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [detailLoadingId, setDetailLoadingId] = useState(null);

  const fetchPendingPartners = async (isBackground = false) => {
    try {
      if (!isBackground && pendingPartners.length === 0) setLoading(true);
      setError(null);
      
      const response = await API.get('/api/partners?isApproved=0');
      
      let rawData = response.data.data || response.data.partners || response.data;
      if (rawData && !Array.isArray(rawData) && Array.isArray(rawData.data)) {
        rawData = rawData.data;
      }
      
      const validPartners = Array.isArray(rawData) ? rawData : [];
      setPendingPartners(validPartners);
      sessionStorage.setItem('pending_partners_cache', JSON.stringify(validPartners));
    } catch (err) {
      console.error('Error fetching pending partners:', err);
      if (pendingPartners.length === 0) {
        setError('Unable to sync pending partners from the backend server.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingPartners(pendingPartners.length > 0);
  }, []);

  // Fetch full partner details using /api/partners/:id when clicked
  const handleReviewPartner = async (partnerId) => {
    try {
      setDetailLoadingId(partnerId);
      const response = await API.get(`/api/partners/${partnerId}`);
      const partnerData = response.data?.data || response.data;
      setSelectedPartner(partnerData);
      setIsModalOpen(true);
    } catch (err) {
      console.error('Failed to fetch partner details:', err);
      alert('Could not load full partner details.');
    } finally {
      setDetailLoadingId(null);
    }
  };

  // Approve Partner Handler
  const handleApprove = async (id) => {
    if (!id) {
      alert('Invalid Partner ID');
      return;
    }

    try {
      setActionLoadingId(id);
      
      // Update this line to match your actual backend endpoint and method (e.g., PUT or PATCH)
      await API.put(`/api/partners/${id}`, { isApproved: true }); 
      // OR if your backend uses: await API.put(`/api/partners/approve/${id}`);
      
      // Remove from pending state list instantly
      setPendingPartners((prev) => {
        const updated = prev.filter(p => (p.id !== id && p._id !== id && p.id != id && p._id != id));
        sessionStorage.setItem('pending_partners_cache', JSON.stringify(updated));
        return updated;
      });
      
      setIsModalOpen(false);
      setSelectedPartner(null);
      alert('Partner approved successfully!');
    } catch (err) {
      console.error('Error approving partner:', err.response?.data || err.message);
      const serverMessage = err.response?.data?.message || err.response?.data?.error || 'Please try again.';
      alert(`Failed to approve partner: ${serverMessage}`);
    } finally {
      setActionLoadingId(null);
    }
  };

  // Reject Partner Handler
  const handleReject = async (id) => {
    try {
      setActionLoadingId(id);
      setPendingPartners((prev) => {
        const updated = prev.filter(p => (p.id !== id && p._id !== id));
        sessionStorage.setItem('pending_partners_cache', JSON.stringify(updated));
        return updated;
      });
      setIsModalOpen(false);
      alert('Partner application rejected.');
    } catch (err) {
      console.error('Error rejecting partner:', err);
      alert('Failed to reject partner.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const filteredPartners = useMemo(() => {
    return pendingPartners.filter(p => 
      (p.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.mobile || p.phone || '').includes(searchQuery) ||
      (p.city || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.categoryName || p.category || '').toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [pendingPartners, searchQuery]);

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col space-y-4">
      {/* Header & Stats */}
      <div className="flex-none flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Pending Partner Approvals</h1>
          <p className="text-xs text-slate-500 mt-0.5">Review details and approve newly registered partner applications</p>
        </div>
        <div className="bg-amber-50 border border-amber-200 text-amber-800 px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-2">
          <Clock size={14} className="text-amber-600" />
          <span>Pending Review: {pendingPartners.length}</span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex-none bg-white p-3.5 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search pending partners by name, mobile, category, or city..."
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
                <th className="py-3.5 px-5">Partner Name</th>
                <th className="py-3.5 px-5">Mobile</th>
                <th className="py-3.5 px-5">Category</th>
                <th className="py-3.5 px-5">Location</th>
                <th className="py-3.5 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {loading && pendingPartners.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-16 text-center text-slate-400 font-medium">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <div className="w-6 h-6 border-2 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
                      <p className="text-xs text-slate-500">Fetching pending partner requests via Axios...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredPartners.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-12 text-center text-slate-400 font-medium">
                    No pending partner requests found.
                  </td>
                </tr>
              ) : (
                filteredPartners.map((partner) => {
                  const partnerId = partner.id || partner._id;
                  const isDetailLoading = detailLoadingId === partnerId;
                  const isActioning = actionLoadingId === partnerId;

                  return (
                    <tr key={partnerId} className="hover:bg-slate-50/70 transition-colors">
                      {/* Clickable Partner Name Column */}
                      <td className="py-3.5 px-5 font-semibold text-slate-800">
                        <button
                          type="button"
                          onClick={() => handleReviewPartner(partnerId)}
                          className="text-left hover:text-teal-600 transition-colors group cursor-pointer"
                        >
                          <div className="group-hover:underline flex items-center space-x-1">
                            <span>{partner.name}</span>
                            {isDetailLoading && <div className="w-3 h-3 border-2 border-teal-600 border-t-transparent rounded-full animate-spin ml-1"></div>}
                          </div>
                          <div className="text-xs text-slate-400 font-normal">ID: {partnerId}</div>
                        </button>
                      </td>
                      <td className="py-3.5 px-5 text-slate-600 text-xs">
                        <div className="flex items-center space-x-1.5">
                          <Phone size={13} className="text-slate-400" />
                          <span>{partner.mobile || partner.phone || 'N/A'}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-5 text-slate-700 text-xs">
                        <span className="inline-flex items-center space-x-1 bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg font-medium">
                          <Layers size={12} className="text-slate-500" />
                          <span>{partner.categoryName || partner.category || 'General'}</span>
                        </span>
                      </td>
                      <td className="py-3.5 px-5 text-slate-600 text-xs">
                        <div className="flex items-center space-x-1">
                          <MapPin size={13} className="text-slate-400" />
                          <span>{partner.city || 'N/A'}, {partner.state || ''}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-5 text-right space-x-2">
                        {/* Review Button */}
                        <button
                          type="button"
                          onClick={() => handleReviewPartner(partnerId)}
                          disabled={isDetailLoading}
                          className="inline-flex items-center space-x-1 bg-teal-50 hover:bg-teal-100 text-teal-700 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
                        >
                          <Eye size={13} />
                          <span>Review</span>
                        </button>

                        {/* Quick Approve Button */}
                        <button
                          type="button"
                          onClick={() => handleApprove(partnerId)}
                          disabled={isActioning}
                          className="inline-flex items-center space-x-1 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-xl text-xs font-semibold shadow-sm transition-colors cursor-pointer disabled:opacity-50"
                        >
                          {isActioning ? (
                            <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <CheckCircle2 size={13} />
                          )}
                          <span>Approve</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Partner Details Modal */}
      {isModalOpen && selectedPartner && (
        <PartnerDetailsModal
          partner={selectedPartner}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onApprove={() => handleApprove(selectedPartner.id || selectedPartner._id)}
          onReject={() => handleReject(selectedPartner.id || selectedPartner._id)}
          loading={actionLoadingId === (selectedPartner.id || selectedPartner._id)}
        />
      )}
    </div>
  );
};

export default PendingPartners;
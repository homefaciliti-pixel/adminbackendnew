import React, { useState, useEffect, useMemo } from 'react';
import { ShieldCheck, Search, Phone, Mail, MapPin, CheckCircle } from 'lucide-react';
import API from '../../services/api';
import PartnerDetailsModal from './PartnerDetailsModal';

const ApprovedPartners = () => {
  const [partners, setPartners] = useState(() => {
    const cached = sessionStorage.getItem('approved_partners_cache');
    return cached ? JSON.parse(cached) : [];
  });
  
  const [loading, setLoading] = useState(() => !sessionStorage.getItem('approved_partners_cache'));
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal & Fetching Full Details State
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  const fetchApprovedPartners = async (isBackground = false) => {
    try {
      if (!isBackground && partners.length === 0) setLoading(true);
      setError(null);
      
      const response = await API.get('/api/partners?isApproved=1');
      let rawData = response.data.data || response.data.partners || response.data;
      if (rawData && !Array.isArray(rawData) && Array.isArray(rawData.data)) {
        rawData = rawData.data;
      }
      
      const validPartners = Array.isArray(rawData) ? rawData : [];
      setPartners(validPartners);
      sessionStorage.setItem('approved_partners_cache', JSON.stringify(validPartners));
    } catch (err) {
      console.error('Error fetching approved partners:', err);
      if (partners.length === 0) {
        setError('Unable to sync approved partners from the backend server.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApprovedPartners(partners.length > 0);
  }, []);

  const handleRowClick = async (partner) => {
    const partnerId = partner.id || partner._id;
    if (!partnerId) {
      setSelectedPartner(partner);
      return;
    }

    try {
      setModalLoading(true);
      setSelectedPartner(partner);
      
      const response = await API.get(`/api/partners/${partnerId}`);
      const fullDetails = response.data.data || response.data.partner || response.data;
      
      if (fullDetails) {
        setSelectedPartner(fullDetails);
      }
    } catch (err) {
      console.error('Failed to fetch full partner details:', err);
    } finally {
      setModalLoading(false);
    }
  };

  // Advanced Multi-keyword Search (Supports City + Profession/Category + Name/Email/Phone)
  const filteredPartners = useMemo(() => {
    if (!searchQuery.trim()) return partners;

    const queryParts = searchQuery.toLowerCase().trim().split(/\s+/);

    return partners.filter(p => {
      const name = (p.name || '').toLowerCase();
      const email = (p.email || '').toLowerCase();
      const mobile = (p.mobile || p.phone || '').toLowerCase();
      const city = (p.city || '').toLowerCase();
      const profession = (p.category || p['s.no'] || p.profession || '').toLowerCase();

      // Every typed word in search query must match at least one of the partner fields
      return queryParts.every(part => 
        name.includes(part) ||
        email.includes(part) ||
        mobile.includes(part) ||
        city.includes(part) ||
        profession.includes(part)
      );
    });
  }, [partners, searchQuery]);

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col space-y-4">
      {/* Header & Stats */}
      <div className="flex-none flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Approved Partners</h1>
          <p className="text-xs text-slate-500 mt-0.5">List of all successfully verified and approved partner vendors</p>
        </div>
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-2">
          <CheckCircle size={14} className="text-emerald-600" />
          <span>Total Approved: {partners.length}</span>
        </div>
      </div>

      {/* Advanced Search Bar */}
      <div className="flex-none bg-white p-3.5 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by city, profession (e.g. plumber, cleaner), name..."
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
                <th className="py-3.5 px-5">Contact Details</th>
                <th className="py-3.5 px-5">Location</th>
                <th className="py-3.5 px-5">Registered Date</th>
                <th className="py-3.5 px-5 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {loading && partners.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-16 text-center text-slate-400 font-medium">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <div className="w-6 h-6 border-2 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
                      <p className="text-xs text-slate-500">Fetching approved partners via Axios...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredPartners.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-12 text-center text-slate-400 font-medium">
                    No approved partners found matching your search.
                  </td>
                </tr>
              ) : (
                filteredPartners.map((partner) => (
                  <tr 
                    key={partner.id || partner._id} 
                    onClick={() => handleRowClick(partner)}
                    className="hover:bg-slate-50/70 transition-colors cursor-pointer"
                  >
                    <td className="py-3.5 px-5 font-semibold text-slate-800">
                      <div>{partner.name}</div>
                      <div className="text-xs text-slate-400 font-normal">{partner.category || partner['s.no'] || partner.profession}</div>
                    </td>
                    <td className="py-3.5 px-5 text-slate-600">
                      <div className="flex items-center space-x-1.5 text-xs">
                        <Phone size={13} className="text-slate-400" />
                        <span>{partner.mobile || partner.phone || 'N/A'}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-5 text-slate-600 text-xs">
                      <div className="flex items-center space-x-1">
                        <MapPin size={13} className="text-slate-400" />
                        <span>{partner.city}, {partner.state}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-5 text-slate-500 text-xs">
                      {partner['date and time'] || partner.createdAt || 'N/A'}
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <span className="inline-flex items-center space-x-1 bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full text-xs font-semibold">
                        <ShieldCheck size={13} />
                        <span>Approved</span>
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <PartnerDetailsModal
        partner={selectedPartner}
        isOpen={!!selectedPartner}
        onClose={() => setSelectedPartner(null)}
        loading={modalLoading}
      />
    </div>
  );
};

export default ApprovedPartners;




// import React, { useState, useEffect, useMemo } from 'react';
// import { ShieldCheck, Search, Phone, Mail, MapPin, CheckCircle } from 'lucide-react';
// import API from '../../services/api'; // Adjust path to your centralized api.js file
// import PartnerDetailsModal from './PartnerDetailsModal';

// const ApprovedPartners = () => {
//   const [partners, setPartners] = useState(() => {
//     const cached = sessionStorage.getItem('approved_partners_cache');
//     return cached ? JSON.parse(cached) : [];
//   });
  
//   const [loading, setLoading] = useState(() => !sessionStorage.getItem('approved_partners_cache'));
//   const [error, setError] = useState(null);
//   const [searchQuery, setSearchQuery] = useState('');
  
//   // Modal & Fetching Full Details State
//   const [selectedPartner, setSelectedPartner] = useState(null);
//   const [modalLoading, setModalLoading] = useState(false);

//   const fetchApprovedPartners = async (isBackground = false) => {
//     try {
//       if (!isBackground && partners.length === 0) setLoading(true);
//       setError(null);
      
//       const response = await API.get('/api/partners?isApproved=1');
//       let rawData = response.data.data || response.data.partners || response.data;
//       if (rawData && !Array.isArray(rawData) && Array.isArray(rawData.data)) {
//         rawData = rawData.data;
//       }
      
//       const validPartners = Array.isArray(rawData) ? rawData : [];
//       setPartners(validPartners);
//       sessionStorage.setItem('approved_partners_cache', JSON.stringify(validPartners));
//     } catch (err) {
//       console.error('Error fetching approved partners:', err);
//       if (partners.length === 0) {
//         setError('Unable to sync approved partners from the backend server.');
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchApprovedPartners(partners.length > 0);
//   }, []);

//   // Handle row click: fetch full partner details by ID from the backend
//   const handleRowClick = async (partner) => {
//     const partnerId = partner.id || partner._id;
//     if (!partnerId) {
//       setSelectedPartner(partner);
//       return;
//     }

//     try {
//       setModalLoading(true);
//       // Open modal immediately with summary data as a fallback placeholder
//       setSelectedPartner(partner);
      
//       // Fetch complete record from backend
//       const response = await API.get(`/api/partners/${partnerId}`);
//       const fullDetails = response.data.data || response.data.partner || response.data;
      
//       if (fullDetails) {
//         setSelectedPartner(fullDetails);
//       }
//     } catch (err) {
//       console.error('Failed to fetch full partner details:', err);
//     } finally {
//       setModalLoading(false);
//     }
//   };

//   const filteredPartners = useMemo(() => {
//     return partners.filter(p => 
//       (p.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
//       (p.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
//       (p.mobile || p.phone || '').includes(searchQuery) ||
//       (p.city || '').toLowerCase().includes(searchQuery.toLowerCase())
//     );
//   }, [partners, searchQuery]);

//   return (
//     <div className="h-[calc(100vh-120px)] flex flex-col space-y-4">
//       {/* Header & Stats */}
//       <div className="flex-none flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
//         <div>
//           <h1 className="text-xl font-bold text-slate-800">Approved Partners</h1>
//           <p className="text-xs text-slate-500 mt-0.5">List of all successfully verified and approved partner vendors</p>
//         </div>
//         <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-2">
//           <CheckCircle size={14} className="text-emerald-600" />
//           <span>Total Approved: {partners.length}</span>
//         </div>
//       </div>

//       {/* Search Bar */}
//       <div className="flex-none bg-white p-3.5 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between gap-4">
//         <div className="relative flex-1 max-w-md">
//           <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
//           <input
//             type="text"
//             placeholder="Search approved partners by name, email, mobile, or city..."
//             value={searchQuery}
//             onChange={(e) => setSearchQuery(e.target.value)}
//             className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-teal-500 transition-colors"
//           />
//         </div>
//       </div>

//       {error && (
//         <div className="flex-none bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl text-sm">
//           {error}
//         </div>
//       )}

//       {/* Table Container */}
//       <div className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col min-h-0">
//         <div className="flex-1 overflow-y-auto">
//           <table className="w-full text-left border-collapse">
//             <thead className="sticky top-0 bg-slate-50 z-10 shadow-sm">
//               <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
//                 <th className="py-3.5 px-5">Partner Name</th>
//                 <th className="py-3.5 px-5">Contact Details</th>
//                 <th className="py-3.5 px-5">Location</th>
//                 <th className="py-3.5 px-5">Registered Date</th>
//                 <th className="py-3.5 px-5 text-right">Status</th>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-slate-100 text-sm">
//               {loading && partners.length === 0 ? (
//                 <tr>
//                   <td colSpan="5" className="py-16 text-center text-slate-400 font-medium">
//                     <div className="flex flex-col items-center justify-center space-y-2">
//                       <div className="w-6 h-6 border-2 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
//                       <p className="text-xs text-slate-500">Fetching approved partners via Axios...</p>
//                     </div>
//                   </td>
//                 </tr>
//               ) : filteredPartners.length === 0 ? (
//                 <tr>
//                   <td colSpan="5" className="py-12 text-center text-slate-400 font-medium">
//                     No approved partners found.
//                   </td>
//                 </tr>
//               ) : (
//                 filteredPartners.Item ? filteredPartners : filteredPartners.map((partner) => (
//                   <tr 
//                     key={partner.id || partner._id} 
//                     onClick={() => handleRowClick(partner)}
//                     className="hover:bg-slate-50/70 transition-colors cursor-pointer"
//                   >
//                     <td className="py-3.5 px-5 font-semibold text-slate-800">
//                       <div>{partner.name}</div>
//                       <div className="text-xs text-slate-400 font-normal">{partner.category || partner['s.no']}</div>
//                     </td>
//                     <td className="py-3.5 px-5 text-slate-600">
//                       <div className="flex items-center space-x-1.5 text-xs">
//                         <Phone size={13} className="text-slate-400" />
//                         <span>{partner.mobile || partner.phone || 'N/A'}</span>
//                       </div>
//                     </td>
//                     <td className="py-3.5 px-5 text-slate-600 text-xs">
//                       <div className="flex items-center space-x-1">
//                         <MapPin size={13} className="text-slate-400" />
//                         <span>{partner.city}, {partner.state}</span>
//                       </div>
//                     </td>
//                     <td className="py-3.5 px-5 text-slate-500 text-xs">
//                       {partner['date and time'] || partner.createdAt || 'N/A'}
//                     </td>
//                     <td className="py-3.5 px-5 text-right">
//                       <span className="inline-flex items-center space-x-1 bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full text-xs font-semibold">
//                         <ShieldCheck size={13} />
//                         <span>Approved</span>
//                       </span>
//                     </td>
//                   </tr>
//                 ))
//               )}
//             </tbody>
//           </table>
//         </div>
//       </div>

//       <PartnerDetailsModal
//         partner={selectedPartner}
//         isOpen={!!selectedPartner}
//         onClose={() => setSelectedPartner(null)}
//         loading={modalLoading}
//       />
//     </div>
//   );
// };

// export default ApprovedPartners;
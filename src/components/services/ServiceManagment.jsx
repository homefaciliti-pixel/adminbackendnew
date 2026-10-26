

import React, { useState, useEffect, useMemo } from 'react';
import { Wrench, Search, Layers, Clock, Edit3, Plus, ArrowRight } from 'lucide-react';
import API from '../../services/api';
import EditServiceModal from './EditServiceModal';
import AddServiceModal from './AddServiceModal'; // 👈 New Add Service Modal component

const ServiceManagement = ({ setActiveTab }) => {
  const [services, setServices] = useState(() => {
    const cached = sessionStorage.getItem('services_cache');
    return cached ? JSON.parse(cached) : [];
  });
  
  const [loading, setLoading] = useState(() => !sessionStorage.getItem('services_cache'));
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingService, setEditingService] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false); // 👈 State for Add Service modal

  const fetchServices = async (isBackground = false) => {
    try {
      if (!isBackground && services.length === 0) setLoading(true);
      setError(null);
      
      const response = await API.get('/api/services');
      let rawData = response.data.data || response.data.services || response.data;
      if (rawData && !Array.isArray(rawData) && Array.isArray(rawData.data)) {
        rawData = rawData.data;
      }
      
      const validServices = Array.isArray(rawData) ? rawData : [];
      setServices(validServices);
      sessionStorage.setItem('services_cache', JSON.stringify(validServices));
      setError(null);
    } catch (err) {
      console.error('Error fetching services:', err);
      setServices((currentServices) => {
        if (currentServices.length === 0) {
          setError('Unable to sync services from the backend server.');
        }
        return currentServices;
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices(services.length > 0);
  }, []);

  // Handle newly created service
  const handleServiceCreated = (newService) => {
    setServices((prevServices) => {
      const updatedList = [newService, ...prevServices];
      sessionStorage.setItem('services_cache', JSON.stringify(updatedList));
      return updatedList;
    });
  };

  const handleServiceUpdated = (updatedService) => {
    setServices((prevServices) => {
      const updatedList = prevServices.map((srv) => 
        (srv.id === updatedService.id || srv._id === updatedService._id) ? updatedService : srv
      );
      sessionStorage.setItem('services_cache', JSON.stringify(updatedList));
      return updatedList;
    });
  };

  const handleServiceDeleted = (deletedId) => {
    setServices((prevServices) => {
      const updatedList = prevServices.filter((srv) => srv.id !== deletedId && srv._id !== deletedId);
      sessionStorage.setItem('services_cache', JSON.stringify(updatedList));
      return updatedList;
    });
  };

  const filteredServices = useMemo(() => {
    return services.filter(srv => 
      (srv.title || srv.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (srv.description || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (srv.categoryId || srv.category_id || '').toString().includes(searchQuery) ||
      (srv.sub_category || '').toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [services, searchQuery]);

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col space-y-4">
      {/* Header & Action Bar */}
      <div className="flex-none flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Service Catalog Management</h1>
          <p className="text-xs text-slate-500 mt-0.5">View and manage platform services, categories, and pricing</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Navigate to Subcategories Section Button */}
          {setActiveTab && (
            <button
              type="button"
              onClick={() => setActiveTab('subcategories')}
              className="flex items-center space-x-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
            >
              <Layers size={14} className="text-slate-500" />
              <span>Manage Subcategories</span>
              <ArrowRight size={13} />
            </button>
          )}
          
          <div className="bg-teal-50 border border-teal-200 text-teal-800 px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center space-x-2">
            <Wrench size={14} className="text-teal-600" />
            <span>Total Services: {services.length}</span>
          </div>

          {/* Add New Service Button */}
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center space-x-1.5 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-sm transition-all cursor-pointer"
          >
            <Plus size={15} />
            <span>Add Service</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex-none bg-white p-3.5 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search services by title, description, category ID, or subcategory..."
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
                <th className="py-3.5 px-5">Service Title</th>
                <th className="py-3.5 px-5">Category & Subcategory</th>
                <th className="py-3.5 px-5">Completion Time</th>
                <th className="py-3.5 px-5">Base Price</th>
                <th className="py-3.5 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {loading && services.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-16 text-center text-slate-400 font-medium">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <div className="w-6 h-6 border-2 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
                      <p className="text-xs text-slate-500">Fetching services...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredServices.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-12 text-center text-slate-400 font-medium">
                    No services found.
                  </td>
                </tr>
              ) : (
                filteredServices.map((srv) => (
                  <tr key={srv.id || srv._id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-5 font-semibold text-slate-800">
                      <div className="flex items-center space-x-2">
                        <span className="w-2 h-2 rounded-full bg-teal-500"></span>
                        <span className="truncate max-w-xs">{srv.title || srv.name || 'Unnamed Service'}</span>
                      </div>
                      <div className="text-xs text-slate-400 font-normal mt-0.5">ID: {srv.id || srv._id} | Rating: {srv.rating || 'N/A'} ⭐</div>
                    </td>
                    <td className="py-3.5 px-5 text-slate-700">
                      <div className="flex flex-col gap-1">
                        <span className="inline-flex items-center space-x-1 bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md text-xs font-semibold w-fit">
                          <Layers size={11} className="text-slate-500" />
                          <span>Cat ID: {srv.categoryId || srv.category_id || 'N/A'}</span>
                        </span>
                        {(srv.sub_category || srv.subCategory) && (
                          <span className="text-xs text-teal-600 font-medium">
                            Sub: {srv.sub_category || srv.subCategory}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-5 text-slate-600 text-xs">
                      <div className="flex items-center space-x-1">
                        <Clock size={12} className="text-slate-400" />
                        <span>{srv.time || 'Standard'}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-5 font-bold text-slate-800">
                      ₹{srv.price || 0}
                      {srv.cutPrice && srv.cutPrice > srv.price && (
                        <span className="text-xs text-slate-400 line-through ml-1.5 font-normal">₹{srv.cutPrice}</span>
                      )}
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <button
                        type="button"
                        onClick={() => setEditingService(srv)}
                        className="inline-flex items-center space-x-1 bg-teal-50 hover:bg-teal-100 text-teal-700 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                      >
                        <Edit3 size={13} />
                        <span>Edit</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Service Modal */}
      {isAddModalOpen && (
        <AddServiceModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onSuccess={handleServiceCreated}
          onNavigateToSubcategories={() => {
            setIsAddModalOpen(false);
            if (setActiveTab) setActiveTab('subcategories');
          }}
        />
      )}

      {/* Edit & Delete Modal Component */}
      <EditServiceModal
        service={editingService}
        onClose={() => setEditingService(null)}
        onUpdateSuccess={handleServiceUpdated}
        onDeleteSuccess={handleServiceDeleted}
      />
    </div>
  );
};

export default ServiceManagement;


// import React, { useState, useEffect, useMemo } from 'react';
// import { Wrench, Search, Layers, CheckCircle2, Clock, Edit3 } from 'lucide-react';
// import API from '../../services/api';
// import EditServiceModal from './EditServiceModal'; // 👈 Import your edit & delete modal

// const ServiceManagement = () => {
  
//   const [services, setServices] = useState(() => {
//     const cached = sessionStorage.getItem('services_cache');
//     return cached ? JSON.parse(cached) : [];
//   });
  
//   const [loading, setLoading] = useState(() => !sessionStorage.getItem('services_cache'));
//   const [error, setError] = useState(null);
//   const [searchQuery, setSearchQuery] = useState('');
//   const [editingService, setEditingService] = useState(null); // 👈 State to manage currently selected service for editing

//   const fetchServices = async (isBackground = false) => {
//     try {
//       if (!isBackground && services.length === 0) setLoading(true);
//       setError(null);
      
//       const response = await API.get('/api/services');
      
//       // Handle Laravel pagination or direct array responses safely
//       let rawData = response.data.data || response.data.services || response.data;
//       if (rawData && !Array.isArray(rawData) && Array.isArray(rawData.data)) {
//         rawData = rawData.data; // Unpack Laravel pagination wrapper
//       }
      
//       const validServices = Array.isArray(rawData) ? rawData : [];
      
//       setServices(validServices);
//       sessionStorage.setItem('services_cache', JSON.stringify(validServices));
//       setError(null);
//     } catch (err) {
//       console.error('Error fetching services:', err);
//       setServices((currentServices) => {
//         if (currentServices.length === 0) {
//           setError('Unable to sync services from the backend server.');
//         }
//         return currentServices;
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchServices(services.length > 0);
//   }, []);

//   // Handle successful update from modal
//   const handleServiceUpdated = (updatedService) => {
//     setServices((prevServices) => {
//       const updatedList = prevServices.map((srv) => 
//         (srv.id === updatedService.id || srv._id === updatedService._id) ? updatedService : srv
//       );
//       sessionStorage.setItem('services_cache', JSON.stringify(updatedList));
//       return updatedList;
//     });
//   };

//   // Handle successful deletion from modal
//   const handleServiceDeleted = (deletedId) => {
//     setServices((prevServices) => {
//       const updatedList = prevServices.filter((srv) => srv.id !== deletedId && srv._id !== deletedId);
//       sessionStorage.setItem('services_cache', JSON.stringify(updatedList));
//       return updatedList;
//     });
//   };

//   const filteredServices = useMemo(() => {
//     return services.filter(srv => 
//       (srv.title || srv.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
//       (srv.description || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
//       (srv.categoryId || srv.category_id || '').toString().includes(searchQuery)
//     );
//   }, [services, searchQuery]);

//   return (
//     <div className="h-[calc(100vh-120px)] flex flex-col space-y-4">
//       {/* Header & Stats */}
//       <div className="flex-none flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
//         <div>
//           <h1 className="text-xl font-bold text-slate-800">Service Catalog Management</h1>
//           <p className="text-xs text-slate-500 mt-0.5">View and manage platform services, categories, and pricing</p>
//         </div>
//         <div className="bg-teal-50 border border-teal-200 text-teal-800 px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-2">
//           <Wrench size={14} className="text-teal-600" />
//           <span>Total Services: {services.length}</span>
//         </div>
//       </div>

//       {/* Search Bar */}
//       <div className="flex-none bg-white p-3.5 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between gap-4">
//         <div className="relative flex-1 max-w-md">
//           <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
//           <input
//             type="text"
//             placeholder="Search services by title, description, or category ID..."
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

//       {/* Table Container with Internal Scroll */}
//       <div className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col min-h-0">
//         <div className="flex-1 overflow-y-auto">
//           <table className="w-full text-left border-collapse">
//             <thead className="sticky top-0 bg-slate-50 z-10 shadow-sm">
//               <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
//                 <th className="py-3.5 px-5">Service Title</th>
//                 <th className="py-3.5 px-5">Category ID</th>
//                 <th className="py-3.5 px-5">Completion Time</th>
//                 <th className="py-3.5 px-5">Base Price</th>
//                 <th className="py-3.5 px-5 text-right">Actions</th>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-slate-100 text-sm">
//               {loading && services.length === 0 ? (
//                 <tr>
//                   <td colSpan="5" className="py-16 text-center text-slate-400 font-medium">
//                     <div className="flex flex-col items-center justify-center space-y-2">
//                       <div className="w-6 h-6 border-2 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
//                       <p className="text-xs text-slate-500">Waking up Render server & fetching services...</p>
//                     </div>
//                   </td>
//                 </tr>
//               ) : filteredServices.length === 0 ? (
//                 <tr>
//                   <td colSpan="5" className="py-12 text-center text-slate-400 font-medium">
//                     No services found.
//                   </td>
//                 </tr>
//               ) : (
//                 filteredServices.map((srv) => (
//                   <tr key={srv.id || srv._id} className="hover:bg-slate-50/70 transition-colors">
//                     <td className="py-3.5 px-5 font-semibold text-slate-800">
//                       <div className="flex items-center space-x-2">
//                         <span className="w-2 h-2 rounded-full bg-teal-500"></span>
//                         <span className="truncate max-w-xs">{srv.title || srv.name || 'Unnamed Service'}</span>
//                       </div>
//                       <div className="text-xs text-slate-400 font-normal mt-0.5">ID: {srv.id || srv._id} | Rating: {srv.rating || 'N/A'} ⭐</div>
//                     </td>
//                     <td className="py-3.5 px-5 text-slate-700">
//                       <span className="inline-flex items-center space-x-1 bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg text-xs font-semibold">
//                         <Layers size={12} className="text-slate-500" />
//                         <span>Cat ID: {srv.categoryId || srv.category_id || 'N/A'}</span>
//                       </span>
//                     </td>
//                     <td className="py-3.5 px-5 text-slate-600 text-xs">
//                       <div className="flex items-center space-x-1">
//                         <Clock size={12} className="text-slate-400" />
//                         <span>{srv.time || 'Standard'}</span>
//                       </div>
//                     </td>
//                     <td className="py-3.5 px-5 font-bold text-slate-800">
//                       ₹{srv.price || 0}
//                       {srv.cutPrice && srv.cutPrice > srv.price && (
//                         <span className="text-xs text-slate-400 line-through ml-1.5 font-normal">₹{srv.cutPrice}</span>
//                       )}
//                     </td>
//                     <td className="py-3.5 px-5 text-right">
//                       <button
//                         type="button"
//                         onClick={() => setEditingService(srv)}
//                         className="inline-flex items-center space-x-1 bg-teal-50 hover:bg-teal-100 text-teal-700 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
//                       >
//                         <Edit3 size={13} />
//                         <span>Edit</span>
//                       </button>
//                     </td>
//                   </tr>
//                 ))
//               )}
//             </tbody>
//           </table>
//         </div>
//       </div>

//       {/* Edit & Delete Modal Component */}
//       <EditServiceModal
//         service={editingService}
//         onClose={() => setEditingService(null)}
//         onUpdateSuccess={handleServiceUpdated}
//         onDeleteSuccess={handleServiceDeleted}
//       />
//     </div>
//   );
// };

// export default ServiceManagement;
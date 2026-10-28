
import React, { useState, useEffect, useMemo } from 'react';
import { ShoppingBag, Search, Clock, CheckCircle2, XCircle, MapPin, Calendar, Building2, Plus, UserCheck, ShieldCheck } from 'lucide-react';
import API from '../../services/api';
import OrderDetailModal from './OrderDetailModal';
import CreateOrderModal from './CreateOrderModal';

const OrderManagement = () => {
  // Initialize state from sessionStorage for instant zero-delay loading
  const [orders, setOrders] = useState(() => {
    const cached = sessionStorage.getItem('orders_cache');
    return cached ? JSON.parse(cached) : [];
  });
  
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(() => !sessionStorage.getItem('orders_cache'));
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('today'); // 'all' | 'today' | 'upcoming'
  const [selectedOrder, setSelectedOrder] = useState(null); // For viewing details modal
  const [isCreateOpen, setIsCreateOpen] = useState(false); // State for Create Order modal

  // Quick Assign Modal State
  const [assignModalOrder, setAssignModalOrder] = useState(null);
  const [selectedPartnerInput, setSelectedPartnerInput] = useState('');
  const [assigning, setAssigning] = useState(false);

  // Fetch orders and approved partners from API with background revalidation
  const fetchOrders = async (isBackground = false) => {
    try {
      if (!isBackground && orders.length === 0) setLoading(true);
      
      const response = await API.get('/api/orders').catch(() => API.get('/api/bookings'));
      let rawData = response.data.data || response.data.orders || response.data;
      const validOrders = Array.isArray(rawData) ? rawData : [];
      
      setOrders(validOrders);
      sessionStorage.setItem('orders_cache', JSON.stringify(validOrders));

      // Fetch approved partners for quick assignment
      const resPartners = await API.get('/api/partners?isApproved=1');
      let rawPartners = resPartners.data.data || resPartners.data.partners || resPartners.data;
      if (rawPartners && !Array.isArray(rawPartners) && Array.isArray(rawPartners.data)) {
        rawPartners = rawPartners.data;
      }
      setPartners(Array.isArray(rawPartners) ? rawPartners : []);

      setError(null);
    } catch (err) {
      console.error('Error fetching orders or partners:', err);
      if (orders.length === 0) {
        setError('Unable to sync orders from the backend server.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(orders.length > 0);
  }, []);

  // Handle newly created order response
  const handleOrderCreated = (newOrder) => {
    setOrders(prev => {
      const updated = [newOrder, ...prev];
      sessionStorage.setItem('orders_cache', JSON.stringify(updated));
      return updated;
    });
  };

  // Interactive Status Toggle (Pending <-> Done/Completed)
  const handleStatusToggle = async (ord, e) => {
    e.stopPropagation();
    const orderId = ord.id || ord._id;
    const currentStatus = String(ord.status || 'Pending').toLowerCase();
    const newStatus = (currentStatus === 'completed' || currentStatus === 'done' || currentStatus === 'success') ? 'Pending' : 'Completed';

    try {
      const updatedOrders = orders.map(o => (o.id === orderId || o._id === orderId) ? { ...o, status: newStatus } : o);
      setOrders(updatedOrders);
      sessionStorage.setItem('orders_cache', JSON.stringify(updatedOrders));

      await API.put(`/api/orders/${orderId}`, { ...ord, status: newStatus }).catch(() => {
        API.patch(`/api/orders/${orderId}/status`, { status: newStatus });
      });
    } catch (err) {
      console.error('Failed to update order status:', err);
    }
  };

  // Submit Partner Assignment from Quick Assign Modal
  const handleConfirmAssignment = async (e) => {
    e.preventDefault();
    if (!assignModalOrder) return;
    
    setAssigning(true);
    const orderId = assignModalOrder.id || assignModalOrder._id;

    try {
      const updatedOrders = orders.map(o => (o.id === orderId || o._id === orderId) ? { ...o, partnerName: selectedPartnerInput } : o);
      setOrders(updatedOrders);
      sessionStorage.setItem('orders_cache', JSON.stringify(updatedOrders));

      await API.put(`/api/orders/${orderId}`, { ...assignModalOrder, partnerName: selectedPartnerInput });
      
      setAssignModalOrder(null);
      setSelectedPartnerInput('');
    } catch (err) {
      console.error('Failed to assign partner:', err);
    } finally {
      setAssigning(false);
    }
  };

  // Helper date calculations
  const getTodayString = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const getFutureDateString = (daysToAdd) => {
    const date = new Date();
    date.setDate(date.getDate() + daysToAdd);
    return date.toISOString().split('T')[0];
  };

  // Filter orders based on Tab (All, Today, Upcoming) and Search Query
  const filteredOrders = useMemo(() => {
    const todayStr = getTodayString();
    const tenDaysAheadStr = getFutureDateString(10);

    return orders.filter(ord => {
      const orderDate = ord.serviceDate ? ord.serviceDate.split('T')[0] : '';
      const isLegacyToday = ord.createdAt && ord.createdAt.includes('10/1/2026');

      // 1. Tab Filters
      if (activeFilter === 'today') {
        const matchesToday = orderDate === todayStr || isLegacyToday;
        if (!matchesToday) return false;
      } else if (activeFilter === 'upcoming') {
        // Between tomorrow and next 10 days
        const matchesUpcoming = orderDate > todayStr && orderDate <= tenDaysAheadStr;
        if (!matchesUpcoming) return false;
      }
      // 'all' includes everything (including orders > 10 days out)

      // 2. Search Query Filter
      return (
        (ord.customerName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (ord.customerMobile || ord.mobile || '').includes(searchQuery) ||
        (ord.serviceName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (ord.serviceRequestNumber || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (ord.city || '').toLowerCase().includes(searchQuery.toLowerCase())
      );
    });
  }, [orders, searchQuery, activeFilter]);

  // Counts for tabs
  const todaysCount = useMemo(() => {
    const todayStr = getTodayString();
    return orders.filter(ord => {
      const orderDate = ord.serviceDate ? ord.serviceDate.split('T')[0] : '';
      return orderDate === todayStr || (ord.createdAt && ord.createdAt.includes('10/1/2026'));
    }).length;
  }, [orders]);

  const upcomingCount = useMemo(() => {
    const todayStr = getTodayString();
    const tenDaysAheadStr = getFutureDateString(10);
    return orders.filter(ord => {
      const orderDate = ord.serviceDate ? ord.serviceDate.split('T')[0] : '';
      return orderDate > todayStr && orderDate <= tenDaysAheadStr;
    }).length;
  }, [orders]);

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col space-y-4">
      {/* Header & Stats */}
      <div className="flex-none flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Order & Booking Management</h1>
          <p className="text-xs text-slate-500 mt-0.5">Track live customer orders, service status, and assigned partners</p>
        </div>
        <div className="flex items-center space-x-3">
          {/* Filter Toggle Buttons */}
          <div className="bg-slate-100 p-1 rounded-xl flex items-center space-x-1 border border-slate-200">
            <button
              onClick={() => setActiveFilter('today')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeFilter === 'today' 
                  ? 'bg-teal-600 text-white shadow-sm' 
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Today's Orders ({todaysCount})
            </button>
            <button
              onClick={() => setActiveFilter('upcoming')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeFilter === 'upcoming' 
                  ? 'bg-teal-600 text-white shadow-sm' 
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Upcoming ({upcomingCount})
            </button>
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeFilter === 'all' 
                  ? 'bg-white text-slate-800 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              All Orders ({orders.length})
            </button>
          </div>

          {/* Create Order Button */}
          <button
            onClick={() => setIsCreateOpen(true)}
            className="inline-flex items-center space-x-1.5 bg-teal-600 hover:bg-teal-700 text-white px-3.5 py-2 rounded-xl text-xs font-semibold shadow-sm transition-colors cursor-pointer"
          >
            <Plus size={15} />
            <span>Create Order</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex-none bg-white p-3.5 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by customer name, city, or request #..."
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
                <th className="py-3.5 px-5">Request # / Date</th>
                <th className="py-3.5 px-5">Customer</th>
                <th className="py-3.5 px-5">Service & City</th>
                <th className="py-3.5 px-5">Assigned Partner</th>
                <th className="py-3.5 px-5">Amount</th>
                <th className="py-3.5 px-5 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {loading && orders.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-16 text-center text-slate-400 font-medium">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <div className="w-6 h-6 border-2 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
                      <p className="text-xs text-slate-500">Waking up Render server & fetching orders...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-400 font-medium">
                    {activeFilter === 'today' ? "No orders scheduled for today." : activeFilter === 'upcoming' ? "No upcoming orders in the next 10 days." : "No orders found."}
                  </td>
                </tr>
              ) : (
                filteredOrders.map((ord) => {
                  const status = String(ord.status || 'Pending').toLowerCase();
                  const isDone = status === 'completed' || status === 'done' || status === 'success';
                  const assignedPartner = ord.partnerName || ord.vendorName || '';
                  
                  return (
                    <tr 
                      key={ord.id || ord._id} 
                      onClick={() => setSelectedOrder(ord)}
                      className="hover:bg-slate-50/70 transition-colors cursor-pointer"
                    >
                      <td className="py-3.5 px-5 font-semibold text-slate-800">
                        <div className="text-teal-700">{ord.serviceRequestNumber || `#REQ-${ord.id || 'N/A'}`}</div>
                        <div className="text-xs text-slate-400 font-normal flex items-center space-x-1 mt-0.5">
                          <Calendar size={12} />
                          <span>{ord.serviceDate || 'Immediate'} ({ord.slotTime || 'Anytime'})</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-5 text-slate-700">
                        <div className="font-medium">{ord.customerName}</div>
                        <div className="text-xs text-slate-400">{ord.customerMobile || ord.mobile}</div>
                      </td>
                      <td className="py-3.5 px-5 text-slate-700 max-w-[280px]">
                        <div className="font-medium truncate" title={ord.serviceName}>
                          {ord.serviceName}
                        </div>
                        <div className="flex items-center space-x-2 mt-1">
                           <span className="inline-flex items-center space-x-1 bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md text-[11px] font-semibold flex-shrink-0">
                            <Building2 size={11} className="text-slate-500" />
                           <span>{ord.city || 'N/A'}</span>
                            </span>
                            <span className="text-xs text-slate-400 truncate" title={ord.locality}>
                              {ord.locality}
                            </span>
                        </div>
                      </td>
                      
                      {/* Assigned Partner Column with Quick Assign Button */}
                      <td className="py-3.5 px-5 text-slate-600 text-xs" onClick={(e) => e.stopPropagation()}>
                        {assignedPartner ? (
                          <button
                            type="button"
                            onClick={() => {
                              setAssignModalOrder(ord);
                              setSelectedPartnerInput(assignedPartner);
                            }}
                            className="inline-flex items-center space-x-1 bg-teal-50 text-teal-700 hover:bg-teal-100 px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer"
                            title="Click to change partner"
                          >
                            <UserCheck size={13} />
                            <span>{assignedPartner}</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              setAssignModalOrder(ord);
                              setSelectedPartnerInput('');
                            }}
                            className="inline-flex items-center space-x-1 bg-amber-50 text-amber-700 hover:bg-amber-100 px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer border border-amber-200"
                            title="Click to assign partner"
                          >
                            <Plus size={12} />
                            <span>Assign Partner</span>
                          </button>
                        )}
                      </td>

                      <td className="py-3.5 px-5 font-bold text-slate-800">
                        ₹{ord.serviceAmount || ord.amount || 0}
                        <div className="text-[10px] text-slate-400 font-normal">{ord.paymentMethod || 'Cash'}</div>
                      </td>
                      <td className="py-3.5 px-5 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
  {/* Interactive Status Toggle Switch Button */}
  <button
    type="button"
    onClick={(e) => handleStatusToggle(ord, e)}
    className={`px-3 py-1.5 rounded-full text-xs font-semibold inline-flex items-center space-x-1 transition-colors cursor-pointer shadow-sm ${
      isDone 
        ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200' 
        : 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200'
    }`}
    title="Click to toggle status between Pending and Done"
  >
    {isDone ? <CheckCircle2 size={13} /> : <Clock size={13} />}
    <span>{isDone ? 'Done' : 'Pending'}</span>
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

      {/* Quick Assign Partner Modal */}
      {assignModalOrder && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-100 w-full max-w-sm overflow-hidden flex flex-col p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-800">Assign Partner</h3>
                <p className="text-[11px] text-slate-400">Request: {assignModalOrder.serviceRequestNumber || `#REQ-${assignModalOrder.id}`}</p>
              </div>
              <button 
                onClick={() => setAssignModalOrder(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <XCircle size={18} />
              </button>
            </div>

            <form onSubmit={handleConfirmAssignment} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Select or Type Partner Name</label>
                <div className="relative">
                  <ShieldCheck size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    list="quick-partner-suggestions"
                    placeholder="Type name or select..."
                    value={selectedPartnerInput}
                    onChange={(e) => setSelectedPartnerInput(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-teal-500 font-semibold text-slate-700"
                    required
                  />
                  <datalist id="quick-partner-suggestions">
                    {partners.map((p) => (
                      <option key={p.id || p._id} value={p.name}>
                        {p.city ? `(${p.city})` : ''}
                      </option>
                    ))}
                  </datalist>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setAssignModalOrder(null)}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={assigning}
                  className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-teal-600 hover:bg-teal-700 text-white shadow-sm transition-colors disabled:opacity-50"
                >
                  {assigning ? 'Assigning...' : 'Confirm'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Order Detail Modal */}
      <OrderDetailModal 
        order={selectedOrder} 
        onClose={() => setSelectedOrder(null)} 
      />

      {/* Create Order Modal Component */}
      <CreateOrderModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onOrderCreated={handleOrderCreated}
      />
    </div>
  );
};

export default OrderManagement;


// import React, { useState, useEffect, useMemo } from 'react';
// import { ShoppingBag, Search, Clock, CheckCircle2, XCircle, MapPin, Calendar, Building2, Plus } from 'lucide-react';
// import API from '../../services/api';
// import OrderDetailModal from './OrderDetailModal';
// import CreateOrderModal from './CreateOrderModal';

// const OrderManagement = () => {
//   // Initialize state from sessionStorage for instant zero-delay loading
//   const [orders, setOrders] = useState(() => {
//     const cached = sessionStorage.getItem('orders_cache');
//     return cached ? JSON.parse(cached) : [];
//   });
  
//   const [partners, setPartners] = useState([]);
//   const [loading, setLoading] = useState(() => !sessionStorage.getItem('orders_cache'));
//   const [error, setError] = useState(null);
//   const [searchQuery, setSearchQuery] = useState('');
//   const [activeFilter, setActiveFilter] = useState('today'); // 'all' | 'today' | 'upcoming'
//   const [selectedOrder, setSelectedOrder] = useState(null); // For viewing details modal
//   const [isCreateOpen, setIsCreateOpen] = useState(false); // State for Create Order modal

//   // Fetch orders and approved partners from API with background revalidation
//   const fetchOrders = async (isBackground = false) => {
//     try {
//       if (!isBackground && orders.length === 0) setLoading(true);
      
//       const response = await API.get('/api/orders').catch(() => API.get('/api/bookings'));
//       let rawData = response.data.data || response.data.orders || response.data;
//       const validOrders = Array.isArray(rawData) ? rawData : [];
      
//       setOrders(validOrders);
//       sessionStorage.setItem('orders_cache', JSON.stringify(validOrders));

//       // Fetch approved partners for assignment dropdown
//       const resPartners = await API.get('/api/partners?isApproved=1');
//       let rawPartners = resPartners.data.data || resPartners.data.partners || resPartners.data;
//       if (rawPartners && !Array.isArray(rawPartners) && Array.isArray(rawPartners.data)) {
//         rawPartners = rawPartners.data;
//       }
//       setPartners(Array.isArray(rawPartners) ? rawPartners : []);

//       setError(null);
//     } catch (err) {
//       console.error('Error fetching orders or partners:', err);
//       if (orders.length === 0) {
//         setError('Unable to sync orders from the backend server.');
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchOrders(orders.length > 0);
//   }, []);

//   // Handle newly created order response
//   const handleOrderCreated = (newOrder) => {
//     setOrders(prev => {
//       const updated = [newOrder, ...prev];
//       sessionStorage.setItem('orders_cache', JSON.stringify(updated));
//       return updated;
//     });
//   };

//   // Interactive Status Toggle (Pending <-> Done/Completed)
//   const handleStatusToggle = async (ord, e) => {
//     e.stopPropagation();
//     const orderId = ord.id || ord._id;
//     const currentStatus = String(ord.status || 'Pending').toLowerCase();
//     const newStatus = (currentStatus === 'completed' || currentStatus === 'done' || currentStatus === 'success') ? 'Pending' : 'Completed';

//     try {
//       const updatedOrders = orders.map(o => (o.id === orderId || o._id === orderId) ? { ...o, status: newStatus } : o);
//       setOrders(updatedOrders);
//       sessionStorage.setItem('orders_cache', JSON.stringify(updatedOrders));

//       await API.put(`/api/orders/${orderId}`, { ...ord, status: newStatus }).catch(() => {
//         API.patch(`/api/orders/${orderId}/status`, { status: newStatus });
//       });
//     } catch (err) {
//       console.error('Failed to update order status:', err);
//     }
//   };

//   // Manual Partner Assignment Dropdown
//   const handlePartnerAssignment = async (ord, partnerName, e) => {
//     e.stopPropagation();
//     const orderId = ord.id || ord._id;

//     try {
//       const updatedOrders = orders.map(o => (o.id === orderId || o._id === orderId) ? { ...o, partnerName: partnerName } : o);
//       setOrders(updatedOrders);
//       sessionStorage.setItem('orders_cache', JSON.stringify(updatedOrders));

//       await API.put(`/api/orders/${orderId}`, { ...ord, partnerName: partnerName });
//     } catch (err) {
//       console.error('Failed to assign partner:', err);
//     }
//   };

//   // Helper date calculations
//   const getTodayString = () => {
//     const today = new Date();
//     return today.toISOString().split('T')[0];
//   };

//   const getFutureDateString = (daysToAdd) => {
//     const date = new Date();
//     date.setDate(date.getDate() + daysToAdd);
//     return date.toISOString().split('T')[0];
//   };

//   // Filter orders based on Tab (All, Today, Upcoming) and Search Query
//   const filteredOrders = useMemo(() => {
//     const todayStr = getTodayString();
//     const tenDaysAheadStr = getFutureDateString(10);

//     return orders.filter(ord => {
//       const orderDate = ord.serviceDate ? ord.serviceDate.split('T')[0] : '';
//       const isLegacyToday = ord.createdAt && ord.createdAt.includes('10/1/2026');

//       // 1. Tab Filters
//       if (activeFilter === 'today') {
//         const matchesToday = orderDate === todayStr || isLegacyToday;
//         if (!matchesToday) return false;
//       } else if (activeFilter === 'upcoming') {
//         // Between tomorrow and next 10 days
//         const matchesUpcoming = orderDate > todayStr && orderDate <= tenDaysAheadStr;
//         if (!matchesUpcoming) return false;
//       }
//       // 'all' includes everything (including orders > 10 days out)

//       // 2. Search Query Filter
//       return (
//         (ord.customerName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
//         (ord.customerMobile || ord.mobile || '').includes(searchQuery) ||
//         (ord.serviceName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
//         (ord.serviceRequestNumber || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
//         (ord.city || '').toLowerCase().includes(searchQuery.toLowerCase())
//       );
//     });
//   }, [orders, searchQuery, activeFilter]);

//   // Counts for tabs
//   const todaysCount = useMemo(() => {
//     const todayStr = getTodayString();
//     return orders.filter(ord => {
//       const orderDate = ord.serviceDate ? ord.serviceDate.split('T')[0] : '';
//       return orderDate === todayStr || (ord.createdAt && ord.createdAt.includes('10/1/2026'));
//     }).length;
//   }, [orders]);

//   const upcomingCount = useMemo(() => {
//     const todayStr = getTodayString();
//     const tenDaysAheadStr = getFutureDateString(10);
//     return orders.filter(ord => {
//       const orderDate = ord.serviceDate ? ord.serviceDate.split('T')[0] : '';
//       return orderDate > todayStr && orderDate <= tenDaysAheadStr;
//     }).length;
//   }, [orders]);

//   return (
//     <div className="h-[calc(100vh-120px)] flex flex-col space-y-4">
//       {/* Header & Stats */}
//       <div className="flex-none flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
//         <div>
//           <h1 className="text-xl font-bold text-slate-800">Order & Booking Management</h1>
//           <p className="text-xs text-slate-500 mt-0.5">Track live customer orders, service status, and assigned partners</p>
//         </div>
//         <div className="flex items-center space-x-3">
//           {/* Filter Toggle Buttons */}
//           <div className="bg-slate-100 p-1 rounded-xl flex items-center space-x-1 border border-slate-200">
//             <button
//               onClick={() => setActiveFilter('today')}
//               className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
//                 activeFilter === 'today' 
//                   ? 'bg-teal-600 text-white shadow-sm' 
//                   : 'text-slate-500 hover:text-slate-800'
//               }`}
//             >
//               Today's Orders ({todaysCount})
//             </button>
//             <button
//               onClick={() => setActiveFilter('upcoming')}
//               className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
//                 activeFilter === 'upcoming' 
//                   ? 'bg-teal-600 text-white shadow-sm' 
//                   : 'text-slate-500 hover:text-slate-800'
//               }`}
//             >
//               Upcoming ({upcomingCount})
//             </button>
//             <button
//               onClick={() => setActiveFilter('all')}
//               className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
//                 activeFilter === 'all' 
//                   ? 'bg-white text-slate-800 shadow-sm' 
//                   : 'text-slate-500 hover:text-slate-800'
//               }`}
//             >
//               All Orders ({orders.length})
//             </button>
//           </div>

//           {/* Create Order Button */}
//           <button
//             onClick={() => setIsCreateOpen(true)}
//             className="inline-flex items-center space-x-1.5 bg-teal-600 hover:bg-teal-700 text-white px-3.5 py-2 rounded-xl text-xs font-semibold shadow-sm transition-colors cursor-pointer"
//           >
//             <Plus size={15} />
//             <span>Create Order</span>
//           </button>
//         </div>
//       </div>

//       {/* Search Bar */}
//       <div className="flex-none bg-white p-3.5 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between gap-4">
//         <div className="relative flex-1 max-w-md">
//           <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
//           <input
//             type="text"
//             placeholder="Search by customer name, city, or request #..."
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
//                 <th className="py-3.5 px-5">Request # / Date</th>
//                 <th className="py-3.5 px-5">Customer</th>
//                 <th className="py-3.5 px-5">Service & City</th>
//                 {/* <th className="py-3.5 px-5">Assigned Partner</th> */}
//                 <th className="py-3.5 px-5">Amount</th>
//                 <th className="py-3.5 px-5 text-right">Status</th>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-slate-100 text-sm">
//               {loading && orders.length === 0 ? (
//                 <tr>
//                   <td colSpan="6" className="py-16 text-center text-slate-400 font-medium">
//                     <div className="flex flex-col items-center justify-center space-y-2">
//                       <div className="w-6 h-6 border-2 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
//                       <p className="text-xs text-slate-500">Waking up Render server & fetching orders...</p>
//                     </div>
//                   </td>
//                 </tr>
//               ) : filteredOrders.length === 0 ? (
//                 <tr>
//                   <td colSpan="6" className="py-12 text-center text-slate-400 font-medium">
//                     {activeFilter === 'today' ? "No orders scheduled for today." : activeFilter === 'upcoming' ? "No upcoming orders in the next 10 days." : "No orders found."}
//                   </td>
//                 </tr>
//               ) : (
//                 filteredOrders.map((ord) => {
//                   const status = String(ord.status || 'Pending').toLowerCase();
//                   const isDone = status === 'completed' || status === 'done' || status === 'success';
//                   const assignedPartner = ord.partnerName || ord.vendorName || '';
                  
//                   return (
//                     <tr 
//                       key={ord.id || ord._id} 
//                       onClick={() => setSelectedOrder(ord)}
//                       className="hover:bg-slate-50/70 transition-colors cursor-pointer"
//                     >
//                       <td className="py-3.5 px-5 font-semibold text-slate-800">
//                         <div className="text-teal-700">{ord.serviceRequestNumber || `#REQ-${ord.id || 'N/A'}`}</div>
//                         <div className="text-xs text-slate-400 font-normal flex items-center space-x-1 mt-0.5">
//                           <Calendar size={12} />
//                           <span>{ord.serviceDate || 'Immediate'} ({ord.slotTime || 'Anytime'})</span>
//                         </div>
//                       </td>
//                       <td className="py-3.5 px-5 text-slate-700">
//                         <div className="font-medium">{ord.customerName}</div>
//                         <div className="text-xs text-slate-400">{ord.customerMobile || ord.mobile}</div>
//                       </td>
//                       <td className="py-3.5 px-5 text-slate-700 max-w-[280px]">
//                         <div className="font-medium truncate" title={ord.serviceName}>
//                           {ord.serviceName}
//                         </div>
//                         <div className="flex items-center space-x-2 mt-1">
//                            <span className="inline-flex items-center space-x-1 bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md text-[11px] font-semibold flex-shrink-0">
//                             <Building2 size={11} className="text-slate-500" />
//                            <span>{ord.city || 'N/A'}</span>
//                             </span>
//                             <span className="text-xs text-slate-400 truncate" title={ord.locality}>
//                               {ord.locality}
//                             </span>
//                         </div>
//                       </td>                 
//                       <td className="py-3.5 px-5 font-bold text-slate-800">
//                         ₹{ord.serviceAmount || ord.amount || 0}
//                         <div className="text-[10px] text-slate-400 font-normal">{ord.paymentMethod || 'Cash'}</div>
//                       </td>
//                       <td className="py-3.5 px-5 text-right" onClick={(e) => e.stopPropagation()}>
//                         {/* Interactive Status Toggle Switch Button */}
//                         <button
//                           type="button"
//                           onClick={(e) => handleStatusToggle(ord, e)}
//                           className={`px-3.5 py-1.5 rounded-full text-xs font-semibold inline-flex items-center space-x-1.5 transition-colors cursor-pointer shadow-sm ${
//                             isDone 
//                               ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200' 
//                               : 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200'
//                           }`}
//                           title="Click to toggle status between Pending and Done"
//                         >
//                           {isDone ? <CheckCircle2 size={14} /> : <Clock size={14} />}
//                           <span>{isDone ? 'Done' : 'Pending'}</span>
//                         </button>
//                       </td>
//                     </tr>
//                   );
//                 })
//               )}
//             </tbody>
//           </table>
//         </div>
//       </div>

//       {/* Order Detail Modal */}
//       <OrderDetailModal 
//         order={selectedOrder} 
//         onClose={() => setSelectedOrder(null)} 
//       />

//       {/* Create Order Modal Component */}
//       <CreateOrderModal
//         isOpen={isCreateOpen}
//         onClose={() => setIsCreateOpen(false)}
//         onOrderCreated={handleOrderCreated}
//       />
//     </div>
//   );
// };

// export default OrderManagement;

// import React, { useState, useEffect, useMemo } from 'react';
// import { ShoppingBag, Search, Clock, CheckCircle2, XCircle, MapPin, Calendar, Building2, Plus } from 'lucide-react';
// import OrderDetailModal from './OrderDetailModal';
// import CreateOrderModal from './CreateOrderModal';

// const OrderManagement = () => {
//   // Initialize state from sessionStorage for instant zero-delay loading
//   const [orders, setOrders] = useState(() => {
//     const cached = sessionStorage.getItem('orders_cache');
//     return cached ? JSON.parse(cached) : [];
//   });
  
//   const [loading, setLoading] = useState(() => !sessionStorage.getItem('orders_cache'));
//   const [error, setError] = useState(null);
//   const [searchQuery, setSearchQuery] = useState('');
//   const [activeFilter, setActiveFilter] = useState('today'); // 'all' | 'today' | 'upcoming'
//   const [selectedOrder, setSelectedOrder] = useState(null); // For viewing details modal
//   const [isCreateOpen, setIsCreateOpen] = useState(false); // State for Create Order modal

//   // Fetch orders from API with background revalidation
//   const fetchOrders = async (isBackground = false) => {
//     try {
//       if (!isBackground && orders.length === 0) setLoading(true);
      
//       const response = await fetch('https://adminbackend-1-h03r.onrender.com/api/orders');
      
//       if (!response.ok) {
//         const altResponse = await fetch('https://adminbackend-1-h03r.onrender.com/api/bookings');
//         if (!altResponse.ok) throw new Error(`Server returned status ${response.status}`);
//         const altResult = await altResponse.json();
//         const altData = altResult.data || altResult.bookings || altResult;
//         const validAlt = Array.isArray(altData) ? altData : [];
//         setOrders(validAlt);
//         sessionStorage.setItem('orders_cache', JSON.stringify(validAlt));
//         setError(null);
//         return;
//       }

//       const result = await response.json();
//       const responseData = result.data || result.orders || result;
//       const validOrders = Array.isArray(responseData) ? responseData : [];
      
//       setOrders(validOrders);
//       sessionStorage.setItem('orders_cache', JSON.stringify(validOrders));
//       setError(null);
//     } catch (err) {
//       console.error('Error fetching orders:', err);
//       if (orders.length === 0) {
//         setError('Unable to sync orders from the backend server.');
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchOrders(orders.length > 0);
//   }, []);

//   // Handle newly created order response
//   const handleOrderCreated = (newOrder) => {
//     setOrders(prev => {
//       const updated = [newOrder, ...prev];
//       sessionStorage.setItem('orders_cache', JSON.stringify(updated));
//       return updated;
//     });
//   };

//   // Helper date calculations
//   const getTodayString = () => {
//     const today = new Date();
//     return today.toISOString().split('T')[0];
//   };

//   const getFutureDateString = (daysToAdd) => {
//     const date = new Date();
//     date.setDate(date.getDate() + daysToAdd);
//     return date.toISOString().split('T')[0];
//   };

//   // Filter orders based on Tab (All, Today, Upcoming) and Search Query
//   const filteredOrders = useMemo(() => {
//     const todayStr = getTodayString();
//     const tenDaysAheadStr = getFutureDateString(10);

//     return orders.filter(ord => {
//       const orderDate = ord.serviceDate ? ord.serviceDate.split('T')[0] : '';
//       const isLegacyToday = ord.createdAt && ord.createdAt.includes('10/1/2026');

//       // 1. Tab Filters
//       if (activeFilter === 'today') {
//         const matchesToday = orderDate === todayStr || isLegacyToday;
//         if (!matchesToday) return false;
//       } else if (activeFilter === 'upcoming') {
//         // Between tomorrow and next 10 days
//         const matchesUpcoming = orderDate > todayStr && orderDate <= tenDaysAheadStr;
//         if (!matchesUpcoming) return false;
//       }
//       // 'all' includes everything (including orders > 10 days out)

//       // 2. Search Query Filter
//       return (
//         (ord.customerName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
//         (ord.customerMobile || ord.mobile || '').includes(searchQuery) ||
//         (ord.serviceName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
//         (ord.serviceRequestNumber || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
//         (ord.city || '').toLowerCase().includes(searchQuery.toLowerCase())
//       );
//     });
//   }, [orders, searchQuery, activeFilter]);

//   // Counts for tabs
//   const todaysCount = useMemo(() => {
//     const todayStr = getTodayString();
//     return orders.filter(ord => {
//       const orderDate = ord.serviceDate ? ord.serviceDate.split('T')[0] : '';
//       return orderDate === todayStr || (ord.createdAt && ord.createdAt.includes('10/1/2026'));
//     }).length;
//   }, [orders]);

//   const upcomingCount = useMemo(() => {
//     const todayStr = getTodayString();
//     const tenDaysAheadStr = getFutureDateString(10);
//     return orders.filter(ord => {
//       const orderDate = ord.serviceDate ? ord.serviceDate.split('T')[0] : '';
//       return orderDate > todayStr && orderDate <= tenDaysAheadStr;
//     }).length;
//   }, [orders]);

//   return (
//     <div className="h-[calc(100vh-120px)] flex flex-col space-y-4">
//       {/* Header & Stats */}
//       <div className="flex-none flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
//         <div>
//           <h1 className="text-xl font-bold text-slate-800">Order & Booking Management</h1>
//           <p className="text-xs text-slate-500 mt-0.5">Track live customer orders, service status, and assigned partners</p>
//         </div>
//         <div className="flex items-center space-x-3">
//           {/* Filter Toggle Buttons */}
//           <div className="bg-slate-100 p-1 rounded-xl flex items-center space-x-1 border border-slate-200">
//             <button
//               onClick={() => setActiveFilter('today')}
//               className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
//                 activeFilter === 'today' 
//                   ? 'bg-teal-600 text-white shadow-sm' 
//                   : 'text-slate-500 hover:text-slate-800'
//               }`}
//             >
//               Today's Orders ({todaysCount})
//             </button>
//             <button
//               onClick={() => setActiveFilter('upcoming')}
//               className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
//                 activeFilter === 'upcoming' 
//                   ? 'bg-teal-600 text-white shadow-sm' 
//                   : 'text-slate-500 hover:text-slate-800'
//               }`}
//             >
//               Upcoming ({upcomingCount})
//             </button>
//             <button
//               onClick={() => setActiveFilter('all')}
//               className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
//                 activeFilter === 'all' 
//                   ? 'bg-white text-slate-800 shadow-sm' 
//                   : 'text-slate-500 hover:text-slate-800'
//               }`}
//             >
//               All Orders ({orders.length})
//             </button>
//           </div>

//           {/* Create Order Button */}
//           <button
//             onClick={() => setIsCreateOpen(true)}
//             className="inline-flex items-center space-x-1.5 bg-teal-600 hover:bg-teal-700 text-white px-3.5 py-2 rounded-xl text-xs font-semibold shadow-sm transition-colors cursor-pointer"
//           >
//             <Plus size={15} />
//             <span>Create Order</span>
//           </button>
//         </div>
//       </div>

//       {/* Search Bar */}
//       <div className="flex-none bg-white p-3.5 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between gap-4">
//         <div className="relative flex-1 max-w-md">
//           <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
//           <input
//             type="text"
//             placeholder="Search by customer name, city, or request #..."
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
//                 <th className="py-3.5 px-5">Request # / Date</th>
//                 <th className="py-3.5 px-5">Customer</th>
//                 <th className="py-3.5 px-5">Service & City</th>
//                 {/* <th className="py-3.5 px-5">Assigned Partner</th> */}
//                 <th className="py-3.5 px-5">Amount</th>
//                 <th className="py-3.5 px-5 text-right">Status</th>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-slate-100 text-sm">
//               {loading && orders.length === 0 ? (
//                 <tr>
//                   <td colSpan="6" className="py-16 text-center text-slate-400 font-medium">
//                     <div className="flex flex-col items-center justify-center space-y-2">
//                       <div className="w-6 h-6 border-2 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
//                       <p className="text-xs text-slate-500">Waking up Render server & fetching orders...</p>
//                     </div>
//                   </td>
//                 </tr>
//               ) : filteredOrders.length === 0 ? (
//                 <tr>
//                   <td colSpan="6" className="py-12 text-center text-slate-400 font-medium">
//                     {activeFilter === 'today' ? "No orders scheduled for today." : activeFilter === 'upcoming' ? "No upcoming orders in the next 10 days." : "No orders found."}
//                   </td>
//                 </tr>
//               ) : (
//                 filteredOrders.map((ord) => {
//                   const status = String(ord.status || 'Pending').toLowerCase();
//                   const assignedPartner = ord.partnerName || ord.vendorName;
                  
//                   return (
//                     <tr 
//                       key={ord.id || ord._id} 
//                       onClick={() => setSelectedOrder(ord)}
//                       className="hover:bg-slate-50/70 transition-colors cursor-pointer"
//                     >
//                       <td className="py-3.5 px-5 font-semibold text-slate-800">
//                         <div className="text-teal-700">{ord.serviceRequestNumber || `#REQ-${ord.id || 'N/A'}`}</div>
//                         <div className="text-xs text-slate-400 font-normal flex items-center space-x-1 mt-0.5">
//                           <Calendar size={12} />
//                           <span>{ord.serviceDate || 'Immediate'} ({ord.slotTime || 'Anytime'})</span>
//                         </div>
//                       </td>
//                       <td className="py-3.5 px-5 text-slate-700">
//                         <div className="font-medium">{ord.customerName}</div>
//                         <div className="text-xs text-slate-400">{ord.customerMobile || ord.mobile}</div>
//                       </td>
//                       <td className="py-3.5 px-5 text-slate-700">
//                         <div className="font-medium">{ord.serviceName}</div>
//                         <div className="flex items-center space-x-2 mt-1">
//                           <span className="inline-flex items-center space-x-1 bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md text-[11px] font-semibold">
//                             <Building2 size={11} className="text-slate-500" />
//                             <span>{ord.city || 'N/A'}</span>
//                           </span>
//                           <span className="text-xs text-slate-400 truncate max-w-[180px]">
//                             {ord.locality}
//                           </span>
//                         </div>
//                       </td>
//                       {/* <td className="py-3.5 px-5 text-slate-600 text-xs">
//                         {assignedPartner && assignedPartner !== '-' ? (
//                           <span className="font-semibold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-lg">
//                             {assignedPartner}
//                           </span>
//                         ) : (
//                           <span className="text-amber-600 bg-amber-50 px-2.5 py-1 rounded-lg font-semibold">
//                             Unassigned
//                           </span>
//                         )}
//                       </td> */}
//                       <td className="py-3.5 px-5 font-bold text-slate-800">
//                         ₹{ord.serviceAmount || ord.amount || 0}
//                         <div className="text-[10px] text-slate-400 font-normal">{ord.paymentMethod || 'Cash'}</div>
//                       </td>
//                       <td className="py-3.5 px-5 text-right">
//                         {status === 'completed' || status === 'success' ? (
//                           <span className="inline-flex items-center space-x-1 bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full text-xs font-semibold">
//                             <CheckCircle2 size={13} />
//                             <span>Completed</span>
//                           </span>
//                         ) : status === 'in progress' ? (
//                           <span className="inline-flex items-center space-x-1 bg-sky-50 text-sky-700 px-2.5 py-1 rounded-full text-xs font-semibold">
//                             <Clock size={13} />
//                             <span>In Progress</span>
//                           </span>
//                         ) : status === 'cancelled' ? (
//                           <span className="inline-flex items-center space-x-1 bg-rose-50 text-rose-700 px-2.5 py-1 rounded-full text-xs font-semibold">
//                             <XCircle size={13} />
//                             <span>Cancelled</span>
//                           </span>
//                         ) : (
//                           <span className="inline-flex items-center space-x-1 bg-amber-50 text-amber-700 px-2.5 py-1 rounded-full text-xs font-semibold">
//                             <Clock size={13} />
//                             <span>Pending</span>
//                           </span>
//                         )}
//                       </td>
//                     </tr>
//                   );
//                 })
//               )}
//             </tbody>
//           </table>
//         </div>
//       </div>

//       {/* Order Detail Modal */}
//       <OrderDetailModal 
//         order={selectedOrder} 
//         onClose={() => setSelectedOrder(null)} 
//       />

//       {/* Create Order Modal Component */}
//       <CreateOrderModal
//         isOpen={isCreateOpen}
//         onClose={() => setIsCreateOpen(false)}
//         onOrderCreated={handleOrderCreated}
//       />
//     </div>
//   );
// };

// export default OrderManagement;
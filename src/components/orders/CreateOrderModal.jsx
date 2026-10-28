
import React, { useState, useEffect } from 'react';
import { X, Calendar, User, Phone, MapPin, Building2, IndianRupee, Clock, ShieldCheck } from 'lucide-react';
import api from '../../services/api';

const CreateOrderModal = ({ isOpen, onClose, onOrderCreated }) => {
  const [formData, setFormData] = useState({
    customerName: '',
    customerMobile: '',
    serviceName: '',
    city: '',
    locality: '',
    serviceDate: new Date().toISOString().split('T')[0],
    slotTime: '10:00 AM - 12:00 PM',
    serviceAmount: '',
    paymentMethod: 'Cash',
    status: 'Pending',
    partnerName: ''
  });

  const [partners, setPartners] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Fetch approved partners when modal opens
  useEffect(() => {
    if (isOpen) {
      const fetchPartners = async () => {
        try {
          const res = await api.get('/api/partners?isApproved=1');
          let rawPartners = res.data.data || res.data.partners || res.data;
          if (rawPartners && !Array.isArray(rawPartners) && Array.isArray(rawPartners.data)) {
            rawPartners = rawPartners.data;
          }
          setPartners(Array.isArray(rawPartners) ? rawPartners : []);
        } catch (err) {
          console.error('Failed to fetch partners for modal:', err);
        }
      };
      fetchPartners();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const response = await api.post('/api/orders', {
        ...formData,
        serviceAmount: Number(formData.serviceAmount),
        serviceRequestNumber: `#REQ-${Math.floor(100000 + Math.random() * 900000)}`,
        createdAt: new Date().toISOString()
      });

      const result = response.data;
      const newOrder = result.data || result.order || { ...formData, id: Date.now() };

      onOrderCreated(newOrder);
      onClose();
    } catch (err) {
      console.error('Error creating order:', err);
      setError(err.response?.data?.message || 'Failed to create order on the server.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-100 w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-800">Create New Order</h2>
          <button 
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 px-3 py-2 rounded-xl text-xs">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Customer Name</label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  name="customerName"
                  required
                  placeholder="John Doe"
                  value={formData.customerName}
                  onChange={handleChange}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-teal-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Mobile Number</label>
              <div className="relative">
                <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  name="customerMobile"
                  required
                  placeholder="9876543210"
                  value={formData.customerMobile}
                  onChange={handleChange}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-teal-500"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Service Name</label>
            <input 
              type="text" 
              name="serviceName"
              required
              placeholder="e.g. AC Deep Cleaning / Plumbing Service"
              value={formData.serviceName}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-teal-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">City</label>
              <div className="relative">
                <Building2 size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  name="city"
                  required
                  placeholder="Jaipur"
                  value={formData.city}
                  onChange={handleChange}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-teal-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Locality / Area</label>
              <div className="relative">
                <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  name="locality"
                  required
                  placeholder="Malviya Nagar"
                  value={formData.locality}
                  onChange={handleChange}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-teal-500"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Service Date</label>
              <div className="relative">
                <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="date" 
                  name="serviceDate"
                  required
                  value={formData.serviceDate}
                  onChange={handleChange}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-teal-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Time Slot</label>
              <div className="relative">
                <Clock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <select
                  name="slotTime"
                  value={formData.slotTime}
                  onChange={handleChange}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-teal-500"
                >
                  <option value="09:00 AM - 11:00 AM">09:00 AM - 11:00 AM</option>
                  <option value="11:00 AM - 01:00 PM">11:00 AM - 01:00 PM</option>
                  <option value="02:00 PM - 04:00 PM">02:00 PM - 04:00 PM</option>
                  <option value="04:00 PM - 06:00 PM">04:00 PM - 06:00 PM</option>
                </select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Amount (₹)</label>
              <div className="relative">
                <IndianRupee size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="number" 
                  name="serviceAmount"
                  required
                  placeholder="499"
                  value={formData.serviceAmount}
                  onChange={handleChange}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-teal-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Payment Method</label>
              <select
                name="paymentMethod"
                value={formData.paymentMethod}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-teal-500"
              >
                <option value="Cash">Cash</option>
                <option value="UPI">UPI</option>
                <option value="Online">Online / Card</option>
              </select>
            </div>
          </div>

          {/* Partner Assignment Field (Select from list OR type manually) */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Assign Partner (Select or Type Manually)</label>
            <div className="relative">
              <ShieldCheck size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                name="partnerName"
                list="partner-suggestions"
                placeholder="Type partner name or select from list"
                value={formData.partnerName}
                onChange={handleChange}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-teal-500 font-semibold text-slate-700"
              />
              <datalist id="partner-suggestions">
                {partners.map((p) => (
                  <option key={p.id || p._id} value={p.name}>
                    {p.city ? `(${p.city})` : ''}
                  </option>
                ))}
              </datalist>
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="pt-4 flex items-center justify-end space-x-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-xl text-xs font-semibold bg-teal-600 hover:bg-teal-700 text-white shadow-sm transition-colors disabled:opacity-50 cursor-pointer"
            >
              {submitting ? 'Creating...' : 'Save Order'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

export default CreateOrderModal;

// import React, { useState } from 'react';
// import { X, Calendar, User, Phone, MapPin, Building2, IndianRupee, Clock } from 'lucide-react';
// import api from '../../services/api';

// const CreateOrderModal = ({ isOpen, onClose, onOrderCreated }) => {
//   const [formData, setFormData] = useState({
//     customerName: '',
//     customerMobile: '',
//     serviceName: '',
//     city: '',
//     locality: '',
//     serviceDate: new Date().toISOString().split('T')[0],
//     slotTime: '10:00 AM - 12:00 PM',
//     serviceAmount: '',
//     paymentMethod: 'Cash',
//     status: 'Pending'
//   });
//   const [submitting, setSubmitting] = useState(false);
//   const [error, setError] = useState(null);

//   if (!isOpen) return null;

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({ ...prev, [name]: value }));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setSubmitting(true);
//     setError(null);

//     try {
//       const response = await api.post('/api/orders', {
//         ...formData,
//         serviceAmount: Number(formData.serviceAmount),
//         serviceRequestNumber: `#REQ-${Math.floor(100000 + Math.random() * 900000)}`,
//         createdAt: new Date().toISOString()
//       });

//       const result = response.data;
//       const newOrder = result.data || result.order || { ...formData, id: Date.now() };

//       onOrderCreated(newOrder);
//       onClose();
//     } catch (err) {
//       console.error('Error creating order:', err);
//       setError(err.response?.data?.message || 'Failed to create order on the server.');
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   return (
//     <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
//       <div className="bg-white rounded-2xl shadow-xl border border-slate-100 w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        
//         {/* Modal Header */}
//         <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
//           <h2 className="text-lg font-bold text-slate-800">Create New Order</h2>
//           <button 
//             onClick={onClose}
//             className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-50 transition-colors"
//           >
//             <X size={20} />
//           </button>
//         </div>

//         {/* Modal Form */}
//         <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
//           {error && (
//             <div className="bg-rose-50 border border-rose-200 text-rose-700 px-3 py-2 rounded-xl text-xs">
//               {error}
//             </div>
//           )}

//           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//             <div>
//               <label className="block text-xs font-semibold text-slate-600 mb-1">Customer Name</label>
//               {/* <label className="block text-xs font-semibold text-slate-600 mb-1">Customer Name</label> */}

//               <div className="relative">
//                 <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
//                 <input 
//                   type="text" 
//                   name="customerName"
//                   required
//                   placeholder="John Doe"
//                   value={formData.customerName}
//                   onChange={handleChange}
//                   className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-teal-500"
//                 />
//               </div>
//             </div>

//             <div>
//               <label className="block text-xs font-semibold text-slate-600 mb-1">Mobile Number</label>
//               <div className="relative">
//                 <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
//                 <input 
//                   type="text" 
//                   name="customerMobile"
//                   required
//                   placeholder="9876543210"
//                   value={formData.customerMobile}
//                   onChange={handleChange}
//                   className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-teal-500"
//                 />
//               </div>
//             </div>
//           </div>

//           <div>
//             <label className="block text-xs font-semibold text-slate-600 mb-1">Service Name</label>
//             <input 
//               type="text" 
//               name="serviceName"
//               required
//               placeholder="e.g. AC Deep Cleaning / Plumbing Service"
//               value={formData.serviceName}
//               onChange={handleChange}
//               className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-teal-500"
//             />
//           </div>

//           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//             <div>
//               <label className="block text-xs font-semibold text-slate-600 mb-1">City</label>
//               <div className="relative">
//                 <Building2 size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
//                 <input 
//                   type="text" 
//                   name="city"
//                   required
//                   placeholder="Jaipur"
//                   value={formData.city}
//                   onChange={handleChange}
//                   className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-teal-500"
//                 />
//               </div>
//             </div>

//             <div>
//               <label className="block text-xs font-semibold text-slate-600 mb-1">Locality / Area</label>
//               <div className="relative">
//                 <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
//                 <input 
//                   type="text" 
//                   name="locality"
//                   required
//                   placeholder="Malviya Nagar"
//                   value={formData.locality}
//                   onChange={handleChange}
//                   className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-teal-500"
//                 />
//               </div>
//             </div>
//           </div>

//           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//             <div>
//               <label className="block text-xs font-semibold text-slate-600 mb-1">Service Date</label>
//               <div className="relative">
//                 <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
//                 <input 
//                   type="date" 
//                   name="serviceDate"
//                   required
//                   value={formData.serviceDate}
//                   onChange={handleChange}
//                   className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-teal-500"
//                 />
//               </div>
//             </div>

//             <div>
//               <label className="block text-xs font-semibold text-slate-600 mb-1">Time Slot</label>
//               <div className="relative">
//                 <Clock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
//                 <select
//                   name="slotTime"
//                   value={formData.slotTime}
//                   onChange={handleChange}
//                   className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-teal-500"
//                 >
//                   <option value="09:00 AM - 11:00 AM">09:00 AM - 11:00 AM</option>
//                   <option value="11:00 AM - 01:00 PM">11:00 AM - 01:00 PM</option>
//                   <option value="02:00 PM - 04:00 PM">02:00 PM - 04:00 PM</option>
//                   <option value="04:00 PM - 06:00 PM">04:00 PM - 06:00 PM</option>
//                 </select>
//               </div>
//             </div>
//           </div>

//           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//             <div>
//               <label className="block text-xs font-semibold text-slate-600 mb-1">Amount (₹)</label>
//               <div className="relative">
//                 <IndianRupee size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
//                 <input 
//                   type="number" 
//                   name="serviceAmount"
//                   required
//                   placeholder="499"
//                   value={formData.serviceAmount}
//                   onChange={handleChange}
//                   className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-teal-500"
//                 />
//               </div>
//             </div>

//             <div>
//               <label className="block text-xs font-semibold text-slate-600 mb-1">Payment Method</label>
//               <select
//                 name="paymentMethod"
//                 value={formData.paymentMethod}
//                 onChange={handleChange}
//                 className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-teal-500"
//               >
//                 <option value="Cash">Cash</option>
//                 <option value="UPI">UPI</option>
//                 <option value="Online">Online / Card</option>
//               </select>
//             </div>
//           </div>

//           {/* Footer Buttons */}
//           <div className="pt-4 flex items-center justify-end space-x-3 border-t border-slate-100">
//             <button
//               type="button"
//               onClick={onClose}
//               className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
//             >
//               Cancel
//             </button>
//             <button
//               type="submit"
//               disabled={submitting}
//               className="px-5 py-2 rounded-xl text-xs font-semibold bg-teal-600 hover:bg-teal-700 text-white shadow-sm transition-colors disabled:opacity-50"
//             >
//               {submitting ? 'Creating...' : 'Save Order'}
//             </button>
//           </div>
//         </form>

//       </div>
//     </div>
//   );
// };

// export default CreateOrderModal;
import React from 'react';
import { X, User, Phone, MapPin, Calendar, Clock, Building2, CreditCard, ShieldCheck } from 'lucide-react';

const OrderDetailModal = ({ order, onClose }) => {
  if (!order) return null;

  const status = (order.status || 'Pending').toLowerCase();
  const assignedPartner = order.partnerName || order.vendorName;
  const partnerPhone = order.partnerPhone || order.vendorMobile || order.partnerMobile || order.vendorPhone;
  const customerPhone = order.customerMobile || order.customerPhone || order.userPhone || order.phone || order.mobile;

  return (
    <div className="fixed inset-0 bg-slate-900/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 space-y-6 max-h-[90vh] overflow-y-auto">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold border border-teal-100">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-bold text-lg text-slate-800">{order.serviceRequestNumber || `#REQ-${order.id}`}</h3>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                  status === 'completed' ? 'bg-emerald-50 text-emerald-700' :
                  status === 'in progress' ? 'bg-sky-50 text-sky-700' :
                  status === 'cancelled' ? 'bg-rose-50 text-rose-700' : 'bg-amber-50 text-amber-700'
                }`}>
                  {order.status || 'Pending'}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">Created on: {order.createdAt || 'N/A'}</p>
            </div>
          </div>
          <button 
            type="button"
            onClick={(e) => { e.stopPropagation(); onClose(); }}
            className="text-slate-400 hover:text-slate-600 font-bold p-2 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Service & Schedule Details */}
        <div className="bg-teal-50/50 p-4 rounded-xl border border-teal-100 space-y-2">
          <h4 className="font-bold text-xs text-teal-800 uppercase tracking-wider">Service Booked</h4>
          <div className="text-base font-bold text-slate-800">{order.serviceName}</div>
          <div className="flex flex-wrap gap-4 text-xs text-slate-600 pt-1">
            <div className="flex items-center space-x-1">
              <Calendar size={13} className="text-teal-600" />
              <span>Date: <strong className="text-slate-700">{order.serviceDate}</strong></span>
            </div>
            <div className="flex items-center space-x-1">
              <Clock size={13} className="text-teal-600" />
              <span>Slot: <strong className="text-slate-700">{order.slotTime}</strong></span>
            </div>
            <div className="flex items-center space-x-1">
              <CreditCard size={13} className="text-teal-600" />
              <span>Amount: <strong className="text-slate-700">₹{order.serviceAmount}</strong> ({order.paymentMethod})</span>
            </div>
          </div>
        </div>

        {/* Customer & Partner Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          {/* Customer Details */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2">
            <h4 className="font-bold text-xs text-slate-400 uppercase tracking-wider flex items-center space-x-1">
              <User size={14} />
              <span>Customer Information</span>
            </h4>
            <div className="font-semibold text-slate-800">{order.customerName || 'N/A'}</div>
            <div className="flex items-center space-x-1.5 text-xs text-slate-600">
              <Phone size={13} className="text-slate-400" />
              <span>{customerPhone || 'N/A'}</span>
            </div>
            <div className="flex items-start space-x-1.5 text-xs text-slate-600 pt-1">
              <MapPin size={13} className="text-slate-400 mt-0.5 flex-shrink-0" />
              <span>{order.address}, {order.locality}, {order.city}</span>
            </div>
          </div>

          {/* Assigned Partner Details */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2">
            <h4 className="font-bold text-xs text-slate-400 uppercase tracking-wider flex items-center space-x-1">
              <ShieldCheck size={14} />
              <span>Assigned Partner</span>
            </h4>
            {assignedPartner && assignedPartner !== '-' ? (
              <>
                <div className="font-semibold text-teal-700">{assignedPartner}</div>
                <div className="flex items-center space-x-1.5 text-xs text-slate-600">
                  <Phone size={13} className="text-slate-400" />
                  <span>{partnerPhone || 'N/A'}</span>
                </div>
                <div className="text-[11px] text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded inline-block mt-1">
                  Active Assignment
                </div>
              </>
            ) : (
              <div className="text-amber-600 bg-amber-50 px-3 py-2 rounded-lg text-xs font-semibold">
                No partner assigned yet (Pending acceptance)
              </div>
            )}
          </div>
        </div>

        {/* Technical Metadata */}
        <div className="text-[11px] text-slate-400 flex items-center justify-between border-t border-slate-100 pt-3">
          <span>Source System: {order.source || 'N/A'}</span>
          <span>Coordinates: {order.latitude}, {order.longitude}</span>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-semibold transition-colors cursor-pointer"
          >
            Close Details
          </button>
        </div>

      </div>
    </div>
  );
};

export default OrderDetailModal;
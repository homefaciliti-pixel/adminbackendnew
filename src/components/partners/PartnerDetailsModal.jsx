import React from 'react';
import { X, User, ShieldCheck } from 'lucide-react';

const PartnerDetailsModal = ({ partner, isOpen = true, onClose, onApprove, onReject, loading }) => {
  if (isOpen === false || !partner) return null;

  // Normalization mapper to handle various backend database key naming conventions
  const details = {
    name: partner.name || partner.fullName || partner.full_name || 'N/A',
    mobile: partner.mobile || partner.phone || partner.phone_number || partner.contact || 'N/A',
    email: partner.email || partner.mail || 'N/A',
    city: partner.city || partner.location || 'N/A',
    locality: partner.locality || partner.address || '',
    gender: partner.gender || partner.sex || 'N/A',
    experience: partner.experience || partner.exp || 'N/A',
    services: partner.services || partner.offered_services || [],
    panNumber: partner.panNumber || partner.pan || partner.pan_card || 'N/A',
    aadhaarNumber: partner.aadhaarNumber || partner.aadhaar || partner.aadhaar_card || 'Verified Record',
    bankName: partner.bankName || partner.bank_name || partner.bank || 'N/A',
    accountNumber: partner.accountNumber || partner.account_no || partner.acc_number || 'N/A',
    ifscCode: partner.ifscCode || partner.ifsc_code || partner.ifsc || 'N/A'
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center space-x-2">
            <User size={18} className="text-teal-600" />
            <h3 className="text-sm font-bold text-slate-800">Partner Verification & Details</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs">
          
          {/* Basic Personal Information */}
          <div>
            <h4 className="font-bold text-slate-700 uppercase tracking-wider text-[11px] mb-3 border-b pb-1">Personal Details</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 bg-slate-50 p-3 rounded-xl">
              <div>
                <span className="text-slate-400 block">Full Name</span>
                <strong className="text-slate-800 text-sm">{details.name}</strong>
              </div>
              <div>
                <span className="text-slate-400 block">Mobile Number</span>
                <strong className="text-slate-800">{details.mobile}</strong>
              </div>
              <div>
                <span className="text-slate-400 block">Email Address</span>
                <strong className="text-slate-800 truncate block">{details.email}</strong>
              </div>
              <div>
                <span className="text-slate-400 block">City / Locality</span>
                <strong className="text-slate-800">{details.city}{details.locality ? `, ${details.locality}` : ''}</strong>
              </div>
              <div>
                <span className="text-slate-400 block">Gender</span>
                <strong className="text-slate-800">{details.gender}</strong>
              </div>
              <div>
                <span className="text-slate-400 block">Experience</span>
                <strong className="text-slate-800">{details.experience}</strong>
              </div>
            </div>
          </div>

          {/* Professional & Services Info */}
          <div>
            <h4 className="font-bold text-slate-700 uppercase tracking-wider text-[11px] mb-3 border-b pb-1">Services & Category</h4>
            <div className="bg-slate-50 p-3 rounded-xl space-y-2">
              <div>
                <span className="text-slate-400 block mb-1">Offered Services</span>
                <div className="flex flex-wrap gap-1.5">
                  {details.services && details.services.length > 0 ? (
                    details.services.map((srv, idx) => (
                      <span key={idx} className="bg-teal-50 text-teal-700 px-2.5 py-0.5 rounded-full font-semibold text-[11px]">
                        {srv}
                      </span>
                    ))
                  ) : (
                    <span className="text-slate-600">No services specified</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Verification Numbers */}
          <div>
            <h4 className="font-bold text-slate-700 uppercase tracking-wider text-[11px] mb-3 border-b pb-1">Verification Numbers</h4>
            <div className="grid grid-cols-2 gap-4 bg-slate-50 p-3 rounded-xl">
              <div>
                <span className="text-slate-400 block">PAN Number</span>
                <strong className="text-slate-800">{details.panNumber}</strong>
              </div>
              <div>
                <span className="text-slate-400 block">Aadhaar Reference</span>
                <strong className="text-slate-800">{details.aadhaarNumber}</strong>
              </div>
            </div>
          </div>

          {/* Bank Account Details */}
          <div>
            <h4 className="font-bold text-slate-700 uppercase tracking-wider text-[11px] mb-3 border-b pb-1">Bank Account Information</h4>
            <div className="grid grid-cols-3 gap-4 bg-slate-50 p-3 rounded-xl">
              <div>
                <span className="text-slate-400 block">Bank Name</span>
                <strong className="text-slate-800">{details.bankName}</strong>
              </div>
              <div>
                <span className="text-slate-400 block">Account Number</span>
                <strong className="text-slate-800">{details.accountNumber}</strong>
              </div>
              <div>
                <span className="text-slate-400 block">IFSC Code</span>
                <strong className="text-slate-800">{details.ifscCode}</strong>
              </div>
            </div>
          </div>

        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 border-t border-slate-100 flex items-center justify-end space-x-3 bg-slate-50">
          {onReject && (
            <button
              disabled={loading}
              onClick={onReject}
              className="px-4 py-2 bg-rose-50 text-rose-700 font-semibold rounded-xl hover:bg-rose-100 transition-colors disabled:opacity-50"
            >
              Reject
            </button>
          )}

          {onApprove && (
            <button
              disabled={loading}
              onClick={onApprove}
              className="px-4 py-2 bg-teal-600 text-white font-semibold rounded-xl hover:bg-teal-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Approve Partner'}
            </button>
          )}

          {!onApprove && !onReject && (
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-300 transition-colors"
            >
              Close
            </button>
          )}
        </div>

      </div>
    </div>
  );
};

export default PartnerDetailsModal;
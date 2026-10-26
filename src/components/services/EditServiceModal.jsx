import React, { useState, useEffect } from 'react';
import { X, Wrench, Trash2, CheckCircle2 } from 'lucide-react';
import API from '../../services/api';

const EditServiceModal = ({ service, onClose, onUpdateSuccess, onDeleteSuccess }) => {
  if (!service) return null;

  const [formData, setFormData] = useState({
    title: service.title || service.name || '',
    price: service.price || 0,
    cutPrice: service.cutPrice || 0,
    time: service.time || '',
    description: service.description || '',
    status: service.status ?? true,
  });

  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setFormData({
      title: service.title || service.name || '',
      price: service.price || 0,
      cutPrice: service.cutPrice || 0,
      time: service.time || '',
      description: service.description || '',
      status: service.status ?? true,
    });
  }, [service]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError(null);

      // PUT API: /api/services/:id
      const serviceId = service.id || service._id;
      const response = await API.put(`/api/services/${serviceId}`, formData);

      const updatedService = response.data.data || response.data.service || { ...service, ...formData };
      
      onUpdateSuccess(updatedService);
      onClose();
    } catch (err) {
      console.error('Error updating service:', err);
      setError('Failed to update service details. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete "${service.title || service.name}"?`)) {
      return;
    }

    try {
      setDeleting(true);
      setError(null);

      // DELETE API: /api/services/:id
      const serviceId = service.id || service._id;
      await API.delete(`/api/services/${serviceId}`);

      onDeleteSuccess(serviceId);
      onClose();
    } catch (err) {
      console.error('Error deleting service:', err);
      setError('Failed to delete service. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-6 max-h-[90vh] overflow-y-auto">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold border border-teal-100">
              <Wrench size={20} />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-800">Edit or Delete Service</h3>
              <p className="text-xs text-slate-500">ID: {service.id || service._id}</p>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-2 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl text-xs">
            {error}
          </div>
        )}

        {/* Edit Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-sm">
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Service Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-500 text-slate-800"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Base Price (₹)</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                required
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-500 text-slate-800"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Cut Price (₹)</label>
              <input
                type="number"
                name="cutPrice"
                value={formData.cutPrice}
                onChange={handleChange}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-500 text-slate-800"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Completion Time</label>
            <input
              type="text"
              name="time"
              value={formData.time}
              onChange={handleChange}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-500 text-slate-800"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-500 text-slate-800 text-xs"
            />
          </div>

          <div className="flex items-center space-x-2 pt-2">
            <input
              type="checkbox"
              name="status"
              id="statusCheckbox"
              checked={formData.status}
              onChange={handleChange}
              className="w-4 h-4 text-teal-600 border-slate-300 rounded focus:ring-teal-500"
            />
            <label htmlFor="statusCheckbox" className="text-xs font-semibold text-slate-700 cursor-pointer">
              Active Service Status
            </label>
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50 flex items-center space-x-1.5"
            >
              <Trash2 size={13} />
              <span>{deleting ? 'Deleting...' : 'Delete Service'}</span>
            </button>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors cursor-pointer disabled:opacity-50 flex items-center space-x-1.5"
              >
                {saving ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Saving...</span>
                  </>
                ) : (
                  <span>Save Changes</span>
                )}
              </button>
            </div>
          </div>
        </form>

      </div>
    </div>
  );
};

export default EditServiceModal;
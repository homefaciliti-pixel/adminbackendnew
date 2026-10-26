import React, { useState, useEffect } from 'react';
import { X, Plus, Layers, AlertCircle } from 'lucide-react';
import API from '../../services/api';

const AddServiceModal = ({ isOpen, onClose, onSuccess, onNavigateToSubcategories }) => {
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    price: '',
    cutPrice: '',
    categoryId: '',
    sub_category_id: '',
    sub_category: '',
    time: '',
    description: '',
    image: '',
    status: true
  });

  useEffect(() => {
    if (isOpen) {
      fetchCategories();
    }
  }, [isOpen]);

  // Fetch categories for dropdown
  const fetchCategories = async () => {
    try {
      const res = await API.get('/api/categories');
      const data = res.data.data || res.data;
      setCategories(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  // Fetch subcategories when category changes
  const handleCategoryChange = async (e) => {
    const catId = e.target.value;
    setFormData(prev => ({ ...prev, categoryId: catId, sub_category_id: '', sub_category: '' }));
    
    if (!catId) {
      setSubcategories([]);
      return;
    }

    try {
      const res = await API.get(`/api/categories/${catId}/subcategories`);
      const subs = res.data.data || res.data.subcategories || res.data;
      setSubcategories(Array.isArray(subs) ? subs : []);
    } catch (err) {
      console.error('Error fetching subcategories for category:', err);
      setSubcategories([]);
    }
  };

  const handleSubcategoryChange = (e) => {
    const subId = e.target.value;
    const selectedSub = subcategories.find(s => s.id.toString() === subId.toString());
    setFormData(prev => ({
      ...prev,
      sub_category_id: subId,
      sub_category: selectedSub ? (selectedSub.title || selectedSub.name) : ''
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const payload = {
        ...formData,
        price: Number(formData.price),
        cutPrice: formData.cutPrice ? Number(formData.cutPrice) : null,
        categoryId: Number(formData.categoryId),
        sub_category_id: formData.sub_category_id ? Number(formData.sub_category_id) : null,
      };

      const res = await API.post('/api/services', payload);
      const createdService = res.data.data || res.data.service || res.data;
      
      if (onSuccess) onSuccess(createdService);
      onClose();
    } catch (err) {
      console.error('Error creating service:', err);
      setError(err.response?.data?.message || 'Failed to create service. Please check your inputs.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div>
            <h2 className="text-lg font-bold text-slate-800">Add New Service</h2>
            <p className="text-xs text-slate-500">Create a new service catalog entry under category & subcategory</p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-200/50 transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Modal Body / Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl text-xs flex items-center space-x-2">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Service Title *</label>
              <input
                type="text"
                required
                placeholder="e.g. Sofa Deep Cleaning"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Completion Time</label>
              <input
                type="text"
                placeholder="e.g. 2-3 hours"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-teal-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Base Price (₹) *</label>
              <input
                type="number"
                required
                placeholder="499"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Cut Price / Original Price (₹)</label>
              <input
                type="number"
                placeholder="799"
                value={formData.cutPrice}
                onChange={(e) => setFormData({ ...formData, cutPrice: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-teal-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Parent Category *</label>
              <select
                required
                value={formData.categoryId}
                onChange={handleCategoryChange}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-teal-500"
              >
                <option value="">Select Category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.title || cat.name}</option>
                ))}
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-600">Subcategory</label>
                {onNavigateToSubcategories && (
                  <button
                    type="button"
                    onClick={onNavigateToSubcategories}
                    className="text-[11px] text-teal-600 hover:underline font-medium flex items-center space-x-1"
                  >
                    <Layers size={10} />
                    <span>+ Add Subcategory</span>
                  </button>
                )}
              </div>
              <select
                value={formData.sub_category_id}
                onChange={handleSubcategoryChange}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-teal-500"
              >
                <option value="">Select Subcategory (Optional)</option>
                {subcategories.map((sub) => (
                  <option key={sub.id} value={sub.id}>{sub.title || sub.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Image URL</label>
            <input
              type="text"
              placeholder="https://example.com/image.png"
              value={formData.image}
              onChange={(e) => setFormData({ ...formData, image: e.target.value })}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-teal-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Description</label>
            <textarea
              rows={3}
              placeholder="Detailed service description..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-teal-500"
            />
          </div>

          {/* Modal Footer Buttons */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center space-x-1.5 bg-teal-600 hover:bg-teal-700 text-white px-5 py-2 rounded-xl text-xs font-semibold shadow-sm transition-all disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <Plus size={14} />
                  <span>Create Service</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddServiceModal;
import React, { useState, useEffect } from 'react';
import { FolderTree, Plus, Trash2, CheckCircle, XCircle, Search, Image as ImageIcon } from 'lucide-react';

const CategoryManagement = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal & Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [parent, setParent] = useState('');
  const [image, setImage] = useState('');
  const [status, setStatus] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Fetch categories using direct fetch matching DashboardOverview pattern
  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await fetch('https://adminbackend-1-h03r.onrender.com/api/categories');
      
      if (!response.ok) {
        throw new Error(`Server returned status ${response.status}`);
      }

      const result = await response.json();
      console.log('Live Categories API Result:', result);
      
      const responseData = result.data || result.categories || result;
      setCategories(Array.isArray(responseData) ? responseData : []);
      setError(null);
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError('Unable to sync categories from the backend server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Handle Create Category using direct fetch
  const handleCreateCategory = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const response = await fetch('https://adminbackend-1-h03r.onrender.com/api/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          parent: parent || null,
          image: image || 'https://via.placeholder.com/150',
          status
        })
      });

      if (!response.ok) {
        throw new Error(`Server returned status ${response.status}`);
      }
      
      setTitle('');
      setParent('');
      setImage('');
      setStatus(true);
      setIsModalOpen(false);
      fetchCategories();
    } catch (err) {
      console.error('Failed to create category:', err);
      alert('Error creating category. Please check your inputs.');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Delete Category using direct fetch
  const handleDeleteCategory = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category? This will cascade-delete all sub-categories.')) return;
    try {
      const response = await fetch(`https://adminbackend-1-h03r.onrender.com/api/categories/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error(`Server returned status ${response.status}`);
      }

      setCategories(categories.filter(cat => cat._id !== id && cat.id !== id));
    } catch (err) {
      console.error('Failed to delete category:', err);
      alert('Failed to delete category.');
    }
  };

  const filteredCategories = categories.filter(cat => 
    (cat.title || cat.name || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col space-y-4">
      {/* Header & Action Bar - Locked at top */}
      <div className="flex-none flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Category Management</h1>
          <p className="text-xs text-slate-500 mt-0.5">Manage service categories, parent groups, and active statuses</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center space-x-2 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-sm transition-all"
        >
          <Plus size={18} />
          <span>Add New Category</span>
        </button>
      </div>

      {/* Search Bar & Stats - Locked at top */}
      <div className="flex-none bg-white p-3.5 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search categories by title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-teal-500 transition-colors"
          />
        </div>
        <div className="text-xs font-semibold text-slate-500">
          Total Categories: <span className="text-slate-800 font-bold">{categories.length}</span>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="flex-none bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl text-sm">
          {error}
        </div>
      )}

      {/* Categories Table Container - Expands to take rest of the page with internal scroll */}
      <div className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col min-h-0">
        <div className="flex-1 overflow-y-auto">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-slate-50 z-10 shadow-sm">
              <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3.5 px-5">Image</th>
                <th className="py-3.5 px-5">Title / Name</th>
                <th className="py-3.5 px-5">Parent Category</th>
                <th className="py-3.5 px-5">Status</th>
                <th className="py-3.5 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {loading ? (
                <tr>
                  <td colSpan="5" className="py-12 text-center text-slate-400 animate-pulse font-medium">
                    Fetching categories from API...
                  </td>
                </tr>
              ) : filteredCategories.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-12 text-center text-slate-400 font-medium">
                    No categories found.
                  </td>
                </tr>
              ) : (
                filteredCategories.map((cat) => (
                  <tr key={cat._id || cat.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3.5 px-5">
                      <div className="w-11 h-11 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden">
                        {cat.image ? (
                          <img src={cat.image} alt={cat.title} className="w-full h-full object-cover" />
                        ) : (
                          <ImageIcon size={18} className="text-slate-400" />
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-5 font-semibold text-slate-800">
                      {cat.title || cat.name}
                    </td>
                    <td className="py-3.5 px-5 text-slate-600">
                      {cat.parent || <span className="text-slate-400 italic">Main Category</span>}
                    </td>
                    <td className="py-3.5 px-5">
                      {cat.status !== false ? (
                        <span className="inline-flex items-center space-x-1.5 bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full text-xs font-semibold">
                          <CheckCircle size={13} />
                          <span>Active</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1.5 bg-rose-50 text-rose-700 px-2.5 py-1 rounded-full text-xs font-semibold">
                          <XCircle size={13} />
                          <span>Inactive</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <button
                        onClick={() => handleDeleteCategory(cat._id || cat.id)}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Delete Category"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Category Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-5 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="font-bold text-lg text-slate-800">Add New Category</h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCategory} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Category Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Cleaning, Plumbing"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Parent Category (Optional)</label>
                <input
                  type="text"
                  placeholder="Leave empty if main category"
                  value={parent}
                  onChange={(e) => setParent(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Image URL</label>
                <input
                  type="text"
                  placeholder="https://..."
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <input
                  type="checkbox"
                  id="statusToggle"
                  checked={status}
                  onChange={(e) => setStatus(e.target.checked)}
                  className="w-4 h-4 text-teal-600 rounded border-slate-300 focus:ring-teal-500"
                />
                <label htmlFor="statusToggle" className="text-sm font-semibold text-slate-700">Active Status</label>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-sm font-semibold shadow-sm transition-all disabled:opacity-50"
                >
                  {submitting ? 'Creating...' : 'Save Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryManagement;
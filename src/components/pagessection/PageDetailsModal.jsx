import React, { useState, useEffect } from 'react';
import { X, FileText, Globe, Edit3, Save } from 'lucide-react';
import API from '../../services/api';

const PageDetailModal = ({ page, onClose, onUpdateSuccess }) => {
  if (!page) return null;

  const pageId = page.id || page._id;

  const [pageData, setPageData] = useState(page);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    title: page.title || page.name || '',
    slug: page.slug || '',
    content: page.content || page.description || '',
    status: page.status ?? true,
  });
  const [saving, setSaving] = useState(false);

  // Optional background fetch to ensure we pull full description if the list item was truncated
  useEffect(() => {
    if (!pageId) return;

    const fetchLatestDetails = async () => {
      try {
        setLoading(true);
        const response = await API.get(`/api/pages/${pageId}`);
        const data = response.data.data || response.data.page || response.data;
        
        setPageData(data);
        setFormData({
          title: data.title || data.name || '',
          slug: data.slug || '',
          content: data.content || data.description || '',
          status: data.status ?? true,
        });
      } catch (err) {
        console.error('Could not fetch extra page details, using list cache:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLatestDetails();
  }, [pageId]);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const response = await API.put(`/api/pages/${pageId}`, formData);
      const updated = response.data.data || response.data.page || { ...pageData, ...formData };
      
      setPageData(updated);
      setIsEditing(false);
      if (onUpdateSuccess) onUpdateSuccess(updated);
    } catch (err) {
      console.error('Error updating page:', err);
      alert('Failed to update page.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 space-y-6 max-h-[90vh] overflow-y-auto">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold border border-teal-100 flex-shrink-0">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-800">
                {pageData?.title || pageData?.name || 'Page Details'}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">ID: {pageId}</p>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-2 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {isEditing ? (
          <form onSubmit={handleSave} className="space-y-4 text-sm">
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Page Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-500 text-slate-800"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Slug / URL</label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                required
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-500 text-slate-800"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Content / Body</label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                rows={8}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-500 text-slate-800 text-xs font-mono"
              />
            </div>
            <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors cursor-pointer disabled:opacity-50 flex items-center space-x-1"
              >
                <Save size={14} />
                <span>{saving ? 'Saving...' : 'Save Changes'}</span>
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-4 text-sm">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Slug / URL</span>
                <span className="inline-flex items-center space-x-1 bg-teal-50 text-teal-700 px-2.5 py-0.5 rounded-md text-xs font-semibold">
                  <Globe size={12} />
                  <span>/{pageData?.slug || 'N/A'}</span>
                </span>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Page Content / Body</span>
                {loading && <span className="text-[10px] text-teal-600 animate-pulse">Syncing latest content...</span>}
              </div>
              <div className="text-xs text-slate-700 bg-white p-4 rounded-xl border border-slate-200 max-h-72 overflow-y-auto whitespace-pre-wrap font-sans leading-relaxed">
                {pageData?.content || pageData?.description || 'No detailed content available for this page.'}
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <span className="text-xs text-slate-400">
                Last Updated: {pageData?.updatedAt || pageData?.updated_at || 'N/A'}
              </span>
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="inline-flex items-center space-x-1 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-sm transition-colors cursor-pointer"
              >
                <Edit3 size={14} />
                <span>Edit Page</span>
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default PageDetailModal;
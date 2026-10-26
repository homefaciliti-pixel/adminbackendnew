import React, { useState, useEffect, useMemo } from 'react';
import { FileText, Search, Calendar, CheckCircle2, Globe } from 'lucide-react';
import API from '../../services/api';
import PageDetailModal from './PageDetailsModal'; // 👈 Make sure filename matches your file

const PageManagement = () => {
  const [pages, setPages] = useState(() => {
    const cached = sessionStorage.getItem('pages_cache');
    return cached ? JSON.parse(cached) : [];
  });
  
  const [loading, setLoading] = useState(() => !sessionStorage.getItem('pages_cache'));
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPage, setSelectedPage] = useState(null); // 👈 Store the whole page object instead of just ID

  const fetchPages = async (isBackground = false) => {
    try {
      if (!isBackground && pages.length === 0) setLoading(true);
      setError(null);
      
      const response = await API.get('/api/pages');
      
      let rawData = response.data.data || response.data.pages || response.data;
      if (rawData && !Array.isArray(rawData) && Array.isArray(rawData.data)) {
        rawData = rawData.data;
      }
      
      const validPages = Array.isArray(rawData) ? rawData : [];
      setPages(validPages);
      sessionStorage.setItem('pages_cache', JSON.stringify(validPages));
    } catch (err) {
      console.error('Error fetching pages:', err);
      if (pages.length === 0) {
        setError('Unable to sync pages from the backend server.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPages(pages.length > 0);
  }, []);

  const handlePageUpdated = (updatedPage) => {
    setPages((prev) => {
      const updatedList = prev.map(p => ((p.id || p._id) === (updatedPage.id || updatedPage._id)) ? updatedPage : p);
      sessionStorage.setItem('pages_cache', JSON.stringify(updatedList));
      return updatedList;
    });
  };

  const filteredPages = useMemo(() => {
    return pages.filter(pg => 
      (pg.title || pg.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (pg.slug || '').toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [pages, searchQuery]);

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col space-y-4">
      {/* Header & Stats */}
      <div className="flex-none flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-800">CMS Page Management</h1>
          <p className="text-xs text-slate-500 mt-0.5">Click any row to view full details and content</p>
        </div>
        <div className="bg-teal-50 border border-teal-200 text-teal-800 px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-2">
          <FileText size={14} className="text-teal-600" />
          <span>Total Pages: {pages.length}</span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex-none bg-white p-3.5 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search pages by title or slug..."
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
                <th className="py-3.5 px-5">Page Title</th>
                <th className="py-3.5 px-5">Slug / URL</th>
                <th className="py-3.5 px-5">Last Updated</th>
                <th className="py-3.5 px-5 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {loading && pages.length === 0 ? (
                <tr>
                  <td colSpan="4" className="py-16 text-center text-slate-400 font-medium">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <div className="w-6 h-6 border-2 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
                      <p className="text-xs text-slate-500">Fetching CMS pages...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredPages.length === 0 ? (
                <tr>
                  <td colSpan="4" className="py-12 text-center text-slate-400 font-medium">
                    No pages found.
                  </td>
                </tr>
              ) : (
                filteredPages.map((pg) => {
                  const pageId = pg.id || pg._id;
                  return (
                    <tr 
                      key={pageId} 
                      onClick={() => setSelectedPage(pg)} // 👈 Pass the whole page object here
                      className="hover:bg-slate-50/70 transition-colors cursor-pointer"
                    >
                      <td className="py-3.5 px-5 font-semibold text-slate-800">
                        <div className="flex items-center space-x-2">
                          <span className="w-2 h-2 rounded-full bg-teal-500"></span>
                          <span>{pg.title || pg.name || 'Untitled Page'}</span>
                        </div>
                        <div className="text-xs text-slate-400 font-normal mt-0.5">ID: {pageId}</div>
                      </td>
                      <td className="py-3.5 px-5 text-slate-700">
                        <span className="inline-flex items-center space-x-1 bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg text-xs font-semibold">
                          <Globe size={12} className="text-slate-500" />
                          <span>/{pg.slug || 'page'}</span>
                        </span>
                      </td>
                      <td className="py-3.5 px-5 text-slate-600 text-xs">
                        <div className="flex items-center space-x-1">
                          <Calendar size={12} className="text-slate-400" />
                          <span>{pg.updatedAt || pg.updated_at || pg.createdAt || 'Recent'}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-5 text-right">
                        <span className="inline-flex items-center space-x-1 bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full text-xs font-semibold">
                          <CheckCircle2 size={13} />
                          <span>Published</span>
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Page Detail & Edit Modal */}
      <PageDetailModal
        page={selectedPage} // 👈 Pass the full object prop
        onClose={() => setSelectedPage(null)}
        onUpdateSuccess={handlePageUpdated}
      />
    </div>
  );
};

export default PageManagement;
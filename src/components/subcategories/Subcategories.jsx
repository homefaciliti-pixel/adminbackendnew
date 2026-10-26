import React, { useState, useEffect } from 'react';
import API from '../../services/api';

const Subcategories = () => {
  const [subcategories, setSubcategories] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({ title: '', category_id: '', image: '', status: true });
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  
  useEffect(() => {
    fetchSubcategories();
    fetchCategories();
  }, []);

  const fetchSubcategories = async () => {
    try {
      const response = await API.get('/api/subcategories');
      if (response.data.success) {
        setSubcategories(response.data.data || []);
      } else if (Array.isArray(response.data)) {
        setSubcategories(response.data);
      } else {
        setSubcategories([]);
      }
    } catch (err) {
      console.error('Error fetching subcategories:', err);
      setSubcategories([]);
    } finally {
      setLoading(false);
    }
  };

  // const fetchCategories = async () => {
  //   try {
  //     const response = await API.get('/api/categories');
  //     if (response.data.success) {
  //       setCategories(response.data.data || []);
  //     } else if (Array.isArray(response.data)) {
  //       setCategories(response.data);
  //     }
  //   } catch (err) {
  //     console.error('Error fetching categories:', err);
  //   }
  // };

  const fetchCategories = async () => {
  try {
    const response = await API.get('/api/categories');
    let list = [];
    if (response.data.success) list = response.data.data || [];
    else if (Array.isArray(response.data)) list = response.data;
    console.log('CATEGORIES SAMPLE:', JSON.stringify(list.slice(0, 3), null, 2));
    setCategories(list);
  } catch (err) {
    console.error('Error fetching categories:', err);
  }
};

  const getParentCategoryName = (subcat) => {
    if (subcat.category_id || subcat.categoryId) {
      const catId = subcat.category_id || subcat.categoryId;
      const matchedCat = categories.find((cat) => cat.id === Number(catId));
      if (matchedCat) {
        return matchedCat.name || matchedCat.title;
      }
    }
    return subcat.parent || subcat.categoryName || 'Main Category';
  };

  const filteredSubcategories = subcategories.filter((subcat) => {
    const title = (subcat.title || subcat.name || '').toLowerCase();
    const parentName = getParentCategoryName(subcat).toLowerCase();
    const query = searchTerm.toLowerCase().trim();

    if (!query) return true;

    const queryParts = query.split(/\s+/);
    return queryParts.every(
      (part) => title.includes(part) || parentName.includes(part)
    );
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        title: formData.title,
        category_id: formData.category_id ? Number(formData.category_id) : null,
        categoryId: formData.category_id ? Number(formData.category_id) : null,
        image: formData.image,
        status: formData.status
      };

      if (isEditing) {
        await API.put(`/api/subcategories/${editId}`, payload);
      } else {
        await API.post('/api/subcategories', payload);
      }
      
      setFormData({ title: '', category_id: '', image: '', status: true });
      setIsEditing(false);
      setEditId(null);
      fetchSubcategories();
    } catch (err) {
      console.error('Error saving subcategory:', err);
    }
  };

  const handleEdit = (subcat) => {
    setIsEditing(true);
    setEditId(subcat.id);
    setFormData({
      title: subcat.title || subcat.name || '',
      category_id: subcat.category_id || subcat.categoryId || '',
      image: subcat.image || '',
      status: subcat.status ?? true
    });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this subcategory?')) {
      try {
        await API.delete(`/api/subcategories/${id}`);
        fetchSubcategories();
      } catch (err) {
        console.error('Error deleting subcategory:', err);
      }
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Subcategories Management</h2>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6 flex flex-wrap gap-4 items-end">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Subcategory Title</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
            className="border border-gray-300 p-2.5 rounded-lg w-60 focus:outline-none focus:ring-2 focus:ring-teal-500"
            placeholder="e.g. Sofa Cleaning"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Parent Category</label>
          <select
            value={formData.category_id}
            onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
            className="border border-gray-300 p-2.5 rounded-lg w-60 focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="">Select Parent Category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name || cat.title}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
          <input
            type="text"
            value={formData.image}
            onChange={(e) => setFormData({ ...formData, image: e.target.value })}
            className="border border-gray-300 p-2.5 rounded-lg w-60 focus:outline-none focus:ring-2 focus:ring-teal-500"
            placeholder="Image URL"
          />
        </div>

        <button type="submit" className="bg-teal-600 hover:bg-teal-700 text-white font-medium px-5 py-2.5 rounded-lg transition-all shadow-sm">
          {isEditing ? 'Update Subcategory' : 'Add Subcategory'}
        </button>
      </form>

      {/* Search Bar */}
      <div className="mb-6 bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search subcategories by title or parent category..."
          className="border border-gray-300 p-2.5 rounded-lg w-full max-w-md focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
        />
        <span className="text-sm text-gray-500">Showing {filteredSubcategories.length} subcategories</span>
      </div>

      {loading ? (
        <p className="text-gray-500">Loading subcategories...</p>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-gray-600 text-sm">
                <th className="p-4">Image</th>
                <th className="p-4">ID</th>
                <th className="p-4">Subcategory Title</th>
                <th className="p-4">Parent Category</th>
                <th className="p-4">Status</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSubcategories.map((subcat) => (
                <tr key={subcat.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="p-4">
                    {subcat.image ? (
                      <img src={subcat.image} alt={subcat.title} className="w-10 h-10 object-cover rounded-lg border border-gray-200" />
                    ) : (
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-xs text-gray-400">No img</div>
                    )}
                  </td>
                  <td className="p-4 text-sm text-gray-600">{subcat.id}</td>
                  <td className="p-4 text-sm font-medium text-gray-800">{subcat.title || subcat.name}</td>
                  <td className="p-4 text-sm text-gray-600">{getParentCategoryName(subcat)}</td>
                  <td className="p-4 text-sm">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${subcat.status ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                      {subcat.status ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="p-4 text-sm space-x-3">
                    <button onClick={() => handleEdit(subcat)} className="text-teal-600 hover:text-teal-700 font-medium">Edit</button>
                    <button onClick={() => handleDelete(subcat.id)} className="text-rose-600 hover:text-rose-700 font-medium">Delete</button>
                  </td>
                </tr>
              ))}
              {filteredSubcategories.length === 0 && (
                <tr>
                  <td colSpan="6" className="p-6 text-center text-gray-500">No subcategories found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Subcategories;
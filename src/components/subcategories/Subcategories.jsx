

import React, { useState, useEffect, useCallback } from 'react';
import API from '../../services/api';

const INITIAL_FORM_DATA = {
  title: '',
  category_id: '',
  image: '',
  status: true,
};

// Handles status values returned by the backend:
// true, 1, "1", "true", "active"
const isStatusActive = (status) => {
  if (typeof status === 'boolean') return status;
  if (typeof status === 'number') return status === 1;

  if (typeof status === 'string') {
    const normalizedStatus = status.trim().toLowerCase();

    return (
      normalizedStatus === '1' ||
      normalizedStatus === 'true' ||
      normalizedStatus === 'active'
    );
  }

  return false;
};

// Normalizes API response formats into an array.
const extractList = (responseData, possibleKeys = []) => {
  if (Array.isArray(responseData)) {
    return responseData;
  }

  if (!responseData || typeof responseData !== 'object') {
    return [];
  }

  for (const key of possibleKeys) {
    if (Array.isArray(responseData[key])) {
      return responseData[key];
    }
  }

  return [];
};

const Subcategories = () => {
  const [subcategories, setSubcategories] = useState([]);
  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState(INITIAL_FORM_DATA);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);

  // --------------------------------------------------
  // FETCH SUBCATEGORIES
  // API: GET /api/subcategories
  // Supports:
  // { success: true, data: [...] }
  // { success: true, subcategories: [...] }
  // { success: true, data: { subcategories: [...] } }
  // --------------------------------------------------
  const fetchSubcategories = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMessage('');

      const response = await API.get('/api/subcategories');
      const responseData = response?.data;

      console.log(
        'SUBCATEGORIES API RESPONSE:',
        responseData
      );

      let list = [];

      if (Array.isArray(responseData)) {
        list = responseData;
      } else if (responseData?.success) {
        list = extractList(responseData, [
          'data',
          'subcategories',
          'results',
          'items',
        ]);

        // Also handle nested response data.
        if (!Array.isArray(list) && responseData.data) {
          list = extractList(responseData.data, [
            'subcategories',
            'data',
            'results',
            'items',
          ]);
        }
      }

      const normalizedList = Array.isArray(list)
        ? list.map((item) => ({
            ...item,

            // Ensure ID aliases are available.
            id:
              item.id ??
              item.subcategory_id ??
              item.subCategoryId ??
              item.category_id,

            // Normalize title/name.
            title:
              item.title ??
              item.name ??
              item.subCategoryName ??
              item.categoryName ??
              '',

            // Parent can be returned as parent/category/categoryName.
            parent:
              item.parent ??
              item.categoryName ??
              item.category ??
              '',

            // Keep status in a consistent boolean format.
            status: isStatusActive(item.status),

            // Normalize image value.
            image:
              item.image ??
              item.subCategoryImage ??
              '',
          }))
        : [];

      setSubcategories(normalizedList);
    } catch (error) {
      console.error(
        'Error fetching subcategories:',
        error
      );

      setSubcategories([]);

      setErrorMessage(
        error?.response?.data?.message ||
          error.message ||
          'Unable to fetch subcategories.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // --------------------------------------------------
  // FETCH PARENT CATEGORIES
  // API: GET /api/categories
  // --------------------------------------------------
  const fetchCategories = useCallback(async () => {
    try {
      const response = await API.get('/api/categories');
      const responseData = response?.data;

      console.log(
        'CATEGORIES API RESPONSE:',
        responseData
      );

      const list = extractList(responseData, [
        'data',
        'categories',
        'results',
        'items',
      ]);

      const normalizedCategories = list.map((category) => ({
        ...category,

        id:
          category.id ??
          category.category_id ??
          category.categoryId,

        name:
          category.name ??
          category.title ??
          category.categoryName ??
          '',
      }));

      setCategories(normalizedCategories);
    } catch (error) {
      console.error(
        'Error fetching categories:',
        error
      );
    }
  }, []);

  // --------------------------------------------------
  // INITIAL LOAD
  // --------------------------------------------------
  useEffect(() => {
    fetchSubcategories();
    fetchCategories();
  }, [fetchSubcategories, fetchCategories]);

  // --------------------------------------------------
  // GET PARENT CATEGORY NAME
  // Supports parent as category ID or category name.
  // --------------------------------------------------
  const getParentCategoryName = (subcat) => {
    const parentValue =
      subcat.parent ??
      subcat.categoryName ??
      subcat.category ??
      '';

    const categoryId =
      subcat.category_id ??
      subcat.categoryId ??
      subcat.parent_id ??
      subcat.parentId ??
      '';

    // Try matching category ID first.
    if (categoryId !== '') {
      const matchedById = categories.find(
        (category) =>
          String(category.id) === String(categoryId)
      );

      if (matchedById) {
        return matchedById.name || matchedById.title;
      }
    }

    // The backend may return parent as a category ID.
    if (
      parentValue !== '' &&
      !Number.isNaN(Number(parentValue))
    ) {
      const matchedByParentId = categories.find(
        (category) =>
          String(category.id) === String(parentValue)
      );

      if (matchedByParentId) {
        return matchedByParentId.name || matchedByParentId.title;
      }
    }

    // The backend may return parent as a category name.
    if (parentValue) {
      const matchedByName = categories.find(
        (category) =>
          String(category.name || category.title)
            .trim()
            .toLowerCase() ===
          String(parentValue).trim().toLowerCase()
      );

      if (matchedByName) {
        return matchedByName.name || matchedByName.title;
      }

      return String(parentValue);
    }

    return 'Main Category';
  };

  // --------------------------------------------------
  // FILTER SUBCATEGORIES
  // --------------------------------------------------
  const filteredSubcategories = subcategories.filter(
    (subcat) => {
      const title = String(
        subcat.title || subcat.name || ''
      ).toLowerCase();

      const parentName = String(
        getParentCategoryName(subcat)
      ).toLowerCase();

      const query = searchTerm
        .toLowerCase()
        .trim();

      if (!query) return true;

      const queryParts = query.split(/\s+/);

      return queryParts.every(
        (part) =>
          title.includes(part) ||
          parentName.includes(part)
      );
    }
  );

  // --------------------------------------------------
  // RESET FORM
  // --------------------------------------------------
  const resetForm = () => {
    setFormData(INITIAL_FORM_DATA);
    setIsEditing(false);
    setEditId(null);
  };

  // --------------------------------------------------
  // HANDLE FORM INPUTS
  // --------------------------------------------------
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // --------------------------------------------------
  // ADD / UPDATE SUBCATEGORY
  // API:
  // POST /api/subcategories
  // PUT  /api/subcategories/:id
  // --------------------------------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      setErrorMessage('Subcategory title is required.');
      return;
    }

    if (!formData.category_id) {
      setErrorMessage('Please select a parent category.');
      return;
    }

    try {
      setSaving(true);
      setErrorMessage('');

      const selectedCategoryId = Number(
        formData.category_id
      );

      const payload = {
        title: formData.title.trim(),

        // Send both aliases for backend compatibility.
        category_id: selectedCategoryId,
        categoryId: selectedCategoryId,

        image: formData.image.trim(),

        status: formData.status,
      };

      console.log(
        'SUBCATEGORY SAVE PAYLOAD:',
        payload
      );

      let response;

      if (isEditing && editId !== null) {
        response = await API.put(
          `/api/subcategories/${editId}`,
          payload
        );
      } else {
        response = await API.post(
          '/api/subcategories',
          payload
        );
      }

      console.log(
        'SUBCATEGORY SAVE RESPONSE:',
        response?.data
      );

      if (response?.data?.success === false) {
        throw new Error(
          response.data.message ||
            'Failed to save subcategory.'
        );
      }

      resetForm();

      // Wait for refreshed data.
      await fetchSubcategories();
    } catch (error) {
      console.error(
        'Error saving subcategory:',
        error
      );

      setErrorMessage(
        error?.response?.data?.message ||
          error.message ||
          'Unable to save subcategory.'
      );
    } finally {
      setSaving(false);
    }
  };

  // --------------------------------------------------
  // EDIT SUBCATEGORY
  // --------------------------------------------------
  const handleEdit = (subcat) => {
    const parentCategoryId =
      subcat.category_id ??
      subcat.categoryId ??
      subcat.parent_id ??
      subcat.parentId ??
      '';

    let resolvedCategoryId = parentCategoryId;

    // If backend returned parent as category name,
    // find the matching category ID from categories list.
    if (
      !resolvedCategoryId &&
      subcat.parent
    ) {
      const matchedCategory = categories.find(
        (category) =>
          String(category.name || category.title)
            .trim()
            .toLowerCase() ===
          String(subcat.parent).trim().toLowerCase()
      );

      if (matchedCategory) {
        resolvedCategoryId = matchedCategory.id;
      }
    }

    setIsEditing(true);

    setEditId(
      subcat.id ??
        subcat.subcategory_id ??
        subcat.subCategoryId
    );

    setFormData({
      title:
        subcat.title ||
        subcat.name ||
        subcat.subCategoryName ||
        '',

      category_id:
        resolvedCategoryId !== null &&
        resolvedCategoryId !== undefined
          ? String(resolvedCategoryId)
          : '',

      image:
        subcat.image ||
        subcat.subCategoryImage ||
        '',

      status: isStatusActive(subcat.status),
    });

    setErrorMessage('');

    // Scroll to the form after clicking Edit.
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  // --------------------------------------------------
  // DELETE SUBCATEGORY
  // API: DELETE /api/subcategories/:id
  // --------------------------------------------------
  const handleDelete = async (id) => {
    if (!id) {
      setErrorMessage('Invalid subcategory ID.');
      return;
    }

    const confirmed = window.confirm(
      'Are you sure you want to delete this subcategory?'
    );

    if (!confirmed) return;

    try {
      setErrorMessage('');

      await API.delete(
        `/api/subcategories/${id}`
      );

      await fetchSubcategories();

      // If deleted item was currently being edited,
      // reset the form.
      if (String(editId) === String(id)) {
        resetForm();
      }
    } catch (error) {
      console.error(
        'Error deleting subcategory:',
        error
      );

      setErrorMessage(
        error?.response?.data?.message ||
          error.message ||
          'Unable to delete subcategory.'
      );
    }
  };

  // --------------------------------------------------
  // RENDER
  // --------------------------------------------------
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        Subcategories Management
      </h2>

      {/* Error Message */}
      {errorMessage && (
        <div className="mb-5 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
          <div className="flex items-center justify-between gap-3">
            <span>{errorMessage}</span>

            <button
              type="button"
              onClick={() => setErrorMessage('')}
              className="font-semibold text-rose-700 hover:text-rose-900"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Add / Update Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6 flex flex-wrap gap-4 items-end"
      >
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Subcategory Title
          </label>

          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            required
            className="border border-gray-300 p-2.5 rounded-lg w-60 focus:outline-none focus:ring-2 focus:ring-teal-500"
            placeholder="e.g. Sofa Cleaning"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Parent Category
          </label>

          <select
            name="category_id"
            value={formData.category_id}
            onChange={handleInputChange}
            required
            className="border border-gray-300 p-2.5 rounded-lg w-60 focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="">
              Select Parent Category
            </option>

            {categories.map((category) => (
              <option
                key={category.id}
                value={category.id}
              >
                {category.name || category.title}
              </option>
            ))}
          </select>
        </div>


        {/* Image Section with URL and File Browser */}
  <div>
  <label className="block text-sm font-medium text-gray-700 mb-1">
    Subcategory Image
  </label>
  
  <div className="space-y-3">
    {/* Option 1: File Upload from Browser */}
    <div className="flex items-center space-x-3">
      <input
        type="file"
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files[0];
          if (file) {
            // Aap yahan chahein toh file ko preview ke liye URL.createObjectURL(file) mein convert kar sakte hain
            // Ya agar direct upload API hai toh file object ko state mein save kar sakte hain
            setFormData(prev => ({ 
              ...prev, 
              imageFile: file, 
              image: URL.createObjectURL(file) // Preview ke liye ya local path ke tor par
            }));
          }
        }}
        className="block w-full text-xs text-slate-500
          file:mr-4 file:py-2 file:px-4
          file:rounded-xl file:border-0
          file:text-xs file:font-semibold
          file:bg-teal-50 file:text-teal-700
          hover:file:bg-teal-100 cursor-pointer border border-gray-200 rounded-xl bg-slate-50"
      />
    </div>

    {/* Divider or Text */}
    <div className="flex items-center my-1">
      <div className="flex-grow border-t border-gray-200"></div>
      <span className="flex-shrink mx-4 text-gray-400 text-[11px] uppercase font-semibold">or paste URL</span>
      <div className="flex-grow border-t border-gray-200"></div>
    </div>

    {/* Option 2: Direct Image URL Input */}
    <input
      type="text"
      name="image"
      value={formData.image || ''}
      onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.value, imageFile: null }))}
      className="border border-gray-300 p-2.5 rounded-xl w-full text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-slate-50"
      placeholder="https://example.com/image.jpg"
    />
  </div>
</div>

        {/* <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Image URL
          </label>

          <input
            type="text"
            name="image"
            value={formData.image}
            onChange={handleInputChange}
            className="border border-gray-300 p-2.5 rounded-lg w-60 focus:outline-none focus:ring-2 focus:ring-teal-500"
            placeholder="Image URL"
          />
        </div> */}

        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
            <input
              type="checkbox"
              name="status"
              checked={formData.status}
              onChange={handleInputChange}
              className="h-4 w-4 accent-teal-600"
            />
            Active
          </label>
        </div>

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={saving}
            className="bg-teal-600 hover:bg-teal-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-medium px-5 py-2.5 rounded-lg transition-all shadow-sm"
          >
            {saving
              ? 'Saving...'
              : isEditing
              ? 'Update Subcategory'
              : 'Add Subcategory'}
          </button>

          {isEditing && (
            <button
              type="button"
              onClick={resetForm}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium px-5 py-2.5 rounded-lg transition-all"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      {/* Search Bar */}
      <div className="mb-6 bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-wrap gap-3 items-center justify-between">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) =>
            setSearchTerm(e.target.value)
          }
          placeholder="Search subcategories by title or parent category..."
          className="border border-gray-300 p-2.5 rounded-lg w-full max-w-md focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
        />

        <span className="text-sm text-gray-500">
          Showing {filteredSubcategories.length} of{' '}
          {subcategories.length} subcategories
        </span>
      </div>

      {/* Subcategories Table */}
      {loading ? (
        <p className="text-gray-500">
          Loading subcategories...
        </p>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-gray-600 text-sm">
                <th className="p-4">Image</th>
                <th className="p-4">ID</th>
                <th className="p-4">
                  Subcategory Title
                </th>
                <th className="p-4">
                  Parent Category
                </th>
                <th className="p-4">Status</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredSubcategories.map(
                (subcat, index) => {
                  const subcategoryId =
                    subcat.id ??
                    subcat.subcategory_id ??
                    subcat.subCategoryId;

                  const title =
                    subcat.title ||
                    subcat.name ||
                    'Untitled';

                  const active = isStatusActive(
                    subcat.status
                  );

                  return (
                    <tr
                      key={
                        subcategoryId ??
                        `${title}-${index}`
                      }
                      className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                    >
                      {/* Image */}
                      <td className="p-4">
                        {subcat.image ? (
                          <img
                            src={subcat.image}
                            alt={title}
                            onError={(e) => {
                              e.currentTarget.style.display =
                                'none';
                            }}
                            className="w-10 h-10 object-cover rounded-lg border border-gray-200"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-xs text-gray-400">
                            No img
                          </div>
                        )}
                      </td>

                      {/* ID */}
                      <td className="p-4 text-sm text-gray-600">
                        {subcategoryId ?? '-'}
                      </td>

                      {/* Title */}
                      <td className="p-4 text-sm font-medium text-gray-800">
                        {title}
                      </td>

                      {/* Parent Category */}
                      <td className="p-4 text-sm text-gray-600">
                        {getParentCategoryName(subcat)}
                      </td>

                      {/* Status */}
                      <td className="p-4 text-sm">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                            active
                              ? 'bg-emerald-50 text-emerald-600'
                              : 'bg-rose-50 text-rose-600'
                          }`}
                        >
                          {active
                            ? 'Active'
                            : 'Inactive'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="p-4 text-sm whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() =>
                            handleEdit(subcat)
                          }
                          className="text-teal-600 hover:text-teal-700 font-medium mr-3"
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleDelete(subcategoryId)
                          }
                          className="text-rose-600 hover:text-rose-700 font-medium"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                }
              )}

              {filteredSubcategories.length === 0 && (
                <tr>
                  <td
                    colSpan="6"
                    className="p-6 text-center text-gray-500"
                  >
                    {searchTerm
                      ? 'No matching subcategories found.'
                      : 'No subcategories found.'}
                  </td>
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




// import React, { useState, useEffect } from 'react';
// import API from '../../services/api';

// const Subcategories = () => {
//   const [subcategories, setSubcategories] = useState([]);
//   const [categories, setCategories] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [formData, setFormData] = useState({ title: '', category_id: '', image: '', status: true });
//   const [isEditing, setIsEditing] = useState(false);
//   const [editId, setEditId] = useState(null);
  
//   useEffect(() => {
//     fetchSubcategories();
//     fetchCategories();
//   }, []);

//   const fetchSubcategories = async () => {
//     try {
//       const response = await API.get('/api/subcategories');
//       if (response.data.success) {
//         setSubcategories(response.data.data || []);
//       } else if (Array.isArray(response.data)) {
//         setSubcategories(response.data);
//       } else {
//         setSubcategories([]);
//       }
//     } catch (err) {
//       console.error('Error fetching subcategories:', err);
//       setSubcategories([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // const fetchCategories = async () => {
//   //   try {
//   //     const response = await API.get('/api/categories');
//   //     if (response.data.success) {
//   //       setCategories(response.data.data || []);
//   //     } else if (Array.isArray(response.data)) {
//   //       setCategories(response.data);
//   //     }
//   //   } catch (err) {
//   //     console.error('Error fetching categories:', err);
//   //   }
//   // };

//   const fetchCategories = async () => {
//   try {
//     const response = await API.get('/api/categories');
//     let list = [];
//     if (response.data.success) list = response.data.data || [];
//     else if (Array.isArray(response.data)) list = response.data;
//     console.log('CATEGORIES SAMPLE:', JSON.stringify(list.slice(0, 3), null, 2));
//     setCategories(list);
//   } catch (err) {
//     console.error('Error fetching categories:', err);
//   }
// };

//   const getParentCategoryName = (subcat) => {
//     if (subcat.category_id || subcat.categoryId) {
//       const catId = subcat.category_id || subcat.categoryId;
//       const matchedCat = categories.find((cat) => cat.id === Number(catId));
//       if (matchedCat) {
//         return matchedCat.name || matchedCat.title;
//       }
//     }
//     return subcat.parent || subcat.categoryName || 'Main Category';
//   };

//   const filteredSubcategories = subcategories.filter((subcat) => {
//     const title = (subcat.title || subcat.name || '').toLowerCase();
//     const parentName = getParentCategoryName(subcat).toLowerCase();
//     const query = searchTerm.toLowerCase().trim();

//     if (!query) return true;

//     const queryParts = query.split(/\s+/);
//     return queryParts.every(
//       (part) => title.includes(part) || parentName.includes(part)
//     );
//   });

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       const payload = {
//         title: formData.title,
//         category_id: formData.category_id ? Number(formData.category_id) : null,
//         categoryId: formData.category_id ? Number(formData.category_id) : null,
//         image: formData.image,
//         status: formData.status
//       };

//       if (isEditing) {
//         await API.put(`/api/subcategories/${editId}`, payload);
//       } else {
//         await API.post('/api/subcategories', payload);
//       }
      
//       setFormData({ title: '', category_id: '', image: '', status: true });
//       setIsEditing(false);
//       setEditId(null);
//       fetchSubcategories();
//     } catch (err) {
//       console.error('Error saving subcategory:', err);
//     }
//   };

//   const handleEdit = (subcat) => {
//     setIsEditing(true);
//     setEditId(subcat.id);
//     setFormData({
//       title: subcat.title || subcat.name || '',
//       category_id: subcat.category_id || subcat.categoryId || '',
//       image: subcat.image || '',
//       status: subcat.status ?? true
//     });
//   };

//   const handleDelete = async (id) => {
//     if (window.confirm('Are you sure you want to delete this subcategory?')) {
//       try {
//         await API.delete(`/api/subcategories/${id}`);
//         fetchSubcategories();
//       } catch (err) {
//         console.error('Error deleting subcategory:', err);
//       }
//     }
//   };

//   return (
//     <div className="p-6">
//       <h2 className="text-2xl font-bold mb-6 text-gray-800">Subcategories Management</h2>

//       <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6 flex flex-wrap gap-4 items-end">
//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-1">Subcategory Title</label>
//           <input
//             type="text"
//             value={formData.title}
//             onChange={(e) => setFormData({ ...formData, title: e.target.value })}
//             required
//             className="border border-gray-300 p-2.5 rounded-lg w-60 focus:outline-none focus:ring-2 focus:ring-teal-500"
//             placeholder="e.g. Sofa Cleaning"
//           />
//         </div>

//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-1">Parent Category</label>
//           <select
//             value={formData.category_id}
//             onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
//             className="border border-gray-300 p-2.5 rounded-lg w-60 focus:outline-none focus:ring-2 focus:ring-teal-500"
//           >
//             <option value="">Select Parent Category</option>
//             {categories.map((cat) => (
//               <option key={cat.id} value={cat.id}>{cat.name || cat.title}</option>
//             ))}
//           </select>
//         </div>

//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
//           <input
//             type="text"
//             value={formData.image}
//             onChange={(e) => setFormData({ ...formData, image: e.target.value })}
//             className="border border-gray-300 p-2.5 rounded-lg w-60 focus:outline-none focus:ring-2 focus:ring-teal-500"
//             placeholder="Image URL"
//           />
//         </div>

//         <button type="submit" className="bg-teal-600 hover:bg-teal-700 text-white font-medium px-5 py-2.5 rounded-lg transition-all shadow-sm">
//           {isEditing ? 'Update Subcategory' : 'Add Subcategory'}
//         </button>
//       </form>

//       {/* Search Bar */}
//       <div className="mb-6 bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
//         <input
//           type="text"
//           value={searchTerm}
//           onChange={(e) => setSearchTerm(e.target.value)}
//           placeholder="Search subcategories by title or parent category..."
//           className="border border-gray-300 p-2.5 rounded-lg w-full max-w-md focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
//         />
//         <span className="text-sm text-gray-500">Showing {filteredSubcategories.length} subcategories</span>
//       </div>

//       {loading ? (
//         <p className="text-gray-500">Loading subcategories...</p>
//       ) : (
//         <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
//           <table className="w-full text-left border-collapse">
//             <thead>
//               <tr className="bg-gray-50 border-b border-gray-100 text-gray-600 text-sm">
//                 <th className="p-4">Image</th>
//                 <th className="p-4">ID</th>
//                 <th className="p-4">Subcategory Title</th>
//                 <th className="p-4">Parent Category</th>
//                 <th className="p-4">Status</th>
//                 <th className="p-4">Actions</th>
//               </tr>
//             </thead>
//             <tbody>
//               {filteredSubcategories.map((subcat) => (
//                 <tr key={subcat.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
//                   <td className="p-4">
//                     {subcat.image ? (
//                       <img src={subcat.image} alt={subcat.title} className="w-10 h-10 object-cover rounded-lg border border-gray-200" />
//                     ) : (
//                       <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-xs text-gray-400">No img</div>
//                     )}
//                   </td>
//                   <td className="p-4 text-sm text-gray-600">{subcat.id}</td>
//                   <td className="p-4 text-sm font-medium text-gray-800">{subcat.title || subcat.name}</td>
//                   <td className="p-4 text-sm text-gray-600">{getParentCategoryName(subcat)}</td>
//                   <td className="p-4 text-sm">
//                     <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${subcat.status ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
//                       {subcat.status ? 'Active' : 'Inactive'}
//                     </span>
//                   </td>
//                   <td className="p-4 text-sm space-x-3">
//                     <button onClick={() => handleEdit(subcat)} className="text-teal-600 hover:text-teal-700 font-medium">Edit</button>
//                     <button onClick={() => handleDelete(subcat.id)} className="text-rose-600 hover:text-rose-700 font-medium">Delete</button>
//                   </td>
//                 </tr>
//               ))}
//               {filteredSubcategories.length === 0 && (
//                 <tr>
//                   <td colSpan="6" className="p-6 text-center text-gray-500">No subcategories found.</td>
//                 </tr>
//               )}
//             </tbody>
//           </table>
//         </div>
//       )}
//     </div>
//   );
// };

// export default Subcategories;
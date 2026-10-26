import axios from 'axios';

// Base API instance pointing to your Node.js backend
const API = axios.create({
  baseURL: 'https://adminbackend-1-h03r.onrender.com', 
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach admin/partner tokens if available
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default API;
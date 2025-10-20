import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const auth = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  updateProfile: (profileData) => api.put('/auth/profile', profileData),
  getFarmerAreas: () => api.get('/auth/farmer-areas'),
};

export const products = {
  getAll: (params) => api.get('/products', { params }),
  getById: (id) => api.get(`/products/${id}`),
  create: (productData) => api.post('/products', productData),
  update: (id, productData) => api.put(`/products/${id}`, productData),
  delete: (id) => api.delete(`/products/${id}`),
  getMyProducts: () => api.get('/products/my-products'),
  getFavorites: () => api.get('/products/favorites'),
  toggleFavorite: (productId) => api.post(`/products/${productId}/favorite`),
};

export const orders = {
  create: (orderData) => api.post('/orders', orderData),
  getMyOrders: () => api.get('/orders/my-orders'),
  getFarmerOrders: () => api.get('/orders/farmer-orders'),
  updateStatus: (orderId, status) => api.put(`/orders/${orderId}/status`, { status }),
  cancel: (orderId) => api.put(`/orders/${orderId}/cancel`),
};

export default api;
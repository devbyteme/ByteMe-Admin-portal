import axios from 'axios';

// Base API configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth services
export const authService = {
  login: async (credentials) => {
    const response = await api.post('/auth/admin/login', credentials);
    return response.data;
  },
  registerAdmin: async (adminData) => {
    const response = await api.post('/auth/admin/register', adminData);
    return response.data;
  },
  logout: async () => {
    try {
      // Call backend logout endpoint
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Admin logout error:', error);
    } finally {
      // Clear only admin-specific auth tokens and user data
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
      
      console.log('🔐 Admin AuthService: Admin authentication data cleared from localStorage');
    }
  },
  getCurrentUser: () => {
    const user = localStorage.getItem('adminUser');
    return user ? JSON.parse(user) : null;
  },
  isAuthenticated: () => {
    return !!localStorage.getItem('adminToken');
  },
  googleLogin: () => {
    // Redirect to backend Google OAuth endpoint
    window.location.href = `${API_BASE_URL}/auth/google/admin`;
  }
};

// Analytics services
export const analyticsService = {
  getDashboardStats: async () => {
    const response = await api.get('/admin/dashboard-stats');
    return response.data;
  },
  getVendorDashboardStats: async (vendorId) => {
    const response = await api.get(`/admin/vendor-dashboard-stats/${vendorId}`);
    return response.data;
  },
  getVendorStats: async (period = '30d') => {
    const response = await api.get(`/admin/vendor-stats?period=${period}`);
    return response.data;
  },
  getCustomerStats: async (period = '30d') => {
    const response = await api.get(`/admin/customer-stats?period=${period}`);
    return response.data;
  },
  getOrderStats: async (period = '30d') => {
    const response = await api.get(`/admin/order-stats?period=${period}`);
    return response.data;
  },
  getRevenueStats: async (period = '7d', vendorId = 'all') => {
    const response = await api.get(`/admin/revenue-stats?period=${period}&vendorId=${vendorId}`);
    return response.data;
  },
  getVendorsForAdmin: async () => {
    const response = await api.get('/admin/vendors');
    return response.data;
  }
};

// Vendor services  
export const vendorService = {
  getAllVendors: async () => {
    const response = await api.get('/vendors');
    return response.data;
  },
  getVendorById: async (id) => {
    const response = await api.get(`/vendors/${id}`);
    return response.data;
  },
  updateVendor: async (id, data) => {
    const response = await api.put(`/vendors/${id}`, data);
    return response.data;
  },
  deleteVendor: async (id) => {
    const response = await api.delete(`/vendors/${id}`);
    return response.data;
  }
};

// Customer services
export const customerService = {
  getAllCustomers: async () => {
    const response = await api.get('/users');
    return response.data;
  },
  getCustomerById: async (id) => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },
  updateCustomer: async (id, data) => {
    const response = await api.put(`/users/${id}`, data);
    return response.data;
  },
  deleteCustomer: async (id) => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  }
};

// Order services
export const orderService = {
  getAllOrders: async () => {
    const response = await api.get('/orders');
    return response.data;
  },
  getOrderById: async (id) => {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  },
  updateOrderStatus: async (id, status) => {
    const response = await api.put(`/orders/${id}/status`, { status });
    return response.data;
  }
};

export default api;

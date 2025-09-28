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
    // Check for both general admin and multi-vendor admin tokens
    const generalAdminToken = localStorage.getItem('generalAdminToken');
    const multiVendorAdminToken = localStorage.getItem('multiVendorAdminToken');
    const token = generalAdminToken || multiVendorAdminToken;
    
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
      // Only redirect if it's not a login attempt
      const isLoginAttempt = error.config?.url?.includes('/auth/admin/login') || 
                            error.config?.url?.includes('/auth/admin/multi-vendor-login');
      
      if (!isLoginAttempt) {
        // Clear both admin types' tokens and user data
        localStorage.removeItem('generalAdminToken');
        localStorage.removeItem('generalAdminUser');
        localStorage.removeItem('multiVendorAdminToken');
        localStorage.removeItem('multiVendorAdminUser');
        window.location.href = '/';
      }
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
  loginMultiVendorAdmin: async (credentials) => {
    const response = await api.post('/auth/admin/multi-vendor-login', credentials);
    return response.data;
  },
  registerAdmin: async (adminData) => {
    const response = await api.post('/auth/admin/register', adminData);
    return response.data;
  },
  registerMultiVendorAdmin: async (adminData) => {
    const response = await api.post('/auth/admin/multi-vendor-register', adminData);
    return response.data;
  },
  verifyVendorAccess: async (accessToken) => {
    const response = await api.get(`/vendor-access/verify/${accessToken}`);
    return response.data;
  },
  logout: async () => {
    try {
      // Call backend logout endpoint
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Admin logout error:', error);
    } finally {
      // Clear both admin types' auth tokens and user data
      localStorage.removeItem('generalAdminToken');
      localStorage.removeItem('generalAdminUser');
      localStorage.removeItem('multiVendorAdminToken');
      localStorage.removeItem('multiVendorAdminUser');
      
      console.log('🔐 Admin AuthService: All admin authentication data cleared from localStorage');
    }
  },
  getCurrentUser: () => {
    // Check for both admin types
    const generalAdminUser = localStorage.getItem('generalAdminUser');
    const multiVendorAdminUser = localStorage.getItem('multiVendorAdminUser');
    const user = generalAdminUser || multiVendorAdminUser;
    return user ? JSON.parse(user) : null;
  },
  isAuthenticated: () => {
    // Check for both admin types
    const generalAdminToken = localStorage.getItem('generalAdminToken');
    const multiVendorAdminToken = localStorage.getItem('multiVendorAdminToken');
    return !!(generalAdminToken || multiVendorAdminToken);
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
    // Use admin-scoped vendors endpoint to respect role-based access
    const response = await api.get('/admin/vendors');
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
  getAllOrders: async (params = {}) => {
    // Use admin-filtered orders endpoint with optional vendorId/period
    const query = new URLSearchParams(params).toString();
    const response = await api.get(`/admin/orders${query ? `?${query}` : ''}`);
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

// Aggregated customers for admin (filtered by vendor/date)
export const customerAggService = {
  getCustomers: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const response = await api.get(`/admin/customers${query ? `?${query}` : ''}`);
    return response.data;
  }
};

// Vendor Access services for multi-vendor admin
export const vendorAccessService = {
  getUserVendorAccess: async (userEmail) => {
    const response = await api.get(`/vendor-access/user/${userEmail}`);
    return response.data;
  },
  acceptVendorAccess: async (accessId, userEmail) => {
    const response = await api.post(`/vendor-access/${accessId}/accept`, { userEmail });
    return response.data;
  }
};

export default api;

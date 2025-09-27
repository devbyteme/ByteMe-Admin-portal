import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService, vendorAccessService } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [vendorAccess, setVendorAccess] = useState([]);

  useEffect(() => {
    const initializeAuth = () => {
      const savedUser = authService.getCurrentUser();

      if (savedUser) {
        setUser(savedUser);
      }
      setLoading(false);
    };

    // Handle Google OAuth callback
    const handleGoogleCallback = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get('token');
      const googleAuth = urlParams.get('googleAuth');
      const userData = urlParams.get('userData');

      if (token && googleAuth && userData) {
        try {
          const user = JSON.parse(decodeURIComponent(userData));
          // Store based on admin type
          if (user.role === 'general_admin') {
            localStorage.setItem('generalAdminToken', token);
            localStorage.setItem('generalAdminUser', JSON.stringify(user));
          } else if (user.role === 'multi_vendor_admin') {
            localStorage.setItem('multiVendorAdminToken', token);
            localStorage.setItem('multiVendorAdminUser', JSON.stringify(user));
          }
          setUser(user);
          
          // Clean up URL parameters
          window.history.replaceState({}, document.title, window.location.pathname);
        } catch (error) {
          console.error('Error parsing Google OAuth data:', error);
        }
      }
    };

    initializeAuth();
    handleGoogleCallback();
  }, []);

  const loadVendorAccess = async (userEmail) => {
    try {
      const response = await vendorAccessService.getUserVendorAccess(userEmail);
      if (response.success) {
        setVendorAccess(response.data);
      }
    } catch (error) {
      console.error('Error loading vendor access:', error);
      setVendorAccess([]);
    }
  };

  const login = async (credentials) => {
    try {
      const response = await authService.login(credentials);
      
      if (response.success && response.token) {
        // Store based on admin type
        if (response.user.role === 'general_admin') {
          localStorage.setItem('generalAdminToken', response.token);
          localStorage.setItem('generalAdminUser', JSON.stringify(response.user));
        } else if (response.user.role === 'multi_vendor_admin') {
          localStorage.setItem('multiVendorAdminToken', response.token);
          localStorage.setItem('multiVendorAdminUser', JSON.stringify(response.user));
        }
        setUser(response.user);
        
        // Load vendor access for multi-vendor admins
        if (response.user.role === 'multi_vendor_admin') {
          await loadVendorAccess(response.user.email);
        }
        
        return { success: true };
      } else {
        return { success: false, message: response.message || 'Login failed' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'An error occurred during login' 
      };
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setVendorAccess([]);
    }
  };

  const googleLogin = () => {
    authService.googleLogin();
  };

  const value = {
    user,
    vendorAccess,
    login,
    logout,
    googleLogin,
    isAuthenticated: !!user,
    loading,
    isGeneralAdmin: user?.role === 'general_admin',
    isMultiVendorAdmin: user?.role === 'multi_vendor_admin'
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

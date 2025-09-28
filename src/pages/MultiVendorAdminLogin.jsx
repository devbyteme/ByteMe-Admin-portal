import React, { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { authService } from '../services/api';

const MultiVendorAdminLogin = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { isAuthenticated, isMultiVendorAdmin } = useAuth();

  // Redirect if already authenticated as multi-vendor admin
  if (isAuthenticated && isMultiVendorAdmin) {
    const user = authService.getCurrentUser();
    if (user && user._id) {
      return <Navigate to={`/mv/${user._id}`} replace />;
    }
  }

  // Redirect if authenticated as general admin
  if (isAuthenticated && !isMultiVendorAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validation
    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    try {
      const result = await authService.loginMultiVendorAdmin(formData);
      
      if (result.success) {
        // Persist multi-vendor admin session
        if (result.token) {
          localStorage.setItem('multiVendorAdminToken', result.token);
        }
        if (result.user) {
          localStorage.setItem('multiVendorAdminUser', JSON.stringify(result.user));
        }
        // Redirect multi-vendor admin to scoped dashboard
        const admin = result.user;
        if (admin && admin.role === 'multi_vendor_admin' && admin._id) {
          window.location.href = `/mv/${admin._id}`;
        } else {
          window.location.href = '/dashboard';
        }
      } else {
        setError(result.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      
      // Handle specific error cases
      if (error.response?.status === 401) {
        setError('Invalid email or password. Please check your credentials and try again.');
      } else if (error.response?.status === 403) {
        setError('Access denied. Your account may not have the required permissions.');
      } else if (error.response?.status === 404) {
        setError('Account not found. Please check your email address.');
      } else if (error.response?.status >= 500) {
        setError('Server error. Please try again later.');
      } else if (error.code === 'NETWORK_ERROR' || !error.response) {
        setError('Network error. Please check your connection and try again.');
      } else {
        setError(error.response?.data?.message || 'An error occurred during login. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <img src="/Main Logo_ByteMe.png" alt="ByteMe Logo" className="w-48 h-24" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Multi-Vendor Admin Login
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Access granted vendor accounts
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <div className="flex">
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">
                      {error}
                    </h3>
                  </div>
                </div>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1 relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2 pr-10 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-primary hover:bg-brand-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Need access?</span>
              </div>
            </div>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Contact a vendor to grant you access to their restaurant data.
              </p>
            </div>
          </div>

          <div className="mt-6 text-center">
            <Link
              to="/general-admin-login"
              className="text-sm text-brand-primary hover:text-brand-primary/80"
            >
              Are you a General ByteMe Admin? Sign in here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MultiVendorAdminLogin;

import React, { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { authService } from '../services/api';
import ByteMeLogo from '../components/ByteMeLogo';

const AdminRegistration = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    adminCode: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
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
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword || !formData.adminCode) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    if (formData.adminCode !== 'BYTEME_ADMIN_2024') {
      setError('Invalid admin registration code');
      setLoading(false);
      return;
    }

    try {
      const response = await authService.registerAdmin({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        adminCode: formData.adminCode
      });

      if (response.success) {
        setSuccess(true);
        setFormData({
          name: '',
          email: '',
          password: '',
          confirmPassword: '',
          adminCode: ''
        });
      } else {
        setError(response.message || 'Registration failed');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred during registration');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-green-600">
              <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Registration Successful!
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Your admin account has been created successfully.
            </p>
            <div className="mt-4">
              <Link
                to="/login"
                className="font-medium text-primary-600 hover:text-primary-500"
              >
                Click here to sign in
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-secondary to-brand-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
        <img src="/Main Logo_ByteMe.png" alt="ByteMe Logo" className="w-40 h-20" />
          <p className="mt-2 text-center text-sm text-brand-dark/70">
            Register as a ByteMe platform administrator
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
                             <label htmlFor="name" className="block text-sm font-medium text-brand-dark">
                Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                required
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={handleChange}
                disabled={loading}
              />
            </div>

            <div>
                             <label htmlFor="email" className="block text-sm font-medium text-brand-dark">
                 Email Address
               </label>
               <input
                 id="email"
                 name="email"
                 type="email"
                 autoComplete="email"
                 required
                 className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-brand-dark rounded-md focus:outline-none focus:ring-brand-primary focus:border-brand-primary focus:z-10 sm:text-sm"
                 placeholder="Enter your email address"
                 value={formData.email}
                 onChange={handleChange}
                 disabled={loading}
               />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-brand-dark">
                Password
              </label>
              <div className="mt-1 relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  className="appearance-none relative block w-full px-3 py-2 pr-10 border border-gray-300 placeholder-gray-500 text-brand-dark rounded-md focus:outline-none focus:ring-brand-primary focus:border-primary-500 focus:z-10 sm:text-sm"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={loading}
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
                             <label htmlFor="confirmPassword" className="block text-sm font-medium text-brand-dark">
                 Confirm Password
               </label>
               <div className="mt-1 relative">
                 <input
                   id="confirmPassword"
                   name="confirmPassword"
                   type={showConfirmPassword ? 'text' : 'password'}
                   autoComplete="new-password"
                   required
                   className="appearance-none relative block w-full px-3 py-2 pr-10 border border-gray-300 placeholder-gray-500 text-brand-dark rounded-md focus:outline-none focus:ring-brand-primary focus:border-primary-500 focus:z-10 sm:text-sm"
                   placeholder="Confirm your password"
                   value={formData.confirmPassword}
                   onChange={handleChange}
                   disabled={loading}
                 />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            <div>
                             <label htmlFor="adminCode" className="block text-sm font-medium text-brand-dark">
                 Admin Registration Code
               </label>
               <input
                 id="adminCode"
                 name="adminCode"
                 type="password"
                 required
                 className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-brand-dark rounded-md focus:outline-none focus:ring-brand-primary focus:border-primary-500 focus:z-10 sm:text-sm"
                 placeholder="Enter admin registration code"
                 value={formData.adminCode}
                 onChange={handleChange}
                 disabled={loading}
               />
               <p className="mt-1 text-xs text-brand-dark/50">
                 Contact your system administrator for the registration code
               </p>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-brand-white bg-brand-primary hover:bg-brand-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating Account...
                </div>
              ) : (
                'Create Admin Account'
              )}
            </button>
          </div>

          <div className="text-center">
                         <p className="text-sm text-brand-dark/70">
               Already have an admin account?{' '}
               <Link
                 to="/login"
                 className="font-medium text-brand-primary hover:text-brand-primary/80"
               >
                 Sign in here
               </Link>
              </p>
            </div>

            <div className="text-center">
              <p className="text-xs text-brand-dark/50">
                Demo registration code: BYTEME_ADMIN_2024
              </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminRegistration;

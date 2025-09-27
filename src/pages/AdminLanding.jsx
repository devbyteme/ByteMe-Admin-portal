import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { authService } from '../services/api';
import { 
  BuildingOfficeIcon, 
  ShieldCheckIcon,
  UserGroupIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import ByteMeLogo from '../components/ByteMeLogo';

const AdminLanding = () => {
  const { isAuthenticated, isGeneralAdmin, isMultiVendorAdmin } = useAuth();

  // Redirect if already authenticated
  if (isAuthenticated && isGeneralAdmin) {
    return <Navigate to="/dashboard" replace />;
  }
  if (isAuthenticated && isMultiVendorAdmin) {
    const user = authService.getCurrentUser();
    if (user && user._id) {
      return <Navigate to={`/mv/${user._id}`} replace />;
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <ByteMeLogo variant="full" size="default" />
            </div>
            <div className="text-sm text-gray-500">
              ByteMe Admin Portal
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">
            ByteMe Admin Portal
          </h1>
          <p className="mt-4 text-xl text-gray-600">
            Choose your admin access type to continue
          </p>
        </div>

        <div className="mt-16  gap-8 lg:grid-cols-2">
          {/* General Admin Card */}
          <div className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow duration-200">
            <div className="flex items-center justify-center w-16 h-16 bg-blue-100 rounded-lg mx-auto mb-6">
              <ShieldCheckIcon className="w-8 h-8 text-blue-600" />
            </div>
            
            <h3 className="text-2xl font-bold text-gray-900 text-center mb-4">
              General ByteMe Admin
            </h3>
            
            <p className="text-gray-600 text-center mb-6">
              Full system access to manage all vendors, customers, orders, and system settings.
            </p>

            <div className="space-y-3 mb-8">
              <div className="flex items-center text-sm text-gray-600">
                <ChartBarIcon className="w-5 h-5 text-green-500 mr-3" />
                Complete system analytics and reporting
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <UserGroupIcon className="w-5 h-5 text-green-500 mr-3" />
                Manage all vendors and customers
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <ShieldCheckIcon className="w-5 h-5 text-green-500 mr-3" />
                System settings and configuration
              </div>
            </div>

            <div className="space-y-3">
              <Link
                to="/general-admin-login"
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Sign In as General Admin
              </Link>
              <Link
                to="/general-admin-register"
                className="w-full flex justify-center py-3 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Register as General Admin
              </Link>
            </div>
          </div>

          {/* Multi-Vendor Admin card removed per requirements */}
        </div>

        {/* Information Section */}
        <div className="mt-16 bg-blue-50 rounded-lg p-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Need Help Choosing?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">General Admin</h4>
              <p className="text-sm text-gray-600">
                Choose this if you are a ByteMe system administrator with full access to manage the entire platform, including all vendors, customers, and system settings.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Multi-Vendor Admin</h4>
              <p className="text-sm text-gray-600">
                Choose this if you have been granted access by specific restaurant vendors to manage their accounts. You can only see data for vendors that have given you permission.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLanding;

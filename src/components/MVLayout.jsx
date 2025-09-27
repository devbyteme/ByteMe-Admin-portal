import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { ArrowRightOnRectangleIcon, BuildingOfficeIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import ByteMeLogo from './ByteMeLogo';

const MVLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ByteMeLogo variant="text" size="default" showTagline={false} />
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <BuildingOfficeIcon className="w-4 h-4 text-orange-600" />
              <span>Multi‑Vendor Admin</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">{user?.name || 'Admin'}</p>
              <p className="text-xs text-gray-500">{user?.email}</p>
            </div>
            <button 
              onClick={handleLogout}
              className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <ArrowRightOnRectangleIcon className="w-4 h-4 mr-2" />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default MVLayout;



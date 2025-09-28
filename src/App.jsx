import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import GeneralAdminLogin from './pages/GeneralAdminLogin';
import GeneralAdminRegistration from './pages/GeneralAdminRegistration';
import MultiVendorAdminLogin from './pages/MultiVendorAdminLogin';
import MultiVendorAdminRegistration from './pages/MultiVendorAdminRegistration';
import AdminForgotPassword from './pages/AdminForgotPassword';
import AdminResetPassword from './pages/AdminResetPassword';
import Dashboard from './pages/Dashboard';
import Vendors from './pages/Vendors';
import Customers from './pages/Customers';
import Orders from './pages/Orders';
import Settings from './pages/Settings';
import MultiVendorDashboard from './pages/MultiVendorDashboard';
import MVLayout from './components/MVLayout';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<GeneralAdminLogin />} />
          <Route path="/general-admin-login" element={<GeneralAdminLogin />} />
          <Route path="/general-admin-register" element={<GeneralAdminRegistration />} />
          <Route path="/multi-vendor-admin-login" element={<MultiVendorAdminLogin />} />
          <Route path="/multi-vendor-admin-register" element={<MultiVendorAdminRegistration />} />
          <Route path="/forgot-password" element={<AdminForgotPassword />} />
          <Route path="/reset-password" element={<AdminResetPassword />} />
          {/* Legacy routes for backward compatibility */}
          <Route path="/login" element={<Navigate to="/" replace />} />
          <Route path="/register" element={<Navigate to="/general-admin-register" replace />} />
          <Route 
            path="/*" 
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            } 
          >
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="vendors" element={<Vendors />} />
            <Route path="customers" element={<Customers />} />
            <Route path="orders" element={<Orders />} />
            <Route path="settings" element={<Settings />} />
          </Route>

          {/* Multi‑Vendor Admin standalone layout and routes */}
          <Route 
            path="/mv/*" 
            element={
              <ProtectedRoute>
                <MVLayout />
              </ProtectedRoute>
            }
          >
            <Route path=":adminId" element={<MultiVendorDashboard />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;

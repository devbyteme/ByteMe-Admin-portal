import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { analyticsService, orderService, customerAggService } from '../services/api';
import {
  BuildingStorefrontIcon,
  ClipboardDocumentListIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';

const MultiVendorDashboard = () => {
  const { adminId } = useParams();
  const navigate = useNavigate();
  const { user, isMultiVendorAdmin } = useAuth();

  const [vendors, setVendors] = useState([]);
  const [selectedVendor, setSelectedVendor] = useState('');
  const [stats, setStats] = useState({ totalVendors: 0, totalCustomers: 0, totalOrders: 0, totalRevenue: 0, growth: {} });
  const [revenueData, setRevenueData] = useState([]);
  const [period, setPeriod] = useState('7d');
  const [loading, setLoading] = useState(true);
  const [chartsLoading, setChartsLoading] = useState(false);
  const [error, setError] = useState('');
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);

  useEffect(() => {
    // Guard: ensure route param matches logged-in multi-vendor admin
    if (!user || !isMultiVendorAdmin) {
      navigate('/');
      return;
    }
    if (user._id !== adminId) {
      navigate(`/mv/${user._id}`, { replace: true });
      return;
    }
    loadVendorsAndStats();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, adminId]);

  useEffect(() => {
    if (selectedVendor) {
      fetchRevenue();
      fetchOrders();
      fetchCustomers();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedVendor, period]);

  const loadVendorsAndStats = async () => {
    try {
      setLoading(true);
      // Vendors accessible to this admin (already filtered server-side)
      const vResp = await analyticsService.getVendorsForAdmin();
      const list = vResp?.data || [];
      setVendors(list);
      if (list.length > 0) {
        setSelectedVendor(list[0]._id);
      }

      // Overall stats already filtered server-side by role/access
      const sResp = await analyticsService.getDashboardStats();
      if (sResp.success) setStats(sResp.data);
    } catch (err) {
      setError('Failed to load dashboard.');
    } finally {
      setLoading(false);
    }
  };

  const fetchRevenue = async () => {
    try {
      setChartsLoading(true);
      const r = await analyticsService.getRevenueStats(period, selectedVendor);
      if (r.success) setRevenueData(r.data);
    } catch (e) {
      // noop
    } finally {
      setChartsLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      const resp = await orderService.getAllOrders({ vendorId: selectedVendor, period });
      setOrders(resp.data || []);
    } catch (e) {
      setOrders([]);
    }
  };

  const fetchCustomers = async () => {
    try {
      const resp = await customerAggService.getCustomers({ vendorId: selectedVendor, period });
      setCustomers(resp.data || []);
    } catch (e) {
      setCustomers([]);
    }
  };

  const handleVendorChange = (id) => setSelectedVendor(id);
  const formatCurrency = (n) => `LKR ${Number(n || 0).toFixed(2)}`;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">{error}</div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Multi‑Vendor Admin Dashboard</h1>
        <p className="text-gray-600">Access limited to your assigned restaurants</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <Stat title="Assigned Vendors" value={vendors.length} icon={BuildingStorefrontIcon} />
        <Stat title="Total Customers" value={stats.totalCustomers?.toLocaleString?.() || 0} icon={UserGroupIcon} />
        <Stat title="Total Orders" value={stats.totalOrders?.toLocaleString?.() || 0} icon={ClipboardDocumentListIcon} />
        <Stat title="Total Revenue" value={formatCurrency(stats.totalRevenue || 0)} icon={CurrencyDollarIcon} />
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <h3 className="text-lg font-medium text-gray-900">Analytics Filters</h3>
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">Vendor</label>
              <div className="relative">
                <select
                  value={selectedVendor}
                  onChange={(e) => handleVendorChange(e.target.value)}
                  className="appearance-none bg-white border border-gray-300 rounded-md py-2 pl-3 pr-10 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                >
                  {vendors.map(v => (
                    <option key={v._id} value={v._id}>{v.name}</option>
                  ))}
                </select>
                <ChevronDownIcon className="absolute right-3 top-2 h-4 w-4 text-gray-400" />
              </div>
            </div>
            <div className="min-w-0">
              <label className="block text-sm font-medium text-gray-700 mb-1">Time Period</label>
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="appearance-none bg-white border border-gray-300 rounded-md py-2 pl-3 pr-10 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Charts (simple totals for brevity) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow min-h-[200px]">Revenue trend (filtered)</div>
        <div className="bg-white p-6 rounded-lg shadow min-h-[200px]">Orders trend (filtered)</div>
      </div>

      {/* Customers table */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Customers</h3>
          <span className="text-xs text-gray-500">{period}</span>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Orders</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Spent</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Order</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {customers.map((c, idx) => (
                <tr key={idx}>
                  <td className="px-4 py-2 text-sm text-gray-900">{c.email}</td>
                  <td className="px-4 py-2 text-sm text-gray-900">{c.ordersCount}</td>
                  <td className="px-4 py-2 text-sm text-gray-900">{formatCurrency(c.totalSpent)}</td>
                  <td className="px-4 py-2 text-sm text-gray-500">{new Date(c.lastOrderAt).toLocaleString()}</td>
                </tr>
              ))}
              {customers.length === 0 && (
                <tr>
                  <td className="px-4 py-8 text-center text-gray-500" colSpan={4}>No customers in this period.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Orders table */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Orders</h3>
          <span className="text-xs text-gray-500">{period}</span>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orders.map(o => (
                <tr key={o._id}>
                  <td className="px-4 py-2 text-sm text-gray-900">{o._id.slice(-8).toUpperCase()}</td>
                  <td className="px-4 py-2 text-sm text-gray-900">{formatCurrency(o.totalAmount || 0)}</td>
                  <td className="px-4 py-2 text-sm text-gray-900">{o.paymentStatus}</td>
                  <td className="px-4 py-2 text-sm text-gray-500">{new Date(o.createdAt).toLocaleString()}</td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td className="px-4 py-8 text-center text-gray-500" colSpan={4}>No orders in this period.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const Stat = ({ title, value, icon: Icon }) => (
  <div className="bg-white overflow-hidden shadow rounded-lg">
    <div className="p-5 flex items-center">
      <div className="flex-shrink-0">
        <Icon className="h-6 w-6 text-primary-600" />
      </div>
      <div className="ml-5 w-0 flex-1">
        <dl>
          <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
          <dd>
            <div className="text-lg font-semibold text-gray-900">{value}</div>
          </dd>
        </dl>
      </div>
    </div>
  </div>
);

export default MultiVendorDashboard;



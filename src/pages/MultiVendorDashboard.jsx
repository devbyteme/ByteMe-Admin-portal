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
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

const MultiVendorDashboard = () => {
  const { adminId } = useParams();
  const navigate = useNavigate();
  const { user, isMultiVendorAdmin } = useAuth();

  const [vendors, setVendors] = useState([]);
  const [selectedVendor, setSelectedVendor] = useState('all');
  const [stats, setStats] = useState({ totalVendors: 0, totalCustomers: 0, totalOrders: 0, totalRevenue: 0, growth: {} });
  const [revenueData, setRevenueData] = useState([]);
  const [period, setPeriod] = useState('7d');
  const [loading, setLoading] = useState(true);
  const [chartsLoading, setChartsLoading] = useState(false);
  const [error, setError] = useState('');
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [orderPage, setOrderPage] = useState(1);
  const [orderPageSize, setOrderPageSize] = useState(10);

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
      // Default to 'all' to show combined analytics across assigned vendors
      if (list.length > 0) setSelectedVendor('all');

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
      const params = selectedVendor === 'all' ? { period } : { vendorId: selectedVendor, period };
      const resp = await orderService.getAllOrders(params);
      const list = resp?.success ? (resp.data || []) : [];
      setOrders(list);
      setOrderPage(1);
    } catch (e) {
      setOrders([]);
    }
  };

  const fetchCustomers = async () => {
    try {
      const params = selectedVendor === 'all' ? { period } : { vendorId: selectedVendor, period };
      const resp = await customerAggService.getCustomers(params);
      setCustomers(resp?.success ? (resp.data || []) : []);
    } catch (e) {
      setCustomers([]);
    }
  };

  const handleVendorChange = (id) => setSelectedVendor(id);
  const formatCurrency = (n) => `LKR ${Number(n || 0).toFixed(2)}`;

  // Derived pagination values for Orders
  const totalOrderPages = Math.max(1, Math.ceil((orders?.length || 0) / orderPageSize));
  const safeOrderPage = Math.min(orderPage, totalOrderPages);
  const orderStartIdx = (safeOrderPage - 1) * orderPageSize;
  const orderEndIdx = orderStartIdx + orderPageSize;
  const displayedOrders = orders.slice(orderStartIdx, orderEndIdx);

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
                  <option value="all">All Vendors</option>
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

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Revenue Trend</h3>
            {chartsLoading && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
            )}
          </div>
          {chartsLoading ? (
            <div className="h-[300px] flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip 
                  formatter={(value) => [formatCurrency(value), 'Revenue']}
                  labelFormatter={(label) => `Date: ${label}`}
                />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  dot={{ fill: '#3b82f6' }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
          {!chartsLoading && revenueData.length === 0 && (
            <div className="h-[300px] flex items-center justify-center text-gray-500">
              No revenue data available for the selected period
            </div>
          )}
        </div>

        {/* Orders Chart */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Daily Orders</h3>
            {chartsLoading && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
            )}
          </div>
          {chartsLoading ? (
            <div className="h-[300px] flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip 
                  formatter={(value) => [value, 'Orders']}
                  labelFormatter={(label) => `Date: ${label}`}
                />
                <Bar dataKey="orders" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          )}
          {!chartsLoading && revenueData.length === 0 && (
            <div className="h-[300px] flex items-center justify-center text-gray-500">
              No order data available for the selected period
            </div>
          )}
        </div>
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
              {displayedOrders.map(o => (
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
        {/* Orders Pagination Controls */}
        {orders.length > 0 && (
          <div className="mt-4 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Showing <span className="font-medium">{orderStartIdx + 1}</span> to <span className="font-medium">{Math.min(orderEndIdx, orders.length)}</span> of <span className="font-medium">{orders.length}</span> orders
            </div>
            <div className="flex items-center space-x-3">
              <label className="text-sm text-gray-700">
                Rows per page:
                <select
                  className="ml-2 border border-gray-300 rounded-md py-1 px-2 text-sm"
                  value={orderPageSize}
                  onChange={(e) => { setOrderPageSize(Number(e.target.value)); setOrderPage(1); }}
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </label>
              <div className="flex items-center space-x-2">
                <button
                  className={`px-3 py-1 rounded-md border text-sm ${safeOrderPage === 1 ? 'text-gray-400 border-gray-200 cursor-not-allowed' : 'text-gray-700 border-gray-300 hover:bg-gray-50'}`}
                  onClick={() => setOrderPage(p => Math.max(1, p - 1))}
                  disabled={safeOrderPage === 1}
                >
                  Prev
                </button>
                <span className="text-sm text-gray-600">Page {safeOrderPage} of {totalOrderPages}</span>
                <button
                  className={`px-3 py-1 rounded-md border text-sm ${safeOrderPage === totalOrderPages ? 'text-gray-400 border-gray-200 cursor-not-allowed' : 'text-gray-700 border-gray-300 hover:bg-gray-50'}`}
                  onClick={() => setOrderPage(p => Math.min(totalOrderPages, p + 1))}
                  disabled={safeOrderPage === totalOrderPages}
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
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



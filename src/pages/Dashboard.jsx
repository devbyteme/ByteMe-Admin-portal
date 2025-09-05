import React, { useState, useEffect } from 'react';
import {
  UserGroupIcon,
  BuildingStorefrontIcon,
  ClipboardDocumentListIcon,
  CurrencyDollarIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';
import StatsCard from '../components/StatsCard';
import DateFilter from '../components/DateFilter';
import { analyticsService } from '../services/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalVendors: 0,
    totalCustomers: 0,
    totalOrders: 0,
    totalRevenue: 0,
    growth: {
      vendors: 0,
      customers: 0,
      orders: 0
    }
  });
  const [revenueData, setRevenueData] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [selectedVendor, setSelectedVendor] = useState('all');
  const [period, setPeriod] = useState('7d');
  const [loading, setLoading] = useState(true);
  const [chartsLoading, setChartsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
    fetchVendors();
  }, []);

  useEffect(() => {
    fetchChartData();
  }, [selectedVendor, period]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await analyticsService.getDashboardStats();
      
      if (response.success) {
        setStats(response.data);
      } else {
        setError('Failed to load dashboard statistics');
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const fetchVendors = async () => {
    try {
      const response = await analyticsService.getVendorsForAdmin();
      if (response.success) {
        setVendors(response.data);
      }
    } catch (err) {
      console.error('Error fetching vendors:', err);
    }
  };

  const fetchChartData = async () => {
    try {
      setChartsLoading(true);
      const response = await analyticsService.getRevenueStats(period, selectedVendor);
      
      if (response.success) {
        setRevenueData(response.data);
      }
    } catch (err) {
      console.error('Error fetching chart data:', err);
    } finally {
      setChartsLoading(false);
    }
  };

  const handleVendorChange = (vendorId) => {
    setSelectedVendor(vendorId);
  };

  const handlePeriodChange = (newPeriod) => {
    setPeriod(newPeriod);
  };

  const getSelectedVendorName = () => {
    if (selectedVendor === 'all') return 'All Vendors';
    const vendor = vendors.find(v => v._id === selectedVendor);
    return vendor ? vendor.name : 'Unknown Vendor';
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome to the ByteMe admin portal</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Vendors"
          value={stats.totalVendors.toLocaleString()}
          icon={BuildingStorefrontIcon}
          change={stats.growth?.vendors}
          changeType={stats.growth?.vendors >= 0 ? "positive" : "negative"}
        />
        <StatsCard
          title="Total Customers"
          value={stats.totalCustomers.toLocaleString()}
          icon={UserGroupIcon}
          change={stats.growth?.customers}
          changeType={stats.growth?.customers >= 0 ? "positive" : "negative"}
        />
        <StatsCard
          title="Total Orders"
          value={stats.totalOrders.toLocaleString()}
          icon={ClipboardDocumentListIcon}
          change={stats.growth?.orders}
          changeType={stats.growth?.orders >= 0 ? "positive" : "negative"}
        />
        <StatsCard
          title="Total Revenue"
          value={formatCurrency(stats.totalRevenue)}
          icon={CurrencyDollarIcon}
          change={stats.growth?.revenue}
          changeType={stats.growth?.revenue >= 0 ? "positive" : "negative"}
        />
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <h3 className="text-lg font-medium text-gray-900">Analytics Filters</h3>
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            {/* Vendor Filter */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Filter by Vendor
              </label>
              <div className="relative">
                <select
                  value={selectedVendor}
                  onChange={(e) => handleVendorChange(e.target.value)}
                  className="appearance-none bg-white border border-gray-300 rounded-md py-2 pl-3 pr-10 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="all">All Vendors</option>
                  {vendors.map((vendor) => (
                    <option key={vendor._id} value={vendor._id}>
                      {vendor.name}
                    </option>
                  ))}
                </select>
                <ChevronDownIcon className="absolute right-3 top-2 h-4 w-4 text-gray-400" />
              </div>
            </div>

            {/* Period Filter */}
            <DateFilter
              selectedPeriod={period}
              onPeriodChange={handlePeriodChange}
              label="Time Period"
              className="min-w-0"
            />
          </div>
        </div>
        {selectedVendor !== 'all' && (
          <div className="mt-4 p-3 bg-blue-50 rounded-md">
            <p className="text-sm text-blue-700">
              Showing data for: <span className="font-medium">{getSelectedVendorName()}</span>
            </p>
          </div>
        )}
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

      {/* Platform Overview */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Platform Overview
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary-600">{stats.totalVendors}</div>
              <div className="text-sm text-gray-500">Active Vendors</div>
              {stats.growth?.vendors !== undefined && (
                <div className={`text-xs mt-1 ${stats.growth.vendors >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {stats.growth.vendors >= 0 ? '+' : ''}{stats.growth.vendors.toFixed(1)}% this month
                </div>
              )}
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary-600">{stats.totalCustomers}</div>
              <div className="text-sm text-gray-500">Registered Customers</div>
              {stats.growth?.customers !== undefined && (
                <div className={`text-xs mt-1 ${stats.growth.customers >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {stats.growth.customers >= 0 ? '+' : ''}{stats.growth.customers.toFixed(1)}% this month
                </div>
              )}
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary-600">{stats.totalOrders}</div>
              <div className="text-sm text-gray-500">Total Orders</div>
              {stats.growth?.orders !== undefined && (
                <div className={`text-xs mt-1 ${stats.growth.orders >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {stats.growth.orders >= 0 ? '+' : ''}{stats.growth.orders.toFixed(1)}% this month
                </div>
              )}
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary-600">{formatCurrency(stats.totalRevenue)}</div>
              <div className="text-sm text-gray-500">Total Revenue</div>
              {stats.growth?.revenue !== undefined && (
                <div className={`text-xs mt-1 ${stats.growth.revenue >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {stats.growth.revenue >= 0 ? '+' : ''}{stats.growth.revenue.toFixed(1)}% this month
                </div>
              )}
            </div>
          </div>
          
          {selectedVendor !== 'all' && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <h4 className="text-md font-medium text-gray-900">
                  {getSelectedVendorName()} Analytics
                </h4>
                <span className="text-sm text-gray-500">
                  {period === '7d' ? 'Last 7 days' : period === '30d' ? 'Last 30 days' : 'Last 90 days'}
                </span>
              </div>
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-md">
                  <div className="text-lg font-semibold text-gray-900">
                    {formatCurrency(revenueData.reduce((sum, item) => sum + item.revenue, 0))}
                  </div>
                  <div className="text-sm text-gray-600">Revenue</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-md">
                  <div className="text-lg font-semibold text-gray-900">
                    {revenueData.reduce((sum, item) => sum + item.orders, 0)}
                  </div>
                  <div className="text-sm text-gray-600">Orders</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

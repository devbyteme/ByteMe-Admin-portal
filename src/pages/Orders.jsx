import React, { useState, useEffect } from 'react';
import { orderService, analyticsService } from '../services/api';
import DateFilter from '../components/DateFilter';
import { 
  MagnifyingGlassIcon,
  ClipboardDocumentListIcon,
  CalendarIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [orderStats, setOrderStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedPeriod, setSelectedPeriod] = useState('30d');

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    fetchOrderStats();
  }, [selectedPeriod]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await orderService.getAllOrders();
      setOrders(response.data || []);
    } catch (err) {
      console.error('Error fetching orders:', err);
      // If orders endpoint doesn't exist, create mock data for demo
      setOrders(generateMockOrders());
    } finally {
      setLoading(false);
    }
  };

  const fetchOrderStats = async () => {
    try {
      setStatsLoading(true);
      const response = await analyticsService.getOrderStats(selectedPeriod);
      if (response.success) {
        setOrderStats(response.data);
      }
    } catch (err) {
      console.error('Error fetching order stats:', err);
    } finally {
      setStatsLoading(false);
    }
  };

  const handlePeriodChange = (period) => {
    setSelectedPeriod(period);
  };

  const getPeriodLabel = () => {
    switch (selectedPeriod) {
      case '1d': return 'today';
      case '7d': return 'this week';
      case '30d': return 'this month';
      case '90d': return 'the last 3 months';
      default: return 'the selected period';
    }
  };

  const generateMockOrders = () => {
    const statuses = ['pending', 'preparing', 'ready', 'served', 'cancelled'];
    const mockOrders = [];
    
    for (let i = 1; i <= 20; i++) {
      mockOrders.push({
        _id: `order_${i}`,
        tableNumber: `T${Math.floor(Math.random() * 20) + 1}`,
        totalAmount: Math.floor(Math.random() * 100) + 20,
        status: statuses[Math.floor(Math.random() * statuses.length)],
        paymentStatus: Math.random() > 0.3 ? 'paid' : 'pending',
        paymentMethod: ['cash', 'card', 'mobile'][Math.floor(Math.random() * 3)],
        items: [
          {
            name: ['Burger', 'Pizza', 'Pasta', 'Salad', 'Sandwich'][Math.floor(Math.random() * 5)],
            quantity: Math.floor(Math.random() * 3) + 1,
            price: Math.floor(Math.random() * 30) + 10
          }
        ],
        createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
        customerPhone: `+1${Math.floor(Math.random() * 9000000000) + 1000000000}`
      });
    }
    
    return mockOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.tableNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerPhone?.includes(searchTerm) ||
      order._id?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    return `LKR ${amount.toFixed(2)}`;
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      preparing: 'bg-blue-100 text-blue-800',
      ready: 'bg-green-100 text-green-800',
      served: 'bg-gray-100 text-gray-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getPaymentStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      paid: 'bg-green-100 text-green-800',
      refunded: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
          <p className="text-gray-600">Manage customer orders</p>
        </div>
        <DateFilter
          selectedPeriod={selectedPeriod}
          onPeriodChange={handlePeriodChange}
          label="Analytics Period"
          className="w-48"
        />
      </div>

      {/* Period Stats Overview */}
      {orderStats && (
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              Order Activity for {getPeriodLabel()}
            </h3>
            {statsLoading && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary-600">
                {orderStats.period?.overview?.totalOrders || 0}
              </div>
              <div className="text-sm text-gray-500">Total Orders</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(orderStats.period?.overview?.totalRevenue || 0)}
              </div>
              <div className="text-sm text-gray-500">Total Revenue</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {formatCurrency(orderStats.period?.overview?.avgOrderValue || 0)}
              </div>
              <div className="text-sm text-gray-500">Avg Order Value</div>
            </div>
          </div>
          
          {/* Status breakdown for the period */}
          {/* {orderStats.period?.byStatus && orderStats.period.byStatus.length > 0 && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h4 className="text-md font-medium text-gray-900 mb-3">Orders by Status</h4>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {orderStats.period.byStatus.map((status, index) => (
                  <div key={index} className="text-center p-3 bg-gray-50 rounded-md">
                    <div className="text-lg font-semibold text-gray-900">{status.count}</div>
                    <div className="text-xs text-gray-600 capitalize">{status._id}</div>
                  </div>
                ))}
              </div>
            </div>
          )} */}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
        {/* <div className="flex-1 max-w-md">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search orders..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div> */}
        
        {/* <div className="min-w-0">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="preparing">Preparing</option>
            <option value="ready">Ready</option>
            <option value="served">Served</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div> */}
      </div>

      {/* {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
          {error}
        </div>
      )} */}

      {/* Orders Table */}
      {/* <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {filteredOrders.map((order) => (
            <li key={order._id}>
              <div className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                        <ClipboardDocumentListIcon className="h-5 w-5 text-primary-600" />
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="flex items-center">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          Order #{order._id.slice(-6).toUpperCase()}
                        </p>
                        <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </div>
                      <div className="mt-2 flex items-center text-sm text-gray-500">
                        <CalendarIcon className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                        <p>{formatDate(order.createdAt)}</p>
                        <span className="mx-2">•</span>
                        <p>Table {order.tableNumber}</p>
                        {order.customerPhone && (
                          <>
                            <span className="mx-2">•</span>
                            <p>{order.customerPhone}</p>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className="flex items-center text-sm font-medium text-gray-900">
                        <CurrencyDollarIcon className="h-4 w-4 mr-1 text-gray-400" />
                        {formatCurrency(order.totalAmount)}
                      </div>
                      <div className="mt-1">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPaymentStatusColor(order.paymentStatus)}`}>
                          {order.paymentStatus}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {order.items && order.items.length > 0 && (
                  <div className="mt-4">
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">Items:</span>
                      {order.items.map((item, index) => (
                        <span key={index} className="ml-2">
                          {item.quantity}x {item.name}
                          {index < order.items.length - 1 && ', '}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div> */}

      {/* {filteredOrders.length === 0 && !loading && (
        <div className="text-center py-12">
          <ClipboardDocumentListIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No orders found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || statusFilter !== 'all' 
              ? 'Try adjusting your search or filter criteria.' 
              : 'No orders have been placed yet.'}
          </p>
        </div>
      )} */}

      {/* Summary */}
      {/* <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Order Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary-600">{orders.length}</div>
            <div className="text-sm text-gray-500">Total Orders</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {orders.filter(o => o.status === 'pending').length}
            </div>
            <div className="text-sm text-gray-500">Pending</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {orders.filter(o => o.status === 'preparing').length}
            </div>
            <div className="text-sm text-gray-500">Preparing</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {orders.filter(o => o.status === 'served').length}
            </div>
            <div className="text-sm text-gray-500">Served</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-600">
              {formatCurrency(orders.reduce((sum, order) => sum + order.totalAmount, 0))}
            </div>
            <div className="text-sm text-gray-500">Total Revenue</div>
          </div>
        </div>
      </div> */}
    </div>
  );
};

export default Orders;

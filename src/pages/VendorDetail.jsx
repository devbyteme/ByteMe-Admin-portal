import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { vendorService, orderService } from '../services/api';
import { 
  ArrowLeftIcon,
  BuildingStorefrontIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  CalendarIcon,
  ClockIcon,
  ShoppingBagIcon,
  CurrencyDollarIcon,
  StarIcon
} from '@heroicons/react/24/outline';

const VendorDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [vendor, setVendor] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchVendorDetails();
    fetchVendorOrders();
  }, [id]);

  const fetchVendorDetails = async () => {
    try {
      setLoading(true);
      const response = await vendorService.getVendorById(id);
      setVendor(response.data);
    } catch (err) {
      console.error('Error fetching vendor details:', err);
      setError('Failed to load vendor details');
    } finally {
      setLoading(false);
    }
  };

  const fetchVendorOrders = async () => {
    try {
      setOrdersLoading(true);
      const response = await orderService.getOrdersByVendor(id);
      setOrders(response.data || []);
    } catch (err) {
      console.error('Error fetching vendor orders:', err);
    } finally {
      setOrdersLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getOrderStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'preparing': return 'bg-orange-100 text-orange-800';
      case 'ready': return 'bg-green-100 text-green-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error || !vendor) {
    return (
      <div className="text-center py-12">
        <BuildingStorefrontIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Vendor not found</h3>
        <p className="mt-1 text-sm text-gray-500">{error}</p>
        <button
          onClick={() => navigate('/vendors')}
          className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
        >
          Back to Vendors
        </button>
      </div>
    );
  }

  const totalRevenue = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
  const completedOrders = orders.filter(order => order.status === 'delivered').length;
  const averageOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <button
            onClick={() => navigate('/vendors')}
            className="mr-4 p-2 text-gray-400 hover:text-gray-600"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{vendor.name}</h1>
            <p className="text-gray-600">{vendor.cuisine} • Vendor Details</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            {vendor.cuisine}
          </span>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            vendor.isActive 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {vendor.isActive ? 'Active' : 'Inactive'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Vendor Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center">
                <BuildingStorefrontIcon className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Restaurant Name</p>
                  <p className="text-sm text-gray-900">{vendor.name}</p>
                </div>
              </div>
              <div className="flex items-center">
                <span className="text-sm font-medium text-gray-500 mr-3">Cuisine</span>
                <div>
                  <p className="text-sm font-medium text-gray-500">Type</p>
                  <p className="text-sm text-gray-900">{vendor.cuisine}</p>
                </div>
              </div>
              <div className="flex items-center">
                <EnvelopeIcon className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Email</p>
                  <p className="text-sm text-gray-900">{vendor.email}</p>
                </div>
              </div>
              {vendor.phone && (
                <div className="flex items-center">
                  <PhoneIcon className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Phone</p>
                    <p className="text-sm text-gray-900">{vendor.phone}</p>
                  </div>
                </div>
              )}
              <div className="flex items-center">
                <CalendarIcon className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Joined</p>
                  <p className="text-sm text-gray-900">{formatDate(vendor.createdAt)}</p>
                </div>
              </div>
              {vendor.lastLogin && (
                <div className="flex items-center">
                  <ClockIcon className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Last Login</p>
                    <p className="text-sm text-gray-900">{formatDate(vendor.lastLogin)}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Location Information */}
          {vendor.location && (
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Location</h3>
              <div className="flex items-start">
                <MapPinIcon className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-900">
                    {vendor.location.street && `${vendor.location.street}, `}
                    {vendor.location.city}
                    {vendor.location.state && `, ${vendor.location.state}`}
                    {vendor.location.zipCode && ` ${vendor.location.zipCode}`}
                    {vendor.location.country && `, ${vendor.location.country}`}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Rating and Reviews */}
          {vendor.rating > 0 && (
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Rating & Reviews</h3>
              <div className="flex items-center">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <StarIcon
                      key={i}
                      className={`h-5 w-5 ${
                        i < Math.floor(vendor.rating) 
                          ? 'text-yellow-400' 
                          : 'text-gray-300'
                      }`}
                      fill="currentColor"
                    />
                  ))}
                </div>
                <div className="ml-3">
                  <p className="text-lg font-semibold text-gray-900">
                    {vendor.rating.toFixed(1)} out of 5
                  </p>
                  <p className="text-sm text-gray-500">
                    Based on {vendor.totalReviews} review{vendor.totalReviews !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Business Hours */}
          {vendor.businessHours && (
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Business Hours</h3>
              <div className="space-y-2">
                {Object.entries(vendor.businessHours).map(([day, hours]) => (
                  <div key={day} className="flex justify-between">
                    <span className="text-sm font-medium text-gray-500 capitalize">{day}</span>
                    <span className="text-sm text-gray-900">
                      {hours.open && hours.close 
                        ? `${hours.open} - ${hours.close}`
                        : 'Closed'
                      }
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Business Statistics */}
        <div className="space-y-6">
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Business Statistics</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <ShoppingBagIcon className="h-5 w-5 text-gray-400 mr-3" />
                  <span className="text-sm text-gray-500">Total Orders</span>
                </div>
                <span className="text-lg font-semibold text-gray-900">{orders.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <CurrencyDollarIcon className="h-5 w-5 text-gray-400 mr-3" />
                  <span className="text-sm text-gray-500">Total Revenue</span>
                </div>
                <span className="text-lg font-semibold text-gray-900">{formatCurrency(totalRevenue)}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center mr-3">
                    <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                  </div>
                  <span className="text-sm text-gray-500">Completed</span>
                </div>
                <span className="text-lg font-semibold text-gray-900">{completedOrders}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  </div>
                  <span className="text-sm text-gray-500">Avg Order Value</span>
                </div>
                <span className="text-lg font-semibold text-gray-900">{formatCurrency(averageOrderValue)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Recent Orders</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {ordersLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
            </div>
          ) : orders.length > 0 ? (
            orders.slice(0, 10).map((order) => (
              <div key={order._id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center">
                      <p className="text-sm font-medium text-gray-900">
                        Order #{order.orderNumber || order._id.slice(-8)}
                      </p>
                      <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getOrderStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      {formatDate(order.createdAt)} • {formatCurrency(order.totalAmount || 0)}
                    </p>
                    {order.customer && (
                      <p className="text-xs text-gray-400 mt-1">
                        Customer: {order.customer.firstName} {order.customer.lastName}
                      </p>
                    )}
                    {order.items && order.items.length > 0 && (
                      <p className="text-xs text-gray-400 mt-1">
                        {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="px-6 py-8 text-center">
              <ShoppingBagIcon className="mx-auto h-8 w-8 text-gray-400" />
              <p className="mt-2 text-sm text-gray-500">No orders found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VendorDetail;

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { customerService, analyticsService } from '../services/api';
import DateFilter from '../components/DateFilter';
import { 
  MagnifyingGlassIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';

const Customers = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [customerStats, setCustomerStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('30d');

  useEffect(() => {
    fetchCustomers();
  }, []);

  useEffect(() => {
    fetchCustomerStats();
  }, [selectedPeriod]);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const response = await customerService.getAllCustomers();
      setCustomers(response.data || []);
    } catch (err) {
      console.error('Error fetching customers:', err);
      setError('Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomerStats = async () => {
    try {
      setStatsLoading(true);
      const response = await analyticsService.getCustomerStats(selectedPeriod);
      if (response.success) {
        setCustomerStats(response.data);
      }
    } catch (err) {
      console.error('Error fetching customer stats:', err);
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

  const filteredCustomers = customers.filter(customer =>
    `${customer.firstName} ${customer.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
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
          <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
          <p className="text-gray-600">Manage registered customers</p>
        </div>
        <DateFilter
          selectedPeriod={selectedPeriod}
          onPeriodChange={handlePeriodChange}
          label="Analytics Period"
          className="w-48"
        />
      </div>

      {/* Period Stats Overview */}
      {customerStats && (
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              Customer Activity for {getPeriodLabel()}
            </h3>
            {statsLoading && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary-600">
                {customerStats.newInPeriod || 0}
              </div>
              <div className="text-sm text-gray-500">New Customers</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {customerStats.activeInPeriod || 0}
              </div>
              <div className="text-sm text-gray-500">Placed Orders</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {customerStats.loggedInPeriod || 0}
              </div>
              <div className="text-sm text-gray-500">Logged In</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {customerStats.total || 0}
              </div>
              <div className="text-sm text-gray-500">Total Customers</div>
            </div>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="max-w-md">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search customers..."
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {/* Customers List */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {filteredCustomers.map((customer) => (
            <li key={customer._id}>
              <div 
                className="px-4 py-4 flex items-center justify-between hover:bg-gray-50 cursor-pointer"
                onClick={() => navigate(`/customers/${customer._id}`)}
              >
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                      <UserIcon className="h-5 w-5 text-primary-600" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <div className="flex items-center">
                      <p className="text-sm font-medium text-gray-900">
                        {customer.firstName} {customer.lastName}
                      </p>
                      {customer.isEmailVerified && (
                        <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          Verified
                        </span>
                      )}
                    </div>
                    <div className="mt-1 flex items-center text-sm text-gray-500">
                      <EnvelopeIcon className="h-4 w-4 mr-1 text-gray-400" />
                      <span className="truncate">{customer.email}</span>
                    </div>
                    {customer.phone && (
                      <div className="mt-1 flex items-center text-sm text-gray-500">
                        <PhoneIcon className="h-4 w-4 mr-1 text-gray-400" />
                        <span>{customer.phone}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center">
                  {customer.lastLogin && (
                    <div className="text-right text-sm text-gray-500">
                      <p className="text-xs">Last login: {formatDate(customer.lastLogin)}</p>
                    </div>
                  )}
                  <ChevronRightIcon className="ml-2 h-5 w-5 text-gray-400" />
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {filteredCustomers.length === 0 && !loading && (
        <div className="text-center py-12">
          <UserIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No customers found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm ? 'Try adjusting your search terms.' : 'No customers have been registered yet.'}
          </p>
        </div>
      )}

      {/* Summary */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">All Time Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary-600">{customers.length}</div>
            <div className="text-sm text-gray-500">Total Customers</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {customers.filter(c => c.isActive).length}
            </div>
            <div className="text-sm text-gray-500">Active Customers</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {customers.filter(c => c.isEmailVerified).length}
            </div>
            <div className="text-sm text-gray-500">Verified Email</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {customers.filter(c => c.lastLogin && new Date(c.lastLogin) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length}
            </div>
            <div className="text-sm text-gray-500">Active (30 days)</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Customers;

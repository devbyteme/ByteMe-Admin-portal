import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { vendorService, analyticsService } from '../services/api';
import DateFilter from '../components/DateFilter';
import { 
  MagnifyingGlassIcon,
  BuildingStorefrontIcon,
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';

const Vendors = () => {
  const navigate = useNavigate();
  const [vendors, setVendors] = useState([]);
  const [vendorStats, setVendorStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('30d');

  useEffect(() => {
    fetchVendors();
  }, []);

  useEffect(() => {
    fetchVendorStats();
  }, [selectedPeriod]);

  const fetchVendors = async () => {
    try {
      setLoading(true);
      const response = await vendorService.getAllVendors();
      setVendors(response.data || []);
    } catch (err) {
      console.error('Error fetching vendors:', err);
      setError('Failed to load vendors');
    } finally {
      setLoading(false);
    }
  };

  const fetchVendorStats = async () => {
    try {
      setStatsLoading(true);
      const response = await analyticsService.getVendorStats(selectedPeriod);
      if (response.success) {
        setVendorStats(response.data);
      }
    } catch (err) {
      console.error('Error fetching vendor stats:', err);
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

  const filteredVendors = vendors.filter(vendor =>
    vendor.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vendor.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vendor.cuisine?.toLowerCase().includes(searchTerm.toLowerCase())
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
          <h1 className="text-2xl font-bold text-gray-900">Vendors</h1>
          <p className="text-gray-600">Manage registered vendors</p>
        </div>
        <DateFilter
          selectedPeriod={selectedPeriod}
          onPeriodChange={handlePeriodChange}
          label="Analytics Period"
          className="w-48"
        />
      </div>

      {/* Period Stats Overview */}
      {vendorStats && (
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              Vendor Activity for {getPeriodLabel()}
            </h3>
            {statsLoading && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary-600">
                {vendorStats.overview?.newInPeriod || 0}
              </div>
              <div className="text-sm text-gray-500">New Vendors</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {vendorStats.overview?.activeInPeriod || 0}
              </div>
              <div className="text-sm text-gray-500">Active with Orders</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {vendorStats.overview?.total || 0}
              </div>
              <div className="text-sm text-gray-500">Total Vendors</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {vendorStats.overview?.avgRating ? vendorStats.overview.avgRating.toFixed(1) : '0.0'}
              </div>
              <div className="text-sm text-gray-500">Average Rating</div>
            </div>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search vendors..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {/* Vendors List */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {filteredVendors.map((vendor) => (
            <li key={vendor._id}>
              <div 
                className="px-4 py-4 flex items-center justify-between hover:bg-gray-50 cursor-pointer"
                onClick={() => navigate(`/vendors/${vendor._id}`)}
              >
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                      <BuildingStorefrontIcon className="h-5 w-5 text-primary-600" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <div className="flex items-center">
                      <p className="text-sm font-medium text-gray-900">
                        {vendor.name}
                      </p>
                      <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {vendor.cuisine}
                      </span>
                    </div>
                    <div className="mt-1 flex items-center text-sm text-gray-500">
                      <EnvelopeIcon className="h-4 w-4 mr-1 text-gray-400" />
                      <span className="truncate">{vendor.email}</span>
                    </div>
                    {vendor.phone && (
                      <div className="mt-1 flex items-center text-sm text-gray-500">
                        <PhoneIcon className="h-4 w-4 mr-1 text-gray-400" />
                        <span>{vendor.phone}</span>
                      </div>
                    )}
                    {vendor.location && (
                      <div className="mt-1 flex items-center text-sm text-gray-500">
                        <MapPinIcon className="h-4 w-4 mr-1 text-gray-400" />
                        <span className="truncate">
                          {vendor.location.city}, {vendor.location.state}
                        </span>
                      </div>
                    )}
                    {vendor.rating > 0 && (
                      <div className="mt-1 flex items-center">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <svg
                              key={i}
                              className={`h-3 w-3 ${
                                i < Math.floor(vendor.rating) 
                                  ? 'text-yellow-400' 
                                  : 'text-gray-300'
                              }`}
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                          <span className="ml-1 text-xs text-gray-600">
                            {vendor.rating.toFixed(1)} ({vendor.totalReviews} reviews)
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center">
                  <ChevronRightIcon className="h-5 w-5 text-gray-400" />
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {filteredVendors.length === 0 && !loading && (
        <div className="text-center py-12">
          <BuildingStorefrontIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No vendors found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm ? 'Try adjusting your search terms.' : 'No vendors have been registered yet.'}
          </p>
        </div>
      )}

      {/* Cuisine Distribution */}
      {vendorStats?.cuisineDistribution && vendorStats.cuisineDistribution.length > 0 && (
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Cuisine Distribution</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {vendorStats.cuisineDistribution.map((cuisine, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                <span className="font-medium text-gray-900">{cuisine._id}</span>
                <span className="text-lg font-bold text-primary-600">{cuisine.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Summary */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">All Time Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary-600">{vendors.length}</div>
            <div className="text-sm text-gray-500">Total Vendors</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {vendors.filter(v => v.isActive).length}
            </div>
            <div className="text-sm text-gray-500">Active Vendors</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {vendors.filter(v => v.rating >= 4).length}
            </div>
            <div className="text-sm text-gray-500">High Rated (4+)</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Vendors;

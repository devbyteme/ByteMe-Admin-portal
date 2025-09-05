import React from 'react';
import { CalendarIcon, ChevronDownIcon } from '@heroicons/react/24/outline';

const DateFilter = ({ 
  selectedPeriod, 
  onPeriodChange, 
  className = '',
  label = 'Date Filter',
  showLabel = true,
  size = 'default' // 'small', 'default', 'large'
}) => {
  const periods = [
    { value: '1d', label: 'Last Day' },
    { value: '7d', label: 'Last Week' },
    { value: '30d', label: 'Last Month' },
    { value: '90d', label: 'Last 3 Months' }
  ];

  const getPeriodLabel = (value) => {
    const period = periods.find(p => p.value === value);
    return period ? period.label : 'Unknown Period';
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return 'py-1 pl-2 pr-8 text-xs';
      case 'large':
        return 'py-3 pl-4 pr-12 text-base';
      default:
        return 'py-2 pl-3 pr-10 text-sm';
    }
  };

  const getIconSize = () => {
    switch (size) {
      case 'small':
        return 'h-3 w-3';
      case 'large':
        return 'h-5 w-5';
      default:
        return 'h-4 w-4';
    }
  };

  return (
    <div className={`relative ${className}`}>
      {showLabel && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          <div className="flex items-center">
            <CalendarIcon className="h-4 w-4 mr-1 text-gray-500" />
            {label}
          </div>
        </label>
      )}
      <div className="relative">
        <select
          value={selectedPeriod}
          onChange={(e) => onPeriodChange(e.target.value)}
          className={`appearance-none bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 ${getSizeClasses()}`}
        >
          {periods.map((period) => (
            <option key={period.value} value={period.value}>
              {period.label}
            </option>
          ))}
        </select>
        <ChevronDownIcon className={`absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none ${getIconSize()}`} />
      </div>
      {selectedPeriod && (
        <div className="mt-1 text-xs text-gray-500">
          Showing data for: {getPeriodLabel(selectedPeriod).toLowerCase()}
        </div>
      )}
    </div>
  );
};

export default DateFilter;

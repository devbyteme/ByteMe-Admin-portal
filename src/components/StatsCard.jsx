import React from 'react';

const StatsCard = ({ title, value, icon: Icon, change, changeType = 'positive' }) => {
  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="p-5">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-brand-primary rounded-md flex items-center justify-center">
              <Icon className="h-5 w-5 text-brand-white" />
            </div>
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
                          <dt className="text-sm font-medium text-brand-dark/70 truncate">
              {title}
            </dt>
            <dd className="flex items-baseline">
              <div className="text-2xl font-semibold text-brand-dark">
                {value}
              </div>
                {change && (
                  <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                    changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {changeType === 'positive' ? '+' : ''}{change}%
                  </div>
                )}
              </dd>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsCard;

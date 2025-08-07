import React from 'react';

const ConversionChart = ({ data }) => {
  if (!data || !data.byServiceType) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        No conversion data available
      </div>
    );
  }

  const serviceTypes = Object.entries(data.byServiceType);
  const maxRate = Math.max(...serviceTypes.map(([, rate]) => rate));

  return (
    <div className="space-y-4">
      {/* Overall Conversion Rate */}
      <div className="text-center p-4 bg-gray-50 rounded-lg">
        <div className="text-3xl font-bold text-primary-600">
          {(data.overall * 100).toFixed(1)}%
        </div>
        <div className="text-sm text-gray-600">Overall Conversion Rate</div>
      </div>

      {/* Service Type Breakdown */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-gray-700">By Service Type</h4>
        {serviceTypes.map(([type, rate]) => (
          <div key={type} className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 capitalize">{type}</span>
              <span className="text-sm font-medium">{(rate * 100).toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-500 ${
                  rate > 0.8 ? 'bg-green-500' :
                  rate > 0.6 ? 'bg-yellow-500' :
                  rate > 0.4 ? 'bg-orange-500' :
                  'bg-red-500'
                }`}
                style={{ width: `${(rate / maxRate) * 100}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>

      {/* Vehicle Type Breakdown */}
      {data.byVehicleType && Object.keys(data.byVehicleType).length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-700">By Vehicle Type</h4>
          {Object.entries(data.byVehicleType).map(([type, rate]) => (
            <div key={type} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 capitalize">{type}</span>
                <span className="text-sm font-medium">{(rate * 100).toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${rate * 100}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Price Range Breakdown */}
      {data.byPriceRange && Object.keys(data.byPriceRange).length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-700">By Price Range</h4>
          {Object.entries(data.byPriceRange).map(([range, rate]) => (
            <div key={range} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">${range}</span>
                <span className="text-sm font-medium">{(rate * 100).toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-purple-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${rate * 100}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ConversionChart;


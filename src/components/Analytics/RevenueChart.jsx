import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

const RevenueChart = ({ data }) => {
  if (!data || !data.dailyRevenue) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        No revenue data available
      </div>
    );
  }

  const dailyEntries = Object.entries(data.dailyRevenue)
    .sort(([a], [b]) => new Date(a) - new Date(b))
    .slice(-14); // Last 14 days

  const maxRevenue = Math.max(...dailyEntries.map(([, revenue]) => revenue));
  const totalRevenue = dailyEntries.reduce((sum, [, revenue]) => sum + revenue, 0);
  const avgDailyRevenue = totalRevenue / dailyEntries.length;

  // Calculate trend
  const firstHalf = dailyEntries.slice(0, Math.floor(dailyEntries.length / 2));
  const secondHalf = dailyEntries.slice(Math.floor(dailyEntries.length / 2));
  
  const firstHalfAvg = firstHalf.reduce((sum, [, revenue]) => sum + revenue, 0) / firstHalf.length;
  const secondHalfAvg = secondHalf.reduce((sum, [, revenue]) => sum + revenue, 0) / secondHalf.length;
  
  const trendDirection = secondHalfAvg > firstHalfAvg ? 'up' : 'down';
  const trendPercentage = firstHalfAvg > 0 ? Math.abs((secondHalfAvg - firstHalfAvg) / firstHalfAvg * 100) : 0;

  return (
    <div className="space-y-4">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center p-3 bg-blue-50 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">
            ${totalRevenue.toLocaleString()}
          </div>
          <div className="text-sm text-blue-700">Total Revenue</div>
        </div>
        
        <div className="text-center p-3 bg-green-50 rounded-lg">
          <div className="text-2xl font-bold text-green-600">
            ${Math.round(avgDailyRevenue).toLocaleString()}
          </div>
          <div className="text-sm text-green-700">Daily Average</div>
        </div>
      </div>

      {/* Trend Indicator */}
      <div className={`flex items-center justify-center gap-2 p-3 rounded-lg ${
        trendDirection === 'up' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
      }`}>
        {trendDirection === 'up' ? (
          <TrendingUp className="h-5 w-5" />
        ) : (
          <TrendingDown className="h-5 w-5" />
        )}
        <span className="font-medium">
          {trendDirection === 'up' ? 'Trending Up' : 'Trending Down'} {trendPercentage.toFixed(1)}%
        </span>
      </div>

      {/* Revenue Chart */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-gray-700">Daily Revenue (Last 14 Days)</h4>
        <div className="flex items-end justify-between h-32 bg-gray-50 p-4 rounded-lg">
          {dailyEntries.map(([date, revenue], index) => {
            const height = maxRevenue > 0 ? (revenue / maxRevenue) * 100 : 0;
            const dateObj = new Date(date);
            const dayLabel = dateObj.toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric' 
            });
            
            return (
              <div key={date} className="flex flex-col items-center group relative">
                <div
                  className={`w-6 rounded-t transition-all duration-300 hover:opacity-80 ${
                    revenue > avgDailyRevenue ? 'bg-green-500' : 'bg-blue-500'
                  }`}
                  style={{ height: `${Math.max(4, height)}%` }}
                ></div>
                <span className="text-xs text-gray-500 mt-1 transform -rotate-45 origin-left">
                  {dayLabel}
                </span>
                
                {/* Tooltip */}
                <div className="absolute bottom-full mb-2 hidden group-hover:block bg-gray-800 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
                  ${revenue.toLocaleString()}
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Revenue by Service Type */}
      {data.revenueByServiceType && data.revenueByServiceType.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-700">Revenue by Service Type</h4>
          <div className="space-y-2">
            {data.revenueByServiceType.slice(0, 5).map((item, index) => {
              const percentage = (item.revenue / totalRevenue) * 100;
              const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500', 'bg-red-500'];
              
              return (
                <div key={item.type} className="space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 capitalize">{item.type}</span>
                    <div className="text-right">
                      <span className="text-sm font-medium">${item.revenue.toLocaleString()}</span>
                      <span className="text-xs text-gray-500 ml-2">({percentage.toFixed(1)}%)</span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-500 ${colors[index % colors.length]}`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Weekly Growth */}
      {data.weeklyGrowth !== undefined && (
        <div className={`p-3 rounded-lg ${
          data.weeklyGrowth >= 0 ? 'bg-green-50' : 'bg-red-50'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Weekly Growth</span>
            <div className={`flex items-center gap-1 ${
              data.weeklyGrowth >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {data.weeklyGrowth >= 0 ? (
                <TrendingUp className="h-4 w-4" />
              ) : (
                <TrendingDown className="h-4 w-4" />
              )}
              <span className="font-medium">
                {Math.abs(data.weeklyGrowth * 100).toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Projected Monthly Revenue */}
      {data.projectedMonthly && (
        <div className="p-3 bg-purple-50 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Projected Monthly</span>
            <span className="text-lg font-bold text-purple-600">
              ${Math.round(data.projectedMonthly).toLocaleString()}
            </span>
          </div>
          <p className="text-xs text-purple-600 mt-1">
            Based on recent daily average
          </p>
        </div>
      )}
    </div>
  );
};

export default RevenueChart;


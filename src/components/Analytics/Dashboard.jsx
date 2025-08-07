import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, DollarSign, Users, AlertTriangle, CheckCircle, Clock, Target } from 'lucide-react';
import { dashboardAnalytics } from '../../services/analyticsService';
import { Card } from '../ui';
import PricingInsights from './PricingInsights';
import ConversionChart from './ConversionChart';
import RevenueChart from './RevenueChart';

const Dashboard = () => {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('30d');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadDashboardData();
  }, [timeframe]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const data = await dashboardAnalytics.getDashboardMetrics(timeframe);
      setMetrics(data);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-gray-200 h-32 rounded-lg"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-gray-200 h-64 rounded-lg"></div>
            <div className="bg-gray-200 h-64 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="p-6 text-center">
        <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Unable to Load Analytics</h3>
        <p className="text-gray-600">Please try refreshing the page or contact support if the issue persists.</p>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', name: 'Overview', icon: BarChart3 },
    { id: 'pricing', name: 'Pricing', icon: DollarSign },
    { id: 'conversion', name: 'Conversion', icon: Target },
    { id: 'trends', name: 'Trends', icon: TrendingUp }
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600">Monitor your valet service performance and insights</p>
        </div>
        
        <div className="flex items-center gap-3">
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            className="form-input text-sm"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="365d">Last year</option>
          </select>
          
          <button
            onClick={loadDashboardData}
            className="btn btn-primary text-sm"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Alerts */}
      {metrics.alerts && metrics.alerts.length > 0 && (
        <div className="space-y-3">
          {metrics.alerts.map((alert, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg border-l-4 ${
                alert.type === 'error' ? 'bg-red-50 border-red-400' :
                alert.type === 'warning' ? 'bg-yellow-50 border-yellow-400' :
                'bg-green-50 border-green-400'
              }`}
            >
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  {alert.type === 'error' ? (
                    <AlertTriangle className="h-5 w-5 text-red-400" />
                  ) : alert.type === 'warning' ? (
                    <AlertTriangle className="h-5 w-5 text-yellow-400" />
                  ) : (
                    <CheckCircle className="h-5 w-5 text-green-400" />
                  )}
                </div>
                <div className="ml-3 flex-1">
                  <h3 className={`text-sm font-medium ${
                    alert.type === 'error' ? 'text-red-800' :
                    alert.type === 'warning' ? 'text-yellow-800' :
                    'text-green-800'
                  }`}>
                    {alert.title}
                  </h3>
                  <p className={`mt-1 text-sm ${
                    alert.type === 'error' ? 'text-red-700' :
                    alert.type === 'warning' ? 'text-yellow-700' :
                    'text-green-700'
                  }`}>
                    {alert.message}
                  </p>
                  {alert.action && (
                    <p className={`mt-2 text-xs font-medium ${
                      alert.type === 'error' ? 'text-red-800' :
                      alert.type === 'warning' ? 'text-yellow-800' :
                      'text-green-800'
                    }`}>
                      Action: {alert.action}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Quotes"
          value={metrics.overview.totalQuotes}
          icon={Users}
          color="blue"
          change={metrics.trendAnalysis.quoteTrend.length > 1 ? 
            calculateChange(metrics.trendAnalysis.quoteTrend) : null}
        />
        
        <MetricCard
          title="Conversion Rate"
          value={`${(metrics.overview.conversionRate * 100).toFixed(1)}%`}
          icon={Target}
          color="green"
          change={metrics.trendAnalysis.conversionTrend.length > 1 ? 
            calculateChange(metrics.trendAnalysis.conversionTrend) : null}
        />
        
        <MetricCard
          title="Total Revenue"
          value={`$${metrics.overview.totalRevenue.toLocaleString()}`}
          icon={DollarSign}
          color="purple"
          change={metrics.revenueAnalysis.weeklyGrowth}
        />
        
        <MetricCard
          title="Avg Quote Value"
          value={`$${Math.round(metrics.overview.averageQuoteValue)}`}
          icon={TrendingUp}
          color="orange"
          change={metrics.trendAnalysis.priceTrend.length > 1 ? 
            calculateChange(metrics.trendAnalysis.priceTrend) : null}
        />
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.name}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'overview' && (
          <OverviewTab metrics={metrics} />
        )}
        {activeTab === 'pricing' && (
          <PricingInsights metrics={metrics} />
        )}
        {activeTab === 'conversion' && (
          <ConversionTab metrics={metrics} />
        )}
        {activeTab === 'trends' && (
          <TrendsTab metrics={metrics} />
        )}
      </div>
    </div>
  );
};

const MetricCard = ({ title, value, icon: Icon, color, change }) => {
  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    purple: 'bg-purple-500',
    orange: 'bg-orange-500'
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {change !== null && (
            <p className={`text-sm flex items-center gap-1 ${
              change >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              <TrendingUp className={`h-4 w-4 ${change < 0 ? 'rotate-180' : ''}`} />
              {Math.abs(change * 100).toFixed(1)}%
            </p>
          )}
        </div>
        <div className={`p-3 rounded-full ${colorClasses[color]}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
    </Card>
  );
};

const OverviewTab = ({ metrics }) => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Analysis</h3>
      <RevenueChart data={metrics.revenueAnalysis} />
    </Card>
    
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performers</h3>
      <div className="space-y-4">
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Service Types</h4>
          {metrics.topPerformers.serviceTypes.map((item, index) => (
            <div key={index} className="flex justify-between items-center py-1">
              <span className="text-sm text-gray-600 capitalize">{item.type}</span>
              <span className="text-sm font-medium">{item.count} quotes</span>
            </div>
          ))}
        </div>
        
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Price Ranges</h4>
          {metrics.topPerformers.priceRanges.map((item, index) => (
            <div key={index} className="flex justify-between items-center py-1">
              <span className="text-sm text-gray-600">{item.range}</span>
              <span className="text-sm font-medium">{item.count} quotes</span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  </div>
);

const ConversionTab = ({ metrics }) => (
  <div className="space-y-6">
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Conversion Rates by Category</h3>
      <ConversionChart data={metrics.conversionRates} />
    </Card>
    
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">By Service Type</h3>
        <div className="space-y-3">
          {Object.entries(metrics.conversionRates.byServiceType).map(([type, rate]) => (
            <div key={type} className="flex items-center justify-between">
              <span className="text-sm text-gray-600 capitalize">{type}</span>
              <div className="flex items-center gap-2">
                <div className="w-20 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-primary-500 h-2 rounded-full"
                    style={{ width: `${rate * 100}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium">{(rate * 100).toFixed(1)}%</span>
              </div>
            </div>
          ))}
        </div>
      </Card>
      
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">By Vehicle Type</h3>
        <div className="space-y-3">
          {Object.entries(metrics.conversionRates.byVehicleType).map(([type, rate]) => (
            <div key={type} className="flex items-center justify-between">
              <span className="text-sm text-gray-600 capitalize">{type}</span>
              <div className="flex items-center gap-2">
                <div className="w-20 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full"
                    style={{ width: `${rate * 100}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium">{(rate * 100).toFixed(1)}%</span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  </div>
);

const TrendsTab = ({ metrics }) => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quote Volume Trend</h3>
        <div className="h-64">
          {/* Simple line chart representation */}
          <div className="flex items-end justify-between h-full">
            {metrics.trendAnalysis.quoteTrend.map((point, index) => (
              <div key={index} className="flex flex-col items-center">
                <div
                  className="bg-blue-500 w-8 rounded-t"
                  style={{
                    height: `${Math.max(10, (point.value / Math.max(...metrics.trendAnalysis.quoteTrend.map(p => p.value))) * 200)}px`
                  }}
                ></div>
                <span className="text-xs text-gray-500 mt-2 transform -rotate-45">
                  {point.period}
                </span>
              </div>
            ))}
          </div>
        </div>
      </Card>
      
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Conversion Trend</h3>
        <div className="h-64">
          <div className="flex items-end justify-between h-full">
            {metrics.trendAnalysis.conversionTrend.map((point, index) => (
              <div key={index} className="flex flex-col items-center">
                <div
                  className="bg-green-500 w-8 rounded-t"
                  style={{
                    height: `${Math.max(10, point.value * 200)}px`
                  }}
                ></div>
                <span className="text-xs text-gray-500 mt-2 transform -rotate-45">
                  {point.period}
                </span>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  </div>
);

// Helper function to calculate change between first and last values
const calculateChange = (trendData) => {
  if (trendData.length < 2) return null;
  const first = trendData[0].value;
  const last = trendData[trendData.length - 1].value;
  return first > 0 ? (last - first) / first : 0;
};

export default Dashboard;


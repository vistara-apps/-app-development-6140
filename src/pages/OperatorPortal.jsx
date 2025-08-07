import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { BarChart3, Users, DollarSign, Clock, Calendar, MapPin, Car, Eye, TrendingUp, Target, Settings } from 'lucide-react';
import Dashboard from '../components/Analytics/Dashboard';

const OperatorPortal = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [requests, setRequests] = useState([]);
  const [stats, setStats] = useState({
    totalRequests: 0,
    totalRevenue: 0,
    activeServices: 0,
    avgResponseTime: 0
  });

  useEffect(() => {
    if (!user || user.role !== 'operator') {
      navigate('/login');
      return;
    }

    // Demo data
    setRequests([
      {
        id: 1,
        customerName: 'John Smith',
        location: 'Downtown Hotel',
        serviceType: 'Hotel Valet',
        vehicleDetails: 'BMW X5',
        quote: 75,
        status: 'pending',
        requestedAt: new Date(Date.now() - 1000 * 60 * 30),
        duration: '3-4 hours'
      },
      {
        id: 2,
        customerName: 'Sarah Johnson',
        location: 'Corporate Plaza',
        serviceType: 'Corporate Event',
        vehicleDetails: 'Mercedes C-Class',
        quote: 65,
        status: 'assigned',
        requestedAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
        duration: '6-8 hours'
      },
      {
        id: 3,
        customerName: 'Mike Davis',
        location: 'Wedding Venue',
        serviceType: 'Private Party',
        vehicleDetails: 'Tesla Model S',
        quote: 85,
        status: 'completed',
        requestedAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
        duration: '4-6 hours'
      }
    ]);

    setStats({
      totalRequests: 24,
      totalRevenue: 1850,
      activeServices: 3,
      avgResponseTime: 12
    });
  }, [user, navigate]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'assigned': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleStatusUpdate = (requestId, newStatus) => {
    setRequests(prev => 
      prev.map(req => 
        req.id === requestId ? { ...req, status: newStatus } : req
      )
    );
  };

  const tabs = [
    { id: 'dashboard', name: 'Analytics Dashboard', icon: BarChart3 },
    { id: 'requests', name: 'Requests', icon: Users },
    { id: 'pricing', name: 'Pricing Management', icon: Target },
    { id: 'settings', name: 'Settings', icon: Settings }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Operator Portal</h1>
        <p className="text-gray-600">Manage your valet service requests and track performance</p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-8">
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
      {activeTab === 'dashboard' && <Dashboard />}
      
      {activeTab === 'requests' && (
        <div className="space-y-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <BarChart3 className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-gray-500">Total Requests</h3>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalRequests}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-gray-500">Total Revenue</h3>
                  <p className="text-2xl font-bold text-gray-900">${stats.totalRevenue}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Users className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-gray-500">Active Services</h3>
                  <p className="text-2xl font-bold text-gray-900">{stats.activeServices}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Clock className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-gray-500">Avg Response</h3>
                  <p className="text-2xl font-bold text-gray-900">{stats.avgResponseTime}m</p>
                </div>
              </div>
            </div>
          </div>

          {/* Requests Table */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Recent Requests</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Location
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Service
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Vehicle
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quote
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {requests.map((request) => (
                    <tr key={request.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {request.customerName}
                          </div>
                          <div className="text-sm text-gray-500 flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            {request.requestedAt.toLocaleDateString()}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 flex items-center">
                          <MapPin className="h-3 w-3 mr-1" />
                          {request.location}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{request.serviceType}</div>
                        <div className="text-sm text-gray-500 flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {request.duration}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 flex items-center">
                          <Car className="h-3 w-3 mr-1" />
                          {request.vehicleDetails}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          ${request.quote}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full capitalize ${getStatusColor(request.status)}`}>
                          {request.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          {request.status === 'pending' && (
                            <button
                              onClick={() => handleStatusUpdate(request.id, 'assigned')}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              Assign
                            </button>
                          )}
                          {request.status === 'assigned' && (
                            <button
                              onClick={() => handleStatusUpdate(request.id, 'completed')}
                              className="text-green-600 hover:text-green-900"
                            >
                              Complete
                            </button>
                          )}
                          <button className="text-gray-600 hover:text-gray-900">
                            <Eye className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'pricing' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Pricing Management</h2>
          <p className="text-gray-600">Advanced pricing controls and AI training features coming soon...</p>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Settings</h2>
          <p className="text-gray-600">System configuration and preferences coming soon...</p>
        </div>
      )}
    </div>
  );
};

export default OperatorPortal;

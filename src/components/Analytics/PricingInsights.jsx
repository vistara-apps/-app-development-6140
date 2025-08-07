import React, { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, Target, AlertCircle, CheckCircle, Info } from 'lucide-react';
import { pricingAnalytics, competitiveAnalytics } from '../../services/analyticsService';
import { Card } from '../ui';

const PricingInsights = ({ metrics }) => {
  const [selectedServiceType, setSelectedServiceType] = useState('event');
  const [pricingAnalysis, setPricingAnalysis] = useState(null);
  const [competitivePosition, setCompetitivePosition] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadPricingAnalysis();
  }, [selectedServiceType]);

  const loadPricingAnalysis = async () => {
    setLoading(true);
    try {
      const [pricing, competitive] = await Promise.all([
        pricingAnalytics.analyzePricingEffectiveness(selectedServiceType),
        competitiveAnalytics.getMarketPosition(selectedServiceType)
      ]);
      
      setPricingAnalysis(pricing);
      setCompetitivePosition(competitive);
    } catch (error) {
      console.error('Error loading pricing analysis:', error);
    } finally {
      setLoading(false);
    }
  };

  const serviceTypes = ['event', 'restaurant', 'hotel', 'corporate', 'private'];

  const getEffectivenessColor = (effectiveness) => {
    switch (effectiveness) {
      case 'excellent': return 'text-green-600 bg-green-100';
      case 'good': return 'text-blue-600 bg-blue-100';
      case 'fair': return 'text-yellow-600 bg-yellow-100';
      case 'needs_improvement': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPositionColor = (position) => {
    switch (position) {
      case 'premium': return 'text-purple-600 bg-purple-100';
      case 'competitive': return 'text-green-600 bg-green-100';
      case 'budget': return 'text-orange-600 bg-orange-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="space-y-6">
      {/* Service Type Selector */}
      <div className="flex flex-wrap gap-2">
        {serviceTypes.map((type) => (
          <button
            key={type}
            onClick={() => setSelectedServiceType(type)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
              selectedServiceType === type
                ? 'bg-primary-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-gray-200 h-64 rounded-lg animate-pulse"></div>
          ))}
        </div>
      ) : (
        <>
          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Effectiveness</p>
                  <p className={`text-lg font-bold capitalize px-2 py-1 rounded-full text-center ${
                    pricingAnalysis ? getEffectivenessColor(pricingAnalysis.effectiveness) : 'text-gray-600 bg-gray-100'
                  }`}>
                    {pricingAnalysis?.effectiveness?.replace('_', ' ') || 'Loading...'}
                  </p>
                </div>
                <Target className="h-8 w-8 text-primary-500" />
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Market Position</p>
                  <p className={`text-lg font-bold capitalize px-2 py-1 rounded-full text-center ${
                    competitivePosition ? getPositionColor(competitivePosition.position) : 'text-gray-600 bg-gray-100'
                  }`}>
                    {competitivePosition?.position || 'Loading...'}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-500" />
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Current Average</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ${pricingAnalysis?.currentAverage || competitivePosition?.ourAverage || '--'}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-blue-500" />
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Recommended</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ${pricingAnalysis?.tierRecommended || '--'}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-purple-500" />
              </div>
            </Card>
          </div>

          {/* Detailed Analysis */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Pricing Analysis */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Target className="h-5 w-5" />
                Pricing Analysis
              </h3>
              
              {pricingAnalysis && (
                <div className="space-y-4">
                  {pricingAnalysis.optimalPriceRange && (
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h4 className="font-medium text-green-800 mb-2">Optimal Price Range</h4>
                      <p className="text-green-700">
                        {pricingAnalysis.optimalPriceRange.range} with {(pricingAnalysis.optimalPriceRange.conversionRate * 100).toFixed(1)}% conversion rate
                      </p>
                      <p className="text-sm text-green-600 mt-1">
                        Based on {pricingAnalysis.optimalPriceRange.sampleSize} quotes
                      </p>
                    </div>
                  )}

                  {pricingAnalysis.priceElasticity && (
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-medium text-blue-800 mb-2">Price Elasticity</h4>
                      <p className="text-blue-700">
                        {pricingAnalysis.priceElasticity > -1 ? 'Low' : 'High'} price sensitivity
                      </p>
                      <p className="text-sm text-blue-600">
                        Elasticity: {pricingAnalysis.priceElasticity.toFixed(2)}
                      </p>
                    </div>
                  )}

                  <div>
                    <h4 className="font-medium text-gray-800 mb-2">Recommendations</h4>
                    <ul className="space-y-2">
                      {pricingAnalysis.recommendations.map((rec, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm text-gray-600">
                          <Info className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </Card>

            {/* Competitive Position */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Competitive Position
              </h3>
              
              {competitivePosition && (
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-800 mb-2">Market Comparison</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Market Low:</span>
                        <span className="font-medium">${competitivePosition.marketRange.low}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Market Average:</span>
                        <span className="font-medium">${competitivePosition.marketRange.avg}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Market High:</span>
                        <span className="font-medium">${competitivePosition.marketRange.high}</span>
                      </div>
                      <div className="flex justify-between border-t pt-2">
                        <span className="text-sm font-medium text-gray-800">Your Average:</span>
                        <span className="font-bold text-primary-600">${competitivePosition.ourAverage}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-800 mb-2">Competitive Advantages</h4>
                    <ul className="space-y-1">
                      {competitivePosition.competitiveAdvantages.map((advantage, index) => (
                        <li key={index} className="flex items-center gap-2 text-sm text-gray-600">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          {advantage}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-800 mb-2">Recommendations</h4>
                    <ul className="space-y-2">
                      {competitivePosition.recommendations.map((rec, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm text-gray-600">
                          <Info className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </Card>
          </div>

          {/* Service Type Performance */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Service Type Performance</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Service Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Conversion Rate
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Avg Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Market Position
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {serviceTypes.map((type) => {
                    const conversionRate = metrics.conversionRates.byServiceType[type] || 0;
                    const avgRevenue = metrics.revenueAnalysis.revenueByServiceType.find(r => r.type === type)?.revenue || 0;
                    
                    return (
                      <tr key={type} className={selectedServiceType === type ? 'bg-primary-50' : ''}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 capitalize">
                          {type}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {(conversionRate * 100).toFixed(1)}%
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          ${Math.round(avgRevenue / Math.max(1, metrics.overview.totalQuotes * conversionRate))}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            conversionRate > 0.8 ? 'bg-green-100 text-green-800' :
                            conversionRate > 0.6 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {conversionRate > 0.8 ? 'Strong' : conversionRate > 0.6 ? 'Average' : 'Weak'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {conversionRate > 0.7 ? (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          ) : conversionRate > 0.5 ? (
                            <AlertCircle className="h-5 w-5 text-yellow-500" />
                          ) : (
                            <AlertCircle className="h-5 w-5 text-red-500" />
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Price Optimization Suggestions */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Price Optimization Suggestions</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-medium text-green-800 mb-2 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Increase Opportunities
                </h4>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>• Corporate events show high acceptance rates</li>
                  <li>• Luxury vehicle premiums are well-received</li>
                  <li>• Weekend pricing can be optimized</li>
                </ul>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-800 mb-2 flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Optimization Areas
                </h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Restaurant valet pricing review needed</li>
                  <li>• Consider dynamic pricing for peak hours</li>
                  <li>• A/B test different pricing strategies</li>
                </ul>
              </div>
            </div>
          </Card>
        </>
      )}
    </div>
  );
};

export default PricingInsights;


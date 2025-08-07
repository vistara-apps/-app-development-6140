/**
 * Analytics Service for ValetQuotes
 * Provides comprehensive business intelligence and performance analytics
 */

import { getHistoricalQuotes, getConversionRates, getPerformanceMetrics } from './historicalDataService.js';
import { PRICING_TIERS } from './pricingEngine.js';

/**
 * Dashboard Analytics
 */
export class DashboardAnalytics {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
  }

  async getDashboardMetrics(timeframe = '30d') {
    const cacheKey = `dashboard_${timeframe}`;
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    try {
      const performanceMetrics = getPerformanceMetrics(timeframe);
      const conversionRates = getConversionRates(timeframe);
      const revenueAnalysis = this.calculateRevenueAnalysis(timeframe);
      const trendAnalysis = this.calculateTrendAnalysis(timeframe);

      const metrics = {
        overview: {
          totalQuotes: performanceMetrics.totalQuotes,
          acceptedQuotes: performanceMetrics.acceptedQuotes,
          conversionRate: performanceMetrics.conversionRate,
          totalRevenue: performanceMetrics.totalRevenue,
          averageQuoteValue: performanceMetrics.averageQuoteValue,
          averageSatisfaction: performanceMetrics.averageSatisfaction
        },
        conversionRates,
        revenueAnalysis,
        trendAnalysis,
        topPerformers: {
          serviceTypes: performanceMetrics.topServiceTypes,
          priceRanges: this.getTopPriceRanges(),
          locations: this.getTopLocations()
        },
        alerts: this.generateAlerts(performanceMetrics, conversionRates)
      };

      this.setCachedData(cacheKey, metrics);
      return metrics;
    } catch (error) {
      console.error('Error calculating dashboard metrics:', error);
      return this.getDefaultMetrics();
    }
  }

  calculateRevenueAnalysis(timeframe) {
    const quotes = getHistoricalQuotes({ accepted: true });
    
    // Group by time periods
    const dailyRevenue = {};
    const monthlyRevenue = {};
    
    quotes.forEach(quote => {
      const date = new Date(quote.date);
      const dayKey = date.toISOString().split('T')[0];
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      dailyRevenue[dayKey] = (dailyRevenue[dayKey] || 0) + quote.finalPrice;
      monthlyRevenue[monthKey] = (monthlyRevenue[monthKey] || 0) + quote.finalPrice;
    });

    // Calculate growth rates
    const dailyValues = Object.values(dailyRevenue);
    const recentRevenue = dailyValues.slice(-7).reduce((sum, val) => sum + val, 0);
    const previousRevenue = dailyValues.slice(-14, -7).reduce((sum, val) => sum + val, 0);
    const weeklyGrowth = previousRevenue > 0 ? (recentRevenue - previousRevenue) / previousRevenue : 0;

    return {
      dailyRevenue,
      monthlyRevenue,
      weeklyGrowth,
      projectedMonthly: this.projectMonthlyRevenue(dailyRevenue),
      revenueByServiceType: this.calculateRevenueByServiceType(quotes)
    };
  }

  calculateTrendAnalysis(timeframe) {
    const quotes = getHistoricalQuotes();
    const now = new Date();
    const periods = this.createTimePeriods(timeframe, now);

    const trends = {
      quoteTrend: [],
      conversionTrend: [],
      priceTrend: [],
      satisfactionTrend: []
    };

    periods.forEach(period => {
      const periodQuotes = quotes.filter(q => {
        const quoteDate = new Date(q.date);
        return quoteDate >= period.start && quoteDate < period.end;
      });

      const acceptedQuotes = periodQuotes.filter(q => q.accepted);
      
      trends.quoteTrend.push({
        period: period.label,
        value: periodQuotes.length
      });

      trends.conversionTrend.push({
        period: period.label,
        value: periodQuotes.length > 0 ? acceptedQuotes.length / periodQuotes.length : 0
      });

      trends.priceTrend.push({
        period: period.label,
        value: acceptedQuotes.length > 0 ? 
          acceptedQuotes.reduce((sum, q) => sum + q.finalPrice, 0) / acceptedQuotes.length : 0
      });

      trends.satisfactionTrend.push({
        period: period.label,
        value: acceptedQuotes.length > 0 ?
          acceptedQuotes.reduce((sum, q) => sum + q.customerSatisfaction, 0) / acceptedQuotes.length : 0
      });
    });

    return trends;
  }

  createTimePeriods(timeframe, endDate) {
    const periods = [];
    const days = parseInt(timeframe);
    const periodLength = Math.max(1, Math.floor(days / 10)); // Create ~10 periods

    for (let i = days; i > 0; i -= periodLength) {
      const start = new Date(endDate);
      start.setDate(start.getDate() - i);
      const end = new Date(endDate);
      end.setDate(end.getDate() - Math.max(0, i - periodLength));

      periods.push({
        start,
        end,
        label: start.toLocaleDateString()
      });
    }

    return periods;
  }

  projectMonthlyRevenue(dailyRevenue) {
    const recentDays = Object.entries(dailyRevenue)
      .sort(([a], [b]) => new Date(b) - new Date(a))
      .slice(0, 7);

    if (recentDays.length === 0) return 0;

    const avgDailyRevenue = recentDays.reduce((sum, [, revenue]) => sum + revenue, 0) / recentDays.length;
    return avgDailyRevenue * 30; // Project for 30 days
  }

  calculateRevenueByServiceType(quotes) {
    const revenueByType = {};
    
    quotes.forEach(quote => {
      revenueByType[quote.serviceType] = (revenueByType[quote.serviceType] || 0) + quote.finalPrice;
    });

    return Object.entries(revenueByType)
      .map(([type, revenue]) => ({ type, revenue }))
      .sort((a, b) => b.revenue - a.revenue);
  }

  getTopPriceRanges() {
    const quotes = getHistoricalQuotes({ accepted: true });
    const priceRanges = {};

    quotes.forEach(quote => {
      const range = this.getPriceRange(quote.finalPrice);
      priceRanges[range] = (priceRanges[range] || 0) + 1;
    });

    return Object.entries(priceRanges)
      .map(([range, count]) => ({ range, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }

  getTopLocations() {
    const quotes = getHistoricalQuotes({ accepted: true });
    const locations = {};

    quotes.forEach(quote => {
      const locationKey = this.normalizeLocation(quote.location);
      locations[locationKey] = (locations[locationKey] || 0) + 1;
    });

    return Object.entries(locations)
      .map(([location, count]) => ({ location, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }

  generateAlerts(performanceMetrics, conversionRates) {
    const alerts = [];

    // Low conversion rate alert
    if (performanceMetrics.conversionRate < 0.6) {
      alerts.push({
        type: 'warning',
        title: 'Low Conversion Rate',
        message: `Current conversion rate is ${(performanceMetrics.conversionRate * 100).toFixed(1)}%. Consider reviewing pricing strategy.`,
        action: 'Review pricing tiers and competitor analysis'
      });
    }

    // High conversion rate opportunity
    if (performanceMetrics.conversionRate > 0.9) {
      alerts.push({
        type: 'success',
        title: 'High Conversion Rate',
        message: `Excellent conversion rate of ${(performanceMetrics.conversionRate * 100).toFixed(1)}%. Consider testing higher prices.`,
        action: 'Test premium pricing strategy'
      });
    }

    // Service type performance alerts
    Object.entries(conversionRates.byServiceType).forEach(([serviceType, rate]) => {
      if (rate < 0.5) {
        alerts.push({
          type: 'warning',
          title: `Low ${serviceType} Performance`,
          message: `${serviceType} service has ${(rate * 100).toFixed(1)}% conversion rate.`,
          action: `Review ${serviceType} pricing and market positioning`
        });
      }
    });

    // Revenue trend alerts
    if (performanceMetrics.recentTrends.quotesGrowth < -0.2) {
      alerts.push({
        type: 'error',
        title: 'Declining Quote Volume',
        message: 'Quote requests have decreased by more than 20% recently.',
        action: 'Investigate market conditions and marketing effectiveness'
      });
    }

    return alerts;
  }

  getPriceRange(price) {
    if (price < 40) return '$0-40';
    if (price < 60) return '$40-60';
    if (price < 80) return '$60-80';
    if (price < 100) return '$80-100';
    return '$100+';
  }

  normalizeLocation(location) {
    // Normalize location names for grouping
    const normalized = location.toLowerCase();
    if (normalized.includes('downtown') || normalized.includes('city center')) return 'Downtown';
    if (normalized.includes('hotel')) return 'Hotels';
    if (normalized.includes('restaurant')) return 'Restaurants';
    if (normalized.includes('corporate') || normalized.includes('office')) return 'Corporate';
    if (normalized.includes('event') || normalized.includes('venue')) return 'Event Venues';
    return 'Other';
  }

  getCachedData(key) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }
    return null;
  }

  setCachedData(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  getDefaultMetrics() {
    return {
      overview: {
        totalQuotes: 0,
        acceptedQuotes: 0,
        conversionRate: 0,
        totalRevenue: 0,
        averageQuoteValue: 0,
        averageSatisfaction: 0
      },
      conversionRates: { overall: 0, byServiceType: {}, byVehicleType: {}, byPriceRange: {} },
      revenueAnalysis: { dailyRevenue: {}, monthlyRevenue: {}, weeklyGrowth: 0 },
      trendAnalysis: { quoteTrend: [], conversionTrend: [], priceTrend: [] },
      topPerformers: { serviceTypes: [], priceRanges: [], locations: [] },
      alerts: []
    };
  }
}

/**
 * Pricing Analytics
 */
export class PricingAnalytics {
  static analyzePricingEffectiveness(serviceType) {
    const quotes = getHistoricalQuotes({ serviceType });
    const acceptedQuotes = quotes.filter(q => q.accepted);

    if (acceptedQuotes.length === 0) {
      return {
        effectiveness: 'insufficient_data',
        recommendations: ['Gather more quote data for analysis'],
        optimalPriceRange: null
      };
    }

    // Analyze price vs conversion rate
    const priceRanges = this.groupByPriceRanges(quotes);
    const optimalRange = this.findOptimalPriceRange(priceRanges);

    // Compare with tier-based pricing
    const tierOptimal = PRICING_TIERS[serviceType]?.base.optimal || 50;
    const actualAverage = acceptedQuotes.reduce((sum, q) => sum + q.finalPrice, 0) / acceptedQuotes.length;

    const recommendations = [];
    
    if (actualAverage < tierOptimal * 0.9) {
      recommendations.push('Consider increasing base prices - market may support higher rates');
    } else if (actualAverage > tierOptimal * 1.1) {
      recommendations.push('Monitor conversion rates - prices may be above optimal range');
    }

    if (optimalRange.conversionRate > 0.8) {
      recommendations.push('High conversion rate indicates potential for premium pricing');
    }

    return {
      effectiveness: this.calculateEffectivenessScore(priceRanges),
      optimalPriceRange: optimalRange,
      currentAverage: Math.round(actualAverage),
      tierRecommended: Math.round(tierOptimal),
      recommendations,
      priceElasticity: this.calculatePriceElasticity(priceRanges)
    };
  }

  static groupByPriceRanges(quotes) {
    const ranges = {};
    
    quotes.forEach(quote => {
      const range = Math.floor(quote.quotedPrice / 20) * 20; // Group by $20 ranges
      const rangeKey = `${range}-${range + 19}`;
      
      if (!ranges[rangeKey]) {
        ranges[rangeKey] = { total: 0, accepted: 0, prices: [] };
      }
      
      ranges[rangeKey].total++;
      ranges[rangeKey].prices.push(quote.quotedPrice);
      if (quote.accepted) ranges[rangeKey].accepted++;
    });

    // Calculate conversion rates
    Object.keys(ranges).forEach(range => {
      ranges[range].conversionRate = ranges[range].accepted / ranges[range].total;
      ranges[range].averagePrice = ranges[range].prices.reduce((sum, p) => sum + p, 0) / ranges[range].prices.length;
    });

    return ranges;
  }

  static findOptimalPriceRange(priceRanges) {
    let optimalRange = null;
    let bestScore = 0;

    Object.entries(priceRanges).forEach(([range, data]) => {
      // Score combines conversion rate and price level
      const score = data.conversionRate * Math.log(data.averagePrice);
      
      if (score > bestScore && data.total >= 3) { // Minimum sample size
        bestScore = score;
        optimalRange = {
          range,
          conversionRate: data.conversionRate,
          averagePrice: Math.round(data.averagePrice),
          sampleSize: data.total
        };
      }
    });

    return optimalRange;
  }

  static calculateEffectivenessScore(priceRanges) {
    const ranges = Object.values(priceRanges);
    if (ranges.length === 0) return 'insufficient_data';

    const avgConversion = ranges.reduce((sum, r) => sum + r.conversionRate, 0) / ranges.length;
    const avgPrice = ranges.reduce((sum, r) => sum + r.averagePrice, 0) / ranges.length;

    // Effectiveness based on conversion rate and price optimization
    if (avgConversion > 0.8 && avgPrice > 60) return 'excellent';
    if (avgConversion > 0.7 && avgPrice > 50) return 'good';
    if (avgConversion > 0.6) return 'fair';
    return 'needs_improvement';
  }

  static calculatePriceElasticity(priceRanges) {
    const ranges = Object.entries(priceRanges)
      .map(([range, data]) => ({
        price: data.averagePrice,
        conversionRate: data.conversionRate,
        sampleSize: data.total
      }))
      .filter(r => r.sampleSize >= 3)
      .sort((a, b) => a.price - b.price);

    if (ranges.length < 2) return null;

    // Simple elasticity calculation
    const priceChange = (ranges[ranges.length - 1].price - ranges[0].price) / ranges[0].price;
    const demandChange = (ranges[ranges.length - 1].conversionRate - ranges[0].conversionRate) / ranges[0].conversionRate;

    return priceChange !== 0 ? demandChange / priceChange : null;
  }
}

/**
 * Competitive Analysis
 */
export class CompetitiveAnalytics {
  static getMarketPosition(serviceType) {
    const quotes = getHistoricalQuotes({ serviceType, accepted: true });
    
    if (quotes.length === 0) {
      return {
        position: 'unknown',
        recommendations: ['Insufficient data for competitive analysis']
      };
    }

    const avgPrice = quotes.reduce((sum, q) => sum + q.finalPrice, 0) / quotes.length;
    const marketData = this.getMarketBenchmarks(serviceType);

    let position = 'competitive';
    const recommendations = [];

    if (avgPrice < marketData.low) {
      position = 'budget';
      recommendations.push('Consider price increases to improve margins');
    } else if (avgPrice > marketData.high) {
      position = 'premium';
      recommendations.push('Ensure value proposition justifies premium pricing');
    }

    return {
      position,
      ourAverage: Math.round(avgPrice),
      marketRange: marketData,
      recommendations,
      marketShare: this.estimateMarketShare(quotes.length),
      competitiveAdvantages: this.identifyAdvantages(serviceType, avgPrice)
    };
  }

  static getMarketBenchmarks(serviceType) {
    // Simulated market data - in production, this would come from market research
    const benchmarks = {
      event: { low: 45, avg: 58, high: 75 },
      restaurant: { low: 35, avg: 48, high: 62 },
      hotel: { low: 40, avg: 52, high: 68 },
      corporate: { low: 55, avg: 72, high: 95 },
      private: { low: 50, avg: 65, high: 85 }
    };

    return benchmarks[serviceType] || { low: 40, avg: 55, high: 75 };
  }

  static estimateMarketShare(quoteVolume) {
    // Simplified market share estimation based on quote volume
    if (quoteVolume > 100) return 'high';
    if (quoteVolume > 50) return 'medium';
    if (quoteVolume > 20) return 'low';
    return 'emerging';
  }

  static identifyAdvantages(serviceType, avgPrice) {
    const advantages = [];
    const benchmarks = this.getMarketBenchmarks(serviceType);

    if (avgPrice <= benchmarks.avg) {
      advantages.push('Competitive pricing');
    }

    // Add more advantages based on service features
    advantages.push('AI-powered pricing optimization');
    advantages.push('Real-time quote generation');
    advantages.push('Comprehensive service coverage');

    return advantages;
  }
}

/**
 * Forecasting Analytics
 */
export class ForecastingAnalytics {
  static generateDemandForecast(timeframe = '30d') {
    const historicalData = getHistoricalQuotes();
    const trends = this.analyzeTrends(historicalData);

    return {
      nextMonth: this.forecastNextPeriod(trends, 30),
      nextQuarter: this.forecastNextPeriod(trends, 90),
      seasonalFactors: this.calculateSeasonalFactors(historicalData),
      confidence: this.calculateForecastConfidence(historicalData),
      recommendations: this.generateForecastRecommendations(trends)
    };
  }

  static analyzeTrends(data) {
    // Simple trend analysis - in production, use more sophisticated methods
    const monthlyData = {};
    
    data.forEach(quote => {
      const month = new Date(quote.date).toISOString().substring(0, 7);
      if (!monthlyData[month]) {
        monthlyData[month] = { quotes: 0, revenue: 0 };
      }
      monthlyData[month].quotes++;
      if (quote.accepted) {
        monthlyData[month].revenue += quote.finalPrice;
      }
    });

    const months = Object.keys(monthlyData).sort();
    if (months.length < 2) return { growth: 0, volatility: 0 };

    const growthRates = [];
    for (let i = 1; i < months.length; i++) {
      const current = monthlyData[months[i]].quotes;
      const previous = monthlyData[months[i-1]].quotes;
      if (previous > 0) {
        growthRates.push((current - previous) / previous);
      }
    }

    const avgGrowth = growthRates.reduce((sum, rate) => sum + rate, 0) / growthRates.length;
    const volatility = this.calculateVolatility(growthRates);

    return { growth: avgGrowth, volatility, monthlyData };
  }

  static forecastNextPeriod(trends, days) {
    const baseQuotes = Object.values(trends.monthlyData).slice(-1)[0]?.quotes || 0;
    const growthFactor = Math.pow(1 + trends.growth, days / 30);
    
    return {
      expectedQuotes: Math.round(baseQuotes * growthFactor),
      range: {
        low: Math.round(baseQuotes * growthFactor * 0.8),
        high: Math.round(baseQuotes * growthFactor * 1.2)
      }
    };
  }

  static calculateSeasonalFactors(data) {
    const monthlyFactors = {};
    const monthlyData = {};

    data.forEach(quote => {
      const month = new Date(quote.date).getMonth();
      monthlyData[month] = (monthlyData[month] || 0) + 1;
    });

    const avgMonthly = Object.values(monthlyData).reduce((sum, count) => sum + count, 0) / 12;
    
    for (let month = 0; month < 12; month++) {
      monthlyFactors[month] = (monthlyData[month] || 0) / avgMonthly;
    }

    return monthlyFactors;
  }

  static calculateVolatility(values) {
    if (values.length < 2) return 0;
    
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    
    return Math.sqrt(variance);
  }

  static calculateForecastConfidence(data) {
    if (data.length < 10) return 'low';
    if (data.length < 50) return 'medium';
    return 'high';
  }

  static generateForecastRecommendations(trends) {
    const recommendations = [];

    if (trends.growth > 0.1) {
      recommendations.push('Strong growth trend - consider scaling operations');
    } else if (trends.growth < -0.1) {
      recommendations.push('Declining trend - review marketing and pricing strategy');
    }

    if (trends.volatility > 0.3) {
      recommendations.push('High volatility detected - implement demand smoothing strategies');
    }

    return recommendations;
  }
}

// Export singleton instances
export const dashboardAnalytics = new DashboardAnalytics();
export const pricingAnalytics = PricingAnalytics;
export const competitiveAnalytics = CompetitiveAnalytics;
export const forecastingAnalytics = ForecastingAnalytics;


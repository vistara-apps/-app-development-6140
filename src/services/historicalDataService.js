/**
 * Historical Data Service for ValetQuotes
 * Manages historical pricing data, conversion rates, and market trends
 */

// Simulated historical data for demonstration
const HISTORICAL_QUOTES = [
  {
    id: 1,
    date: '2024-07-15',
    serviceType: 'event',
    location: 'Downtown Convention Center',
    vehicleType: 'luxury',
    duration: '4-6',
    quotedPrice: 85,
    finalPrice: 85,
    accepted: true,
    conversionTime: 1200, // seconds
    customerSatisfaction: 4.8
  },
  {
    id: 2,
    date: '2024-07-16',
    serviceType: 'restaurant',
    location: 'Suburban Bistro',
    vehicleType: 'standard',
    duration: '2-4',
    quotedPrice: 45,
    finalPrice: 45,
    accepted: true,
    conversionTime: 800,
    customerSatisfaction: 4.6
  },
  {
    id: 3,
    date: '2024-07-17',
    serviceType: 'corporate',
    location: 'Financial District Office',
    vehicleType: 'exotic',
    duration: '6-8',
    quotedPrice: 120,
    finalPrice: 110,
    accepted: true,
    conversionTime: 2400,
    customerSatisfaction: 4.9
  },
  // Add more historical data...
];

// Market trends data
const MARKET_TRENDS = {
  priceElasticity: {
    event: -0.7,
    restaurant: -0.9,
    hotel: -0.8,
    corporate: -0.5,
    private: -0.6
  },
  seasonalDemand: {
    spring: { event: 1.1, restaurant: 1.0, hotel: 1.2, corporate: 0.9, private: 1.3 },
    summer: { event: 1.4, restaurant: 1.2, hotel: 1.5, corporate: 0.8, private: 1.6 },
    fall: { event: 1.2, restaurant: 1.1, hotel: 1.3, corporate: 1.1, private: 1.4 },
    winter: { event: 0.8, restaurant: 0.9, hotel: 0.9, corporate: 1.2, private: 0.7 }
  },
  competitorPricing: {
    event: { min: 35, avg: 52, max: 75 },
    restaurant: { min: 25, avg: 42, max: 65 },
    hotel: { min: 30, avg: 48, max: 70 },
    corporate: { min: 45, avg: 68, max: 95 },
    private: { min: 40, avg: 58, max: 85 }
  }
};

/**
 * Get historical quotes filtered by criteria
 */
export const getHistoricalQuotes = (filters = {}) => {
  let filteredQuotes = [...HISTORICAL_QUOTES];

  if (filters.serviceType) {
    filteredQuotes = filteredQuotes.filter(q => q.serviceType === filters.serviceType);
  }

  if (filters.vehicleType) {
    filteredQuotes = filteredQuotes.filter(q => q.vehicleType === filters.vehicleType);
  }

  if (filters.dateRange) {
    const { start, end } = filters.dateRange;
    filteredQuotes = filteredQuotes.filter(q => {
      const quoteDate = new Date(q.date);
      return quoteDate >= new Date(start) && quoteDate <= new Date(end);
    });
  }

  if (filters.accepted !== undefined) {
    filteredQuotes = filteredQuotes.filter(q => q.accepted === filters.accepted);
  }

  return filteredQuotes;
};

/**
 * Calculate conversion rates by various dimensions
 */
export const getConversionRates = (timeframe = '30d') => {
  const quotes = getHistoricalQuotes();
  
  const byServiceType = {};
  const byVehicleType = {};
  const byPriceRange = {};
  const byDuration = {};

  quotes.forEach(quote => {
    // By service type
    if (!byServiceType[quote.serviceType]) {
      byServiceType[quote.serviceType] = { total: 0, accepted: 0 };
    }
    byServiceType[quote.serviceType].total++;
    if (quote.accepted) byServiceType[quote.serviceType].accepted++;

    // By vehicle type
    if (!byVehicleType[quote.vehicleType]) {
      byVehicleType[quote.vehicleType] = { total: 0, accepted: 0 };
    }
    byVehicleType[quote.vehicleType].total++;
    if (quote.accepted) byVehicleType[quote.vehicleType].accepted++;

    // By price range
    const priceRange = getPriceRange(quote.quotedPrice);
    if (!byPriceRange[priceRange]) {
      byPriceRange[priceRange] = { total: 0, accepted: 0 };
    }
    byPriceRange[priceRange].total++;
    if (quote.accepted) byPriceRange[priceRange].accepted++;

    // By duration
    if (!byDuration[quote.duration]) {
      byDuration[quote.duration] = { total: 0, accepted: 0 };
    }
    byDuration[quote.duration].total++;
    if (quote.accepted) byDuration[quote.duration].accepted++;
  });

  // Calculate rates
  const calculateRate = (data) => {
    const result = {};
    Object.keys(data).forEach(key => {
      result[key] = data[key].total > 0 ? data[key].accepted / data[key].total : 0;
    });
    return result;
  };

  return {
    overall: quotes.filter(q => q.accepted).length / quotes.length,
    byServiceType: calculateRate(byServiceType),
    byVehicleType: calculateRate(byVehicleType),
    byPriceRange: calculateRate(byPriceRange),
    byDuration: calculateRate(byDuration)
  };
};

/**
 * Get pricing insights based on historical data
 */
export const getPricingInsights = (serviceType) => {
  const quotes = getHistoricalQuotes({ serviceType, accepted: true });
  
  if (quotes.length === 0) {
    return {
      averagePrice: 0,
      priceRange: { min: 0, max: 0 },
      optimalPricePoint: 0,
      conversionRate: 0,
      insights: ['Insufficient historical data for analysis']
    };
  }

  const prices = quotes.map(q => q.quotedPrice);
  const averagePrice = prices.reduce((sum, price) => sum + price, 0) / prices.length;
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);

  // Find optimal price point (highest conversion rate)
  const priceRanges = {};
  quotes.forEach(quote => {
    const range = getPriceRange(quote.quotedPrice);
    if (!priceRanges[range]) {
      priceRanges[range] = { total: 0, accepted: 0, avgPrice: 0 };
    }
    priceRanges[range].total++;
    if (quote.accepted) priceRanges[range].accepted++;
    priceRanges[range].avgPrice += quote.quotedPrice;
  });

  let optimalRange = null;
  let highestConversion = 0;
  Object.keys(priceRanges).forEach(range => {
    const conversionRate = priceRanges[range].accepted / priceRanges[range].total;
    if (conversionRate > highestConversion) {
      highestConversion = conversionRate;
      optimalRange = range;
    }
    priceRanges[range].avgPrice /= priceRanges[range].total;
  });

  const insights = generateInsights(quotes, serviceType);

  return {
    averagePrice: Math.round(averagePrice),
    priceRange: { min: minPrice, max: maxPrice },
    optimalPricePoint: optimalRange ? priceRanges[optimalRange].avgPrice : averagePrice,
    conversionRate: quotes.filter(q => q.accepted).length / quotes.length,
    insights,
    trends: getServiceTypeTrends(serviceType),
    competitorData: MARKET_TRENDS.competitorPricing[serviceType]
  };
};

/**
 * Generate AI training data from historical quotes
 */
export const generateTrainingData = () => {
  const quotes = getHistoricalQuotes();
  
  return quotes.map(quote => ({
    input: {
      serviceType: quote.serviceType,
      vehicleType: quote.vehicleType,
      duration: quote.duration,
      location: quote.location,
      date: quote.date
    },
    output: {
      price: quote.finalPrice,
      accepted: quote.accepted,
      conversionTime: quote.conversionTime,
      satisfaction: quote.customerSatisfaction
    },
    metadata: {
      originalQuote: quote.quotedPrice,
      priceAdjustment: quote.finalPrice - quote.quotedPrice,
      success: quote.accepted && quote.customerSatisfaction >= 4.0
    }
  }));
};

/**
 * Get market trends for a specific service type
 */
export const getServiceTypeTrends = (serviceType) => {
  const currentSeason = getCurrentSeason();
  const seasonalMultiplier = MARKET_TRENDS.seasonalDemand[currentSeason][serviceType];
  const priceElasticity = MARKET_TRENDS.priceElasticity[serviceType];

  return {
    seasonalDemand: seasonalMultiplier,
    priceElasticity,
    recommendedAdjustment: seasonalMultiplier > 1.1 ? 'increase' : seasonalMultiplier < 0.9 ? 'decrease' : 'maintain',
    competitorAverage: MARKET_TRENDS.competitorPricing[serviceType].avg
  };
};

/**
 * Predict optimal pricing using historical patterns
 */
export const predictOptimalPrice = (requestData) => {
  const { serviceType, vehicleType, duration, location } = requestData;
  
  // Get similar historical quotes
  const similarQuotes = getHistoricalQuotes({
    serviceType,
    vehicleType
  }).filter(q => q.accepted);

  if (similarQuotes.length === 0) {
    return null; // No historical data available
  }

  // Calculate weighted average based on similarity
  let totalWeight = 0;
  let weightedPriceSum = 0;

  similarQuotes.forEach(quote => {
    let weight = 1.0;
    
    // Duration similarity
    if (quote.duration === duration) weight *= 1.5;
    else weight *= 0.8;

    // Location similarity (simplified)
    if (quote.location.toLowerCase().includes(location.toLowerCase().split(' ')[0])) {
      weight *= 1.3;
    }

    // Recent quotes get higher weight
    const daysDiff = Math.abs(new Date() - new Date(quote.date)) / (1000 * 60 * 60 * 24);
    weight *= Math.exp(-daysDiff / 30); // Exponential decay over 30 days

    totalWeight += weight;
    weightedPriceSum += quote.finalPrice * weight;
  });

  const predictedPrice = weightedPriceSum / totalWeight;
  const confidence = Math.min(0.95, similarQuotes.length / 10); // Higher confidence with more data

  return {
    predictedPrice: Math.round(predictedPrice),
    confidence,
    basedOnQuotes: similarQuotes.length,
    factors: [
      `Based on ${similarQuotes.length} similar historical quotes`,
      `Average success rate: ${(similarQuotes.filter(q => q.accepted).length / similarQuotes.length * 100).toFixed(1)}%`
    ]
  };
};

// Helper functions
const getPriceRange = (price) => {
  if (price < 40) return '0-40';
  if (price < 60) return '40-60';
  if (price < 80) return '60-80';
  if (price < 100) return '80-100';
  return '100+';
};

const getCurrentSeason = () => {
  const month = new Date().getMonth();
  if (month >= 2 && month <= 4) return 'spring';
  if (month >= 5 && month <= 7) return 'summer';
  if (month >= 8 && month <= 10) return 'fall';
  return 'winter';
};

const generateInsights = (quotes, serviceType) => {
  const insights = [];
  
  // Price optimization insights
  const avgPrice = quotes.reduce((sum, q) => sum + q.quotedPrice, 0) / quotes.length;
  const avgFinalPrice = quotes.reduce((sum, q) => sum + q.finalPrice, 0) / quotes.length;
  
  if (avgFinalPrice < avgPrice * 0.95) {
    insights.push('Customers frequently negotiate prices down - consider starting with more competitive quotes');
  }

  // Conversion time insights
  const avgConversionTime = quotes.reduce((sum, q) => sum + q.conversionTime, 0) / quotes.length;
  if (avgConversionTime > 1800) { // 30 minutes
    insights.push('Long conversion times detected - consider simplifying the booking process');
  }

  // Satisfaction insights
  const avgSatisfaction = quotes.reduce((sum, q) => sum + q.customerSatisfaction, 0) / quotes.length;
  if (avgSatisfaction < 4.5) {
    insights.push('Customer satisfaction could be improved - review service quality');
  }

  // Seasonal insights
  const currentTrends = getServiceTypeTrends(serviceType);
  if (currentTrends.seasonalDemand > 1.2) {
    insights.push('High seasonal demand - consider premium pricing');
  } else if (currentTrends.seasonalDemand < 0.8) {
    insights.push('Low seasonal demand - consider promotional pricing');
  }

  return insights;
};

/**
 * Save a new quote to historical data (in a real app, this would save to database)
 */
export const saveQuoteToHistory = (quoteData) => {
  const newQuote = {
    id: HISTORICAL_QUOTES.length + 1,
    date: new Date().toISOString().split('T')[0],
    ...quoteData,
    timestamp: new Date().toISOString()
  };

  HISTORICAL_QUOTES.push(newQuote);
  return newQuote;
};

/**
 * Get performance metrics for the dashboard
 */
export const getPerformanceMetrics = (timeframe = '30d') => {
  const quotes = getHistoricalQuotes();
  const acceptedQuotes = quotes.filter(q => q.accepted);
  
  return {
    totalQuotes: quotes.length,
    acceptedQuotes: acceptedQuotes.length,
    conversionRate: quotes.length > 0 ? acceptedQuotes.length / quotes.length : 0,
    averageQuoteValue: acceptedQuotes.length > 0 ? 
      acceptedQuotes.reduce((sum, q) => sum + q.finalPrice, 0) / acceptedQuotes.length : 0,
    totalRevenue: acceptedQuotes.reduce((sum, q) => sum + q.finalPrice, 0),
    averageSatisfaction: acceptedQuotes.length > 0 ?
      acceptedQuotes.reduce((sum, q) => sum + q.customerSatisfaction, 0) / acceptedQuotes.length : 0,
    topServiceTypes: getTopServiceTypes(acceptedQuotes),
    recentTrends: getRecentTrends(quotes)
  };
};

const getTopServiceTypes = (quotes) => {
  const serviceTypeCounts = {};
  quotes.forEach(quote => {
    serviceTypeCounts[quote.serviceType] = (serviceTypeCounts[quote.serviceType] || 0) + 1;
  });
  
  return Object.entries(serviceTypeCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3)
    .map(([type, count]) => ({ type, count }));
};

const getRecentTrends = (quotes) => {
  // Calculate week-over-week trends
  const now = new Date();
  const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

  const thisWeekQuotes = quotes.filter(q => new Date(q.date) >= lastWeek);
  const lastWeekQuotes = quotes.filter(q => {
    const date = new Date(q.date);
    return date >= twoWeeksAgo && date < lastWeek;
  });

  return {
    quotesGrowth: lastWeekQuotes.length > 0 ? 
      (thisWeekQuotes.length - lastWeekQuotes.length) / lastWeekQuotes.length : 0,
    conversionGrowth: lastWeekQuotes.length > 0 ? 
      (thisWeekQuotes.filter(q => q.accepted).length / thisWeekQuotes.length) - 
      (lastWeekQuotes.filter(q => q.accepted).length / lastWeekQuotes.length) : 0
  };
};


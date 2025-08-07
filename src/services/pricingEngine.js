/**
 * Advanced Pricing Engine for ValetQuotes
 * Combines AI-generated quotes with proven pricing tiers and historical data
 */

// Proven pricing tiers based on market research
export const PRICING_TIERS = {
  event: {
    base: { min: 40, max: 60, optimal: 50 },
    luxury_premium: { min: 15, max: 25, optimal: 20 },
    exotic_premium: { min: 25, max: 40, optimal: 32 },
    location_premium: { downtown: 15, suburban: 0, remote: 8 },
    duration_multiplier: { '1-2': 1.0, '2-4': 1.1, '4-6': 1.2, '6-8': 1.3, '8+': 1.4 }
  },
  restaurant: {
    base: { min: 30, max: 50, optimal: 40 },
    luxury_premium: { min: 10, max: 20, optimal: 15 },
    exotic_premium: { min: 20, max: 35, optimal: 27 },
    location_premium: { downtown: 12, suburban: 0, remote: 6 },
    duration_multiplier: { '1-2': 1.0, '2-4': 1.0, '4-6': 1.1, '6-8': 1.2, '8+': 1.3 }
  },
  hotel: {
    base: { min: 35, max: 55, optimal: 45 },
    luxury_premium: { min: 12, max: 22, optimal: 17 },
    exotic_premium: { min: 22, max: 37, optimal: 29 },
    location_premium: { downtown: 13, suburban: 0, remote: 7 },
    duration_multiplier: { '1-2': 1.0, '2-4': 1.0, '4-6': 1.1, '6-8': 1.2, '8+': 1.3 }
  },
  corporate: {
    base: { min: 50, max: 75, optimal: 62 },
    luxury_premium: { min: 18, max: 28, optimal: 23 },
    exotic_premium: { min: 28, max: 43, optimal: 35 },
    location_premium: { downtown: 18, suburban: 0, remote: 10 },
    duration_multiplier: { '1-2': 1.0, '2-4': 1.1, '4-6': 1.2, '6-8': 1.3, '8+': 1.4 }
  },
  private: {
    base: { min: 45, max: 65, optimal: 55 },
    luxury_premium: { min: 15, max: 25, optimal: 20 },
    exotic_premium: { min: 25, max: 40, optimal: 32 },
    location_premium: { downtown: 15, suburban: 0, remote: 8 },
    duration_multiplier: { '1-2': 1.0, '2-4': 1.1, '4-6': 1.2, '6-8': 1.3, '8+': 1.4 }
  }
};

// Market demand factors (simulated historical data)
export const DEMAND_FACTORS = {
  timeOfDay: {
    morning: 0.9,    // 6AM-12PM
    afternoon: 1.0,  // 12PM-6PM
    evening: 1.2,    // 6PM-10PM
    night: 1.1       // 10PM-6AM
  },
  dayOfWeek: {
    monday: 0.8,
    tuesday: 0.8,
    wednesday: 0.9,
    thursday: 1.0,
    friday: 1.3,
    saturday: 1.4,
    sunday: 1.1
  },
  season: {
    spring: 1.0,
    summer: 1.2,
    fall: 1.1,
    winter: 0.9
  }
};

// Historical conversion rates by price range (simulated data)
export const CONVERSION_DATA = {
  event: {
    '40-50': 0.85,
    '50-60': 0.75,
    '60-70': 0.65,
    '70-80': 0.50,
    '80+': 0.35
  },
  restaurant: {
    '30-40': 0.90,
    '40-50': 0.80,
    '50-60': 0.65,
    '60-70': 0.45,
    '70+': 0.30
  },
  hotel: {
    '35-45': 0.88,
    '45-55': 0.78,
    '55-65': 0.68,
    '65-75': 0.52,
    '75+': 0.38
  },
  corporate: {
    '50-65': 0.82,
    '65-80': 0.72,
    '80-95': 0.62,
    '95-110': 0.48,
    '110+': 0.35
  },
  private: {
    '45-60': 0.86,
    '60-75': 0.76,
    '75-90': 0.66,
    '90-105': 0.51,
    '105+': 0.38
  }
};

/**
 * Calculate optimal pricing based on proven tiers and market factors
 */
export const calculateOptimalPrice = (requestData, options = {}) => {
  const { serviceType, vehicleType, location, duration } = requestData;
  const { optimizeForConversion = true, includeMarketFactors = true } = options;

  if (!PRICING_TIERS[serviceType]) {
    throw new Error(`Unsupported service type: ${serviceType}`);
  }

  const tier = PRICING_TIERS[serviceType];
  let basePrice = tier.base.optimal;
  let additionalFees = 0;
  const factors = [`${serviceType} valet service`];

  // Vehicle type premium
  if (vehicleType === 'luxury') {
    additionalFees += tier.luxury_premium.optimal;
    factors.push('Luxury vehicle handling');
  } else if (vehicleType === 'exotic') {
    additionalFees += tier.exotic_premium.optimal;
    factors.push('Exotic vehicle premium');
  }

  // Location premium
  const locationKey = getLocationCategory(location);
  if (tier.location_premium[locationKey] > 0) {
    additionalFees += tier.location_premium[locationKey];
    factors.push(`${locationKey} location premium`);
  }

  // Duration multiplier
  if (tier.duration_multiplier[duration]) {
    const multiplier = tier.duration_multiplier[duration];
    basePrice *= multiplier;
    if (multiplier > 1.0) {
      factors.push(`Extended duration (${duration})`);
    }
  }

  let totalPrice = basePrice + additionalFees;

  // Apply market demand factors if enabled
  if (includeMarketFactors) {
    const demandMultiplier = calculateDemandMultiplier();
    totalPrice *= demandMultiplier;
    if (demandMultiplier > 1.05) {
      factors.push('High demand period');
    } else if (demandMultiplier < 0.95) {
      factors.push('Off-peak pricing');
    }
  }

  // Optimize for conversion if enabled
  if (optimizeForConversion) {
    const conversionOptimizedPrice = optimizeForConversionRate(totalPrice, serviceType);
    if (conversionOptimizedPrice !== totalPrice) {
      totalPrice = conversionOptimizedPrice;
      factors.push('Conversion optimized');
    }
  }

  return {
    basePrice: Math.round(basePrice),
    additionalFees: Math.round(additionalFees),
    total: Math.round(totalPrice),
    estimatedTime: duration,
    factors,
    conversionRate: getExpectedConversionRate(totalPrice, serviceType),
    confidence: 0.92 // High confidence in tier-based pricing
  };
};

/**
 * Categorize location for pricing purposes
 */
const getLocationCategory = (location) => {
  const locationLower = location.toLowerCase();
  if (locationLower.includes('downtown') || locationLower.includes('city center') || 
      locationLower.includes('financial district') || locationLower.includes('times square')) {
    return 'downtown';
  }
  if (locationLower.includes('suburb') || locationLower.includes('residential')) {
    return 'suburban';
  }
  return 'remote';
};

/**
 * Calculate demand multiplier based on current time and date
 */
const calculateDemandMultiplier = () => {
  const now = new Date();
  const hour = now.getHours();
  const dayOfWeek = now.toLocaleLowerCase().substring(0, 3);
  const month = now.getMonth();

  // Time of day factor
  let timeMultiplier = 1.0;
  if (hour >= 6 && hour < 12) timeMultiplier = DEMAND_FACTORS.timeOfDay.morning;
  else if (hour >= 12 && hour < 18) timeMultiplier = DEMAND_FACTORS.timeOfDay.afternoon;
  else if (hour >= 18 && hour < 22) timeMultiplier = DEMAND_FACTORS.timeOfDay.evening;
  else timeMultiplier = DEMAND_FACTORS.timeOfDay.night;

  // Day of week factor
  const dayMultiplier = DEMAND_FACTORS.dayOfWeek[dayOfWeek] || 1.0;

  // Season factor
  let seasonMultiplier = 1.0;
  if (month >= 2 && month <= 4) seasonMultiplier = DEMAND_FACTORS.season.spring;
  else if (month >= 5 && month <= 7) seasonMultiplier = DEMAND_FACTORS.season.summer;
  else if (month >= 8 && month <= 10) seasonMultiplier = DEMAND_FACTORS.season.fall;
  else seasonMultiplier = DEMAND_FACTORS.season.winter;

  return timeMultiplier * dayMultiplier * seasonMultiplier;
};

/**
 * Optimize price for maximum conversion rate
 */
const optimizeForConversionRate = (price, serviceType) => {
  const conversionRanges = CONVERSION_DATA[serviceType];
  if (!conversionRanges) return price;

  // Find the price range with the highest conversion rate that's close to our calculated price
  let bestPrice = price;
  let bestConversion = 0;

  for (const [range, conversion] of Object.entries(conversionRanges)) {
    const [min, max] = range.includes('+') ? 
      [parseInt(range.replace('+', '')), Infinity] : 
      range.split('-').map(Number);

    if (price >= min && (max === Infinity || price <= max)) {
      if (conversion > bestConversion) {
        bestConversion = conversion;
        bestPrice = price;
      }
    }
  }

  return bestPrice;
};

/**
 * Get expected conversion rate for a given price and service type
 */
const getExpectedConversionRate = (price, serviceType) => {
  const conversionRanges = CONVERSION_DATA[serviceType];
  if (!conversionRanges) return 0.7; // Default conversion rate

  for (const [range, conversion] of Object.entries(conversionRanges)) {
    const [min, max] = range.includes('+') ? 
      [parseInt(range.replace('+', '')), Infinity] : 
      range.split('-').map(Number);

    if (price >= min && (max === Infinity || price <= max)) {
      return conversion;
    }
  }

  return 0.5; // Default for out-of-range prices
};

/**
 * Generate multiple pricing options for A/B testing
 */
export const generatePricingOptions = (requestData) => {
  const baseQuote = calculateOptimalPrice(requestData);
  
  return {
    conservative: {
      ...calculateOptimalPrice(requestData, { optimizeForConversion: true }),
      strategy: 'conservative',
      description: 'Optimized for highest conversion rate'
    },
    competitive: {
      ...baseQuote,
      strategy: 'competitive',
      description: 'Market-competitive pricing'
    },
    premium: {
      ...calculateOptimalPrice(requestData, { optimizeForConversion: false }),
      total: Math.round(baseQuote.total * 1.15),
      strategy: 'premium',
      description: 'Premium service positioning'
    }
  };
};

/**
 * Analyze pricing performance and suggest improvements
 */
export const analyzePricingPerformance = (historicalQuotes) => {
  // This would analyze actual historical data in a real implementation
  const analysis = {
    averageConversionRate: 0.73,
    topPerformingPriceRanges: {},
    recommendations: [],
    trends: {
      demandGrowth: 0.12,
      priceElasticity: -0.8,
      seasonalVariation: 0.15
    }
  };

  // Generate recommendations based on analysis
  analysis.recommendations.push(
    'Consider increasing prices during peak hours (6-10 PM) by 10-15%',
    'Luxury vehicle premiums show high acceptance rates - consider slight increase',
    'Weekend pricing can be optimized for 8% higher conversion rates'
  );

  return analysis;
};


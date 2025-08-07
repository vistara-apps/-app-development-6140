import OpenAI from 'openai';
import { calculateOptimalPrice, generatePricingOptions } from './pricingEngine.js';
import { predictOptimalPrice, getPricingInsights, saveQuoteToHistory } from './historicalDataService.js';

const openai = new OpenAI({
  apiKey: "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",
  baseURL: "https://openrouter.ai/api/v1",
  dangerouslyAllowBrowser: true,
});

export const generateQuote = async (requestData, options = {}) => {
  const { useAI = true, strategy = 'hybrid' } = options;
  
  try {
    // Get historical insights and predictions
    const historicalPrediction = predictOptimalPrice(requestData);
    const pricingInsights = getPricingInsights(requestData.serviceType);
    
    // Generate tier-based pricing
    const tierBasedQuote = calculateOptimalPrice(requestData);
    
    let finalQuote = tierBasedQuote;

    if (useAI && strategy === 'hybrid') {
      // Use AI to refine the tier-based pricing with market context
      const aiQuote = await generateAIEnhancedQuote(requestData, tierBasedQuote, historicalPrediction, pricingInsights);
      
      if (aiQuote && aiQuote.confidence > 0.7) {
        // Blend AI suggestions with tier-based pricing
        finalQuote = blendQuotes(tierBasedQuote, aiQuote, historicalPrediction);
      }
    } else if (strategy === 'ai-only' && useAI) {
      // Pure AI-generated quote
      const aiQuote = await generateAIEnhancedQuote(requestData, tierBasedQuote, historicalPrediction, pricingInsights);
      if (aiQuote) finalQuote = aiQuote;
    }

    // Add market intelligence
    finalQuote.marketInsights = {
      competitorAverage: pricingInsights.competitorData?.avg || 'N/A',
      historicalSuccess: historicalPrediction?.confidence || 0,
      conversionProbability: finalQuote.conversionRate || 0.7,
      priceOptimization: 'Optimized for conversion and profitability'
    };

    // Save quote attempt for future learning
    saveQuoteToHistory({
      ...requestData,
      quotedPrice: finalQuote.total,
      strategy,
      aiUsed: useAI,
      timestamp: new Date().toISOString()
    });

    return finalQuote;
    
  } catch (error) {
    console.error('Enhanced AI service error:', error);
    // Fallback to tier-based pricing
    const fallbackQuote = calculateOptimalPrice(requestData);
    fallbackQuote.fallbackUsed = true;
    fallbackQuote.factors.push('Fallback pricing due to service error');
    return fallbackQuote;
  }
};

/**
 * Generate AI-enhanced quote with market context
 */
const generateAIEnhancedQuote = async (requestData, tierBasedQuote, historicalPrediction, pricingInsights) => {
  const prompt = `
You are an expert valet service pricing analyst with access to comprehensive market data. Generate an optimized quote based on:

CUSTOMER REQUEST:
- Location: ${requestData.location}
- Service Type: ${requestData.serviceType}
- Vehicle: ${requestData.vehicleMake} ${requestData.vehicleModel} (${requestData.vehicleType})
- Duration: ${requestData.duration}
- Customer: ${requestData.name}

MARKET INTELLIGENCE:
- Tier-based optimal price: $${tierBasedQuote.total}
- Historical prediction: ${historicalPrediction ? `$${historicalPrediction.predictedPrice} (${(historicalPrediction.confidence * 100).toFixed(1)}% confidence)` : 'No historical data'}
- Market average for ${requestData.serviceType}: $${pricingInsights.competitorData?.avg || 'N/A'}
- Historical conversion rate: ${(pricingInsights.conversionRate * 100).toFixed(1)}%
- Current market insights: ${pricingInsights.insights.join('; ')}

PRICING STRATEGY:
Focus on conversion optimization while maintaining profitability. Consider:
- Current market demand and seasonal factors
- Customer price sensitivity for this service type
- Competitive positioning
- Historical success patterns

Provide a response in this exact JSON format:
{
  "basePrice": [number],
  "additionalFees": [number],
  "total": [number],
  "estimatedTime": "${requestData.duration}",
  "factors": ["factor1", "factor2", "factor3"],
  "confidence": [0.0-1.0],
  "reasoning": "Brief explanation of pricing strategy",
  "conversionRate": [0.0-1.0]
}

Make the pricing data-driven and conversion-optimized.
`;

  try {
    const completion = await openai.chat.completions.create({
      model: "google/gemini-2.0-flash-001",
      messages: [
        {
          role: "system",
          content: "You are a data-driven valet service pricing expert with access to comprehensive market intelligence. Your goal is to optimize quotes for both conversion and profitability using historical data and market trends."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.3, // Lower temperature for more consistent pricing
      max_tokens: 400
    });

    const response = completion.choices[0].message.content;
    
    // Try to parse JSON response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const aiQuote = JSON.parse(jsonMatch[0]);
      
      // Validate AI response
      if (aiQuote.total && aiQuote.total > 0 && aiQuote.confidence) {
        return aiQuote;
      }
    }
  } catch (parseError) {
    console.warn('Failed to parse AI response:', parseError);
  }

  return null;
};

/**
 * Blend different pricing approaches for optimal results
 */
const blendQuotes = (tierQuote, aiQuote, historicalPrediction) => {
  const weights = {
    tier: 0.4,
    ai: 0.4,
    historical: 0.2
  };

  // Calculate weighted average price
  let weightedPrice = tierQuote.total * weights.tier + aiQuote.total * weights.ai;
  
  if (historicalPrediction && historicalPrediction.confidence > 0.5) {
    weightedPrice += historicalPrediction.predictedPrice * weights.historical;
  } else {
    // Redistribute historical weight to tier and AI
    weightedPrice = tierQuote.total * (weights.tier + weights.historical/2) + 
                   aiQuote.total * (weights.ai + weights.historical/2);
  }

  // Combine factors from all sources
  const combinedFactors = [
    ...tierQuote.factors,
    'AI market analysis',
    historicalPrediction ? 'Historical data optimization' : 'Market trend analysis'
  ];

  return {
    basePrice: Math.round(tierQuote.basePrice),
    additionalFees: Math.round(weightedPrice - tierQuote.basePrice),
    total: Math.round(weightedPrice),
    estimatedTime: tierQuote.estimatedTime,
    factors: combinedFactors,
    confidence: Math.min(0.95, (tierQuote.confidence + aiQuote.confidence) / 2),
    conversionRate: Math.max(tierQuote.conversionRate, aiQuote.conversionRate),
    strategy: 'hybrid',
    reasoning: aiQuote.reasoning || 'Optimized blend of tier-based and AI pricing'
  };
};

/**
 * Generate multiple quote options for A/B testing
 */
export const generateQuoteOptions = async (requestData) => {
  try {
    const options = generatePricingOptions(requestData);
    
    // Enhance each option with AI if available
    for (const [key, option] of Object.entries(options)) {
      try {
        const aiEnhancement = await generateAIEnhancedQuote(
          requestData, 
          option, 
          predictOptimalPrice(requestData),
          getPricingInsights(requestData.serviceType)
        );
        
        if (aiEnhancement && key === 'competitive') {
          // Apply AI enhancement to the competitive option
          options[key] = {
            ...option,
            aiEnhanced: true,
            reasoning: aiEnhancement.reasoning
          };
        }
      } catch (error) {
        console.warn(`Failed to enhance ${key} option with AI:`, error);
      }
    }

    return options;
  } catch (error) {
    console.error('Error generating quote options:', error);
    return generatePricingOptions(requestData);
  }
};

/**
 * Analyze quote performance and provide recommendations
 */
export const analyzeQuotePerformance = (quoteId, outcome) => {
  // This would analyze the performance of a specific quote
  // and provide insights for future improvements
  const analysis = {
    quoteId,
    outcome,
    recommendations: [],
    learnings: []
  };

  if (outcome.accepted) {
    analysis.learnings.push('Pricing strategy was successful');
    if (outcome.conversionTime < 600) { // 10 minutes
      analysis.learnings.push('Quick conversion indicates competitive pricing');
    }
  } else {
    analysis.recommendations.push('Consider more competitive pricing for similar requests');
    analysis.recommendations.push('Analyze competitor pricing in this market segment');
  }

  return analysis;
};

const generateFallbackQuote = (requestData) => {
  // Fallback pricing logic
  let basePrice = 45;
  let additionalFees = 10;
  const factors = [];

  // Service type pricing
  switch (requestData.serviceType) {
    case 'event':
      basePrice = 50;
      factors.push('Event valet service');
      break;
    case 'restaurant':
      basePrice = 40;
      factors.push('Restaurant valet service');
      break;
    case 'hotel':
      basePrice = 45;
      factors.push('Hotel valet service');
      break;
    case 'corporate':
      basePrice = 60;
      factors.push('Corporate event premium');
      break;
    case 'private':
      basePrice = 55;
      factors.push('Private party service');
      break;
  }

  // Vehicle type adjustments
  if (requestData.vehicleType === 'luxury' || requestData.vehicleType === 'exotic') {
    additionalFees += 20;
    factors.push('Luxury vehicle handling');
  }

  // Duration adjustments
  if (requestData.duration === '6-8' || requestData.duration === '8+') {
    additionalFees += 15;
    factors.push('Extended service duration');
  }

  // Location considerations (simplified)
  if (requestData.location.toLowerCase().includes('downtown')) {
    additionalFees += 15;
    factors.push('Prime downtown location');
  }

  return {
    basePrice,
    additionalFees,
    total: basePrice + additionalFees,
    estimatedTime: requestData.duration,
    factors
  };
};

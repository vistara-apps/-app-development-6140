import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: "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",
  baseURL: "https://openrouter.ai/api/v1",
  dangerouslyAllowBrowser: true,
});

export const generateQuote = async (requestData) => {
  try {
    const prompt = `
Generate a realistic valet service quote based on the following customer request:

Location: ${requestData.location}
Service Type: ${requestData.serviceType}
Vehicle: ${requestData.vehicleMake} ${requestData.vehicleModel} (${requestData.vehicleType})
Duration: ${requestData.duration}
Customer: ${requestData.name}

Consider these factors for pricing:
- Base rates: Event Valet ($40-60), Restaurant Valet ($30-50), Hotel Valet ($35-55), Corporate Event ($50-75), Private Party ($45-65)
- Vehicle type premiums: Luxury (+$15-25), Exotic (+$25-40), Standard (no premium)
- Location factors: Downtown/high-traffic areas (+$10-20), suburban (standard), remote (+$5-15)
- Duration: longer events may have volume discounts

Provide a response in this exact JSON format:
{
  "basePrice": [number],
  "additionalFees": [number],
  "total": [number],
  "estimatedTime": "[duration string]",
  "factors": ["factor1", "factor2", "factor3"]
}

Make the pricing realistic and competitive. Factors should explain the pricing decisions.
`;

    const completion = await openai.chat.completions.create({
      model: "google/gemini-2.0-flash-001",
      messages: [
        {
          role: "system",
          content: "You are a valet service pricing expert. Generate accurate, competitive quotes based on market rates and service factors."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 300
    });

    const response = completion.choices[0].message.content;
    
    // Try to parse JSON response
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (parseError) {
      console.warn('Failed to parse AI response, using fallback');
    }

    // Fallback quote generation
    return generateFallbackQuote(requestData);
    
  } catch (error) {
    console.error('AI service error:', error);
    return generateFallbackQuote(requestData);
  }
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
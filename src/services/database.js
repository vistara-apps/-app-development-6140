/**
 * Database Service for ValetQuotes
 * Handles all database operations using Supabase
 */

import { useSupabase } from '../contexts/SupabaseContext';

// Database table names
export const TABLES = {
  QUOTES: 'quotes',
  CUSTOMERS: 'customers',
  OPERATORS: 'operators',
  HISTORICAL_DATA: 'historical_data',
  ANALYTICS: 'analytics',
  PRICING_RULES: 'pricing_rules'
};

/**
 * Quote Management
 */
export class QuoteService {
  constructor(supabase) {
    this.supabase = supabase;
  }

  async createQuote(quoteData) {
    try {
      const { data, error } = await this.supabase
        .from(TABLES.QUOTES)
        .insert([{
          customer_name: quoteData.name,
          customer_email: quoteData.email,
          customer_phone: quoteData.phone,
          service_type: quoteData.serviceType,
          location: quoteData.location,
          vehicle_make: quoteData.vehicleMake,
          vehicle_model: quoteData.vehicleModel,
          vehicle_type: quoteData.vehicleType,
          duration: quoteData.duration,
          base_price: quoteData.basePrice,
          additional_fees: quoteData.additionalFees,
          total_price: quoteData.total,
          factors: quoteData.factors,
          confidence: quoteData.confidence,
          conversion_rate: quoteData.conversionRate,
          strategy: quoteData.strategy,
          status: 'pending',
          created_at: new Date().toISOString(),
          market_insights: quoteData.marketInsights
        }])
        .select();

      if (error) throw error;
      return data[0];
    } catch (error) {
      console.error('Error creating quote:', error);
      throw error;
    }
  }

  async updateQuoteStatus(quoteId, status, additionalData = {}) {
    try {
      const updateData = {
        status,
        updated_at: new Date().toISOString(),
        ...additionalData
      };

      const { data, error } = await this.supabase
        .from(TABLES.QUOTES)
        .update(updateData)
        .eq('id', quoteId)
        .select();

      if (error) throw error;
      return data[0];
    } catch (error) {
      console.error('Error updating quote status:', error);
      throw error;
    }
  }

  async getQuotes(filters = {}) {
    try {
      let query = this.supabase
        .from(TABLES.QUOTES)
        .select('*')
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      if (filters.serviceType) {
        query = query.eq('service_type', filters.serviceType);
      }
      if (filters.dateRange) {
        query = query
          .gte('created_at', filters.dateRange.start)
          .lte('created_at', filters.dateRange.end);
      }
      if (filters.limit) {
        query = query.limit(filters.limit);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching quotes:', error);
      throw error;
    }
  }

  async getQuoteById(quoteId) {
    try {
      const { data, error } = await this.supabase
        .from(TABLES.QUOTES)
        .select('*')
        .eq('id', quoteId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching quote:', error);
      throw error;
    }
  }
}

/**
 * Analytics Service
 */
export class AnalyticsService {
  constructor(supabase) {
    this.supabase = supabase;
  }

  async getConversionMetrics(timeframe = '30d') {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(timeframe));

      const { data, error } = await this.supabase
        .from(TABLES.QUOTES)
        .select('status, total_price, service_type, created_at')
        .gte('created_at', startDate.toISOString());

      if (error) throw error;

      // Calculate metrics
      const totalQuotes = data.length;
      const acceptedQuotes = data.filter(q => q.status === 'accepted').length;
      const conversionRate = totalQuotes > 0 ? acceptedQuotes / totalQuotes : 0;
      const totalRevenue = data
        .filter(q => q.status === 'accepted')
        .reduce((sum, q) => sum + q.total_price, 0);

      // Group by service type
      const byServiceType = {};
      data.forEach(quote => {
        if (!byServiceType[quote.service_type]) {
          byServiceType[quote.service_type] = { total: 0, accepted: 0, revenue: 0 };
        }
        byServiceType[quote.service_type].total++;
        if (quote.status === 'accepted') {
          byServiceType[quote.service_type].accepted++;
          byServiceType[quote.service_type].revenue += quote.total_price;
        }
      });

      return {
        totalQuotes,
        acceptedQuotes,
        conversionRate,
        totalRevenue,
        averageQuoteValue: acceptedQuotes > 0 ? totalRevenue / acceptedQuotes : 0,
        byServiceType
      };
    } catch (error) {
      console.error('Error fetching conversion metrics:', error);
      throw error;
    }
  }

  async getPricingInsights(serviceType) {
    try {
      const { data, error } = await this.supabase
        .from(TABLES.QUOTES)
        .select('total_price, status, created_at')
        .eq('service_type', serviceType)
        .eq('status', 'accepted')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;

      if (data.length === 0) {
        return {
          averagePrice: 0,
          priceRange: { min: 0, max: 0 },
          conversionRate: 0,
          insights: ['Insufficient data for analysis']
        };
      }

      const prices = data.map(q => q.total_price);
      const averagePrice = prices.reduce((sum, price) => sum + price, 0) / prices.length;
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);

      return {
        averagePrice: Math.round(averagePrice),
        priceRange: { min: minPrice, max: maxPrice },
        conversionRate: 1.0, // These are all accepted quotes
        sampleSize: data.length,
        insights: this.generatePricingInsights(data, serviceType)
      };
    } catch (error) {
      console.error('Error fetching pricing insights:', error);
      throw error;
    }
  }

  generatePricingInsights(data, serviceType) {
    const insights = [];
    
    if (data.length < 10) {
      insights.push('Limited data available - consider gathering more quotes for better insights');
    }

    const recentData = data.slice(0, 20);
    const olderData = data.slice(20, 40);

    if (recentData.length > 0 && olderData.length > 0) {
      const recentAvg = recentData.reduce((sum, q) => sum + q.total_price, 0) / recentData.length;
      const olderAvg = olderData.reduce((sum, q) => sum + q.total_price, 0) / olderData.length;
      
      if (recentAvg > olderAvg * 1.1) {
        insights.push('Pricing trend is upward - market may support higher prices');
      } else if (recentAvg < olderAvg * 0.9) {
        insights.push('Pricing trend is downward - consider market competition analysis');
      }
    }

    return insights;
  }

  async saveAnalyticsEvent(eventType, eventData) {
    try {
      const { data, error } = await this.supabase
        .from(TABLES.ANALYTICS)
        .insert([{
          event_type: eventType,
          event_data: eventData,
          timestamp: new Date().toISOString()
        }]);

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error saving analytics event:', error);
      throw error;
    }
  }
}

/**
 * Customer Service
 */
export class CustomerService {
  constructor(supabase) {
    this.supabase = supabase;
  }

  async createOrUpdateCustomer(customerData) {
    try {
      // Check if customer exists
      const { data: existingCustomer } = await this.supabase
        .from(TABLES.CUSTOMERS)
        .select('*')
        .eq('email', customerData.email)
        .single();

      if (existingCustomer) {
        // Update existing customer
        const { data, error } = await this.supabase
          .from(TABLES.CUSTOMERS)
          .update({
            name: customerData.name,
            phone: customerData.phone,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingCustomer.id)
          .select();

        if (error) throw error;
        return data[0];
      } else {
        // Create new customer
        const { data, error } = await this.supabase
          .from(TABLES.CUSTOMERS)
          .insert([{
            name: customerData.name,
            email: customerData.email,
            phone: customerData.phone,
            created_at: new Date().toISOString()
          }])
          .select();

        if (error) throw error;
        return data[0];
      }
    } catch (error) {
      console.error('Error creating/updating customer:', error);
      throw error;
    }
  }

  async getCustomerHistory(customerId) {
    try {
      const { data, error } = await this.supabase
        .from(TABLES.QUOTES)
        .select('*')
        .eq('customer_id', customerId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching customer history:', error);
      throw error;
    }
  }
}

/**
 * Real-time subscriptions
 */
export class RealtimeService {
  constructor(supabase) {
    this.supabase = supabase;
    this.subscriptions = new Map();
  }

  subscribeToQuotes(callback) {
    const subscription = this.supabase
      .channel('quotes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: TABLES.QUOTES },
        callback
      )
      .subscribe();

    this.subscriptions.set('quotes', subscription);
    return subscription;
  }

  subscribeToAnalytics(callback) {
    const subscription = this.supabase
      .channel('analytics')
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: TABLES.ANALYTICS },
        callback
      )
      .subscribe();

    this.subscriptions.set('analytics', subscription);
    return subscription;
  }

  unsubscribe(channelName) {
    const subscription = this.subscriptions.get(channelName);
    if (subscription) {
      this.supabase.removeChannel(subscription);
      this.subscriptions.delete(channelName);
    }
  }

  unsubscribeAll() {
    this.subscriptions.forEach((subscription, channelName) => {
      this.supabase.removeChannel(subscription);
    });
    this.subscriptions.clear();
  }
}

/**
 * Database initialization and schema setup
 */
export const initializeDatabase = async (supabase) => {
  // This would typically be handled by migrations in a production environment
  // For demo purposes, we'll provide the SQL schema
  
  const schema = `
    -- Customers table
    CREATE TABLE IF NOT EXISTS customers (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      phone VARCHAR(50),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- Quotes table
    CREATE TABLE IF NOT EXISTS quotes (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      customer_id UUID REFERENCES customers(id),
      customer_name VARCHAR(255) NOT NULL,
      customer_email VARCHAR(255) NOT NULL,
      customer_phone VARCHAR(50),
      service_type VARCHAR(50) NOT NULL,
      location TEXT NOT NULL,
      vehicle_make VARCHAR(100),
      vehicle_model VARCHAR(100),
      vehicle_type VARCHAR(50),
      duration VARCHAR(20),
      base_price DECIMAL(10,2),
      additional_fees DECIMAL(10,2),
      total_price DECIMAL(10,2) NOT NULL,
      factors JSONB,
      confidence DECIMAL(3,2),
      conversion_rate DECIMAL(3,2),
      strategy VARCHAR(50),
      status VARCHAR(20) DEFAULT 'pending',
      market_insights JSONB,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- Analytics table
    CREATE TABLE IF NOT EXISTS analytics (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      event_type VARCHAR(100) NOT NULL,
      event_data JSONB,
      timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- Historical data table
    CREATE TABLE IF NOT EXISTS historical_data (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      quote_id UUID REFERENCES quotes(id),
      service_type VARCHAR(50),
      vehicle_type VARCHAR(50),
      location_category VARCHAR(50),
      quoted_price DECIMAL(10,2),
      final_price DECIMAL(10,2),
      accepted BOOLEAN,
      conversion_time INTEGER,
      customer_satisfaction DECIMAL(2,1),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- Pricing rules table
    CREATE TABLE IF NOT EXISTS pricing_rules (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      service_type VARCHAR(50) NOT NULL,
      rule_type VARCHAR(50) NOT NULL,
      rule_data JSONB NOT NULL,
      active BOOLEAN DEFAULT true,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- Indexes for better performance
    CREATE INDEX IF NOT EXISTS idx_quotes_status ON quotes(status);
    CREATE INDEX IF NOT EXISTS idx_quotes_service_type ON quotes(service_type);
    CREATE INDEX IF NOT EXISTS idx_quotes_created_at ON quotes(created_at);
    CREATE INDEX IF NOT EXISTS idx_historical_data_service_type ON historical_data(service_type);
    CREATE INDEX IF NOT EXISTS idx_analytics_event_type ON analytics(event_type);
  `;

  console.log('Database schema for ValetQuotes:');
  console.log(schema);
  
  return schema;
};

/**
 * Hook for using database services
 */
export const useDatabase = () => {
  const supabase = useSupabase();
  
  return {
    quotes: new QuoteService(supabase),
    analytics: new AnalyticsService(supabase),
    customers: new CustomerService(supabase),
    realtime: new RealtimeService(supabase)
  };
};


import apiService from './apiService.js';
import { generateQuote as generateAIQuote } from './aiService.js';

// Enhanced quote service that combines AI generation with database persistence
export class QuoteService {
  // Generate quote using AI and save to database
  static async generateAndSaveQuote(requestData) {
    try {
      // First, generate the quote using AI
      const aiQuote = await generateAIQuote(requestData);
      
      // Prepare quote data for database
      const quoteData = {
        customer_name: requestData.name,
        customer_email: requestData.email,
        customer_phone: requestData.phone || null,
        location: requestData.location,
        service_type: requestData.serviceType,
        vehicle_make: requestData.vehicleMake || null,
        vehicle_model: requestData.vehicleModel || null,
        vehicle_type: requestData.vehicleType || 'standard',
        duration: requestData.duration,
        event_date: requestData.eventDate || null,
        base_price: aiQuote.basePrice,
        additional_fees: aiQuote.additionalFees || 0,
        total_price: aiQuote.total,
        pricing_factors: aiQuote.factors || [],
        status: 'pending',
        notes: `AI-generated quote. Estimated time: ${aiQuote.estimatedTime || requestData.duration}`
      };

      // Save to database
      const response = await apiService.createQuote(quoteData);
      
      if (response.success) {
        return {
          success: true,
          quote: response.data,
          aiQuote: aiQuote
        };
      } else {
        throw new Error(response.error || 'Failed to save quote');
      }
    } catch (error) {
      console.error('Error generating and saving quote:', error);
      
      // If database save fails, still return the AI-generated quote
      try {
        const aiQuote = await generateAIQuote(requestData);
        return {
          success: false,
          error: error.message,
          aiQuote: aiQuote,
          fallback: true
        };
      } catch (aiError) {
        console.error('AI quote generation also failed:', aiError);
        return {
          success: false,
          error: 'Failed to generate quote',
          aiQuote: null
        };
      }
    }
  }

  // Get all quotes with optional filters
  static async getQuotes(page = 1, limit = 10, filters = {}) {
    try {
      const response = await apiService.getQuotes(page, limit, filters);
      return response;
    } catch (error) {
      console.error('Error fetching quotes:', error);
      throw error;
    }
  }

  // Get single quote by ID
  static async getQuote(id) {
    try {
      const response = await apiService.getQuote(id);
      return response;
    } catch (error) {
      console.error('Error fetching quote:', error);
      throw error;
    }
  }

  // Update quote
  static async updateQuote(id, updateData) {
    try {
      const response = await apiService.updateQuote(id, updateData);
      return response;
    } catch (error) {
      console.error('Error updating quote:', error);
      throw error;
    }
  }

  // Update quote status
  static async updateQuoteStatus(id, status) {
    try {
      const response = await apiService.updateQuoteStatus(id, status);
      return response;
    } catch (error) {
      console.error('Error updating quote status:', error);
      throw error;
    }
  }

  // Delete quote
  static async deleteQuote(id) {
    try {
      const response = await apiService.deleteQuote(id);
      return response;
    } catch (error) {
      console.error('Error deleting quote:', error);
      throw error;
    }
  }

  // Duplicate quote
  static async duplicateQuote(id) {
    try {
      const response = await apiService.duplicateQuote(id);
      return response;
    } catch (error) {
      console.error('Error duplicating quote:', error);
      throw error;
    }
  }

  // Get quote statistics
  static async getQuoteStats() {
    try {
      const response = await apiService.getQuoteStats();
      return response;
    } catch (error) {
      console.error('Error fetching quote stats:', error);
      throw error;
    }
  }

  // Approve quote
  static async approveQuote(id, notes = '') {
    try {
      const updateData = { status: 'approved' };
      if (notes) {
        updateData.notes = notes;
      }
      
      const response = await apiService.updateQuote(id, updateData);
      return response;
    } catch (error) {
      console.error('Error approving quote:', error);
      throw error;
    }
  }

  // Reject quote
  static async rejectQuote(id, reason = '') {
    try {
      const updateData = { status: 'rejected' };
      if (reason) {
        updateData.notes = reason;
      }
      
      const response = await apiService.updateQuote(id, updateData);
      return response;
    } catch (error) {
      console.error('Error rejecting quote:', error);
      throw error;
    }
  }

  // Cancel quote
  static async cancelQuote(id, reason = '') {
    try {
      const updateData = { status: 'cancelled' };
      if (reason) {
        updateData.notes = reason;
      }
      
      const response = await apiService.updateQuote(id, updateData);
      return response;
    } catch (error) {
      console.error('Error cancelling quote:', error);
      throw error;
    }
  }

  // Get quotes by status
  static async getQuotesByStatus(status, page = 1, limit = 10) {
    try {
      const response = await apiService.getQuotes(page, limit, { status });
      return response;
    } catch (error) {
      console.error('Error fetching quotes by status:', error);
      throw error;
    }
  }

  // Get quotes by service type
  static async getQuotesByServiceType(serviceType, page = 1, limit = 10) {
    try {
      const response = await apiService.getQuotes(page, limit, { service_type: serviceType });
      return response;
    } catch (error) {
      console.error('Error fetching quotes by service type:', error);
      throw error;
    }
  }

  // Get quotes by customer email
  static async getQuotesByCustomer(customerEmail, page = 1, limit = 10) {
    try {
      const response = await apiService.getQuotes(page, limit, { customer_email: customerEmail });
      return response;
    } catch (error) {
      console.error('Error fetching quotes by customer:', error);
      throw error;
    }
  }

  // Search quotes
  static async searchQuotes(searchTerm, page = 1, limit = 10) {
    try {
      // Search in customer email for now
      const response = await apiService.getQuotes(page, limit, { customer_email: searchTerm });
      return response;
    } catch (error) {
      console.error('Error searching quotes:', error);
      throw error;
    }
  }

  // Format quote for display
  static formatQuote(quote) {
    return {
      ...quote,
      formattedTotal: `$${parseFloat(quote.total_price).toFixed(2)}`,
      formattedBasePrice: `$${parseFloat(quote.base_price).toFixed(2)}`,
      formattedAdditionalFees: `$${parseFloat(quote.additional_fees || 0).toFixed(2)}`,
      statusDisplay: quote.status.charAt(0).toUpperCase() + quote.status.slice(1),
      serviceTypeDisplay: quote.service_type.charAt(0).toUpperCase() + quote.service_type.slice(1),
      vehicleTypeDisplay: quote.vehicle_type ? quote.vehicle_type.charAt(0).toUpperCase() + quote.vehicle_type.slice(1) : 'Standard',
      createdAtFormatted: new Date(quote.created_at).toLocaleDateString(),
      eventDateFormatted: quote.event_date ? new Date(quote.event_date).toLocaleDateString() : 'Not specified'
    };
  }

  // Validate quote data
  static validateQuoteData(quoteData) {
    const errors = [];

    if (!quoteData.customer_name || quoteData.customer_name.trim().length < 2) {
      errors.push('Customer name must be at least 2 characters long');
    }

    if (!quoteData.customer_email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(quoteData.customer_email)) {
      errors.push('Valid customer email is required');
    }

    if (!quoteData.location || quoteData.location.trim().length < 5) {
      errors.push('Location must be at least 5 characters long');
    }

    if (!quoteData.service_type || !['event', 'restaurant', 'hotel', 'corporate', 'private'].includes(quoteData.service_type)) {
      errors.push('Valid service type is required');
    }

    if (!quoteData.duration || !['1-2', '2-4', '4-6', '6-8', '8+'].includes(quoteData.duration)) {
      errors.push('Valid duration is required');
    }

    if (!quoteData.base_price || parseFloat(quoteData.base_price) <= 0) {
      errors.push('Base price must be a positive number');
    }

    if (!quoteData.total_price || parseFloat(quoteData.total_price) <= 0) {
      errors.push('Total price must be a positive number');
    }

    return errors;
  }
}

export default QuoteService;


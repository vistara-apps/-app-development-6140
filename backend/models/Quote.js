import { executeQuery } from '../config/database.js';

export class Quote {
  constructor(data) {
    this.id = data.id;
    this.customer_name = data.customer_name;
    this.customer_email = data.customer_email;
    this.customer_phone = data.customer_phone;
    this.location = data.location;
    this.service_type = data.service_type;
    this.vehicle_make = data.vehicle_make;
    this.vehicle_model = data.vehicle_model;
    this.vehicle_type = data.vehicle_type;
    this.duration = data.duration;
    this.event_date = data.event_date;
    this.base_price = data.base_price;
    this.additional_fees = data.additional_fees;
    this.total_price = data.total_price;
    this.pricing_factors = data.pricing_factors;
    this.status = data.status || 'pending';
    this.notes = data.notes;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  // Create a new quote
  static async create(quoteData) {
    const query = `
      INSERT INTO quotes (
        customer_name, customer_email, customer_phone, location, service_type,
        vehicle_make, vehicle_model, vehicle_type, duration, event_date,
        base_price, additional_fees, total_price, pricing_factors, status, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const params = [
      quoteData.customer_name,
      quoteData.customer_email,
      quoteData.customer_phone,
      quoteData.location,
      quoteData.service_type,
      quoteData.vehicle_make,
      quoteData.vehicle_model,
      quoteData.vehicle_type,
      quoteData.duration,
      quoteData.event_date,
      quoteData.base_price,
      quoteData.additional_fees,
      quoteData.total_price,
      JSON.stringify(quoteData.pricing_factors || []),
      quoteData.status || 'pending',
      quoteData.notes
    ];

    const result = await executeQuery(query, params);
    if (result.success) {
      return await Quote.findById(result.data.insertId);
    }
    throw new Error(result.error);
  }

  // Find quote by ID
  static async findById(id) {
    const query = 'SELECT * FROM quotes WHERE id = ?';
    const result = await executeQuery(query, [id]);
    
    if (result.success && result.data.length > 0) {
      const quote = result.data[0];
      // Parse JSON fields
      if (quote.pricing_factors) {
        quote.pricing_factors = JSON.parse(quote.pricing_factors);
      }
      return new Quote(quote);
    }
    return null;
  }

  // Get all quotes with pagination
  static async findAll(page = 1, limit = 10, filters = {}) {
    let query = 'SELECT * FROM quotes WHERE 1=1';
    const params = [];

    // Apply filters
    if (filters.status) {
      query += ' AND status = ?';
      params.push(filters.status);
    }
    if (filters.service_type) {
      query += ' AND service_type = ?';
      params.push(filters.service_type);
    }
    if (filters.customer_email) {
      query += ' AND customer_email LIKE ?';
      params.push(`%${filters.customer_email}%`);
    }

    // Add pagination
    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, (page - 1) * limit);

    const result = await executeQuery(query, params);
    if (result.success) {
      return result.data.map(quote => {
        if (quote.pricing_factors) {
          quote.pricing_factors = JSON.parse(quote.pricing_factors);
        }
        return new Quote(quote);
      });
    }
    throw new Error(result.error);
  }

  // Update quote
  static async update(id, updateData) {
    const allowedFields = [
      'customer_name', 'customer_email', 'customer_phone', 'location',
      'service_type', 'vehicle_make', 'vehicle_model', 'vehicle_type',
      'duration', 'event_date', 'base_price', 'additional_fees',
      'total_price', 'pricing_factors', 'status', 'notes'
    ];

    const updates = [];
    const params = [];

    Object.keys(updateData).forEach(key => {
      if (allowedFields.includes(key)) {
        updates.push(`${key} = ?`);
        if (key === 'pricing_factors' && Array.isArray(updateData[key])) {
          params.push(JSON.stringify(updateData[key]));
        } else {
          params.push(updateData[key]);
        }
      }
    });

    if (updates.length === 0) {
      throw new Error('No valid fields to update');
    }

    updates.push('updated_at = NOW()');
    params.push(id);

    const query = `UPDATE quotes SET ${updates.join(', ')} WHERE id = ?`;
    const result = await executeQuery(query, params);

    if (result.success) {
      return await Quote.findById(id);
    }
    throw new Error(result.error);
  }

  // Delete quote
  static async delete(id) {
    const query = 'DELETE FROM quotes WHERE id = ?';
    const result = await executeQuery(query, [id]);
    return result.success;
  }

  // Get quote statistics
  static async getStats() {
    const queries = {
      total: 'SELECT COUNT(*) as count FROM quotes',
      pending: 'SELECT COUNT(*) as count FROM quotes WHERE status = "pending"',
      approved: 'SELECT COUNT(*) as count FROM quotes WHERE status = "approved"',
      rejected: 'SELECT COUNT(*) as count FROM quotes WHERE status = "rejected"',
      totalRevenue: 'SELECT SUM(total_price) as revenue FROM quotes WHERE status = "approved"'
    };

    const stats = {};
    for (const [key, query] of Object.entries(queries)) {
      const result = await executeQuery(query);
      if (result.success) {
        stats[key] = result.data[0].count || result.data[0].revenue || 0;
      }
    }

    return stats;
  }
}


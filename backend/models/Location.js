import { executeQuery } from '../config/database.js';

export class Location {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.address = data.address;
    this.city = data.city;
    this.state = data.state;
    this.zip_code = data.zip_code;
    this.country = data.country || 'US';
    this.latitude = data.latitude;
    this.longitude = data.longitude;
    this.location_type = data.location_type; // hotel, restaurant, event_venue, corporate, etc.
    this.contact_name = data.contact_name;
    this.contact_email = data.contact_email;
    this.contact_phone = data.contact_phone;
    this.pricing_zone = data.pricing_zone; // downtown, suburban, remote
    this.base_rate = data.base_rate;
    this.premium_rate = data.premium_rate;
    this.notes = data.notes;
    this.is_active = data.is_active !== undefined ? data.is_active : true;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  // Create a new location
  static async create(locationData) {
    const query = `
      INSERT INTO locations (
        name, address, city, state, zip_code, country, latitude, longitude,
        location_type, contact_name, contact_email, contact_phone,
        pricing_zone, base_rate, premium_rate, notes, is_active
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const params = [
      locationData.name,
      locationData.address,
      locationData.city,
      locationData.state,
      locationData.zip_code,
      locationData.country || 'US',
      locationData.latitude,
      locationData.longitude,
      locationData.location_type,
      locationData.contact_name,
      locationData.contact_email,
      locationData.contact_phone,
      locationData.pricing_zone,
      locationData.base_rate,
      locationData.premium_rate,
      locationData.notes,
      locationData.is_active !== undefined ? locationData.is_active : true
    ];

    const result = await executeQuery(query, params);
    if (result.success) {
      return await Location.findById(result.data.insertId);
    }
    throw new Error(result.error);
  }

  // Find location by ID
  static async findById(id) {
    const query = 'SELECT * FROM locations WHERE id = ?';
    const result = await executeQuery(query, [id]);
    
    if (result.success && result.data.length > 0) {
      return new Location(result.data[0]);
    }
    return null;
  }

  // Get all locations with pagination and filters
  static async findAll(page = 1, limit = 10, filters = {}) {
    let query = 'SELECT * FROM locations WHERE 1=1';
    const params = [];

    // Apply filters
    if (filters.location_type) {
      query += ' AND location_type = ?';
      params.push(filters.location_type);
    }
    if (filters.pricing_zone) {
      query += ' AND pricing_zone = ?';
      params.push(filters.pricing_zone);
    }
    if (filters.city) {
      query += ' AND city LIKE ?';
      params.push(`%${filters.city}%`);
    }
    if (filters.state) {
      query += ' AND state = ?';
      params.push(filters.state);
    }
    if (filters.is_active !== undefined) {
      query += ' AND is_active = ?';
      params.push(filters.is_active);
    }
    if (filters.search) {
      query += ' AND (name LIKE ? OR address LIKE ? OR city LIKE ?)';
      const searchTerm = `%${filters.search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    // Add pagination
    query += ' ORDER BY name ASC LIMIT ? OFFSET ?';
    params.push(limit, (page - 1) * limit);

    const result = await executeQuery(query, params);
    if (result.success) {
      return result.data.map(location => new Location(location));
    }
    throw new Error(result.error);
  }

  // Get active locations only
  static async findActive() {
    const query = 'SELECT * FROM locations WHERE is_active = true ORDER BY name ASC';
    const result = await executeQuery(query);
    
    if (result.success) {
      return result.data.map(location => new Location(location));
    }
    throw new Error(result.error);
  }

  // Find locations by city
  static async findByCity(city) {
    const query = 'SELECT * FROM locations WHERE city = ? AND is_active = true ORDER BY name ASC';
    const result = await executeQuery(query, [city]);
    
    if (result.success) {
      return result.data.map(location => new Location(location));
    }
    throw new Error(result.error);
  }

  // Find locations by pricing zone
  static async findByPricingZone(zone) {
    const query = 'SELECT * FROM locations WHERE pricing_zone = ? AND is_active = true ORDER BY name ASC';
    const result = await executeQuery(query, [zone]);
    
    if (result.success) {
      return result.data.map(location => new Location(location));
    }
    throw new Error(result.error);
  }

  // Update location
  static async update(id, updateData) {
    const allowedFields = [
      'name', 'address', 'city', 'state', 'zip_code', 'country',
      'latitude', 'longitude', 'location_type', 'contact_name',
      'contact_email', 'contact_phone', 'pricing_zone', 'base_rate',
      'premium_rate', 'notes', 'is_active'
    ];

    const updates = [];
    const params = [];

    Object.keys(updateData).forEach(key => {
      if (allowedFields.includes(key)) {
        updates.push(`${key} = ?`);
        params.push(updateData[key]);
      }
    });

    if (updates.length === 0) {
      throw new Error('No valid fields to update');
    }

    updates.push('updated_at = NOW()');
    params.push(id);

    const query = `UPDATE locations SET ${updates.join(', ')} WHERE id = ?`;
    const result = await executeQuery(query, params);

    if (result.success) {
      return await Location.findById(id);
    }
    throw new Error(result.error);
  }

  // Delete location (soft delete by setting is_active to false)
  static async delete(id) {
    const query = 'UPDATE locations SET is_active = false, updated_at = NOW() WHERE id = ?';
    const result = await executeQuery(query, [id]);
    return result.success;
  }

  // Hard delete location
  static async hardDelete(id) {
    const query = 'DELETE FROM locations WHERE id = ?';
    const result = await executeQuery(query, [id]);
    return result.success;
  }

  // Get location statistics
  static async getStats() {
    const queries = {
      total: 'SELECT COUNT(*) as count FROM locations',
      active: 'SELECT COUNT(*) as count FROM locations WHERE is_active = true',
      inactive: 'SELECT COUNT(*) as count FROM locations WHERE is_active = false',
      byType: `
        SELECT location_type, COUNT(*) as count 
        FROM locations 
        WHERE is_active = true 
        GROUP BY location_type 
        ORDER BY count DESC
      `,
      byZone: `
        SELECT pricing_zone, COUNT(*) as count 
        FROM locations 
        WHERE is_active = true 
        GROUP BY pricing_zone 
        ORDER BY count DESC
      `
    };

    const stats = {};
    
    // Get simple counts
    for (const [key, query] of Object.entries(queries)) {
      if (['byType', 'byZone'].includes(key)) continue;
      
      const result = await executeQuery(query);
      if (result.success) {
        stats[key] = result.data[0].count || 0;
      }
    }

    // Get grouped data
    const typeResult = await executeQuery(queries.byType);
    if (typeResult.success) {
      stats.byType = typeResult.data;
    }

    const zoneResult = await executeQuery(queries.byZone);
    if (zoneResult.success) {
      stats.byZone = zoneResult.data;
    }

    return stats;
  }

  // Search locations within radius (requires lat/lng)
  static async findWithinRadius(latitude, longitude, radiusKm = 50) {
    const query = `
      SELECT *, 
        (6371 * acos(cos(radians(?)) * cos(radians(latitude)) * 
        cos(radians(longitude) - radians(?)) + sin(radians(?)) * 
        sin(radians(latitude)))) AS distance
      FROM locations 
      WHERE is_active = true
      HAVING distance < ?
      ORDER BY distance ASC
    `;
    
    const result = await executeQuery(query, [latitude, longitude, latitude, radiusKm]);
    if (result.success) {
      return result.data.map(location => new Location(location));
    }
    throw new Error(result.error);
  }
}


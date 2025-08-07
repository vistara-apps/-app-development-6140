import { executeQuery } from '../config/database.js';

export class Lead {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.email = data.email;
    this.phone = data.phone;
    this.company = data.company;
    this.source = data.source;
    this.status = data.status || 'new';
    this.notes = data.notes;
    this.assigned_to = data.assigned_to;
    this.follow_up_date = data.follow_up_date;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  // Create a new lead
  static async create(leadData) {
    const query = `
      INSERT INTO leads (
        name, email, phone, company, source, status, notes, assigned_to, follow_up_date
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const params = [
      leadData.name,
      leadData.email,
      leadData.phone,
      leadData.company,
      leadData.source,
      leadData.status || 'new',
      leadData.notes,
      leadData.assigned_to,
      leadData.follow_up_date
    ];

    const result = await executeQuery(query, params);
    if (result.success) {
      return await Lead.findById(result.data.insertId);
    }
    throw new Error(result.error);
  }

  // Find lead by ID
  static async findById(id) {
    const query = 'SELECT * FROM leads WHERE id = ?';
    const result = await executeQuery(query, [id]);
    
    if (result.success && result.data.length > 0) {
      return new Lead(result.data[0]);
    }
    return null;
  }

  // Find lead by email
  static async findByEmail(email) {
    const query = 'SELECT * FROM leads WHERE email = ?';
    const result = await executeQuery(query, [email]);
    
    if (result.success && result.data.length > 0) {
      return new Lead(result.data[0]);
    }
    return null;
  }

  // Get all leads with pagination and filters
  static async findAll(page = 1, limit = 10, filters = {}) {
    let query = 'SELECT * FROM leads WHERE 1=1';
    const params = [];

    // Apply filters
    if (filters.status) {
      query += ' AND status = ?';
      params.push(filters.status);
    }
    if (filters.source) {
      query += ' AND source = ?';
      params.push(filters.source);
    }
    if (filters.assigned_to) {
      query += ' AND assigned_to = ?';
      params.push(filters.assigned_to);
    }
    if (filters.search) {
      query += ' AND (name LIKE ? OR email LIKE ? OR company LIKE ?)';
      const searchTerm = `%${filters.search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    // Add pagination
    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, (page - 1) * limit);

    const result = await executeQuery(query, params);
    if (result.success) {
      return result.data.map(lead => new Lead(lead));
    }
    throw new Error(result.error);
  }

  // Update lead
  static async update(id, updateData) {
    const allowedFields = [
      'name', 'email', 'phone', 'company', 'source', 'status',
      'notes', 'assigned_to', 'follow_up_date'
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

    const query = `UPDATE leads SET ${updates.join(', ')} WHERE id = ?`;
    const result = await executeQuery(query, params);

    if (result.success) {
      return await Lead.findById(id);
    }
    throw new Error(result.error);
  }

  // Update lead status
  static async updateStatus(id, status) {
    const query = 'UPDATE leads SET status = ?, updated_at = NOW() WHERE id = ?';
    const result = await executeQuery(query, [status, id]);
    
    if (result.success) {
      return await Lead.findById(id);
    }
    throw new Error(result.error);
  }

  // Delete lead
  static async delete(id) {
    const query = 'DELETE FROM leads WHERE id = ?';
    const result = await executeQuery(query, [id]);
    return result.success;
  }

  // Get leads due for follow-up
  static async getFollowUpDue(date = new Date()) {
    const query = `
      SELECT * FROM leads 
      WHERE follow_up_date <= ? AND status NOT IN ('converted', 'closed')
      ORDER BY follow_up_date ASC
    `;
    
    const result = await executeQuery(query, [date.toISOString().split('T')[0]]);
    if (result.success) {
      return result.data.map(lead => new Lead(lead));
    }
    throw new Error(result.error);
  }

  // Get lead statistics
  static async getStats() {
    const queries = {
      total: 'SELECT COUNT(*) as count FROM leads',
      new: 'SELECT COUNT(*) as count FROM leads WHERE status = "new"',
      contacted: 'SELECT COUNT(*) as count FROM leads WHERE status = "contacted"',
      qualified: 'SELECT COUNT(*) as count FROM leads WHERE status = "qualified"',
      converted: 'SELECT COUNT(*) as count FROM leads WHERE status = "converted"',
      closed: 'SELECT COUNT(*) as count FROM leads WHERE status = "closed"'
    };

    const stats = {};
    for (const [key, query] of Object.entries(queries)) {
      const result = await executeQuery(query);
      if (result.success) {
        stats[key] = result.data[0].count || 0;
      }
    }

    return stats;
  }

  // Get leads by source
  static async getBySource() {
    const query = `
      SELECT source, COUNT(*) as count 
      FROM leads 
      GROUP BY source 
      ORDER BY count DESC
    `;
    
    const result = await executeQuery(query);
    if (result.success) {
      return result.data;
    }
    throw new Error(result.error);
  }
}


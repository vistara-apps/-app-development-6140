import { executeQuery } from '../config/database.js';
import bcrypt from 'bcryptjs';

export class User {
  constructor(data) {
    this.id = data.id;
    this.email = data.email;
    this.password_hash = data.password_hash;
    this.first_name = data.first_name;
    this.last_name = data.last_name;
    this.phone = data.phone;
    this.role = data.role || 'operator';
    this.company_name = data.company_name;
    this.is_active = data.is_active !== undefined ? data.is_active : true;
    this.email_verified = data.email_verified || false;
    this.last_login = data.last_login;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  // Create a new user
  static async create(userData) {
    // Hash password
    const saltRounds = 12;
    const password_hash = await bcrypt.hash(userData.password, saltRounds);

    const query = `
      INSERT INTO users (
        email, password_hash, first_name, last_name, phone, role,
        company_name, is_active, email_verified
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const params = [
      userData.email.toLowerCase(),
      password_hash,
      userData.first_name,
      userData.last_name,
      userData.phone,
      userData.role || 'operator',
      userData.company_name,
      userData.is_active !== undefined ? userData.is_active : true,
      userData.email_verified || false
    ];

    const result = await executeQuery(query, params);
    if (result.success) {
      return await User.findById(result.data.insertId);
    }
    throw new Error(result.error);
  }

  // Find user by ID
  static async findById(id) {
    const query = 'SELECT * FROM users WHERE id = ?';
    const result = await executeQuery(query, [id]);
    
    if (result.success && result.data.length > 0) {
      return new User(result.data[0]);
    }
    return null;
  }

  // Find user by email
  static async findByEmail(email) {
    const query = 'SELECT * FROM users WHERE email = ?';
    const result = await executeQuery(query, [email.toLowerCase()]);
    
    if (result.success && result.data.length > 0) {
      return new User(result.data[0]);
    }
    return null;
  }

  // Verify password
  static async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  // Update password
  static async updatePassword(id, newPassword) {
    const saltRounds = 12;
    const password_hash = await bcrypt.hash(newPassword, saltRounds);
    
    const query = 'UPDATE users SET password_hash = ?, updated_at = NOW() WHERE id = ?';
    const result = await executeQuery(query, [password_hash, id]);
    
    return result.success;
  }

  // Update last login
  static async updateLastLogin(id) {
    const query = 'UPDATE users SET last_login = NOW() WHERE id = ?';
    const result = await executeQuery(query, [id]);
    return result.success;
  }

  // Get all users with pagination
  static async findAll(page = 1, limit = 10, filters = {}) {
    let query = 'SELECT id, email, first_name, last_name, phone, role, company_name, is_active, email_verified, last_login, created_at, updated_at FROM users WHERE 1=1';
    const params = [];

    // Apply filters
    if (filters.role) {
      query += ' AND role = ?';
      params.push(filters.role);
    }
    if (filters.is_active !== undefined) {
      query += ' AND is_active = ?';
      params.push(filters.is_active);
    }
    if (filters.search) {
      query += ' AND (first_name LIKE ? OR last_name LIKE ? OR email LIKE ? OR company_name LIKE ?)';
      const searchTerm = `%${filters.search}%`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }

    // Add pagination
    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, (page - 1) * limit);

    const result = await executeQuery(query, params);
    if (result.success) {
      return result.data.map(user => new User(user));
    }
    throw new Error(result.error);
  }

  // Update user
  static async update(id, updateData) {
    const allowedFields = [
      'first_name', 'last_name', 'phone', 'role', 'company_name',
      'is_active', 'email_verified'
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

    const query = `UPDATE users SET ${updates.join(', ')} WHERE id = ?`;
    const result = await executeQuery(query, params);

    if (result.success) {
      return await User.findById(id);
    }
    throw new Error(result.error);
  }

  // Deactivate user (soft delete)
  static async deactivate(id) {
    const query = 'UPDATE users SET is_active = false, updated_at = NOW() WHERE id = ?';
    const result = await executeQuery(query, [id]);
    return result.success;
  }

  // Activate user
  static async activate(id) {
    const query = 'UPDATE users SET is_active = true, updated_at = NOW() WHERE id = ?';
    const result = await executeQuery(query, [id]);
    return result.success;
  }

  // Delete user (hard delete)
  static async delete(id) {
    const query = 'DELETE FROM users WHERE id = ?';
    const result = await executeQuery(query, [id]);
    return result.success;
  }

  // Get user statistics
  static async getStats() {
    const queries = {
      total: 'SELECT COUNT(*) as count FROM users',
      active: 'SELECT COUNT(*) as count FROM users WHERE is_active = true',
      inactive: 'SELECT COUNT(*) as count FROM users WHERE is_active = false',
      verified: 'SELECT COUNT(*) as count FROM users WHERE email_verified = true',
      byRole: `
        SELECT role, COUNT(*) as count 
        FROM users 
        WHERE is_active = true 
        GROUP BY role 
        ORDER BY count DESC
      `
    };

    const stats = {};
    
    // Get simple counts
    for (const [key, query] of Object.entries(queries)) {
      if (key === 'byRole') continue;
      
      const result = await executeQuery(query);
      if (result.success) {
        stats[key] = result.data[0].count || 0;
      }
    }

    // Get role distribution
    const roleResult = await executeQuery(queries.byRole);
    if (roleResult.success) {
      stats.byRole = roleResult.data;
    }

    return stats;
  }

  // Check if email exists
  static async emailExists(email) {
    const query = 'SELECT id FROM users WHERE email = ?';
    const result = await executeQuery(query, [email.toLowerCase()]);
    return result.success && result.data.length > 0;
  }

  // Get user profile (without sensitive data)
  getProfile() {
    return {
      id: this.id,
      email: this.email,
      first_name: this.first_name,
      last_name: this.last_name,
      phone: this.phone,
      role: this.role,
      company_name: this.company_name,
      is_active: this.is_active,
      email_verified: this.email_verified,
      last_login: this.last_login,
      created_at: this.created_at
    };
  }
}


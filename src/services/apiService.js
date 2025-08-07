// API Service for ValetQuotes Backend
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.token = localStorage.getItem('auth_token');
  }

  // Set authentication token
  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('auth_token', token);
    } else {
      localStorage.removeItem('auth_token');
    }
  }

  // Get authentication token
  getToken() {
    return this.token || localStorage.getItem('auth_token');
  }

  // Get headers with authentication
  getHeaders(includeAuth = true) {
    const headers = {
      'Content-Type': 'application/json',
    };

    if (includeAuth && this.getToken()) {
      headers.Authorization = `Bearer ${this.getToken()}`;
    }

    return headers;
  }

  // Generic request method
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: this.getHeaders(options.auth !== false),
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // GET request
  async get(endpoint, options = {}) {
    return this.request(endpoint, { method: 'GET', ...options });
  }

  // POST request
  async post(endpoint, data, options = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
      ...options,
    });
  }

  // PUT request
  async put(endpoint, data, options = {}) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
      ...options,
    });
  }

  // PATCH request
  async patch(endpoint, data, options = {}) {
    return this.request(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
      ...options,
    });
  }

  // DELETE request
  async delete(endpoint, options = {}) {
    return this.request(endpoint, { method: 'DELETE', ...options });
  }

  // Authentication methods
  async login(email, password) {
    const response = await this.post('/auth/login', { email, password }, { auth: false });
    if (response.success && response.data.token) {
      this.setToken(response.data.token);
    }
    return response;
  }

  async register(userData) {
    const response = await this.post('/auth/register', userData, { auth: false });
    if (response.success && response.data.token) {
      this.setToken(response.data.token);
    }
    return response;
  }

  async logout() {
    try {
      await this.post('/auth/logout');
    } catch (error) {
      console.warn('Logout request failed:', error);
    } finally {
      this.setToken(null);
    }
  }

  async getProfile() {
    return this.get('/auth/profile');
  }

  async updateProfile(profileData) {
    return this.put('/auth/profile', profileData);
  }

  async changePassword(currentPassword, newPassword) {
    return this.put('/auth/change-password', { currentPassword, newPassword });
  }

  async verifyToken() {
    return this.get('/auth/verify');
  }

  // Quote methods
  async getQuotes(page = 1, limit = 10, filters = {}) {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...filters,
    });
    return this.get(`/quotes?${params}`);
  }

  async getQuote(id) {
    return this.get(`/quotes/${id}`);
  }

  async createQuote(quoteData) {
    return this.post('/quotes', quoteData, { auth: false });
  }

  async updateQuote(id, quoteData) {
    return this.put(`/quotes/${id}`, quoteData);
  }

  async updateQuoteStatus(id, status) {
    return this.patch(`/quotes/${id}/status`, { status });
  }

  async deleteQuote(id) {
    return this.delete(`/quotes/${id}`);
  }

  async duplicateQuote(id) {
    return this.post(`/quotes/${id}/duplicate`);
  }

  async getQuoteStats() {
    return this.get('/quotes/stats/overview');
  }

  // Lead methods
  async getLeads(page = 1, limit = 10, filters = {}) {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...filters,
    });
    return this.get(`/leads?${params}`);
  }

  async getLead(id) {
    return this.get(`/leads/${id}`);
  }

  async createLead(leadData) {
    return this.post('/leads', leadData);
  }

  async updateLead(id, leadData) {
    return this.put(`/leads/${id}`, leadData);
  }

  async updateLeadStatus(id, status) {
    return this.patch(`/leads/${id}/status`, { status });
  }

  async assignLead(id, assignedTo) {
    return this.patch(`/leads/${id}/assign`, { assigned_to: assignedTo });
  }

  async deleteLead(id) {
    return this.delete(`/leads/${id}`);
  }

  async getFollowUpLeads(date) {
    const params = date ? `?date=${date}` : '';
    return this.get(`/leads/followup/due${params}`);
  }

  async getLeadStats() {
    return this.get('/leads/stats/overview');
  }

  async getLeadsBySource() {
    return this.get('/leads/stats/by-source');
  }

  // Location methods
  async getLocations(page = 1, limit = 10, filters = {}) {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...filters,
    });
    return this.get(`/locations?${params}`);
  }

  async getActiveLocations() {
    return this.get('/locations/active');
  }

  async getLocation(id) {
    return this.get(`/locations/${id}`);
  }

  async createLocation(locationData) {
    return this.post('/locations', locationData);
  }

  async updateLocation(id, locationData) {
    return this.put(`/locations/${id}`, locationData);
  }

  async deleteLocation(id) {
    return this.delete(`/locations/${id}`);
  }

  async getLocationsByCity(city) {
    return this.get(`/locations/city/${city}`);
  }

  async getLocationsByZone(zone) {
    return this.get(`/locations/zone/${zone}`);
  }

  async searchLocationsByRadius(latitude, longitude, radius = 50) {
    return this.post('/locations/search/radius', { latitude, longitude, radius });
  }

  async toggleLocationStatus(id) {
    return this.patch(`/locations/${id}/toggle`);
  }

  async getLocationStats() {
    return this.get('/locations/stats/overview');
  }

  // Health check
  async healthCheck() {
    return this.request('/health', { auth: false });
  }
}

// Create and export a singleton instance
const apiService = new ApiService();
export default apiService;


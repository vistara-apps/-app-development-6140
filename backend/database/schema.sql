-- ValetQuotes Database Schema
-- MySQL Database Schema for Valet Service Management System

-- Create database (run this first)
-- CREATE DATABASE valetquotes CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
-- USE valetquotes;

-- Users table for authentication and user management
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    phone VARCHAR(20),
    role ENUM('admin', 'operator', 'manager') DEFAULT 'operator',
    company_name VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    email_verified BOOLEAN DEFAULT FALSE,
    last_login TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_email (email),
    INDEX idx_role (role),
    INDEX idx_active (is_active)
);

-- Locations table for managing service locations
CREATE TABLE locations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    address VARCHAR(200) NOT NULL,
    city VARCHAR(50) NOT NULL,
    state VARCHAR(2) NOT NULL,
    zip_code VARCHAR(10) NOT NULL,
    country VARCHAR(2) DEFAULT 'US',
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    location_type ENUM('hotel', 'restaurant', 'event_venue', 'corporate', 'residential', 'other') NOT NULL,
    contact_name VARCHAR(100),
    contact_email VARCHAR(255),
    contact_phone VARCHAR(20),
    pricing_zone ENUM('downtown', 'suburban', 'remote') NOT NULL,
    base_rate DECIMAL(10, 2),
    premium_rate DECIMAL(10, 2),
    notes TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_city (city),
    INDEX idx_state (state),
    INDEX idx_location_type (location_type),
    INDEX idx_pricing_zone (pricing_zone),
    INDEX idx_active (is_active),
    INDEX idx_coordinates (latitude, longitude)
);

-- Quotes table for managing customer quote requests
CREATE TABLE quotes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    customer_name VARCHAR(100) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(20),
    location VARCHAR(200) NOT NULL,
    service_type ENUM('event', 'restaurant', 'hotel', 'corporate', 'private') NOT NULL,
    vehicle_make VARCHAR(50),
    vehicle_model VARCHAR(50),
    vehicle_type ENUM('standard', 'luxury', 'exotic', 'suv', 'truck') DEFAULT 'standard',
    duration ENUM('1-2', '2-4', '4-6', '6-8', '8+') NOT NULL,
    event_date DATE,
    base_price DECIMAL(10, 2) NOT NULL,
    additional_fees DECIMAL(10, 2) DEFAULT 0,
    total_price DECIMAL(10, 2) NOT NULL,
    pricing_factors JSON,
    status ENUM('pending', 'approved', 'rejected', 'cancelled') DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_customer_email (customer_email),
    INDEX idx_service_type (service_type),
    INDEX idx_status (status),
    INDEX idx_event_date (event_date),
    INDEX idx_created_at (created_at)
);

-- Leads table for managing potential customers
CREATE TABLE leads (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    company VARCHAR(100),
    source ENUM('website', 'referral', 'social_media', 'email_campaign', 'phone_call', 'other') DEFAULT 'website',
    status ENUM('new', 'contacted', 'qualified', 'proposal_sent', 'converted', 'closed') DEFAULT 'new',
    notes TEXT,
    assigned_to INT,
    follow_up_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_email (email),
    INDEX idx_status (status),
    INDEX idx_source (source),
    INDEX idx_assigned_to (assigned_to),
    INDEX idx_follow_up_date (follow_up_date)
);

-- Pricing rules table for dynamic pricing
CREATE TABLE pricing_rules (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    service_type ENUM('event', 'restaurant', 'hotel', 'corporate', 'private'),
    vehicle_type ENUM('standard', 'luxury', 'exotic', 'suv', 'truck'),
    pricing_zone ENUM('downtown', 'suburban', 'remote'),
    duration_min VARCHAR(10),
    duration_max VARCHAR(10),
    base_multiplier DECIMAL(5, 2) DEFAULT 1.00,
    additional_fee DECIMAL(10, 2) DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_service_type (service_type),
    INDEX idx_vehicle_type (vehicle_type),
    INDEX idx_pricing_zone (pricing_zone),
    INDEX idx_active (is_active)
);

-- Seasonal pricing adjustments
CREATE TABLE seasonal_pricing (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    service_type ENUM('event', 'restaurant', 'hotel', 'corporate', 'private'),
    pricing_zone ENUM('downtown', 'suburban', 'remote'),
    multiplier DECIMAL(5, 2) NOT NULL DEFAULT 1.00,
    additional_fee DECIMAL(10, 2) DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_date_range (start_date, end_date),
    INDEX idx_service_type (service_type),
    INDEX idx_pricing_zone (pricing_zone),
    INDEX idx_active (is_active)
);

-- Quote history for tracking changes
CREATE TABLE quote_history (
    id INT PRIMARY KEY AUTO_INCREMENT,
    quote_id INT NOT NULL,
    user_id INT,
    action ENUM('created', 'updated', 'status_changed', 'deleted') NOT NULL,
    old_values JSON,
    new_values JSON,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (quote_id) REFERENCES quotes(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_quote_id (quote_id),
    INDEX idx_user_id (user_id),
    INDEX idx_action (action),
    INDEX idx_created_at (created_at)
);

-- Lead activities for tracking interactions
CREATE TABLE lead_activities (
    id INT PRIMARY KEY AUTO_INCREMENT,
    lead_id INT NOT NULL,
    user_id INT,
    activity_type ENUM('call', 'email', 'meeting', 'note', 'status_change') NOT NULL,
    description TEXT,
    scheduled_date TIMESTAMP,
    completed_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_lead_id (lead_id),
    INDEX idx_user_id (user_id),
    INDEX idx_activity_type (activity_type),
    INDEX idx_scheduled_date (scheduled_date)
);

-- Email templates for automated communications
CREATE TABLE email_templates (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    subject VARCHAR(200) NOT NULL,
    body TEXT NOT NULL,
    template_type ENUM('quote_confirmation', 'quote_approved', 'quote_rejected', 'follow_up', 'welcome') NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_template_type (template_type),
    INDEX idx_active (is_active)
);

-- System settings
CREATE TABLE settings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT,
    setting_type ENUM('string', 'number', 'boolean', 'json') DEFAULT 'string',
    description TEXT,
    is_public BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_setting_key (setting_key),
    INDEX idx_is_public (is_public)
);

-- Insert default admin user (password: admin123)
INSERT INTO users (email, password_hash, first_name, last_name, role, is_active, email_verified) VALUES
('admin@valetquotes.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/hL8.WuFyG', 'Admin', 'User', 'admin', TRUE, TRUE);

-- Insert default settings
INSERT INTO settings (setting_key, setting_value, setting_type, description, is_public) VALUES
('company_name', 'ValetQuotes', 'string', 'Company name displayed in the application', TRUE),
('default_base_rate', '45.00', 'number', 'Default base rate for valet services', FALSE),
('default_currency', 'USD', 'string', 'Default currency for pricing', TRUE),
('email_notifications_enabled', 'true', 'boolean', 'Enable email notifications', FALSE),
('max_quote_validity_days', '30', 'number', 'Maximum days a quote remains valid', FALSE);

-- Insert sample pricing rules
INSERT INTO pricing_rules (name, service_type, vehicle_type, pricing_zone, base_multiplier, additional_fee, is_active) VALUES
('Downtown Event Premium', 'event', NULL, 'downtown', 1.25, 15.00, TRUE),
('Luxury Vehicle Surcharge', NULL, 'luxury', NULL, 1.20, 20.00, TRUE),
('Exotic Vehicle Premium', NULL, 'exotic', NULL, 1.50, 35.00, TRUE),
('Corporate Standard', 'corporate', 'standard', 'suburban', 1.10, 10.00, TRUE),
('Remote Location Fee', NULL, NULL, 'remote', 1.15, 12.00, TRUE);

-- Insert sample email templates
INSERT INTO email_templates (name, subject, body, template_type, is_active) VALUES
('Quote Confirmation', 'Your Valet Service Quote Request', 'Dear {{customer_name}},\n\nThank you for your valet service quote request. We have received your request and will get back to you within 24 hours.\n\nQuote Details:\n- Service Type: {{service_type}}\n- Location: {{location}}\n- Date: {{event_date}}\n- Estimated Total: ${{total_price}}\n\nBest regards,\nValetQuotes Team', 'quote_confirmation', TRUE),
('Quote Approved', 'Your Valet Service Quote Has Been Approved', 'Dear {{customer_name}},\n\nGreat news! Your valet service quote has been approved.\n\nQuote #{{quote_id}}\nTotal Amount: ${{total_price}}\n\nTo proceed with booking, please contact us at your earliest convenience.\n\nBest regards,\nValetQuotes Team', 'quote_approved', TRUE);

-- Create indexes for better performance
CREATE INDEX idx_quotes_customer_location ON quotes(customer_email, location);
CREATE INDEX idx_leads_status_assigned ON leads(status, assigned_to);
CREATE INDEX idx_locations_type_zone ON locations(location_type, pricing_zone);

-- Create views for common queries
CREATE VIEW active_quotes AS
SELECT * FROM quotes WHERE status IN ('pending', 'approved');

CREATE VIEW active_leads AS
SELECT * FROM leads WHERE status NOT IN ('converted', 'closed');

CREATE VIEW location_summary AS
SELECT 
    l.*,
    COUNT(q.id) as total_quotes,
    AVG(q.total_price) as avg_quote_value
FROM locations l
LEFT JOIN quotes q ON q.location LIKE CONCAT('%', l.city, '%')
WHERE l.is_active = TRUE
GROUP BY l.id;


# ValetQuotes API Documentation

## Overview

The ValetQuotes API is a RESTful service built with Node.js and Express that provides backend functionality for the valet service management system. It connects to a MySQL database and provides endpoints for managing quotes, leads, locations, and user authentication.

## Base URL

```
http://localhost:5000/api
```

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

## Response Format

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation completed successfully"
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message",
  "details": "Detailed error information"
}
```

## Endpoints

### Authentication

#### POST /auth/register
Register a new user.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "first_name": "John",
  "last_name": "Doe",
  "phone": "+1234567890",
  "company_name": "Acme Corp",
  "role": "operator"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "email": "user@example.com",
      "first_name": "John",
      "last_name": "Doe",
      "role": "operator"
    },
    "token": "jwt_token_here"
  }
}
```

#### POST /auth/login
Authenticate a user.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "email": "user@example.com",
      "first_name": "John",
      "last_name": "Doe",
      "role": "operator"
    },
    "token": "jwt_token_here"
  }
}
```

#### GET /auth/profile
Get current user profile. Requires authentication.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "email": "user@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "role": "operator",
    "company_name": "Acme Corp"
  }
}
```

### Quotes

#### GET /quotes
Get all quotes with pagination and filters. Requires authentication.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `status` (optional): Filter by status (pending, approved, rejected, cancelled)
- `service_type` (optional): Filter by service type
- `customer_email` (optional): Filter by customer email

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "customer_name": "Jane Smith",
      "customer_email": "jane@example.com",
      "location": "Downtown Hotel",
      "service_type": "hotel",
      "total_price": 75.00,
      "status": "pending",
      "created_at": "2024-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1
  }
}
```

#### POST /quotes
Create a new quote. No authentication required (public endpoint).

**Request Body:**
```json
{
  "customer_name": "Jane Smith",
  "customer_email": "jane@example.com",
  "customer_phone": "+1234567890",
  "location": "Downtown Hotel",
  "service_type": "hotel",
  "vehicle_make": "BMW",
  "vehicle_model": "X5",
  "vehicle_type": "luxury",
  "duration": "4-6",
  "event_date": "2024-02-15",
  "base_price": 60.00,
  "additional_fees": 15.00,
  "total_price": 75.00,
  "pricing_factors": ["Luxury vehicle handling", "Downtown location"],
  "notes": "Special event parking"
}
```

#### GET /quotes/:id
Get a specific quote by ID. Requires authentication.

#### PUT /quotes/:id
Update a quote. Requires authentication.

#### PATCH /quotes/:id/status
Update quote status. Requires authentication.

**Request Body:**
```json
{
  "status": "approved"
}
```

#### DELETE /quotes/:id
Delete a quote. Requires authentication.

#### POST /quotes/:id/duplicate
Duplicate an existing quote. Requires authentication.

### Leads

#### GET /leads
Get all leads with pagination and filters. Requires authentication.

**Query Parameters:**
- `page` (optional): Page number
- `limit` (optional): Items per page
- `status` (optional): Filter by status
- `source` (optional): Filter by source
- `search` (optional): Search in name, email, or company

#### POST /leads
Create a new lead. Requires authentication.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "company": "Acme Corp",
  "source": "website",
  "notes": "Interested in corporate valet services"
}
```

#### PATCH /leads/:id/status
Update lead status. Requires authentication.

**Request Body:**
```json
{
  "status": "contacted"
}
```

### Locations

#### GET /locations
Get all locations with pagination and filters.

**Query Parameters:**
- `page` (optional): Page number
- `limit` (optional): Items per page
- `location_type` (optional): Filter by type
- `pricing_zone` (optional): Filter by pricing zone
- `city` (optional): Filter by city
- `is_active` (optional): Filter by active status

#### GET /locations/active
Get only active locations. Public endpoint.

#### POST /locations
Create a new location. Requires authentication.

**Request Body:**
```json
{
  "name": "Downtown Hotel",
  "address": "123 Main St",
  "city": "New York",
  "state": "NY",
  "zip_code": "10001",
  "location_type": "hotel",
  "pricing_zone": "downtown",
  "base_rate": 50.00,
  "premium_rate": 75.00
}
```

#### POST /locations/search/radius
Search locations within a radius.

**Request Body:**
```json
{
  "latitude": 40.7128,
  "longitude": -74.0060,
  "radius": 25
}
```

### Health Check

#### GET /health
Check API health and database connection status.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00Z",
  "database": "connected",
  "version": "1.0.0"
}
```

## Error Codes

- `400` - Bad Request (validation errors)
- `401` - Unauthorized (authentication required)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found (resource doesn't exist)
- `409` - Conflict (duplicate resource)
- `429` - Too Many Requests (rate limit exceeded)
- `500` - Internal Server Error

## Rate Limiting

The API implements rate limiting to prevent abuse:
- **Window**: 15 minutes
- **Max Requests**: 100 per IP address per window

## Data Validation

All endpoints include comprehensive input validation:

### Email Validation
- Must be a valid email format
- Required for user registration and quotes

### Phone Validation
- International format supported
- Optional for most endpoints

### Required Fields
- Enforced based on endpoint requirements
- Clear error messages for missing fields

### String Lengths
- Minimum and maximum length validation
- Prevents database overflow

### Enum Values
- Restricted to predefined values
- Status fields, service types, etc.

## Security Features

- **JWT Authentication**: Secure token-based auth
- **Password Hashing**: bcrypt with salt rounds
- **Rate Limiting**: Prevents API abuse
- **CORS Configuration**: Controlled cross-origin access
- **Input Sanitization**: SQL injection prevention
- **Helmet Security**: Security headers
- **Environment Variables**: Sensitive data protection

## Database Schema

### Users Table
- `id` - Primary key
- `email` - Unique email address
- `password_hash` - Hashed password
- `first_name`, `last_name` - User names
- `role` - User role (admin, operator, manager)
- `company_name` - Company affiliation
- `is_active` - Account status

### Quotes Table
- `id` - Primary key
- `customer_name`, `customer_email` - Customer info
- `location` - Service location
- `service_type` - Type of service
- `vehicle_make`, `vehicle_model`, `vehicle_type` - Vehicle info
- `base_price`, `additional_fees`, `total_price` - Pricing
- `status` - Quote status
- `created_at`, `updated_at` - Timestamps

### Leads Table
- `id` - Primary key
- `name`, `email`, `phone` - Contact info
- `company` - Company name
- `source` - Lead source
- `status` - Lead status
- `assigned_to` - Assigned user ID
- `follow_up_date` - Next follow-up date

### Locations Table
- `id` - Primary key
- `name`, `address`, `city`, `state` - Location info
- `location_type` - Type of location
- `pricing_zone` - Pricing zone
- `base_rate`, `premium_rate` - Pricing rates
- `is_active` - Location status

## Usage Examples

### JavaScript/Fetch
```javascript
// Login
const response = await fetch('http://localhost:5000/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password123'
  })
});

const data = await response.json();
const token = data.data.token;

// Get quotes
const quotesResponse = await fetch('http://localhost:5000/api/quotes', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

### cURL
```bash
# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'

# Get quotes
curl -X GET http://localhost:5000/api/quotes \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Development

### Environment Variables
```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=valetquotes
DB_USER=your_username
DB_PASSWORD=your_password
JWT_SECRET=your_secret_key
PORT=5000
```

### Running the API
```bash
cd backend
npm install
npm run dev
```

### Testing
```bash
npm test
```

## Support

For API support or questions, please contact the development team or create an issue in the project repository.


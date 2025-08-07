# ValetQuotes Backend API

A Node.js/Express backend API for the ValetQuotes valet service management system with MySQL database integration.

## Features

- **MySQL Database Integration**: Secure connection to existing MySQL database
- **RESTful API**: Complete CRUD operations for quotes, leads, locations, and users
- **JWT Authentication**: Secure user authentication and authorization
- **Input Validation**: Comprehensive request validation using Joi
- **Rate Limiting**: API rate limiting for security
- **CORS Support**: Cross-origin resource sharing configuration
- **Error Handling**: Centralized error handling and logging
- **Database Models**: Object-oriented database models with relationships

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MySQL with mysql2 driver
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: Joi
- **Security**: Helmet, CORS, Rate Limiting
- **Password Hashing**: bcryptjs

## Quick Start

### Prerequisites

- Node.js (v16 or higher)
- MySQL database
- npm or yarn

### Installation

1. **Install dependencies**:
   ```bash
   cd backend
   npm install
   ```

2. **Environment Setup**:
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your database credentials:
   ```env
   DB_HOST=localhost
   DB_PORT=3306
   DB_NAME=valetquotes
   DB_USER=your_username
   DB_PASSWORD=your_password
   JWT_SECRET=your_super_secret_jwt_key_here
   ```

3. **Database Setup**:
   ```bash
   # Create database and tables
   mysql -u your_username -p < database/schema.sql
   ```

4. **Start the server**:
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

The API will be available at `http://localhost:5000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile
- `PUT /api/auth/change-password` - Change password
- `POST /api/auth/refresh` - Refresh JWT token
- `GET /api/auth/verify` - Verify JWT token

### Quotes
- `GET /api/quotes` - Get all quotes (with pagination and filters)
- `GET /api/quotes/:id` - Get quote by ID
- `POST /api/quotes` - Create new quote
- `PUT /api/quotes/:id` - Update quote
- `PATCH /api/quotes/:id/status` - Update quote status
- `DELETE /api/quotes/:id` - Delete quote
- `POST /api/quotes/:id/duplicate` - Duplicate quote
- `GET /api/quotes/stats/overview` - Get quote statistics

### Leads
- `GET /api/leads` - Get all leads (with pagination and filters)
- `GET /api/leads/:id` - Get lead by ID
- `POST /api/leads` - Create new lead
- `PUT /api/leads/:id` - Update lead
- `PATCH /api/leads/:id/status` - Update lead status
- `PATCH /api/leads/:id/assign` - Assign lead to user
- `DELETE /api/leads/:id` - Delete lead
- `GET /api/leads/followup/due` - Get leads due for follow-up
- `GET /api/leads/stats/overview` - Get lead statistics
- `GET /api/leads/stats/by-source` - Get leads by source

### Locations
- `GET /api/locations` - Get all locations (with pagination and filters)
- `GET /api/locations/active` - Get active locations only
- `GET /api/locations/:id` - Get location by ID
- `POST /api/locations` - Create new location
- `PUT /api/locations/:id` - Update location
- `DELETE /api/locations/:id` - Delete location (soft delete)
- `GET /api/locations/city/:city` - Get locations by city
- `GET /api/locations/zone/:zone` - Get locations by pricing zone
- `POST /api/locations/search/radius` - Search locations within radius
- `PATCH /api/locations/:id/toggle` - Toggle location active status
- `GET /api/locations/stats/overview` - Get location statistics

### Health Check
- `GET /health` - API health check and database status

## Database Schema

The application uses the following main tables:

- **users**: User authentication and profiles
- **quotes**: Customer quote requests
- **leads**: Potential customer leads
- **locations**: Service locations
- **pricing_rules**: Dynamic pricing rules
- **seasonal_pricing**: Seasonal pricing adjustments
- **quote_history**: Quote change tracking
- **lead_activities**: Lead interaction tracking

See `database/schema.sql` for the complete database schema.

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

### User Roles

- **admin**: Full system access
- **manager**: Management access to quotes and leads
- **operator**: Basic access to quotes and leads

## Request/Response Format

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

## Validation

All API endpoints include comprehensive input validation:

- **Email validation**: Proper email format
- **Phone validation**: International phone number format
- **Required fields**: Enforced required fields
- **Data types**: Type checking for all fields
- **String lengths**: Maximum and minimum length validation
- **Enum values**: Restricted to predefined values

## Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt with salt rounds
- **Rate Limiting**: Prevents API abuse
- **CORS Configuration**: Controlled cross-origin access
- **Input Sanitization**: SQL injection prevention
- **Helmet Security**: Security headers
- **Environment Variables**: Sensitive data protection

## Error Handling

The API includes comprehensive error handling:

- **Database Errors**: Connection and query error handling
- **Validation Errors**: Input validation error responses
- **Authentication Errors**: JWT and permission errors
- **404 Errors**: Resource not found handling
- **500 Errors**: Internal server error handling

## Development

### Running in Development Mode

```bash
npm run dev
```

This starts the server with nodemon for automatic restarts on file changes.

### Environment Variables

Required environment variables:

```env
# Database
DB_HOST=localhost
DB_PORT=3306
DB_NAME=valetquotes
DB_USER=your_username
DB_PASSWORD=your_password

# Server
PORT=5000
NODE_ENV=development

# JWT
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=24h

# API
FRONTEND_URL=http://localhost:5173
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Database Connection

The application uses connection pooling for efficient database connections:

- **Connection Limit**: 10 concurrent connections
- **Automatic Reconnection**: Handles connection drops
- **Query Timeout**: 60 seconds
- **UTF8MB4 Charset**: Full Unicode support

## Deployment

### Production Setup

1. Set `NODE_ENV=production`
2. Use a process manager like PM2
3. Configure reverse proxy (nginx)
4. Set up SSL certificates
5. Configure database connection pooling
6. Set up monitoring and logging

### Docker Support

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details.


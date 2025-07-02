# Calorie Counter Backend

A robust Express TypeScript backend service that integrates with the USDA FoodData Central API to provide calorie calculation functionality for various dishes.

## Features

- 🔐 **User Authentication** - JWT-based authentication with secure password hashing
- 🍎 **Calorie Calculation** - Integration with USDA FoodData Central API
- 📊 **Smart Food Matching** - Fuzzy matching algorithm for best food results
- 🛡️ **Security** - Upstash Redis rate limiting, CORS protection, and input validation
- 🚀 **Modern Stack** - TypeScript, Express, PostgreSQL, Drizzle ORM
- ✅ **Validation** - Zod schema validation for all API endpoints
- 🐍 **snake_case API** - Consistent snake_case formatting for all API payloads and responses
- 📝 **Professional Logging** - Winston logger with structured logging, file rotation, and environment-specific configurations

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: Drizzle ORM
- **Validation**: Zod
- **Authentication**: JWT + bcrypt
- **Security**: Helmet, CORS, Rate Limiting
- **Logging**: Winston with structured logging
- **Caching/Rate Limiting**: Upstash Redis

## Prerequisites

- Node.js 18+ and pnpm
- PostgreSQL database
- USDA FoodData Central API key ([Get one here](https://fdc.nal.usda.gov/api-key-signup.html))

## Quick Start

1. **Install dependencies**
   ```bash
   pnpm install
   ```

2. **Environment Setup**
   ```bash
   cp .env.example .env
   # Edit .env with your actual values
   ```

3. **Database Setup**
   ```bash
   # Generate migrations
   pnpm db:generate
   
   # Run migrations
   pnpm db:migrate
   ```

4. **Start Development Server**
   ```bash
   pnpm dev
   ```

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@localhost:5432/db` |
| `USDA_API_KEY` | USDA FoodData Central API key | `your_api_key_here` |
| `UPSTASH_REDIS_REST_URL` | Upstash Redis REST URL | `https://your-redis.upstash.io` |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash Redis REST token | `your_redis_token` |
| `JWT_SECRET` | Secret for JWT token signing | `your_secret_key` |
| `JWT_EXPIRES_IN` | JWT token expiration time | `7d` |
| `PORT` | Server port | `3001` |
| `NODE_ENV` | Environment mode | `development` |
| `CORS_ORIGIN` | Frontend URL for CORS | `http://localhost:3000` |

## API Endpoints

### Authentication

#### Register User
```http
POST /auth/register
Content-Type: application/json

{
  "first_name": "John",
  "last_name": "Doe",
  "email": "john@example.com",
  "password": "secure123"
}
```

**Response:**
```json
{
  "user": {
    "id": 1,
    "first_name": "John",
    "last_name": "Doe",
    "email": "john@example.com"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Login User
```http
POST /auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "secure123"
}
```

**Response:**
```json
{
  "user": {
    "id": 1,
    "first_name": "John",
    "last_name": "Doe",
    "email": "john@example.com"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Calorie Calculation

#### Get Calories
```http
POST /get-calories
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "dish_name": "chicken biryani",
  "servings": 2
}
```

**Response:**
```json
{
  "dish_name": "chicken biryani",
  "servings": 2,
  "calories_per_serving": 280,
  "total_calories": 560,
  "source": "USDA FoodData Central",
  "ingredient_breakdown": [
    {
      "name": "Chicken biryani",
      "calories_per_100g": 180,
      "serving_size": "100g"
    }
  ]
}
```

### Health Check
```http
GET /health
```

## Database Schema

### Users Table
- `id` - Primary key
- `firstName` - User's first name (stored as camelCase in DB)
- `lastName` - User's last name (stored as camelCase in DB)
- `email` - Unique email address
- `passwordHash` - Bcrypt hashed password
- `createdAt` - Registration timestamp
- `updatedAt` - Last update timestamp

**Note:** Database uses camelCase internally, but API responses use snake_case format.

## Security Features

- **Rate Limiting (Upstash Redis)**: 
  - General endpoints: 100 req/15min
  - Calorie endpoints: 15 req/15min
  - Auth endpoints: 5 req/15min
  - Persistent across server restarts
  - Serverless-compatible
- **Password Security**: Bcrypt with 12 salt rounds
- **JWT Authentication**: Secure token-based auth
- **Input Validation**: Zod schema validation
- **CORS Protection**: Configurable origin whitelist

## Logging

The application uses **Winston** for professional logging with:

- **Log Levels**: error, warn, info, http, debug
- **Structured Logging**: JSON format with metadata
- **Console Output**: Colorized logs for development
- **File Logging**: Separate error and combined logs in production
- **Request Logging**: HTTP requests with timing and status codes
- **Exception Handling**: Automatic logging of uncaught exceptions and unhandled rejections

**Log Files** (Production only):
- `logs/error.log` - Error level logs only
- `logs/combined.log` - All log levels
- `logs/exceptions.log` - Uncaught exceptions
- `logs/rejections.log` - Unhandled promise rejections

**Development**: Console output with colors and timestamps  
**Production**: File logging with JSON format for log aggregation

## Development Commands

```bash
# Development server with hot reload
pnpm dev

# Build production bundle
pnpm build

# Start production server
pnpm start

# Database operations
pnpm db:generate    # Generate migrations
pnpm db:migrate     # Run migrations
pnpm db:push        # Push schema changes
pnpm db:studio      # Open Drizzle Studio
```

## Testing the API

Test with common dishes:
- "macaroni and cheese"
- "grilled salmon" 
- "paneer butter masala"
- "pasta alfredo"

## Error Handling

The API returns consistent error responses:

```json
{
  "error": "Error Type",
  "message": "Detailed error message",
  "status_code": 400
}
```

Common error codes:
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (missing/invalid token)
- `404` - Not Found (dish not found)
- `409` - Conflict (email already exists)
- `422` - Unprocessable Entity (no calorie data)
- `429` - Too Many Requests (rate limited)
- `500` - Internal Server Error

## Architecture

The backend follows a modular architecture:

- **Routes**: API endpoint definitions
- **Middleware**: Auth, rate limiting, validation
- **Services**: Business logic (USDA integration)
- **Database**: Schema definitions and queries
- **Types**: TypeScript interfaces and Zod schemas
- **Utils**: Helper functions

## Contributing

1. Follow TypeScript best practices
2. Use Zod for all input validation
3. Implement proper error handling
4. Add rate limiting to new endpoints
5. Update this README for new features 
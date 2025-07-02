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
- **Optimized for Vercel serverless deployment**

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
- **Vercel**: Serverless deployment

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

## Vercel Deployment

This backend is optimized for Vercel's serverless platform with comprehensive deployment configurations.

### Prerequisites

Before deploying, ensure you have:

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **Database**: PostgreSQL database (Vercel Postgres, Neon, PlanetScale, or Railway)
3. **Redis**: Upstash Redis account for rate limiting
4. **USDA API Key**: From [USDA FoodData Central](https://fdc.nal.usda.gov/api-guide.html)

### Step 1: Database Setup

#### Option A: Vercel Postgres (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Navigate to your project
cd backend

# Add Vercel Postgres
vercel env add DATABASE_URL
# Enter your PostgreSQL connection string when prompted
```

#### Option B: External Database (Neon, PlanetScale, Railway)
1. Create a PostgreSQL database on your preferred platform
2. Copy the connection string
3. You'll add this to Vercel environment variables later

### Step 2: Redis Setup (Upstash)

1. Go to [Upstash Console](https://console.upstash.com/)
2. Create a new Redis database
3. Copy the `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`

### Step 3: Deploy to Vercel

#### Method 1: Using Vercel CLI (Recommended)

```bash
# Login to Vercel
vercel login

# Deploy
vercel

# Follow the prompts:
# - Set up and deploy? Y
# - Which scope? (select your team/personal)
# - Link to existing project? N
# - What's your project's name? calorie-counter-backend
# - In which directory is your code located? ./
```

#### Method 2: Using GitHub Integration

1. Push your code to GitHub
2. Go to [Vercel Dashboard](https://vercel.com/dashboard)
3. Click "New Project"
4. Import your GitHub repository
5. Configure build settings:
   - **Framework Preset**: Other
   - **Build Command**: `pnpm vercel-build`
   - **Output Directory**: `dist`
   - **Install Command**: `pnpm install`

### Step 4: Configure Environment Variables

In your Vercel project settings, add these environment variables:

#### Required Variables
| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host/db` |
| `USDA_API_KEY` | USDA FoodData Central API key | `abcd1234-5678-90ef-ghij-klmnopqrstuv` |
| `UPSTASH_REDIS_REST_URL` | Upstash Redis URL | `https://xxx.upstash.io` |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash Redis token | `AYASxxx...` |
| `JWT_SECRET` | JWT signing secret (32+ chars) | `super-secret-jwt-key-32-characters` |

#### Optional Variables
| Variable | Description | Default |
|----------|-------------|---------|
| `JWT_EXPIRES_IN` | Token expiration | `7d` |
| `CORS_ORIGIN` | Frontend domain | `https://your-app.vercel.app` |

### Step 5: Database Migration

After successful deployment, run database migrations:

```bash
# Pull environment variables locally
vercel env pull .env.local

# Run database migration
pnpm db:push

# Or if you have migrations
pnpm db:migrate
```

### Step 6: Test Deployment

1. **Health Check**: Visit `https://your-app.vercel.app/health`
2. **API Endpoints**: Test authentication and calorie endpoints
3. **Logs**: Check Vercel function logs for any errors

### Vercel Configuration

The project includes `vercel.json` with optimized settings:
- **Function timeout**: 15 seconds
- **Build command**: TypeScript compilation
- **Serverless function optimization**
- **Route configuration**: All requests routed to main handler

### Performance Optimizations

#### Cold Start Optimization
- **Separated app configuration**: App logic separated from server startup
- **Optimized imports**: Minimal imports for faster initialization
- **Database connection pooling**: Optimized for serverless environment

#### Connection Pooling
Database connections are optimized for serverless:
```typescript
max: env.NODE_ENV === 'production' ? 1 : 20,
idleTimeoutMillis: 30000,
connectionTimeoutMillis: 2000,
allowExitOnIdle: true,
```

#### Logging Optimization
- **Console-only logging**: No file system writes in production
- **Structured JSON logs**: Better debugging in Vercel dashboard
- **Environment detection**: Automatically detects serverless environment

## Troubleshooting

### Common Issues

1. **Database connection issues**:
   - Verify `DATABASE_URL` is correct
   - Ensure database is accessible from Vercel
   - Check connection pooling settings

2. **Redis connection issues**:
   - Verify Upstash credentials
   - Check Redis URL format
   - Ensure Redis instance is active

3. **CORS issues**:
   - Update `CORS_ORIGIN` to match your frontend domain
   - Check protocol (http vs https)

4. **Vercel deployment issues**:
   - Check build logs in Vercel dashboard
   - Verify all environment variables are set
   - Ensure database migrations are applied

### Deployment Troubleshooting

#### Common Issues

**1. Database Connection Timeout**
```
Error: Connection timeout
```
**Solution**: 
- Ensure your database allows connections from Vercel IPs
- Check if connection pooling is properly configured
- Verify `DATABASE_URL` format

**2. Redis Connection Issues**
```
Error: Redis connection failed
```
**Solution**:
- Verify `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`
- Check Upstash Redis dashboard for connection status
- Ensure Redis database is not paused

**3. CORS Errors**
```
Access to fetch blocked by CORS policy
```
**Solution**:
- Set `CORS_ORIGIN` to your frontend domain
- Ensure protocol matches (http vs https)

**4. JWT Secret Issues**
```
Error: JWT secret must be at least 32 characters
```
**Solution**:
- Generate a secure JWT secret: `openssl rand -hex 32`
- Update `JWT_SECRET` environment variable

**5. Build Failures**
```
Error: Module not found
```
**Solution**:
- Ensure all dependencies are in `package.json`
- Check TypeScript compilation errors
- Verify file paths are correct

### Monitoring and Maintenance

#### Environment Variable Updates
```bash
# Using Vercel CLI
vercel env add VARIABLE_NAME

# Or update via dashboard: Settings → Environment Variables → Edit
```

#### Database Monitoring
- Check connection pool usage
- Monitor query performance
- Set up alerts for high latency

#### Redis Monitoring
- Check request count and memory usage
- Monitor rate limiting effectiveness
- Review Redis dashboard for performance metrics

### Security Considerations

1. **JWT Secret**: Use a cryptographically secure secret (32+ characters)
2. **Database**: Use connection string with strong password
3. **CORS**: Set specific origin, avoid wildcards
4. **Rate Limiting**: Configure appropriate limits for your use case
5. **Environment Variables**: Never commit secrets to version control

### Scaling and Cost Optimization

#### Automatic Scaling
- Vercel functions scale automatically based on traffic
- No configuration needed for horizontal scaling
- Pay-per-execution pricing model

#### Database Scaling
For high traffic applications:
- Consider read replicas for better performance
- Implement connection pooling strategies
- Use database clustering for large datasets

#### Cost Management
- **Vercel Hobby**: Free for personal projects
- **Vercel Pro**: $20/month for commercial use
- **Database costs**: Varies by provider (Neon, PlanetScale, Railway)
- **Redis costs**: Upstash free tier (10K requests/month)

### Environment-Specific Notes

**Development**: Uses local PostgreSQL and Redis
**Production (Vercel)**: Uses cloud PostgreSQL and Upstash Redis

## License

MIT License 
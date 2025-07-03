# Calorie Counter Backend

A robust Express TypeScript backend service that integrates with the USDA FoodData Central API to provide calorie calculation functionality for various dishes.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Environment Variables](#environment-variables)
- [API Endpoints](#api-endpoints)
  - [Authentication](#authentication)
  - [Calorie Calculation](#calorie-calculation)
  - [Health Check](#health-check)
- [Database Schema](#database-schema)
- [Security Features](#security-features)
- [Logging](#logging)
- [Development Commands](#development-commands)
- [Testing the API](#testing-the-api)
- [Error Handling](#error-handling)
- [Architecture](#architecture)
  - [🏗️ System Overview](#️-system-overview)
  - [🔄 API Request Flow](#-api-request-flow)
  - [🗄️ Database Schema](#️-database-schema)
  - [🔐 Authentication Flow](#-authentication-flow)
  - [🌱 USDA Integration Flow](#-usda-integration-flow)
  - [🚀 Deployment Architecture](#-deployment-architecture)
  - [📁 Project Structure](#-project-structure)
  - [🔍 Key Architectural Decisions](#-key-architectural-decisions)
- [Contributing](#contributing)
- [Vercel Deployment](#vercel-deployment)
- [Troubleshooting](#troubleshooting)
- [License](#license)

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
  "macronutrients_per_serving": {
    "protein": 24.5,
    "total_fat": 8.2,
    "carbohydrates": 35.8,
    "fiber": 2.1,
    "sugars": 4.3,
    "saturated_fat": 2.1
  },
  "total_macronutrients": {
    "protein": 49.0,
    "total_fat": 16.4,
    "carbohydrates": 71.6,
    "fiber": 4.2,
    "sugars": 8.6,
    "saturated_fat": 4.2
  },
  "source": "USDA FoodData Central",
  "ingredient_breakdown": [
    {
      "name": "Chicken biryani",
      "calories_per_100g": 180,
      "macronutrients_per_100g": {
        "protein": 15.7,
        "total_fat": 5.2,
        "carbohydrates": 22.9,
        "fiber": 1.4,
        "sugars": 2.8,
        "saturated_fat": 1.3
      },
      "serving_size": "156g",
      "data_type": "Survey (FNDDS)",
      "fdc_id": 167512,
      "brand": null,
      "category": "Mixed Dishes"
    }
  ],
  "matched_food": {
    "name": "Chicken biryani",
    "fdc_id": 167512,
    "data_type": "Survey (FNDDS)",
    "published_date": "2019-04-01"
  }
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
  - General endpoints: 100 req/5min
  - Calorie endpoints: 15 req/5min
  - Auth endpoints: 5 req/5min
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

The Calorie Counter Backend follows a modern, serverless-first architecture designed for scalability, security, and maintainability. Below are detailed architectural diagrams explaining the system design.

### 🏗️ System Overview

```mermaid
graph TB
    Client[Frontend Application] --> LB[Load Balancer/CDN]
    LB --> API[Express.js API Server]
    
    API --> Auth[JWT Authentication]
    API --> RL[Rate Limiter]
    API --> Val[Zod Validation]
    
    Auth --> JWT[JWT Token Service]
    RL --> Redis[(Upstash Redis)]
    
    API --> AuthRoute[Auth Routes]
    API --> CalRoute[Calorie Routes]
    API --> Health[Health Check]
    
    AuthRoute --> AuthServ[Auth Service]
    CalRoute --> CalServ[Calorie Service]
    CalServ --> USDA[USDA API Service]
    
    AuthServ --> DB[(PostgreSQL)]
    USDA --> USDAApi[USDA FoodData Central API]
    
    DB --> Drizzle[Drizzle ORM]
    
    API --> Logger[Winston Logger]
    Logger --> Logs[Log Files]
    
    subgraph "Security Layer"
        Auth
        RL
        Val
        Helmet[Helmet.js Security]
    end
    
    subgraph "External Services"
        Redis
        USDAApi
        DB
    end
    
    subgraph "Deployment"
        Vercel[Vercel Serverless]
        API --> Vercel
    end
    
    style Client fill:#e1f5fe
    style API fill:#f3e5f5
    style DB fill:#e8f5e8
    style Redis fill:#fff3e0
    style USDAApi fill:#f1f8e9
    style Vercel fill:#fce4ec
```

### 🔄 API Request Flow

```mermaid
sequenceDiagram
    participant Client
    participant API as Express API
    participant Auth as JWT Middleware
    participant RL as Rate Limiter
    participant Val as Zod Validator
    participant Service as Business Logic
    participant DB as PostgreSQL
    participant USDA as USDA API

    Client->>API: POST /get-calories
    API->>RL: Check rate limit
    RL->>Redis: Validate IP limit
    Redis-->>RL: Allow/Deny
    RL-->>API: Rate limit result
    
    alt Rate limit exceeded
        API-->>Client: 429 Too Many Requests
    else Rate limit OK
        API->>Auth: Verify JWT token
        Auth-->>API: User authenticated
        
        API->>Val: Validate request body
        Val-->>API: Validation result
        
        alt Validation failed
            API-->>Client: 400 Bad Request
        else Validation OK
            API->>Service: Process calorie request
            Service->>USDA: Search food data
            USDA-->>Service: Food nutrition data
            Service->>Service: Calculate calories
            Service-->>API: Calorie results
            API-->>Client: 200 Success with data
        end
    end

    Note over Client,USDA: All responses include structured logging
```

### 🗄️ Database Schema

```mermaid
erDiagram
    USERS {
        serial id PK
        varchar firstName
        varchar lastName
        varchar email UK
        text passwordHash
        timestamp createdAt
        timestamp updatedAt
    }

    USERS ||--o{ CALORIE_LOGS : "can have"
    
    CALORIE_LOGS {
        serial id PK
        int userId FK
        varchar dishName
        int servings
        float caloriesPerServing
        float totalCalories
        varchar source
        json ingredientBreakdown
        timestamp createdAt
    }
```

**Key Points:**
- Database uses **camelCase** internally, API responses use **snake_case**
- JWT tokens include user data for stateless authentication
- Passwords are hashed with bcrypt (12 salt rounds)
- Future-ready schema with calorie logs table for analytics

### 🔐 Authentication Flow

```mermaid
sequenceDiagram
    participant Client
    participant API as Express API
    participant Auth as Auth Service
    participant DB as PostgreSQL
    participant JWT as JWT Service
    participant Bcrypt as Password Hash

    rect rgb(245, 245, 245)
        Note over Client,Bcrypt: User Registration Flow
        Client->>API: POST /auth/register
        API->>Auth: Validate input data
        Auth->>DB: Check if email exists
        DB-->>Auth: User exists/not exists
        
        alt User already exists
            Auth-->>API: 409 Conflict
            API-->>Client: User already exists
        else New user
            Auth->>Bcrypt: Hash password (12 rounds)
            Bcrypt-->>Auth: Password hash
            Auth->>DB: Create new user
            DB-->>Auth: User created
            Auth->>JWT: Generate token
            JWT-->>Auth: JWT token
            Auth-->>API: User + token
            API-->>Client: 201 Created with token
        end
    end

    rect rgb(250, 250, 250)
        Note over Client,Bcrypt: User Login Flow
        Client->>API: POST /auth/login
        API->>Auth: Validate credentials
        Auth->>DB: Find user by email
        DB-->>Auth: User data
        
        alt User not found
            Auth-->>API: 422 Invalid credentials
            API-->>Client: Invalid email/password
        else User found
            Auth->>Bcrypt: Compare password
            Bcrypt-->>Auth: Password valid/invalid
            
            alt Password invalid
                Auth-->>API: 422 Invalid credentials
                API-->>Client: Invalid email/password
            else Password valid
                Auth->>JWT: Generate token
                JWT-->>Auth: JWT token
                Auth-->>API: User + token
                API-->>Client: 200 Success with token
            end
        end
    end
```

### 🌱 USDA Integration Flow

```mermaid
flowchart TD
    Start([Client Request: dish_name + servings]) --> Validate[Validate Input]
    Validate --> Search[Search USDA API]
    
    Search --> USDAReq[POST /foods/search<br/>with dish_name]
    USDAReq --> USDAResp[Receive foods array]
    
    USDAResp --> Match{Find Best Match}
    
    Match --> Exact[1. Exact Match<br/>Case-insensitive]
    Match --> StartsWith[2. Starts With<br/>Description begins with query]
    Match --> Contains[3. Contains<br/>Description includes query]
    Match --> Score[4. Comprehensive Scoring]
    
    Exact --> Found{Food Found?}
    StartsWith --> Found
    Contains --> Found
    Score --> ScoreCalc[Calculate Score:<br/>• Word matching<br/>• Data type priority<br/>• Calorie availability<br/>• Length penalty]
    ScoreCalc --> Found
    
    Found -->|Yes| Extract[Extract Nutrition Data]
    Found -->|No| Error[404 Not Found]
    
    Extract --> Calories[Get Calories per 100g<br/>kcal > kJ conversion]
    Extract --> Macros[Get Macronutrients<br/>Protein, Fats, Carbs]
    Extract --> Serving[Calculate Serving Size]
    
    Calories --> Calculate[Calculate Total Calories<br/>= calories_per_100g × serving_size × servings]
    Macros --> Calculate
    Serving --> Calculate
    
    Calculate --> Response[Return Formatted Response<br/>snake_case format]
    Error --> Response
    
    Response --> End([Client Response])
    
    subgraph "Data Priority"
        P1[Foundation Foods - Highest]
        P2[SR Legacy - High]
        P3[Survey FNDDS - Medium]
        P4[Branded Foods - Low]
    end
    
    subgraph "Scoring Algorithm"
        S1[Word Match Score: 0-100]
        S2[Data Type Boost: +10 to +20]
        S3[Calorie Boost: +10]
        S4[Length Penalty: -5]
    end
    
    style Start fill:#e1f5fe
    style Response fill:#e8f5e8
    style Error fill:#ffebee
    style Search fill:#f3e5f5
    style Calculate fill:#fff3e0
```

### 🚀 Deployment Architecture

```mermaid
graph TB
    subgraph "Client Layer"
        Web[Web Browser]
        Mobile[Mobile App]
        API_Client[API Client]
    end
    
    subgraph "CDN & Edge"
        Vercel_Edge[Vercel Edge Network]
        CDN[Global CDN]
    end
    
    subgraph "Vercel Serverless"
        Func[Serverless Functions]
        Router[API Router]
        Middleware[Middleware Stack]
    end
    
    subgraph "Application Layer"
        Auth_MW[Auth Middleware]
        Rate_MW[Rate Limiter]
        Val_MW[Validation]
        Routes[Route Handlers]
        Services[Business Logic]
    end
    
    subgraph "External Services"
        Redis_DB[(Upstash Redis<br/>Rate Limiting)]
        Postgres_DB[(PostgreSQL<br/>User Data)]
        USDA_Service[USDA FoodData<br/>Central API]
    end
    
    subgraph "Monitoring & Logging"
        Logs[Winston Logger]
        Metrics[Vercel Analytics]
        Errors[Error Tracking]
    end
    
    Web --> Vercel_Edge
    Mobile --> Vercel_Edge
    API_Client --> Vercel_Edge
    
    Vercel_Edge --> CDN
    CDN --> Func
    
    Func --> Router
    Router --> Middleware
    
    Middleware --> Auth_MW
    Middleware --> Rate_MW
    Middleware --> Val_MW
    
    Auth_MW --> Routes
    Rate_MW --> Routes
    Val_MW --> Routes
    
    Routes --> Services
    
    Rate_MW <--> Redis_DB
    Services <--> Postgres_DB
    Services <--> USDA_Service
    
    Func --> Logs
    Func --> Metrics
    Func --> Errors
    
    style Web fill:#e1f5fe
    style Mobile fill:#e1f5fe
    style API_Client fill:#e1f5fe
    style Vercel_Edge fill:#f3e5f5
    style Func fill:#fff3e0
    style Redis_DB fill:#ffebee
    style Postgres_DB fill:#e8f5e8
    style USDA_Service fill:#f1f8e9
```

### 📁 Project Structure

The backend follows a modular architecture with clear separation of concerns:

- **Routes**: API endpoint definitions and request handling
- **Middleware**: Authentication, rate limiting, and validation
- **Services**: Business logic and external API integration
- **Database**: Schema definitions and database queries
- **Types**: TypeScript interfaces and Zod validation schemas
- **Utils**: Helper functions and utilities

### 🔍 Key Architectural Decisions

1. **Serverless-First Design**: Built for Vercel's serverless environment with optimized cold starts
2. **Stateless Authentication**: JWT tokens eliminate server-side session storage
3. **Redis Rate Limiting**: Persistent, distributed rate limiting across serverless functions
4. **Input Validation**: Zod schemas ensure type safety at runtime
5. **Structured Logging**: Winston provides comprehensive logging with metadata
6. **Connection Pooling**: Optimized database connections for serverless architecture
7. **Error Handling**: Consistent error responses with proper HTTP status codes

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
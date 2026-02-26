# Asynchronous Report Generator - Monorepo

This is a Node.js/TypeScript monorepo that implements an asynchronous report generation system using npm workspaces.

## Monorepo Structure

```
report-generator/
├── backend/              # Express API (port 3000)
├── worker/              # Background job processor
├── frontend/            # Angular 20+ (port 4200)
├── shared/              # Shared types and interfaces
├── tsconfig.base.json   # TypeScript base configuration
├── package.json         # Workspace configuration
└── README.md
```

## Workspaces

### 1. **Shared** (`@report-generator/shared`)
Contains shared types, interfaces, and utilities between backend, worker, and frontend.

**Key files:**
- `src/index.ts` - Type definitions
- `src/config/database.ts` - Database connection singleton
- `src/config/redis.ts` - Redis connection singleton
- `src/logger/index.ts` - Centralized Pino logger

### 2. **Backend** (`@report-generator/backend`)
Express REST API that exposes endpoints to create and query reports, and Server-Sent Events (SSE) for real-time notifications.

**Dependencies:**
- Express
- Sequelize + PostgreSQL
- Redis
- CORS

**Scripts:**
- `npm run dev` - Start server in development mode (ts-node)
- `npm run build` - Compile TypeScript
- `npm start` - Run compiled version

### 3. **Worker** (`@report-generator/worker`)
Background process that consumes jobs from Redis queue and processes reports.

**Dependencies:**
- Sequelize + PostgreSQL
- Redis

**Scripts:**
- `npm run dev` - Start worker in development mode
- `npm run build` - Compile TypeScript
- `npm start` - Run compiled version

### 4. **Frontend** (`@report-generator/frontend`)
Angular 20+ application with ag-Grid table to display reports and form to create new ones.

**Dependencies:**
- Angular 20+
- ag-Grid
- RxJS

**Scripts:**
- `npm run dev` - Start Angular development server
- `npm run build` - Build application for production
- `npm test` - Run tests

## Installation

```bash
# Install all dependencies for all workspaces
npm install

# Or use npm workspaces explicitly
npm install --workspaces
```

## Commands

### Development
```bash
# Run all workspaces in development mode
npm run dev

# Run a specific workspace
npm run dev --workspace=backend
npm run dev --workspace=worker
npm run dev --workspace=frontend
npm run dev --workspace=shared
```

### Build
```bash
# Build all workspaces
npm run build

# Build a specific workspace
npm run build --workspace=backend
```

### Clean
```bash
# Remove node_modules and dist from all workspaces
npm run clean
```

## Configuration

### Prerequisites
- Node.js v20+
- npm v9+
- PostgreSQL
- Redis

### Environment Variables

Create a `.env` file in the project root with the following variables:

```bash
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=report_generator

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379

# Server Configuration
NODE_ENV=development
PORT=3000

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:4200
```

See `.env.example` for a template.

## Data Flow

1. **Client** → POST `/api/reports` (Backend)
2. **Backend** → Validates, creates in DB, enqueues to Redis
3. **Backend** → Returns report (status: PENDING)
4. **Worker** → Consumes job from Redis, updates status to PROCESSING
5. **Worker** → Publishes update via Redis Pub/Sub
6. **Backend** → Receives update, publishes via SSE
7. **Frontend** → Receives update via EventSource, updates UI
8. **Worker** → Completes processing, updates status to COMPLETED

## Architecture Highlights

### Shared Connections
Both backend and worker use the **same connection instances** from `shared`:
- PostgreSQL connection via `initializeDatabase()` and `getDatabase()`
- Redis connection via `initializeRedis()` and `getRedisClient()`
- Centralized logger via Pino

### Bootstrap Pattern
Both backend and worker follow the same initialization pattern:
- `index.ts` - Entry point (calls bootstrap)
- `bootstrap.ts` - Handles connection initialization and graceful shutdown
- Clean separation of concerns


**Note:** This project is structured as a modern monorepo. Each workspace is independent but shares types and utilities through `shared`.


# Asynchronous Report Generator - Monorepo

This is a Node.js/TypeScript monorepo that implements an asynchronous report generation system using npm workspaces.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                             BROWSER / CLIENT                            │
│                          (Angular 20+ App)                              │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │  Reports Grid (ag-Grid)                                         │   │
│  │  • Display all reports with status badges                       │   │
│  │  • Real-time status updates via SSE                             │   │
│  │  • Form modal to create new reports                             │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│            │                                        │                   │
│            │ HTTP POST /api/reports                 │ SSE EventStream   │
│            │ (Create Report)                        │ (Real-time Updates)
│            └──────────────────┬──────────────────────┘                   │
└─────────────────────────────────────────────────────────────────────────┘
                                 │
                    ┌────────────┴────────────┐
                    │                         │
                    ↓                         ↓
        ┌──────────────────────┐  ┌──────────────────────┐
        │  HTTP POST/GET       │  │  SSE GET /stream     │
        │  Stateless Requests  │  │  Persistent Conn     │
        └──────────────────────┘  └──────────────────────┘
                    │                         │
        ┌───────────┴────────────────────────┴───────────┐
        │                                                │
        ↓                                                ↓
┌─────────────────────────────────────────────────────────────────────────┐
│                        EXPRESS API SERVER                               │
│                         (Port 3000)                                     │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │  Route Handlers                                                 │   │
│  │  • POST   /api/reports         → Create new report              │   │
│  │  • GET    /api/reports         → List all reports               │   │
│  │  • GET    /api/reports/:id     → Get single report              │   │
│  │  • GET    /api/reports/stream  → SSE endpoint                   │   │
│  │  • GET    /health              → Health check                   │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │  Service Layer                                                  │   │
│  │  • ReportService     → Database CRUD operations               │   │
│  │  • QueueService      → Redis queue & pub/sub management        │   │
│  │  • SSE Broadcaster   → Push updates to connected clients       │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                         │                         │                    │
│                         └─────────────┬───────────┘                    │
└─────────────────────────────────────────────────────────────────────────┘
                                 │
                ┌────────────────┼────────────────┐
                │                │                │
                ↓                ↓                ↓
        ┌──────────────┐  ┌─────────────┐  ┌────────────────┐
        │ PostgreSQL   │  │Redis Queue  │  │Redis Pub/Sub   │
        │(Persistence) │  │report_queue │  │report_updates  │
        │              │  │             │  │                │
        │ Reports Table│  │ [Job, Job]  │  │ Event Channel  │
        └──────────────┘  └─────────────┘  └────────────────┘
                ↑                ↑                ↑
                │                │                │
                └────────────────┼────────────────┘
                                 │
┌─────────────────────────────────────────────────────────────────────────┐
│                       WORKER PROCESS                                    │
│                  (Background Job Processor)                             │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │  Job Processing Loop                                            │   │
│  │  1. BRPOP from Redis queue (blocking, 5s timeout)              │   │
│  │  2. Fetch report from PostgreSQL                               │   │
│  │  3. Update status → PROCESSING                                 │   │
│  │  4. Publish PROCESSING event via Redis Pub/Sub                 │   │
│  │  5. Simulate report generation (5 seconds)                     │   │
│  │  6. Update status → COMPLETED (or FAILED on error)             │   │
│  │  7. Publish COMPLETED event via Redis Pub/Sub                  │   │
│  │  8. Loop back to step 1                                        │   │
│  └──────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
```

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

## Setup Instructions: Running Locally

### Prerequisites
- **Node.js** v20+ ([Download](https://nodejs.org/))
- **npm** v9+
- **PostgreSQL** 12+ ([Download](https://www.postgresql.org/download/))
- **Redis** 6+ ([Download](https://redis.io/download/))

### Step 1: Clone and Install Dependencies

```bash
# Clone the repository
git clone <repository-url>
cd report-generator

# Install all dependencies for all workspaces
npm install
```

### Step 2: Setup Database (PostgreSQL)

```bash
# Create a new PostgreSQL database
psql -U postgres

# Inside psql:
CREATE DATABASE report_generator;
\q
```

### Step 3: Setup Environment Variables

Create a `.env` file in the project root:

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

### Step 4: Start PostgreSQL and Redis

```bash
# On macOS (using Homebrew)
brew services start postgresql
brew services start redis

# On Linux (using systemctl)
sudo systemctl start postgresql
sudo systemctl start redis-server

# On Windows (manually or using services)
# Start PostgreSQL and Redis from your installations
```

### Step 5: Run the Application

Open **three terminal windows** and run each service:

#### Terminal 1: Backend API (Port 3000)

```bash
npm run dev --workspace=backend
```

Expected output:
```
✓ PostgreSQL connected
✓ Redis connected
Server running on http://localhost:3000
```

#### Terminal 2: Worker Process

```bash
npm run dev --workspace=worker
```

Expected output:
```
✓ PostgreSQL connected
✓ Redis connected
  Worker started, listening to queue...
```

#### Terminal 3: Frontend (Port 4200)

```bash
npm run dev --workspace=frontend
```

Expected output:
```
✔ Compiled successfully.
✔ Browser application bundle generated successfully.
⠙ Bundling...
```

### Step 6: Access the Application

Open your browser and navigate to:

```
http://localhost:4200
```

## Available Commands

### Development
```bash
# Run all workspaces in development mode
npm run dev

# Run a specific workspace
npm run dev --workspace=backend
npm run dev --workspace=worker
npm run dev --workspace=frontend
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


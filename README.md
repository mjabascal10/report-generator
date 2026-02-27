# Asynchronous Report Generator

A full-stack TypeScript monorepo demonstrating asynchronous job processing with real-time updates.

## Tech Stack

- **Frontend**: Angular 20+ with ag-Grid
- **Backend**: Node.js + Express + Sequelize
- **Worker**: Background job processor
- **Database**: PostgreSQL
- **Queue**: Redis (job queue + pub/sub)

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND                                │
│                      Angular 20 + ag-Grid                       │
│                                                                 │
│  [Create Report Button] → Modal Form                           │
│  [Reports Table] → Real-time status updates                    │
└─────────────────────────────────────────────────────────────────┘
           │                                          ↑
           │ HTTP POST                                │ SSE
           │ /api/reports                             │ /api/reports/stream
           ↓                                          │
┌─────────────────────────────────────────────────────────────────┐
│                          BACKEND                                │
│                    Express API (Port 3000)                      │
│                                                                 │
│  Routes → Controllers → Services                               │
│                                                                 │
│  POST   /api/reports        Create report                      │
│  GET    /api/reports        List reports                       │
│  GET    /api/reports/stream SSE endpoint                       │
└─────────────────────────────────────────────────────────────────┘
           │                           ↑
           │                           │
           ↓                           │
    ┌──────────┐              ┌───────────────┐
    │PostgreSQL│              │ Redis Pub/Sub │
    │          │              │ report_updates│
    │ reports  │              └───────────────┘
    │  table   │                      ↑
    └──────────┘                      │ PUBLISH
           ↑                           │
           │                           │
           │ UPDATE                    │
           │                           │
    ┌──────────────────────────────────┴──────┐
    │                                         │
┌─────────────────────────────────────────────────────────────────┐
│                          WORKER                                 │
│                   Background Job Processor                      │
│                                                                 │
│  Loop:                                                          │
│   1. BRPOP from Redis queue (blocking)                         │
│   2. Update status → PROCESSING                                │
│   3. Publish update to Redis Pub/Sub                           │
│   4. Simulate work (5 seconds)                                 │
│   5. Update status → COMPLETED                                 │
│   6. Publish update to Redis Pub/Sub                           │
└─────────────────────────────────────────────────────────────────┘
           ↑
           │ BRPOP
           │
    ┌──────────────┐
    │ Redis Queue  │
    │report_queue  │
    │   [jobs]     │
    └──────────────┘
           ↑
           │ LPUSH
           │
    [Backend enqueues jobs here]
```

## Project Structure

```
report-generator/
├── backend/       # Express API (port 3000)
├── worker/        # Background job processor
├── frontend/      # Angular app (port 4200)
├── shared/        # Shared types, models, config
└── .env           # Environment variables
```

## Quick Start

### Prerequisites

- Node.js v20+
- PostgreSQL 12+
- Redis 6+

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup Database

```bash
# Create database
psql -U postgres -c "CREATE DATABASE report_generator;"
```

### 3. Configure Environment

Create `.env` file in the root:

```bash
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=report_generator

REDIS_HOST=localhost
REDIS_PORT=6379

NODE_ENV=development
PORT=3000

FRONTEND_URL=http://localhost:4200
```

### 4. Start Services

Make sure PostgreSQL and Redis are running:

```bash
# macOS
brew services start postgresql redis

# Linux
sudo systemctl start postgresql redis-server
```

### 5. Compile Shared Workspace

```bash
npm run build --workspace=shared
```

### 6. Run the Application

Open **three terminals**:

```bash
# Terminal 1: Backend
npm run dev --workspace=backend

# Terminal 2: Worker
npm run dev --workspace=worker

# Terminal 3: Frontend
npm run dev --workspace=frontend
```

### 7. Open the App

Visit **http://localhost:4200**

## Features

- ✅ Create reports via modal form
- ✅ Real-time status updates (no page refresh)
- ✅ ag-Grid table with status badges
- ✅ Background job processing
- ✅ Server-Sent Events (SSE) for live updates
- ✅ Full TypeScript monorepo

## API Endpoints

```
POST   /api/reports        # Create new report
GET    /api/reports        # List all reports
GET    /api/reports/stream # SSE real-time updates
GET    /health             # Health check
```

## How It Works

1. **User creates report** → Frontend sends POST to backend
2. **Backend saves to DB** → Status: PENDING → Job queued in Redis
3. **Worker picks up job** → Updates status to PROCESSING
4. **Worker simulates work** → Waits 5 seconds
5. **Worker completes** → Updates status to COMPLETED
6. **Backend broadcasts** → SSE pushes update to frontend
7. **Frontend updates** → ag-Grid shows new status (no refresh!)

## License

MIT


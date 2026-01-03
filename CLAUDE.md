# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A multi-platform media downloader application consisting of four parts:
- **Backend** (`backend/`): NestJS API for handling downloads, authentication, and WebSocket real-time updates
- **Frontend** (`frontend/`): Next.js 15 web application with shadcn/ui components
- **Mobile** (`mobile/`): React Native + Expo mobile app with Clean Architecture
- **Desktop** (`desktop/`): Electron standalone application with embedded NestJS backend

The application downloads media from multiple platforms (YouTube, TikTok, Instagram, Facebook) using yt-dlp, with real-time progress updates via WebSockets.

---

## Common Commands

### Backend (NestJS)
```bash
cd backend

# Development
npm run start:dev          # Start with watch mode
npm run start:debug        # Start with debug mode

# Building
npm run build              # Compile TypeScript to dist/
npm run start:prod         # Run production build from dist/

# Testing
npm run test               # Run unit tests
npm run test:e2e           # Run e2e tests
npm run test:cov           # Run tests with coverage

# Database (Prisma)
npx prisma generate        # Generate Prisma client
npx prisma db push         # Push schema changes to database
npx prisma migrate dev     # Create and apply migration
npx prisma studio          # Open Prisma Studio GUI

# Linting
npm run lint               # Run ESLint
npm run format             # Format with Prettier
```

### Frontend (Next.js 15)
```bash
# Development (runs on port 3000)
npm run dev                # Start Next.js dev server

# Building
npm run build              # Build for production
npm run start              # Start production server (requires build first)

# Database (Prisma)
npm run db:push            # Push schema to database
npm run db:generate        # Generate Prisma client
npm run db:migrate         # Create migration
npm run db:reset           # Reset database

# Linting
npm run lint               # Run ESLint
```

### Mobile (React Native + Expo)
```bash
cd mobile

# Development
npm start                  # Start Expo dev server
npm run android            # Run on Android
npm run ios                # Run on iOS (macOS only)
npm run web                # Run in web browser

# Type checking
npm run type-check         # Check TypeScript types
npm run lint               # Run ESLint

# Troubleshooting
npm start -- --reset-cache # Clear Metro cache
```

### Desktop (Electron + NestJS)
```bash
cd desktop

# Development (starts backend + frontend + electron)
npm run dev                  # Start full development environment

# Individual development
npm run dev:backend          # Start NestJS backend only
npm run dev:frontend         # Start Next.js frontend only
npm run dev:electron         # Start Electron only (after backend/frontend ready)

# Building
npm run build                # Build frontend + backend + electron
npm run build:frontend       # Build Next.js to .next/
npm run build:backend        # Build NestJS to dist/
npm run build:electron       # Compile Electron TypeScript to dist/

# Packaging (creates standalone installers)
npm run dist                 # Build for current platform
npm run dist:windows         # Build .exe for Windows
npm run dist:mac             # Build .dmg for macOS
npm run dist:linux           # Build .AppImage/.deb for Linux

# Download yt-dlp binaries
./download-ytdlp.sh          # Unix/Linux/macOS
download-ytdlp.bat           # Windows
```

### Full Stack Development
```bash
# Terminal 1: Start backend
cd backend && npm run start:dev

# Terminal 2: Start frontend
cd frontend && npm run dev

# Terminal 3 (optional): Start mobile
cd mobile && npm start

# Terminal 4 (optional): Start desktop
cd desktop && npm run dev
```

---

## Architecture

### Backend Architecture

**Framework:** NestJS with TypeScript, Prisma ORM, Socket.IO

**Module Structure:**
- `modules/download/` - Download job management and yt-dlp integration
- `modules/auth/` - JWT authentication with bcrypt password hashing
- `modules/websocket/` - Real-time progress updates via Socket.IO
- `modules/queue/` - Bull queue processor (currently using in-memory Map instead)
- `common/prisma.service.ts` - Prisma client singleton for database access

**Key Patterns:**
- Jobs are stored in-memory in `DownloadService.jobs: Map<string, DownloadJobDto>`
- WebSocket gateway broadcasts updates to all clients subscribed to 'jobs' room
- Download execution uses `spawn('yt-dlp', args)` with progress parsing from stderr
- Static files served from `/downloads` directory via `ServeStaticModule`

**Download Flow:**
1. Frontend sends URL(s) to `POST /api/downloads`
2. `DownloadService.createDownloadJob()` creates jobs and starts async processing
3. `processDownload()` gets video info, spawns yt-dlp, parses progress
4. WebSocket emits real-time progress to frontend
5. Completed files are saved to `backend/downloads/`

**Database (SQLite with Prisma):**
- `User` - id, email, name, password (hashed), createdAt, updatedAt
- `DownloadJob` - id, url, title, duration, thumbnail, mediaType, quality, format, status, progress, downloadPath, errorMessage, createdAt, completedAt, userId

**API Endpoints:**
- Auth: `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`
- Downloads: `POST /api/downloads`, `GET /api/downloads`, `GET /api/downloads/:jobId`, `GET /api/downloads/download-file/:filename`
- Docs: Swagger UI at `/api`

**WebSocket Events:**
- Client → Server: `subscribe-jobs`, `unsubscribe-jobs`
- Server → Client: `job-update`, `notification`

### Frontend Architecture

**Framework:** Next.js 15 with App Router, TypeScript, Tailwind CSS 4, shadcn/ui

**State Management:**
- Zustand for global state
- TanStack Query for server state
- next-themes for dark/light mode

**Key Components:**
- `app/page.tsx` - Main download interface with URL input and job list
- `app/layout.tsx` - Root layout with ThemeProvider
- `components/theme-provider.tsx` - Theme context for dark/light mode
- `components/ui/` - shadcn/ui components (Button, Card, Input, etc.)

**API Integration:**
- `app/api/route.ts` - Next.js API route that proxies to backend
- Socket.IO client connects to `ws://localhost:3001` for real-time updates

**Styling:**
- Tailwind CSS 4 with custom theme in `tailwind.config.ts`
- shadcn/ui components in `components/ui/`
- `app/globals.css` for global styles and CSS variables

### Mobile Architecture

**Framework:** React Native + Expo SDK 54, TypeScript, React Navigation

**Clean Architecture Layers:**
- `domain/` - Entities, repository interfaces, use cases
- `data/` - Repository implementations, API services
- `presentation/` - Screens, components, navigation, Zustand stores, theme

**Dependency Injection:**
- `src/di.ts` - Centralized DI container providing use case instances
- Import use cases: `import { useCases } from './di'`

**State Management:**
- Zustand stores in `presentation/stores/`
- No hardcoded colors - always use `theme.colors.*`
- React.memo for all components

**Navigation:**
- React Navigation v6 with bottom tabs and native stack
- Configuration in `presentation/navigation/`

**Theme:**
- Two themes: Ocean Breeze (light), Dark Mode Native (dark)
- Automatic theme selection based on device settings
- Theme system in `presentation/theme/`

### Desktop Architecture

**Framework:** Electron + NestJS embedded

**Structure:**

- `src/main.ts` - Electron main process, starts NestJS backend
- `src/preload.ts` - Preload script for secure IPC communication
- `binaries/` - Platform-specific yt-dlp binaries (Windows/macOS/Linux)
- `resources/` - Icons, error page, and static assets

**Key Patterns:**

- Main process spawns NestJS backend as child process on startup
- Backend runs on dynamic port (3001-3010) to avoid conflicts
- Frontend (Next.js) compiled to static files served by NestJS
- yt-dlp bundled as platform-specific binary
- SQLite database stored in user data directory
- Downloads saved to user data directory

**Desktop-specific Features:**

- `window.electronAPI` exposed to renderer process via contextBridge
- Backend URL detection: `getBackendURL()` returns embedded backend URL
- Downloads folder access: `getDownloadsPath()` and `openDownloadsFolder()`
- No external dependencies - completely offline-capable (except for video downloads)

**Build Process:**

1. Frontend compiled with `npm run build` → `.next/`
2. Backend compiled with `npm run build` → `dist/`
3. Electron TypeScript compiled → `dist/`
4. electron-builder packages everything into platform-specific installer

**Frontend Integration:**

- Use `frontend/src/lib/desktop.ts` utilities to detect desktop mode
- `isDesktop()` checks if running in Electron
- `getBackendURL()` returns embedded backend URL in desktop mode
- API calls automatically use correct backend URL

---

## Environment Configuration

### Backend (.env)
```env
DATABASE_URL="file:./dev.db"
REDIS_HOST=localhost
REDIS_PORT=6379
JWT_SECRET=your-super-secret-jwt-key
FRONTEND_URL=http://localhost:3000
PORT=3001
MAX_CONCURRENT_DOWNLOADS=3
DOWNLOAD_PATH=./downloads
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

**Important:** Use `NEXT_PUBLIC_` prefix for client-side variables. Never commit `.env.local` files.

### Mobile (.env)
```env
API_BASE_URL=http://192.168.1.100:3001  # Use local IP, not localhost for physical devices
```

---

## Database Schema

**Prisma Schema:** [backend/prisma/schema.prisma](backend/prisma/schema.prisma)

```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  password  String   // bcrypt hashed
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  downloads DownloadJob[]
}

model DownloadJob {
  id           String   @id @default(cuid())
  url          String
  title        String?
  duration     String?
  thumbnail    String?
  mediaType    String   // 'video' | 'audio'
  quality      String
  format       String
  status       String   // 'pending' | 'downloading' | 'completed' | 'failed'
  progress     Int      @default(0)
  downloadPath String?
  errorMessage String?
  createdAt    DateTime @default(now())
  completedAt  DateTime?
  userId       String
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

---

## Key Technologies

- **yt-dlp** - CLI tool for downloading media (must be installed on system)
- **Prisma** - ORM for SQLite database
- **Socket.IO** - WebSocket for real-time updates
- **shadcn/ui** - Pre-built React components for Next.js
- **Zustand** - Lightweight state management
- **TanStack Query** - Server state management
- **Bull/BullMQ** - Queue system (configured but not actively used)

---

## Development Notes

### Running the Full Stack
1. Ensure Redis is running (or install and start Redis server)
2. Ensure yt-dlp is installed on the system
3. Start backend: `cd backend && npm run start:dev`
4. Start frontend: `cd frontend && npm run dev`
5. Access web app at `http://localhost:3000`
6. API docs at `http://localhost:3001/api`

### Mobile Development with Physical Device
- Change `localhost` to your machine's local IP in mobile app
- Ensure device and development machine are on same WiFi network
- Use Expo Go app to scan QR code

### Testing Download Functionality
- The backend uses in-memory storage for jobs (not persisted to database)
- Files are downloaded to `backend/downloads/`
- Progress updates are broadcast via WebSocket to all connected clients

### Adding New Features
1. Backend: Add new module in `backend/src/modules/` following NestJS patterns
2. Frontend: Add components in `frontend/src/components/` and pages in `frontend/src/app/`
3. Mobile: Follow Clean Architecture - add use cases in `domain/usecases/`, implementations in `data/`, UI in `presentation/`

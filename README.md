# Video Streaming

A monorepo containing the frontend and backend for the video streaming platform.

## Structure

```
video-streaming/
├── frontend/   # React (Vite) — user interface
└── backend/    # NestJS — REST API and business logic
```

## Getting Started

### Prerequisites

- Node.js >= 18
- npm >= 9

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Runs on `http://localhost:5173` by default.

### Backend

```bash
cd backend
npm install
npm run start:dev
```

Runs on `http://localhost:3000` by default.

## Scripts

| Location   | Command              | Description                |
|------------|----------------------|----------------------------|
| `frontend` | `npm run dev`        | Start dev server           |
| `frontend` | `npm run build`      | Production build           |
| `frontend` | `npm run preview`    | Preview production build   |
| `backend`  | `npm run start:dev`  | Start with hot reload      |
| `backend`  | `npm run build`      | Compile TypeScript         |
| `backend`  | `npm run start:prod` | Start compiled build       |
| `backend`  | `npm run test`       | Run unit tests             |
| `backend`  | `npm run test:e2e`   | Run end-to-end tests       |

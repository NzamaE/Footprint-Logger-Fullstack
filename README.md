# 🌱 Footprint Logger

A full-stack web app for tracking personal carbon emissions. Users log daily activities (transport, energy, food, waste), and the app automatically calculates their carbon footprint, surfaces real-time tips over WebSockets, tracks progress against emission-reduction goals, and ranks users on a community leaderboard.

## Features

- **JWT authentication** — register/login with hashed passwords (bcrypt)
- **Automatic carbon footprint calculation** — activities are scored on save using category-specific emission factors (transport mode, energy source, food type, waste disposal method)
- **Dashboard & stats** — totals, streaks, weekly summaries, and community comparisons
- **Goals & insights** — set weekly or emission-reduction goals and track progress, with weekly analysis, trend detection, and personalized recommendations
- **Leaderboard** — ranks users by lowest footprint
- **Real-time updates** — Socket.IO pushes activity tips, goal milestones, trend alerts, and goal status changes to connected clients
- **Modern React UI** — Vite + Tailwind + shadcn/ui components, charts (Recharts), forms (React Hook Form + Zod)

## Tech Stack

**Backend:** Node.js, Express 5, MongoDB (Mongoose), Socket.IO, JWT, bcrypt
**Frontend:** React 19, Vite, Tailwind CSS, shadcn/ui (Radix primitives), Recharts, Axios, React Router, Socket.IO client

## Project Structure

```
Footprint-Logger-Fullstack/
├── server/                  # Express API + WebSocket server
│   ├── app.js                # Express app, middleware, route mounting, health checks
│   ├── server.js             # HTTP server, Socket.IO setup, graceful shutdown
│   ├── models/
│   │   ├── user.js           # User schema (auth, goals, stats, preferences)
│   │   └── Activity.js       # Activity schema + carbon footprint calculation logic
│   ├── routes/
│   │   ├── auth.js           # Register / login
│   │   ├── activities.js     # CRUD for activities, stats, emission-factor reference
│   │   ├── dashboard.js       # Dashboard, streaks, leaderboard, stats
│   │   └── insights.js       # Weekly analysis, recommendations, goals, trends
│   └── middleware/
│       ├── auth.js            # JWT verification
│       └── validation.js      # Request validation
└── client/                   # React frontend (Vite)
    └── src/
        ├── components/        # Dashboard, insights, leaderboard, goals, UI kit, etc.
        ├── services/           # api.js (Axios instance), activityService.js, websocketService.js
        └── App.jsx
```

## Prerequisites

- Node.js ≥ 18
- A MongoDB instance (local or Atlas)

## Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/NzamaE/Footprint-Logger-Fullstack.git
cd Footprint-Logger-Fullstack
```

### 2. Set up the server

```bash
cd server
npm install
```

Create a `.env` file in `server/`:

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/footprint-logger
JWT_SECRET=your-secret-key
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

Run the server:

```bash
npm run dev     # nodemon, auto-restart
# or
npm start       # node server.js
```

The API runs at `http://localhost:3000`. Check `http://localhost:3000/health` to confirm it's up and connected to MongoDB.

### 3. Set up the client

```bash
cd client
npm install
```

Create a `.env` file in `client/`:

```env
VITE_API_URL=http://localhost:3000/api
```

Run the dev server:

```bash
npm run dev
```

The app runs at `http://localhost:5173`.

## API Overview

All routes are prefixed with `/api`. Routes under `/activities`, `/dashboard`, and `/insights` require a `Bearer <token>` Authorization header obtained from `/auth/login` or `/auth/register`.

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Log in and receive a JWT |
| POST | `/api/activities` | Log a new activity (footprint auto-calculated) |
| GET | `/api/activities` | List the current user's activities |
| GET | `/api/activities/:id` | Get a single activity |
| PUT | `/api/activities/:id` | Update an activity |
| DELETE | `/api/activities/:id` | Delete an activity |
| GET | `/api/activities/stats/summary` | Summary stats for the user's activities |
| GET | `/api/activities/reference/emission-factors` | Reference table of emission factors |
| POST | `/api/activities/calculate-preview` | Preview a footprint calculation without saving |
| GET | `/api/dashboard` | Dashboard data with community comparison |
| GET | `/api/streak` | Weekly summaries and streak tracking |
| GET | `/api/leaderboard` | Low-footprint users leaderboard |
| GET | `/api/stats` | User statistics |
| GET | `/api/insights/weekly-analysis` | Weekly emissions analysis |
| GET | `/api/insights/recommendations` | Personalized recommendations |
| POST | `/api/insights/set-weekly-goal` | Set a weekly reduction goal |
| GET | `/api/insights/weekly-goal-progress` | Track weekly goal progress |
| GET | `/api/insights/trends` | Emission trend detection |
| POST | `/api/insights/set-emission-goal` | Set an emission reduction goal |
| GET | `/api/insights/emission-goal-progress` | Track emission goal progress |
| GET | `/health` | Server/DB health check |

## WebSocket Events

The client connects to Socket.IO with a JWT (`socket.handshake.auth.token`) and joins a personal room (`user:<id>`). Server-emitted events:

- `activity_tip` — real-time tip after logging an activity
- `goal_set` — confirmation when a goal is set
- `goal_milestone` — progress milestone notifications
- `weekly_insights` — weekly analysis updates
- `trend_alert` — significant trend change alerts
- `goal_status_update` — critical goal status updates

## How Carbon Footprint Is Calculated

Each activity's `carbonFootprint` is computed automatically in a Mongoose pre-save hook, based on `activityType` and category-specific emission factors (kg CO₂ per unit):

- **Transport** — by mode (e.g. car, bus, train, plane, bicycle), converted to km
- **Energy** — by source (coal, natural gas, solar, wind, hydro, nuclear, grid average), converted to kWh
- **Food** — by food type (beef, pork, chicken, dairy, vegetables, etc.), converted to kg
- **Waste** — by waste type and disposal method (landfill, incineration, recycling, composting)

## License

ISC

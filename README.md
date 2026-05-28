# Neighbourhood Grocery Shopping & Delivery Ecosystem

A full-stack web application that equips neighbourhood grocery stores with demand prediction, personalized recommendations, dynamic pricing, and expiry-aware discounting. Built as a laptop-first experience using a modern TypeScript stack.

## Tech Stack

- **Frontend**: React 18, Vite, Mantine UI, Zustand, React Hook Form, Zod
- **Backend**: Node.js, Express, TypeScript, Prisma ORM, MySQL
- **Data Layer**: MySQL 8 with Prisma schema for stores, inventory, orders, demand forecasts, and recommendation signals
- **Tooling**: ESLint, Tailwind, Mantine design system, XLSX parsing, cron jobs for demand and expiry sweeps

## Project Structure

```text
NeighbourhoodGrocery/
├── backend/        # Express + Prisma API
├── frontend/       # React Vite SPA
├── prisma/         # Generated during backend setup
└── README.md
```

Each workspace (`backend`, `frontend`) contains its own setup instructions in the respective `README.md`.

## Getting Started

### 1. Clone & Install

```powershell
cd backend
npm install

cd ../frontend
npm install
```

### 2. Configure Environment

- Copy `backend/.env.example` to `backend/.env` and update the MySQL connection string & JWT secret.
- Ensure MySQL is running locally and the target database exists (or create it manually).

### 3. Database Setup

```powershell
cd backend
npx prisma migrate dev
npm run seed
```

### 4. Run the Stack

In separate terminals:

```powershell
# Backend API
cd backend
npm run dev

# Frontend Vite app
cd frontend
npm run dev
```

Frontend runs on `http://localhost:5173` and proxies API calls to `http://localhost:4000`.

## Feature Highlights

- Excel-based inventory ingestion with Firebase-inspired real-time updates via Prisma & MySQL
- Automated cron jobs for expiry-based discounts and heuristic demand forecasting
- Customer journey with personalized recommendations and dynamic pricing
- Owner dashboards for inventory health, expiry alerts, and smart upload feedback
- Delivery board for last-mile associates with assignment claiming and status progression

## Testing & Quality

- TypeScript strict mode across backend and frontend
- ESLint configurations for both workspaces (`npm run lint`)
- Seed script provides demo users (admin, owner, customer, delivery) and baseline data

## Next Steps

- Integrate advanced ML pipelines for demand forecasting
- Add real payment gateways and route optimization services
- Harden authentication (refresh tokens, password reset flows)
- Expand UI with analytics dashboards and reporting exports

Enjoy building and extending the neighbourhood grocery ecosystem!


Customer: customer@demo.local / password123
Store owner: owner@store.local / password123
Admin: admin@neighbourhood.local / password123
Delivery: delivery@demo.local / password123
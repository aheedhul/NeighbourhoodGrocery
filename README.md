# 🛒 Neighbourhood Grocery — Full-Stack Delivery & Inventory Platform

A production-grade full-stack web application that equips neighbourhood grocery stores with **demand forecasting**, **personalized recommendations**, **dynamic expiry-aware pricing**, and **last-mile delivery tracking** — all from one modern, role-based dashboard.

Built as a portfolio-quality project using a modern TypeScript stack across both frontend and backend.

---

## ✨ Features

| Feature | Description |
|---|---|
| **Role-based access** | Three roles — `CUSTOMER`, `OWNER`, `DELIVERY` — each with a dedicated protected UI |
| **Dynamic pricing** | Inventory prices update automatically based on expiry proximity (cron every 30 min) |
| **Demand forecasting** | Short-term order signals aggregated every 4 hours via scheduled job |
| **Personalized recommendations** | Collaborative-filtering–style recommendation engine per customer |
| **Inventory workbook upload** | Owners upload `.xlsx` files; backend parses and upserts SKUs with deduplication |
| **Order lifecycle** | Full status flow: Pending → Confirmed → Preparing → Out for Delivery → Completed |
| **Delivery board** | Delivery associates claim and advance assignments in real time |
| **Expiry alerts** | Near-expiry and low-stock dashboard alerts with base vs. dynamic price comparison |
| **JWT authentication** | Stateless auth with 12-hour tokens; passwords hashed with bcrypt (10 rounds) |
| **Zod validation** | Schema validation on both client and server; unified 422 error shape |
| **Toast notifications** | Every async action shows real-time success/error feedback via Mantine Notifications |
| **React Error Boundary** | Top-level crash boundary prevents blank screens on unexpected runtime errors |

---

## 🧰 Tech Stack

### Backend
- **Runtime**: Node.js 20 + TypeScript 5 (strict)
- **Framework**: Express 4
- **ORM**: Prisma 5 with MySQL 8
- **Auth**: JSON Web Tokens (jsonwebtoken) + bcrypt
- **Validation**: Zod
- **File upload**: multer (memory storage) + xlsx
- **Scheduled jobs**: node-cron

### Frontend
- **Framework**: React 18 + TypeScript + Vite 5
- **UI Library**: Mantine v7 (`@mantine/core`, `@mantine/notifications`, `@mantine/dates`)
- **Icons**: Tabler Icons (`@tabler/icons-react`)
- **State management**: Zustand
- **Forms**: React Hook Form + `@hookform/resolvers/zod`
- **HTTP client**: Axios (with auth interceptor)
- **Routing**: React Router v6

---

## 📁 Project Structure

```
NeighbourhoodGroceryFSWD/
├── backend/                  # Express + Prisma API (port 4000)
│   ├── prisma/
│   │   └── schema.prisma     # DB schema (stores, inventory, orders, …)
│   ├── src/
│   │   ├── controllers/      # Route handlers
│   │   ├── services/         # Business logic
│   │   ├── middleware/       # auth, errorHandler
│   │   ├── jobs/             # node-cron tasks (expiry sweep, demand forecast)
│   │   ├── validators/       # Zod schemas
│   │   └── utils/            # geo, pricing, serializers
│   └── .env.example
├── frontend/                 # React + Vite SPA (port 5173)
│   └── src/
│       ├── api/              # Axios API layer
│       ├── pages/            # Route-level page components
│       ├── layouts/          # AppShell with role-aware nav
│       ├── components/       # ProtectedRoute, ErrorBoundary
│       ├── store/            # Zustand auth store
│       └── utils/            # Error extractor utility
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js ≥ 18
- MySQL 8 running locally (or a hosted MySQL instance)
- A database created (e.g. `neighbourhood_grocery`)

### 1. Clone the repository

```bash
git clone https://github.com/<your-username>/NeighbourhoodGroceryFSWD.git
cd NeighbourhoodGroceryFSWD
```

### 2. Install dependencies

```bash
# Backend
cd backend
npm install

# Frontend (separate terminal)
cd ../frontend
npm install
```

### 3. Configure environment

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env`:

```env
DATABASE_URL="mysql://USER:PASSWORD@localhost:3306/neighbourhood_grocery"
JWT_SECRET="replace_with_a_long_random_secret"
PORT=4000
ALLOWED_ORIGINS="http://localhost:5173"
```

### 4. Set up the database

```bash
cd backend
npx prisma migrate dev --name init
npm run seed
```

### 5. Start the development servers

Open two terminals:

```bash
# Terminal 1 — API
cd backend
npm run dev

# Terminal 2 — Frontend
cd frontend
npm run dev
```

Visit **http://localhost:5173** in your browser.

---

## 👥 Demo Accounts (after seeding)

| Role | Email | Password |
|------|-------|----------|
| Owner | `owner@example.com` | `password123` |
| Customer | `customer@example.com` | `password123` |
| Delivery | `delivery@example.com` | `password123` |

> Check `backend/src/scripts/seed.ts` for full seed data details.

---

## 🔌 API Overview

All routes are prefixed `/api`. Auth-required routes expect `Authorization: Bearer <token>`.

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/register` | — | Register a new user |
| POST | `/auth/login` | — | Login, receive JWT |
| GET | `/stores` | — | Nearby stores (lat/lng query) |
| GET | `/stores/owned` | OWNER | Stores owned by current user |
| POST | `/stores` | OWNER | Create a store |
| POST | `/stores/:id/inventory/upload` | OWNER | Upload `.xlsx` workbook |
| GET | `/stores/:id/inventory` | OWNER | Full inventory list |
| GET | `/stores/:id/alerts` | OWNER | Near-expiry / low-stock alerts |
| GET | `/stores/:id/products` | — | Purchasable products for customers |
| POST | `/orders` | CUSTOMER | Place an order |
| GET | `/orders/mine` | CUSTOMER | My order history |
| GET | `/orders/store/:id` | OWNER | Orders for a store |
| PATCH | `/orders/:id/status` | OWNER | Advance order status |
| GET | `/deliveries` | DELIVERY | Available assignments |
| POST | `/deliveries/:id/claim` | DELIVERY | Claim an assignment |
| PATCH | `/deliveries/:id/status` | DELIVERY | Update delivery status |
| GET | `/recommendations` | CUSTOMER | Personalized item picks |

---

## 📄 License

MIT — free to use, modify, and distribute.

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
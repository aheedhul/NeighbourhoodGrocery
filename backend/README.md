# Neighbourhood Grocery Backend

API server for the Neighbourhood Grocery Shopping and Delivery Ecosystem. Built with Express, TypeScript, Prisma, and MySQL.

## Prerequisites

- Node.js 18+
- MySQL 8+
- pnpm, npm, or yarn (examples use npm)

## Setup

1. Copy `.env.example` to `.env` and update values.
2. Install dependencies:
   ```powershell
   npm install
   ```
3. Run database migrations and generate Prisma client:
   ```powershell
   npx prisma migrate dev
   ```
4. Seed initial data:
   ```powershell
   npm run seed
   ```
5. Start development server:
   ```powershell
   npm run dev
   ```

## Scripts

- `npm run dev` – Start dev server with hot reload.
- `npm run build` – Compile TypeScript to JavaScript.
- `npm run seed` – Insert demo data.
- `npm run prisma:studio` – Inspect DB via Prisma Studio.

## Testing APIs

Use the included Thunder Client collection (`docs/thunder/collection.json`) or any REST client.

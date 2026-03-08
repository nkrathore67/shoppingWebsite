# ThikanaWear — Local Development

Full-stack clothing e-commerce platform.

> **Deployment branch:** Switch to `deploy` branch for production setup.

---

## Tech Stack

- **Frontend:** Next.js 15, TypeScript, Tailwind CSS, NextAuth v5, TanStack Query, Zustand
- **Backend:** Fastify 5, TypeScript, Prisma 7, PostgreSQL
- **Local DB:** Docker (PostgreSQL + Redis)

---

## Setup

**Prerequisites:** Node.js 18+, Docker

### 1. Start the database
```bash
docker-compose up -d
```

### 2. Backend — `http://localhost:4000`
```bash
cd backend
npm install
npm run db:migrate
npm run db:seed
npm run dev
```

### 3. Frontend — `http://localhost:3000`
```bash
cd frontend
npm install
npm run dev
```

---

## Environment Variables

### `backend/.env`
```
NODE_ENV=development
PORT=4000
FRONTEND_URL=http://localhost:3000
DATABASE_URL=postgresql://postgres:password@localhost:5432/shoppingdb
JWT_ACCESS_SECRET=<min 32 chars>
JWT_REFRESH_SECRET=<min 32 chars>
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d
```

### `frontend/.env.local`
```
NEXT_PUBLIC_API_URL=http://localhost:4000/api
BACKEND_URL=http://localhost:4000
AUTH_SECRET=<min 32 chars>
AUTH_URL=http://localhost:3000
```

---

## Default Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@store.com | admin123456 |
| Customer | any seeded email | customer123 |

Coupon codes: `WELCOME10`, `FLAT200`, `SUMMER25`

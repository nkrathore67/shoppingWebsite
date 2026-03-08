# ThikanaWear

Full-stack clothing e-commerce platform — Next.js frontend + Fastify backend + PostgreSQL.

## Branches

| Branch | Purpose |
|--------|---------|
| `main` | Local development |
| `deploy` | Production deployment (Vercel + Render) |

---

## Local Development (`main`)

**Prerequisites:** Node.js 18+, Docker

### 1. Start the database
```bash
docker-compose up -d
```

### 2. Backend
```bash
cd backend
cp .env.example .env   # fill in values
npm install
npm run db:migrate
npm run db:seed
npm run dev            # runs on http://localhost:4000
```

### 3. Frontend
```bash
cd frontend
cp .env.local.example .env.local   # fill in values
npm install
npm run dev            # runs on http://localhost:3000
```

### Default credentials
| Role | Email | Password |
|------|-------|----------|
| Admin | admin@store.com | admin123456 |
| Customer | any seeded email | customer123 |

---

## Deployment (`deploy` branch)

| Service | Provider | Free tier |
|---------|----------|-----------|
| Frontend | [Vercel](https://vercel.com) | Free forever |
| Backend | [Render](https://render.com) | 750 hrs/month |
| Database | [Neon](https://neon.tech) | 0.5 GB free |

### Deploy steps
1. Push `deploy` branch to GitHub
2. **Neon** — create project, copy connection string, run `npm run db:migrate && npm run db:seed` locally with Neon `DATABASE_URL`
3. **Render** — New Web Service → connect repo → branch: `deploy` → root: `backend`
4. **Vercel** — Import project → branch: `deploy` → root: `frontend`

### Required environment variables

**Render (backend)**
```
NODE_ENV=production
DATABASE_URL=<neon connection string>
FRONTEND_URL=<vercel app url>
JWT_ACCESS_SECRET=<min 32 chars>
JWT_REFRESH_SECRET=<min 32 chars>
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d
```

**Vercel (frontend)**
```
NEXT_PUBLIC_API_URL=<render url>/api
BACKEND_URL=<render url>
AUTH_SECRET=<min 32 chars>
AUTH_URL=<vercel app url>
```

---

## Tech Stack

- **Frontend:** Next.js 15, TypeScript, Tailwind CSS, NextAuth v5, TanStack Query, Zustand
- **Backend:** Fastify 5, TypeScript, Prisma 7, PostgreSQL
- **Auth:** JWT (access + refresh tokens), NextAuth Credentials provider

# ThikanaWear — Deployment

Production deployment using free hosting services.

> **Development branch:** Switch to `main` branch for local setup.

---

## Hosting Stack

| Part | Service | Free Tier |
|------|---------|-----------|
| Frontend | [Vercel](https://vercel.com) | Free forever |
| Backend | [Render](https://render.com) | 750 hrs/month |
| Database | [Neon](https://neon.tech) | 0.5 GB free |

> Render free tier spins down after 15 min inactivity (~30s cold start on first request).

---

## Deployment Order

### 1. Neon (Database)
1. Sign up at neon.tech → create project
2. Copy connection string: `postgresql://user:pass@ep-xxx.neon.tech/neondb?sslmode=require`
3. Set `DATABASE_URL` in `backend/.env` to the Neon URL
4. Run locally:
```bash
cd backend
npm run db:migrate
npm run db:seed
```

### 2. Render (Backend)
1. Sign up at render.com → New Web Service → connect GitHub repo
2. Branch: `deploy` · Root directory: `backend`
3. Build: `npm install && npx prisma generate && npm run build`
4. Start: `npm run start`
5. Add environment variables (see below)
6. Deploy → copy the service URL

### 3. Vercel (Frontend)
1. Sign up at vercel.com → Import project → connect GitHub repo
2. Branch: `deploy` · Root directory: `frontend`
3. Add environment variables (see below)
4. Deploy → copy the app URL
5. Go back to Render → set `FRONTEND_URL` to the Vercel URL → Redeploy

---

## Environment Variables

### Render (backend)
```
NODE_ENV=production
DATABASE_URL=<neon connection string>
FRONTEND_URL=<vercel app url>
JWT_ACCESS_SECRET=<run: openssl rand -base64 32>
JWT_REFRESH_SECRET=<run: openssl rand -base64 32>
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d
```

### Vercel (frontend)
```
NEXT_PUBLIC_API_URL=<render url>/api
BACKEND_URL=<render url>
AUTH_SECRET=<run: openssl rand -base64 32>
AUTH_URL=<vercel app url>
```

---

## Verify Deployment

- `https://<vercel-url>` → homepage loads with products
- `https://<render-url>/api/products?limit=2` → returns JSON
- Login as `admin@store.com / admin123456` → no redirect loop
- `/admin` → dashboard loads

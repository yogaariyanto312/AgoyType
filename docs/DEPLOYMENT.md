# Deployment

AgoyType is a standard Next.js 15 app with a PostgreSQL database. Two common
setups are documented below.

## Environment variables

| Variable | Required | Notes |
| --- | --- | --- |
| `DATABASE_URL` | yes | PostgreSQL connection string |
| `NEXTAUTH_SECRET` | yes | `openssl rand -base64 32` |
| `NEXTAUTH_URL` | yes (prod) | Full public URL, e.g. `https://agoytype.app` |
| `NEXT_PUBLIC_APP_URL` | yes | Same as above, exposed to the client |
| `GOOGLE_CLIENT_ID` | no | enables the Google sign-in button |
| `GOOGLE_CLIENT_SECRET` | no | |

---

## Option A — Vercel (app) + Railway/Neon (database)

This is the recommended setup: Vercel serves the Next.js app, a managed Postgres
provider hosts the database.

### 1. Provision the database

- **Railway**: New Project → *Provision PostgreSQL* → copy the `DATABASE_URL`
  from the *Connect* tab.
- **Neon**: create a project → copy the pooled connection string (append
  `?sslmode=require`).

### 2. Apply the schema

From your machine, pointing at the production database:

```bash
DATABASE_URL="<prod-url>" npx prisma db push
DATABASE_URL="<prod-url>" npm run db:seed   # optional demo data + content
```

> For a real migration history use `npx prisma migrate deploy` with committed
> migrations instead of `db push`.

### 3. Deploy to Vercel

1. Import the repository at <https://vercel.com/new>.
2. Add the environment variables from the table above.
3. The default build command (`next build`) works; `prisma generate` runs via the
   `build` script / `postinstall`.
4. Set `NEXTAUTH_URL` and `NEXT_PUBLIC_APP_URL` to your Vercel URL.

If you use Google OAuth, add `https://<your-domain>/api/auth/callback/google`
to the authorized redirect URIs in the Google Cloud console.

---

## Option B — Railway (app + database) with Docker

The repo ships a production `Dockerfile` (Next.js standalone) and a
`docker-compose.yml` for local parity.

### Local

```bash
cp .env.example .env          # adjust if needed
docker compose up --build
# app on http://localhost:3000, postgres on localhost:5432
```

The container entrypoint runs `prisma db push` on boot, so the schema is created
automatically. Seed once with:

```bash
docker compose exec app node_modules/.bin/prisma db seed
```

### Railway

1. New Project → *Deploy from Repo*; Railway detects the `Dockerfile`.
2. Add a PostgreSQL plugin; reference its `DATABASE_URL`.
3. Add the remaining environment variables.
4. Expose port `3000`.

---

## Post-deploy checklist

- [ ] `NEXTAUTH_SECRET` is a strong random value
- [ ] `NEXTAUTH_URL` / `NEXT_PUBLIC_APP_URL` match the public domain
- [ ] Database schema applied (`prisma db push` or `migrate deploy`)
- [ ] (optional) seed data loaded
- [ ] (optional) Google OAuth redirect URI registered
- [ ] swap the in-memory rate limiter in `src/lib/rate-limit.ts` for Redis if
      running multiple instances

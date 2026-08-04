# ProjectCamp — Production Readiness Checklist

> Planning to launch as a SaaS product. Here's everything needed before going live, grouped by priority.

---

## 🔴 Critical (Must-have before any public traffic)

### 1. Security Hardening

| Item | What to do |
|---|---|
| **CORS** | Replace `CORS_ORIGIN=*` with an explicit frontend domain |
| **Helmet.js** | Add `helmet()` middleware — sets ~15 security HTTP headers automatically |
| **Rate Limiting** | You're already planning this — `express-rate-limit` on auth routes (login, register, forgot-password). Tighter limits on password reset |
| **Input Sanitization** | Add `express-mongo-sanitize` to prevent NoSQL injection via `$` operators in request bodies |
| **Cookie Security** | Set `secure: true`, `sameSite: 'strict'` and `httpOnly: true` on all cookies. Currently cookies have `secure: true` but `sameSite` is missing |
| **Secrets Management** | Never commit `.env`. Use a secrets manager (Doppler — free tier, or Railway/Render's built-in env vars) |
| **JWT Secret Strength** | Replace the current simple secrets (`chaicodeaftabislearning`) with 64-character random strings |
| **Password Minimum Length** | Enforce min 8 chars on registration validator |
| **File Upload Security** | Validate MIME type server-side (not just extension), add virus scan or at least file type whitelist in multer |

---

### 2. Logging — **Use Pino** ✅

**Recommendation: [Pino](https://getpino.io/)** (not Winston)

- **Why Pino over Winston:** Pino is 5–8× faster (benchmarked), outputs structured JSON by default, has zero-copy serialization, and is the de-facto standard for Node.js production logging
- Install: `pino` + `pino-http` (request logger middleware)
- Use `pino-pretty` only in development; in production pipe raw JSON to your log aggregator

```
What to log:
✅ Every HTTP request (method, path, status, latency) via pino-http
✅ Every unhandled error with stack trace
✅ Auth events (login, logout, failed login attempts, password reset)
✅ DB connection events
❌ Don't log passwords, tokens, or full request bodies
```

**Log transport for production:**
- **[Logtail / BetterStack](https://betterstack.com/logs)** — Free tier: 1 GB/month, 3-day retention. Has a clean UI, alerts, and a Pino transport package (`@logtail/pino`). Best free option.
- Alternative: Ship to your own **Loki + Grafana** (self-hosted, fully free if you already have a server)

---

### 3. Error Handling

- **Unhandled rejections & uncaught exceptions:** Add `process.on('unhandledRejection')` and `process.on('uncaughtException')` handlers that log and gracefully shut down
- **Structured error responses:** Your `ApiError` class is good — make sure stack traces are **never** sent to clients in production (check `NODE_ENV !== 'production'`)
- **Graceful shutdown:** Handle `SIGTERM`/`SIGINT` to close DB connections and drain in-flight requests before the process exits

---

## 🟠 Important (Before paying customers)

### 4. Observability — **Free Stack**

**Recommendation: [Grafana Cloud Free Tier](https://grafana.com/products/cloud/)**

Grafana Cloud free tier gives you:
| Tool | What it does | Free Limit |
|---|---|---|
| **Grafana** | Dashboards & visualization | Unlimited |
| **Loki** | Log aggregation | 50 GB/month |
| **Tempo** | Distributed tracing | 50 GB/month |
| **Prometheus / Mimir** | Metrics (CPU, memory, req/s, error rate) | 10k series |

This is the **OpenTelemetry** stack — industry standard. Add `@opentelemetry/sdk-node` to your backend.

**Key metrics to track for SaaS:**
- Request rate, error rate, p95/p99 latency (the "RED" method)
- Active users per day / week
- DB query latency
- File upload success/failure rate
- Email delivery rate

**Alternative (even simpler):** [Highlight.io](https://highlight.io) — free tier covers session replay, error monitoring, and logs in one SDK, works with Node.js and React.

---

### 5. Testing

| Layer | Tool | Why |
|---|---|---|
| **Unit tests** | **Vitest** | Same config as Vite, faster than Jest, works with ESM natively. Test validators, utility functions, controller logic |
| **Integration / API tests** | **Supertest** + Vitest | Test actual Express routes against a real (test) MongoDB instance. Essential for auth flows |
| **E2E tests** | **Playwright** | Free, open-source, fast. Records tests visually, works headless. Test critical paths: register → verify → create project → assign task |
| **Test DB** | **mongodb-memory-server** | Spins up an in-memory MongoDB for unit/integration tests — no real DB needed |

**Minimum test coverage targets for SaaS:**
- Auth flows (register, login, forgot password): 100%
- Permission middleware (`validateProjectPermission`): 100%
- Task CRUD: 80%+

---

### 6. Database

| Item | Action |
|---|---|
| **Indexes** | Add indexes on frequently queried fields: `Tasks.project`, `ProjectMember.project + user`, `User.email`, `User.username`. Missing indexes = slow queries at scale |
| **Connection pooling** | Mongoose default pool is 5 — increase to 10–20 for production |
| **Backups** | Enable MongoDB Atlas automated backups (M10+ plan required, or use Atlas free tier with manual export scripts) |
| **Transactions** | Use Mongoose sessions/transactions for multi-document operations (e.g., delete project → delete tasks → delete members atomically) |
| **Schema validation** | Add Mongoose validators for all required fields — right now some fields have no min/max length constraints |

---

### 7. File Storage — **Replace local disk storage**

Currently avatars and attachments are saved to `./public/images` on the server. **This will break on any containerized or multi-instance deployment.**

**Recommendation: [Cloudinary](https://cloudinary.com/)** — Free tier: 25 GB storage, 25 GB bandwidth/month
- Handles image resizing, format conversion, CDN delivery
- Dead-simple Node.js SDK
- Alternative: **AWS S3** (free tier: 5 GB) or **Backblaze B2** (10 GB free, much cheaper than S3 at scale)

---

### 8. Containerization — **Docker**

**What you need:**

```
/
├── Backend/
│   └── Dockerfile          # Node 20 alpine, non-root user
├── Frontend/
│   └── Dockerfile          # Build stage + nginx serve stage
└── docker-compose.yml      # Local dev: backend + frontend + mongo
```

**Key Dockerfile best practices:**
- Use `node:20-alpine` (not full Debian — saves ~400 MB)
- Run as a **non-root user** (security requirement)
- Use multi-stage builds for the frontend (build with Node, serve with nginx)
- `.dockerignore` to exclude `node_modules`, `.env`, logs

**docker-compose.yml** for local dev:
- Services: `mongo`, `backend`, `frontend`
- Use volumes for hot reload
- Pass env vars via `.env` file

---

## 🟡 SaaS-Specific Requirements

### 9. Multi-tenancy & Billing

Since you're launching as SaaS, you need:

| Concern | Tool / Approach |
|---|---|
| **Payments** | **Stripe** — industry standard. Add `stripe` Node SDK. Implement subscription tiers (Free / Pro / Team) |
| **Usage limits** | Enforce per-plan limits: max projects, max members per project, max file size |
| **Subscription webhooks** | Listen to Stripe `customer.subscription.updated` / `deleted` to downgrade/suspend accounts |
| **Billing portal** | Stripe Customer Portal — pre-built UI for users to manage their subscription |

### 10. Email (Replace Mailtrap for Production)

Mailtrap is for **testing only** — emails never leave their sandbox.

| Provider | Free Tier | Best For |
|---|---|---|
| **Resend** | 3,000 emails/month | Modern API, great DX, React Email templates |
| **Brevo (Sendinblue)** | 300 emails/day | Good free tier, transactional + marketing |
| **Amazon SES** | 62,000/month (if hosted on EC2) | Cheapest at scale |

**Recommendation: Resend** — clean API, works with your existing nodemailer setup via SMTP, has beautiful email templates.

### 11. CI/CD Pipeline

**Free with GitHub:** GitHub Actions

```yaml
# On every push to main:
1. Run Vitest unit + integration tests
2. Build Docker images
3. Push to Docker Hub / GitHub Container Registry
4. Deploy to your hosting provider via SSH or platform CLI
```

**Hosting options:**
| Platform | Backend | Frontend | Free? |
|---|---|---|---|
| **Railway** | ✅ | ✅ | $5 credit/month |
| **Render** | ✅ | ✅ | Free tier (sleeps after 15min) |
| **Fly.io** | ✅ | ✅ | Free for small apps |
| **VPS (Hetzner/DigitalOcean)** | ✅ | ✅ | ~$5-6/month, full control |

**For serious SaaS: VPS (Hetzner CX22, €3.9/month) + Nginx reverse proxy + Certbot SSL** is the most cost-effective.

---

## 🟢 Nice-to-Have (Post-launch)

| Item | Tool | Notes |
|---|---|---|
| **Caching** | **Redis** (you're planning this) | Cache project lists, member lists. Use `ioredis` |
| **Real-time** | **Socket.io** | Live task updates, presence indicators |
| **Analytics** | **PostHog** (self-hostable, free) | Product analytics: feature usage, funnel tracking, session replay |
| **Status page** | **Upptime** (free, GitHub-hosted) | Public status page, uptime monitoring |
| **API docs** | **Swagger / OpenAPI** | `swagger-ui-express` + `swagger-jsdoc`. Auto-generates from JSDoc comments |
| **SEO / Marketing site** | Separate from the app | Use Next.js or Astro for the landing page |

---

## Priority Order for Launch

```
Phase 1 — Security & Stability (Before any users)
  ✅ Fix CORS, Helmet, rate limiting, cookie sameSite
  ✅ Pino logging + Logtail
  ✅ Replace Mailtrap with Resend
  ✅ Move file storage to Cloudinary
  ✅ Strong JWT secrets
  ✅ Unhandled error process handlers

Phase 2 — Infrastructure (Before public launch)
  ✅ Dockerize backend + frontend
  ✅ GitHub Actions CI (run tests on every PR)
  ✅ Deploy to VPS or Railway
  ✅ SSL certificate (Certbot / platform-managed)
  ✅ DB indexes

Phase 3 — SaaS (Before charging money)
  ✅ Stripe integration
  ✅ Subscription tier enforcement
  ✅ Grafana Cloud observability
  ✅ Playwright E2E tests for critical paths

Phase 4 — Growth
  ✅ PostHog analytics
  ✅ Redis caching (you're planning this)
  ✅ Socket.io real-time
  ✅ API documentation
```

---

> **Bottom line:** The core app is functionally solid. The main gaps before production are security hardening, replacing local file storage, swapping Mailtrap for a real email provider, structured logging, and containerization. Those 5 things alone would make it deployable as an early-access SaaS.

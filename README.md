# URL Shortener

A full-stack URL shortening service built with Node.js, PostgreSQL, Redis, and React. 
<br/>
Live demo: [web-production-bbbdc.up.railway.app](https://web-production-bbbdc.up.railway.app)



## Features

- Shorten long URLs to 7-character codes
- 302 redirect with Redis cache-aside pattern
- Click analytics — clicks by day, top countries, top referrers
- Sliding window rate limiter (10 requests/60 seconds per IP)
- JWT authentication — register, login, protected routes
- Fire-and-forget click logging with geo lookup
- Cache invalidation on URL deletion
- React dashboard with Recharts visualizations
- Dockerized local development with Docker Compose


## Tech Stack

**Backend:** Node.js, Express, PostgreSQL (pg), Redis (ioredis)  
**Frontend:** React, Vite, Recharts, React Router  
**Auth:** JWT (jsonwebtoken), bcryptjs  
**DevOps:** Docker, Docker Compose, Railway  


## API Reference

### Auth
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/auth/register` | Register with email + password |
| POST | `/auth/login` | Login, receive JWT |

### URLs
| Method | Route | Description |
|--------|-------|------------|
| POST | `/shorten` | Shorten a URL |
| GET | `/:code` | Redirect to original URL |
| DELETE | `/shorten/:code` | Delete URL + invalidate cache |
| GET | `/urls` |  Get all URLs for current user |

### Analytics
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/analytics/:code` | Clicks by day, top countries, top referrers |


## Database Schema

```sql
users
  id, email, password_hash, created_at

urls
  id, short_code, original_url, user_id, 
  created_at, expires_at, click_count

clicks
  id, url_id, clicked_at, ip_hash, 
  country, city, referer, user_agent
```



## Key Technical Decisions

**Cache-aside pattern** — Redis is checked before every redirect. Cache miss populates Redis with a 1-hour TTL. Reduces Postgres load on hot URLs significantly.

**302 over 301** — 301 is cached permanently by browsers. If a URL is deleted or updated, users would still be redirected to the old destination. 302 keeps control server-side.

**Fire-and-forget click logging** — `logClick()` is called without `await` so the redirect response is sent immediately. Click logging happens asynchronously in the background. A failure in logging never affects the redirect.

**Sliding window rate limiter** — implemented with Redis sorted sets. Each IP gets a sorted set of request timestamps. On every request: remove timestamps older than 60 seconds, add current timestamp, count remaining. If count exceeds 10, return 429. More accurate than fixed window because it has no boundary burst problem.

**Parameterized queries** — all SQL uses `$1, $2` placeholders via the `pg` library. User input is never interpolated into query strings, preventing SQL injection.

**IP hashing** — raw IPs are never stored. IPs are base64 encoded before INSERT into the clicks table for basic privacy compliance.

**ON DELETE CASCADE** — clicks rows are automatically deleted when their parent URL is deleted. No orphaned rows, no manual cleanup query needed.

**TIMESTAMPTZ over TIMESTAMP** — all timestamps stored with timezone. Prevents bugs when the server timezone differs from the user's timezone.



## What I Learned Building This

### Redis
- **ioredis pipeline** — batching multiple Redis commands into one round trip using `redis.pipeline()`. Used in the rate limiter to execute `ZREMRANGEBYSCORE`, `ZADD`, `ZCARD`, and `EXPIRE` atomically without 4 separate network calls.
- **Sorted sets for rate limiting** — using `ZADD` with timestamps as scores, `ZREMRANGEBYSCORE` to remove expired entries, and `ZCARD` to count. This is the standard sliding window implementation.
- **Cache-aside pattern in real code** — check cache → miss → query DB → populate cache → return. Understanding when to populate and when to invalidate.
- **Cache invalidation** — deleting the Redis key immediately after deleting the DB row, and why order matters (DB first, then cache).
- **Key namespacing** — prefixing keys (`url:`, `rate:`) to avoid collisions across different data types in the same Redis instance.
- **TTL management** — setting `EX` on cache keys and `EXPIRE` on rate limiter keys so Redis self-cleans without manual intervention.

### PostgreSQL
- **Connection pooling** — using `pg.Pool` instead of individual connections. The pool manages multiple reusable connections, handles reconnection, and prevents connection exhaustion under load.
- **GROUP BY with aggregate functions** — every non-aggregate column in SELECT must appear in GROUP BY. Used for clicks by day (`GROUP BY DATE(clicked_at)`), top countries, top referrers.
- **DATE() function** — stripping time from TIMESTAMPTZ to group clicks by calendar day regardless of time.
- **RETURNING clause** — getting the inserted row back from an INSERT without a second SELECT query.
- **ON DELETE CASCADE vs SET NULL** — CASCADE for clicks (child records meaningless without parent), SET NULL for urls.user_id (URLs survive user deletion).
- **TIMESTAMPTZ** — always use over TIMESTAMP to avoid timezone bugs in production.
- **Parameterized queries** — `$1, $2` placeholders prevent SQL injection at the driver level.

### Node.js / Express
- **Fire-and-forget pattern** — calling an async function without await to run it in the background. The event loop handles it. Appropriate only for non-critical work where failure is acceptable.
- **Middleware chaining** — applying middleware per-route (`app.use('/shorten', authenticate, router)`) vs globally, and why order of route registration matters.
- **`trust proxy` setting** — telling Express to trust `X-Forwarded-For` headers from Railway's proxy so `req.ip` returns the real client IP instead of the internal proxy IP.
- **Environment-based config** — using `process.env` and `dotenv` to separate config from code. Different values for local vs production without changing code.

### Auth
- **bcrypt salt rounds** — the cost factor doubles computation per round. 10 rounds is the industry standard balance between security and performance.
- **JWT payload design** — only storing `userId` and `email` in the token. Never storing sensitive data in JWT since the payload is base64 decoded, not encrypted.
- **Generic auth error messages** — returning "Invalid credentials" for both wrong email and wrong password to prevent user enumeration attacks.
- **Axios interceptors** — attaching JWT to every request automatically in one place instead of repeating the Authorization header in every API call.

### Docker
- **Docker Compose for local dev** — running Postgres and Redis as containers eliminates "works on my machine" problems. Any developer clones the repo and runs `docker-compose up -d`.
- **Named volumes** — `pgdata` volume persists database state across container restarts. Without it, every `docker-compose down` wipes your data.
- **Port mapping** — `host:container` format. Changed Postgres to `5433:5432` to avoid conflict with a local Postgres installation.

### Deployment
- **Railway environment variables** — separating config from code. `DATABASE_URL`, `REDIS_URL`, `JWT_SECRET`, `BASE_URL` all injected at runtime.
- **Internal vs public URLs** — using Railway's internal network URLs (`*.railway.internal`) for service-to-service communication instead of public URLs to avoid egress costs and latency.
- **Vite environment variables** — `VITE_` prefix exposes variables to the browser bundle at build time via `import.meta.env`. Regular `process.env` variables are not available in Vite builds.
- **Serving React from Express in production** — using `express.static` to serve the Vite build output, with a catch-all for React Router client-side routes.
- **X-Forwarded-For header** — extracting real client IP from proxy headers in production. Railway (and most cloud platforms) sit behind a load balancer that sets this header.




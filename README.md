# API — NestJS 12 · TypeORM 1 · PostgreSQL · S3 (RustFS)

## Getting started

```bash
cp .env.example .env   # then fill in DB_*, JWT_SECRET, SMTP_*, S3_*
npm install
npm run start:dev
```

On startup the API creates the database and the S3 bucket if they do not exist, applies pending
migrations, and creates the admin account (`ADMIN_EMAIL`, `ADMIN_PASSWORD`) and the site settings on first start.
Demo content (shipments, quote requests, messages, made-up testimonials and partners) is inserted into an
empty database only when `SEED_DEMO` is true, which is the default outside production.

## Production

With `NODE_ENV=production` (set by the Dockerfile) the API refuses to start when:

- `JWT_SECRET` is missing, shorter than 32 characters or still the example value;
- a `DB_*` or `S3_*` connection setting is missing, or `DB_PASSWORD` / `S3_SECRET_KEY` is still the example value;
- the admin account has to be created and `ADMIN_PASSWORD` is missing, shorter than 12 characters or still the example value.

The error lists every problem at once. After the first start the `ADMIN_*` variables are ignored:
the administrator changes the password from the admin (Account page), which signs out every other session.

`GET /api/health` answers 200 when the API and the database are up; the Docker image uses it as its health check.

### Deploying with Dokploy

Four services in the same Dokploy project:

1. **PostgreSQL**: a Dokploy database. Use its internal host, user, password and database name for `DB_*`.
2. **S3 storage**: RustFS (or any S3-compatible service) for the logos and photos uploaded in the admin.
3. **API**: application built from `new/api/Dockerfile`, port 3001. It needs no public domain: the website reaches it
   on the internal network. Environment: `DB_*`, `S3_*`, `JWT_SECRET` (`openssl rand -hex 32`), `ADMIN_EMAIL`,
   `ADMIN_PASSWORD`, `SMTP_*`, and `CORS_ORIGINS` set to the website's address.
4. **Website**: application built from `new/app/Dockerfile`, port 3000, with the public domain and HTTPS
   (the admin session cookie is only sent over HTTPS). See `new/app/README.md`.

Run a single API replica: the rate limits are kept in memory. Back up the database and the S3 bucket.

## Migrations

The schema is managed **by migrations only** (`src/migrations`): `synchronize` is disabled everywhere,
including in development. Pending migrations are applied automatically when the API starts.

After changing an entity:

```bash
npm run migration:generate -- src/migrations/MigrationName   # generates the SQL from the entities
npm run migration:check                                      # fails if a migration is missing
```

Review the generated migration before committing it.

Other commands: `migration:run`, `migration:revert` (undoes the last one), `migration:show`,
`migration:create -- src/migrations/Name` (empty migration, written by hand).

The commands compile the project first (the TypeORM CLI runs from `dist/`) and read the connection
from `.env` or the `DB_*` variables.

### Databases created before migrations

`InitialSchema` reproduces the schema that `synchronize` used to create. If the `site_settings` table
already exists, it does nothing and is simply recorded as applied; later migrations then run normally.

## Rate limits

Public routes are limited per client IP (`@RateLimit`, in-memory counters, single instance):

| Route | Limit |
|---|---|
| `GET /shipments/track/:number` | 30 per minute |
| `POST /leads`, `POST /messages` | 5 per 10 minutes |
| `POST /auth/login`, `PATCH /auth/password` | 10 per 15 minutes |

The client IP is read from `X-Forwarded-For` only when the request comes from a trusted proxy
(`TRUST_PROXY`, local and private-network addresses by default). If you run several API instances,
move the counters to a shared store (e.g. Redis).

## Public tracking

`GET /shipments/track/:number` returns a reduced view (`src/modules/shipments/public-tracking.ts`):
status, cities, countries, dates and checkpoints — never names, contact details, addresses, contents,
declared value or internal notes.

## Website content managed from the admin

`GET /api/settings` (public) returns everything the website needs: name, colours, contacts, logos, and

- `homeContent`: home page texts, the three key figures and the example routes of the animated tracking card
  (`null` = the website's built-in defaults). Updated with `PUT /api/settings` (`homeContent: null` restores the defaults).
- `images`: the website photos replaced in the admin, by slot (`hero`, `air`, `sea`, `road`, `customs`, `port`,
  `sorting`, `receive`, `business`). A missing slot means the built-in photo.

| Route (admin, JWT) | Purpose |
|---|---|
| `POST /api/settings/branding/:kind` · `DELETE …` | Logo, logo for dark backgrounds, favicon (`logo`, `logoOnDark`, `favicon`; 2 MB) |
| `POST /api/settings/images/:slot` · `DELETE …` | Website photos (JPG, PNG or WebP; 6 MB) |

Uploaded files are checked by their signature (not the declared type), stored in S3 under content-hashed names
and served publicly by `GET /api/branding/:file` and `GET /api/media/:file` with an immutable cache.

Admin lists (`/api/shipments`, `/api/leads`, `/api/messages`) accept `page`, `limit` (max. 100), `q` (search) and `status`.

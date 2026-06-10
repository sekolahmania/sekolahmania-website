# Migrating SekolahMania: Supabase → Convex

A complete, step-by-step guide for replacing the Supabase backend stubs in
`sekolahmania.html` with Convex — including both **cloud-hosted** (convex.dev)
and **self-hosted** (Docker / Fly.io / Railway) options.

---

## Table of Contents

- [Why Convex vs Supabase for This Project](#why-convex-vs-supabase-for-this-project)
- [Architecture Overview: Before & After](#architecture-overview-before--after)
- [Part 1 — Convex Cloud Hosting](#part-1--convex-cloud-hosting)
  - [Step 1: Project Setup](#step-1-project-setup)
  - [Step 2: Write Convex Functions](#step-2-write-convex-functions)
  - [Step 3: Deploy Functions](#step-3-deploy-functions)
  - [Step 4: Update sekolahmania.html](#step-4-update-sekolahmaniahtml)
- [Part 2 — Self-Hosting Convex](#part-2--self-hosting-convex)
  - [Option A: Docker (Local / VPS)](#option-a-docker-local--vps)
  - [Option B: Fly.io](#option-b-flyio)
  - [Option C: Railway.com](#option-c-railwaycom)
  - [Production: Postgres + S3](#production-postgres--s3)
- [Part 3 — Complete Diff: sekolahmania.html](#part-3--complete-diff-sekolahmaniahtml)
- [Part 4 — Realtime Bonus (Live Q&A Feed)](#part-4--realtime-bonus-live-qa-feed)
- [Hosting Decision Matrix](#hosting-decision-matrix)
- [Troubleshooting](#troubleshooting)

---

## Why Convex vs Supabase for This Project

| Concern | Supabase approach | Convex approach |
|---|---|---|
| **API calls from vanilla JS** | REST fetch to `/rest/v1/table` with `apikey` header | HTTP Actions endpoint — plain `fetch()`, no SDK required |
| **Schema** | SQL DDL (`CREATE TABLE`) + RLS policies | TypeScript schema file — no SQL needed |
| **Realtime** | Realtime server container, separate channel from writes | Native websocket subscriptions, same channel as writes |
| **Self-hosting** | Compose of 8+ containers (Postgres, Kong, GoTrue, etc.) | Single Docker container + dashboard container |
| **Type safety** | Generated SQL types | First-class TypeScript inference end-to-end |
| **No SQL** | ✗ Required | ✓ Document store, no ORM needed |
| **Free tier** | 2 projects, 500 MB DB | 40 deployments, generous compute limits |

**Key point for SekolahMania:** because `sekolahmania.html` is a zero-framework
static HTML file (Aloha-style), it **cannot** use the Convex JS SDK's
`ConvexReactClient` or Node client. Instead, all three forms (Q&A, Feedback,
Unit Plan) must call **Convex HTTP Actions** — plain HTTPS endpoints that Convex
exposes, callable from any `fetch()`.

---

## Architecture Overview: Before & After

### Before (Supabase stubs)

```
sekolahmania.html
  └── fetch(SUPABASE_URL + '/rest/v1/questions', {
        headers: { 'apikey': SUPABASE_ANON, ... }
      })
```

### After (Convex HTTP Actions)

```
sekolahmania.html
  └── fetch(CONVEX_HTTP_URL + '/submitQuestion', { method: 'POST', body: JSON })
  └── fetch(CONVEX_HTTP_URL + '/submitFeedback', { method: 'POST', body: JSON })
  └── fetch(CONVEX_HTTP_URL + '/submitUnitPlan', { method: 'POST', body: JSON })

Convex backend (cloud or self-hosted)
  ├── convex/http.ts          ← HTTP Action router
  ├── convex/mutations.ts     ← Database write functions
  └── convex/schema.ts        ← Document schema (no SQL)
```

---

## Part 1 — Convex Cloud Hosting

### Step 1: Project Setup

Convex functions need to live in a separate directory alongside your static
site. Create this structure next to your `sekolahmania.html`:

```
sekolahmania/
├── sekolahmania.html         ← unchanged static site
├── package.json              ← new
├── convex/
│   ├── _generated/           ← auto-generated, do not edit
│   ├── schema.ts             ← new
│   ├── mutations.ts          ← new
│   └── http.ts               ← new
└── .env.local                ← new (gitignored)
```

**Install Convex:**

```bash
npm init -y
npm install convex
npx convex dev   # prompts login + creates project at dashboard.convex.dev
```

This generates a `.env.local` with your `CONVEX_DEPLOYMENT` and
`VITE_CONVEX_URL` (or `NEXT_PUBLIC_CONVEX_URL`). For our static HTML site,
**we only need the HTTP Actions URL**, which is:

```
https://<your-deployment>.convex.site
```

You can find it in the Convex dashboard under **Deployment Settings →
HTTP Actions URL**.

---

### Step 2: Write Convex Functions

#### `convex/schema.ts` — Define your documents (replaces SQL DDL)

```typescript
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Replaces: CREATE TABLE questions (...)
  questions: defineTable({
    name:    v.string(),
    school:  v.optional(v.string()),
    subject: v.optional(v.string()),
    message: v.string(),
  }),

  // Replaces: CREATE TABLE feedback (...)
  feedback: defineTable({
    name:    v.string(),
    school:  v.optional(v.string()),
    session: v.optional(v.string()),
    rating:  v.optional(v.number()),
    message: v.string(),
  }),

  // Replaces: CREATE TABLE unit_plans (...)
  unit_plans: defineTable({
    mapel:        v.string(),
    kelas:        v.optional(v.string()),
    waktu:        v.optional(v.string()),
    profil:       v.optional(v.string()),
    tujuan:       v.string(),
    topik:        v.optional(v.string()),
    pedagogi:     v.optional(v.string()),
    lingkungan:   v.optional(v.string()),
    mitra:        v.optional(v.string()),
    memahami:     v.optional(v.string()),
    mengaplikasi: v.optional(v.string()),
    merefleksi:   v.optional(v.string()),
    as_awal:      v.optional(v.string()),
    as_proses:    v.optional(v.string()),
    as_akhir:     v.optional(v.string()),
    catatan:      v.optional(v.string()),
    dimensi:      v.array(v.string()),
  }),
});
```

#### `convex/mutations.ts` — Database write functions

```typescript
import { mutation } from "./_generated/server";
import { v } from "convex/values";

// Replaces: POST /rest/v1/questions
export const insertQuestion = mutation({
  args: {
    name:    v.string(),
    school:  v.optional(v.string()),
    subject: v.optional(v.string()),
    message: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("questions", args);
  },
});

// Replaces: POST /rest/v1/feedback
export const insertFeedback = mutation({
  args: {
    name:    v.string(),
    school:  v.optional(v.string()),
    session: v.optional(v.string()),
    rating:  v.optional(v.number()),
    message: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("feedback", args);
  },
});

// Replaces: POST /rest/v1/unit_plans
export const insertUnitPlan = mutation({
  args: {
    mapel:        v.string(),
    kelas:        v.optional(v.string()),
    waktu:        v.optional(v.string()),
    profil:       v.optional(v.string()),
    tujuan:       v.string(),
    topik:        v.optional(v.string()),
    pedagogi:     v.optional(v.string()),
    lingkungan:   v.optional(v.string()),
    mitra:        v.optional(v.string()),
    memahami:     v.optional(v.string()),
    mengaplikasi: v.optional(v.string()),
    merefleksi:   v.optional(v.string()),
    as_awal:      v.optional(v.string()),
    as_proses:    v.optional(v.string()),
    as_akhir:     v.optional(v.string()),
    catatan:      v.optional(v.string()),
    dimensi:      v.array(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("unit_plans", args);
  },
});
```

#### `convex/http.ts` — HTTP Action router (the critical piece)

This is what replaces Supabase's REST API. Convex exposes these as plain
HTTPS endpoints callable by any `fetch()` from your static HTML — no SDK,
no auth headers, no API key in the browser.

```typescript
import { httpRouter }  from "convex/server";
import { httpAction }  from "./_generated/server";
import { api }         from "./_generated/api";

const http = httpRouter();

// ── CORS helper ─────────────────────────────────────────────────────────────
// Required so sekolahmania.html (different origin) can call the API.
// For production, replace "*" with "https://sekolahmania.com".
function corsHeaders(origin: string = "*") {
  return {
    "Access-Control-Allow-Origin":  origin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

// Handle preflight OPTIONS requests for all routes
http.route({
  path:    "/submitQuestion",
  method:  "OPTIONS",
  handler: httpAction(async () =>
    new Response(null, { status: 204, headers: corsHeaders() })
  ),
});
http.route({
  path:    "/submitFeedback",
  method:  "OPTIONS",
  handler: httpAction(async () =>
    new Response(null, { status: 204, headers: corsHeaders() })
  ),
});
http.route({
  path:    "/submitUnitPlan",
  method:  "OPTIONS",
  handler: httpAction(async () =>
    new Response(null, { status: 204, headers: corsHeaders() })
  ),
});

// ── POST /submitQuestion ────────────────────────────────────────────────────
// Replaces: fetch(SUPABASE_URL + '/rest/v1/questions', { method: 'POST', ... })
http.route({
  path:   "/submitQuestion",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const body = await request.json();

      if (!body.name?.trim() || !body.message?.trim()) {
        return new Response(
          JSON.stringify({ error: "name and message are required" }),
          { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders() } }
        );
      }

      const id = await ctx.runMutation(api.mutations.insertQuestion, {
        name:    body.name.trim(),
        school:  body.school?.trim() || undefined,
        subject: body.subject || undefined,
        message: body.message.trim(),
      });

      return new Response(
        JSON.stringify({ success: true, id }),
        { status: 201, headers: { "Content-Type": "application/json", ...corsHeaders() } }
      );
    } catch (err) {
      return new Response(
        JSON.stringify({ error: "Server error" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders() } }
      );
    }
  }),
});

// ── POST /submitFeedback ────────────────────────────────────────────────────
http.route({
  path:   "/submitFeedback",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const body = await request.json();

      if (!body.name?.trim() || !body.message?.trim()) {
        return new Response(
          JSON.stringify({ error: "name and message are required" }),
          { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders() } }
        );
      }

      const id = await ctx.runMutation(api.mutations.insertFeedback, {
        name:    body.name.trim(),
        school:  body.school?.trim() || undefined,
        session: body.session || undefined,
        rating:  typeof body.rating === "number" ? body.rating : undefined,
        message: body.message.trim(),
      });

      return new Response(
        JSON.stringify({ success: true, id }),
        { status: 201, headers: { "Content-Type": "application/json", ...corsHeaders() } }
      );
    } catch (err) {
      return new Response(
        JSON.stringify({ error: "Server error" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders() } }
      );
    }
  }),
});

// ── POST /submitUnitPlan ────────────────────────────────────────────────────
http.route({
  path:   "/submitUnitPlan",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const body = await request.json();

      if (!body.tujuan?.trim()) {
        return new Response(
          JSON.stringify({ error: "tujuan is required" }),
          { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders() } }
        );
      }

      const id = await ctx.runMutation(api.mutations.insertUnitPlan, {
        mapel:        body.mapel        || "Biologi",
        kelas:        body.kelas        || undefined,
        waktu:        body.waktu        || undefined,
        profil:       body.profil       || undefined,
        tujuan:       body.tujuan.trim(),
        topik:        body.topik        || undefined,
        pedagogi:     body.pedagogi     || undefined,
        lingkungan:   body.lingkungan   || undefined,
        mitra:        body.mitra        || undefined,
        memahami:     body.memahami     || undefined,
        mengaplikasi: body.mengaplikasi || undefined,
        merefleksi:   body.merefleksi   || undefined,
        as_awal:      body.as_awal      || undefined,
        as_proses:    body.as_proses    || undefined,
        as_akhir:     body.as_akhir     || undefined,
        catatan:      body.catatan      || undefined,
        dimensi:      Array.isArray(body.dimensi) ? body.dimensi : [],
      });

      return new Response(
        JSON.stringify({ success: true, id }),
        { status: 201, headers: { "Content-Type": "application/json", ...corsHeaders() } }
      );
    } catch (err) {
      return new Response(
        JSON.stringify({ error: "Server error" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders() } }
      );
    }
  }),
});

export default http;
```

---

### Step 3: Deploy Functions

```bash
# Push schema + functions to Convex cloud
npx convex deploy

# Or keep watching for changes during development
npx convex dev
```

After deploy, confirm your HTTP Actions URL in the Convex dashboard:

```
Dashboard → Your Project → Settings → Deployment URL
https://<your-slug>.convex.site
```

Test the endpoints with curl before touching the HTML:

```bash
# Test Q&A endpoint
curl -X POST https://<your-slug>.convex.site/submitQuestion \
  -H "Content-Type: application/json" \
  -d '{"name":"Suta","school":"SMA N 1 Kuta","subject":"Inkuiri STEM","message":"Apa perbedaan utama inkuiri terbimbing dan bebas?"}'

# Expected: {"success":true,"id":"..."}
```

---

### Step 4: Update sekolahmania.html

This is the only file that needs changing. Make **exactly 4 edits**:

#### Edit 1 — Replace Supabase config variables (line ~3341)

**Remove:**
```javascript
// ── Supabase config (replace with real values) ─
var SUPABASE_URL     = 'https://your-project.supabase.co';
var SUPABASE_ANON    = 'your-anon-key';
```

**Replace with:**
```javascript
// ── Convex HTTP Actions config ─────────────────
// Cloud:       'https://<your-slug>.convex.site'
// Self-hosted: 'https://convex.yourdomain.com' (or http://localhost:3211 for dev)
var CONVEX_HTTP_URL = 'https://<your-slug>.convex.site';
```

---

#### Edit 2 — Q&A form submission (line ~3544)

**Remove:**
```javascript
  // Supabase stub:
  // fetch(SUPABASE_URL + '/rest/v1/questions', {
  //   method: 'POST',
  //   headers: { 'apikey': SUPABASE_ANON, 'Content-Type': 'application/json', 'Prefer': 'return=minimal' },
  //   body: JSON.stringify(payload)
  // });
```

**Replace with:**
```javascript
  fetch(CONVEX_HTTP_URL + '/submitQuestion', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(payload)
  })
  .then(function(res) { return res.json(); })
  .then(function(data) {
    if (!data.success) console.error('Q&A error:', data.error);
  })
  .catch(function(err) { console.error('Q&A network error:', err); });
```

---

#### Edit 3 — Feedback form submission (line ~3572)

**Remove:**
```javascript
  // Supabase stub:
  // fetch(SUPABASE_URL + '/rest/v1/feedback', {
  //   method: 'POST',
  //   headers: { 'apikey': SUPABASE_ANON, 'Content-Type': 'application/json', 'Prefer': 'return=minimal' },
  //   body: JSON.stringify(payload)
  // });
```

**Replace with:**
```javascript
  fetch(CONVEX_HTTP_URL + '/submitFeedback', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(payload)
  })
  .then(function(res) { return res.json(); })
  .then(function(data) {
    if (!data.success) console.error('Feedback error:', data.error);
  })
  .catch(function(err) { console.error('Feedback network error:', err); });
```

---

#### Edit 4 — Unit Plan submission (line ~3450)

**Remove:**
```javascript
  // Supabase-ready stub (replace fetch with actual Supabase insert in production)
  // fetch('/api/unit-plans', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(data)
  // });
```

**Replace with:**
```javascript
  fetch(CONVEX_HTTP_URL + '/submitUnitPlan', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(data)
  })
  .then(function(res) { return res.json(); })
  .then(function(result) {
    if (!result.success) console.error('Unit plan error:', result.error);
  })
  .catch(function(err) { console.error('Unit plan network error:', err); });
```

---

#### Edit 5 — Footer badge (optional cosmetic, line ~3274)

**Remove:**
```html
<span class="footer-badge">Supabase</span>
```

**Replace with:**
```html
<span class="footer-badge">Convex</span>
```

---

## Part 2 — Self-Hosting Convex

Self-hosting deploys three services: the **Convex backend**, the **Convex
dashboard**, and your **frontend** (sekolahmania.html stays on Vercel/Netlify
or your own nginx — no change needed there).

### Option A: Docker (Local / VPS)

This is the simplest path and recommended for getting started.

#### 1. Get the Docker Compose file

```bash
mkdir convex-server && cd convex-server

curl -o docker-compose.yml \
  https://raw.githubusercontent.com/get-convex/convex-backend/main/self-hosted/docker/docker-compose.yml
```

#### 2. Start the backend + dashboard

```bash
docker compose up -d
```

| Service | URL |
|---|---|
| Convex backend (API) | `http://127.0.0.1:3210` |
| HTTP Actions endpoint | `http://127.0.0.1:3211` |
| Dashboard UI | `http://localhost:6791` |

#### 3. Generate an admin key

```bash
docker compose exec backend ./generate_admin_key.sh
# Output: admin:<your-long-key>
# Save this — you need it for CLI deploys
```

#### 4. Configure your Convex project for self-hosted

Create `.env.local` in your `sekolahmania/` project root:

```bash
# .env.local — DO NOT commit this file
CONVEX_SELF_HOSTED_URL='http://127.0.0.1:3210'
CONVEX_SELF_HOSTED_ADMIN_KEY='admin:<your-key-from-step-3>'
```

#### 5. Deploy your Convex functions to self-hosted

```bash
npm install convex@latest

# Deploy schema + functions to your local backend
npx convex deploy \
  --url http://127.0.0.1:3210 \
  --admin-key 'admin:<your-key>'
```

#### 6. Update `CONVEX_HTTP_URL` in sekolahmania.html

For local development:
```javascript
var CONVEX_HTTP_URL = 'http://127.0.0.1:3211';
```

For a VPS with a domain (after setting up nginx reverse proxy):
```javascript
var CONVEX_HTTP_URL = 'https://convex.sekolahmania.com';
```

#### 7. nginx reverse proxy (production VPS)

Add this to your nginx config to expose the HTTP Actions port publicly:

```nginx
# /etc/nginx/sites-available/convex.sekolahmania.com
server {
    listen 443 ssl http2;
    server_name convex.sekolahmania.com;

    # SSL — use certbot: certbot --nginx -d convex.sekolahmania.com
    ssl_certificate     /etc/letsencrypt/live/convex.sekolahmania.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/convex.sekolahmania.com/privkey.pem;

    # HTTP Actions port (3211)
    location / {
        proxy_pass         http://127.0.0.1:3211;
        proxy_http_version 1.1;
        proxy_set_header   Upgrade $http_upgrade;
        proxy_set_header   Connection "upgrade";
        proxy_set_header   Host $host;
        proxy_set_header   X-Real-IP $remote_addr;
    }
}

# Dashboard port (6791) — protect with basic auth or VPN in production
server {
    listen 443 ssl http2;
    server_name convex-dashboard.sekolahmania.com;
    # ... same SSL config ...
    location / {
        auth_basic           "Convex Dashboard";
        auth_basic_user_file /etc/nginx/.htpasswd;
        proxy_pass           http://127.0.0.1:6791;
    }
}
```

```bash
# Create dashboard password
sudo htpasswd -c /etc/nginx/.htpasswd admin

sudo nginx -t && sudo systemctl reload nginx
```

---

### Option B: Fly.io

Fly.io is the recommended managed option for self-hosting — cheaper than a
full VPS and handles TLS automatically.

```bash
# Install flyctl
curl -L https://fly.io/install.sh | sh

# Clone the self-hosted config
git clone https://github.com/get-convex/convex-backend.git
cd convex-backend/self-hosted/advanced/fly

# Follow the Fly README — it creates a persistent volume for SQLite
fly launch
fly volumes create convex_data --size 10   # 10 GB persistent disk

# Set your admin key as a secret
fly secrets set CONVEX_ADMIN_KEY="$(fly ssh console -C './generate_admin_key.sh')"

fly deploy
```

Your HTTP Actions URL will be: `https://<app-name>.fly.dev`

Update `sekolahmania.html`:
```javascript
var CONVEX_HTTP_URL = 'https://<app-name>.fly.dev';
```

---

### Option C: Railway.com

```bash
# From the self-hosted advanced dir
cd convex-backend/self-hosted/advanced/railway

# Follow the Railway README
# Railway auto-provisions a public HTTPS URL for your backend
```

Railway gives you a URL like `https://convex-backend-production.up.railway.app`.

---

### Production: Postgres + S3

By default Convex self-hosted stores data in SQLite. For production with
more than a few hundred users, migrate to Postgres + S3:

**Postgres (replace SQLite):**

```bash
# Add to docker-compose.yml environment section for the backend service:
DATABASE_URL=postgresql://user:password@your-postgres-host:5432/convex

# Or for managed Postgres (Neon, Supabase Postgres, AWS RDS):
DATABASE_URL=postgresql://user:password@db.neon.tech/convex?sslmode=require
```

See full instructions: `convex-backend/self-hosted/advanced/postgres_or_mysql.md`

**S3 (replace local filesystem for files/exports):**

```bash
# Add to docker-compose.yml environment:
S3_STORAGE_BUCKET=sekolahmania-convex-storage
AWS_ACCESS_KEY_ID=<your-key>
AWS_SECRET_ACCESS_KEY=<your-secret>
AWS_REGION=ap-southeast-1   # Singapore — closest to Bali
```

See full instructions: `convex-backend/self-hosted/advanced/s3_storage.md`

---

## Part 3 — Complete Diff: sekolahmania.html

Summary of all changes needed in the HTML file. Everything else stays
identical — the Aloha-style architecture is completely unaffected.

```diff
- // ── Supabase config (replace with real values) ─
- var SUPABASE_URL     = 'https://your-project.supabase.co';
- var SUPABASE_ANON    = 'your-anon-key';
+ // ── Convex HTTP Actions config ─────────────────
+ var CONVEX_HTTP_URL = 'https://<your-slug>.convex.site';

  // inside submitQA():
- // Supabase stub:
- // fetch(SUPABASE_URL + '/rest/v1/questions', {
- //   method: 'POST',
- //   headers: { 'apikey': SUPABASE_ANON, 'Content-Type': 'application/json', 'Prefer': 'return=minimal' },
- //   body: JSON.stringify(payload)
- // });
+ fetch(CONVEX_HTTP_URL + '/submitQuestion', {
+   method: 'POST', headers: { 'Content-Type': 'application/json' },
+   body: JSON.stringify(payload)
+ }).then(r => r.json()).catch(console.error);

  // inside submitFeedback():
- // Supabase stub:
- // fetch(SUPABASE_URL + '/rest/v1/feedback', {
- //   method: 'POST',
- //   headers: { 'apikey': SUPABASE_ANON, 'Content-Type': 'application/json', 'Prefer': 'return=minimal' },
- //   body: JSON.stringify(payload)
- // });
+ fetch(CONVEX_HTTP_URL + '/submitFeedback', {
+   method: 'POST', headers: { 'Content-Type': 'application/json' },
+   body: JSON.stringify(payload)
+ }).then(r => r.json()).catch(console.error);

  // inside upfSubmit():
- // Supabase-ready stub (replace fetch with actual Supabase insert in production)
- // fetch('/api/unit-plans', { method: 'POST', ... });
+ fetch(CONVEX_HTTP_URL + '/submitUnitPlan', {
+   method: 'POST', headers: { 'Content-Type': 'application/json' },
+   body: JSON.stringify(data)
+ }).then(r => r.json()).catch(console.error);

  // in footer:
- <span class="footer-badge">Supabase</span>
+ <span class="footer-badge">Convex</span>
```

**Total lines changed in sekolahmania.html: ~15 lines.** The rest of the
3,704-line file is untouched.

---

## Part 4 — Realtime Bonus (Live Q&A Feed)

One of Convex's biggest advantages over Supabase for this project is **native
realtime** — you can show a live feed of submitted questions without polling,
without a separate realtime container, and without any extra configuration.

This requires adding the Convex browser client to your HTML (it's tiny — ~15KB
gzipped):

### Add Convex client to sekolahmania.html

After the jQuery `<script>` tag, add:

```html
<!-- Convex browser client for realtime subscriptions -->
<script type="module">
  import { ConvexClient } from "https://esm.sh/convex/browser";

  const convex = new ConvexClient(CONVEX_HTTP_URL.replace('.site', '.cloud'));

  // Subscribe to live Q&A feed — updates automatically when new questions arrive
  convex.onUpdate(
    { name: "queries:listRecentQuestions" },  // Convex query function (see below)
    {},
    function(questions) {
      var $feed = $('#qaLiveFeed');
      if (!$feed.length) return;
      $feed.empty();
      questions.forEach(function(q) {
        $feed.append(
          '<div class="qa-feed-item">' +
            '<strong>' + $('<span>').text(q.name).html() + '</strong>' +
            ' dari ' + $('<span>').text(q.school || 'anonim').html() +
            '<p>' + $('<span>').text(q.message).html() + '</p>' +
          '</div>'
        );
      });
    }
  );
</script>
```

### Add `convex/queries.ts`

```typescript
import { query } from "./_generated/server";

// Returns the 20 most recent questions — live-updated for subscribers
export const listRecentQuestions = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("questions")
      .order("desc")
      .take(20);
  },
});
```

### Add the live feed container in the Q&A section HTML

Find the `#tanya` section in `sekolahmania.html` and add after the form:

```html
<div id="qaLiveFeed" style="
  margin-top: 24px;
  display: flex;
  flex-direction: column;
  gap: 12px;
">
  <!-- Questions stream in here automatically -->
</div>
```

This is impossible to replicate cleanly with Supabase in a zero-framework
static HTML file — Supabase's realtime uses a websocket client that requires
its own SDK setup. Convex's `ConvexClient` works as a plain ES module import.

---

## Hosting Decision Matrix

Use this to choose your deployment path:

| Scenario | Recommended Option | Convex URL pattern |
|---|---|---|
| Just testing / workshop day | Convex Cloud free tier | `https://xxx.convex.site` |
| Small scale (< 500 users/mo) | Convex Cloud free tier | `https://xxx.convex.site` |
| Production (school district) | Convex Cloud Pro | `https://xxx.convex.site` |
| Data sovereignty (Indonesian gov) | Self-hosted Docker on VPS in ID | `https://convex.sekolahmania.com` |
| Low cost, managed infra | Self-hosted on Fly.io | `https://xxx.fly.dev` |
| Easy deploy, low ops overhead | Self-hosted on Railway | `https://xxx.up.railway.app` |
| Full control, existing Postgres | Self-hosted + Postgres + S3 | your domain |
| Integration with Mai-Milu / NusaBaliConnect | Convex Cloud (shared deployment) | shared `xxx.convex.site` |

### Cost comparison

| Option | Cost | Notes |
|---|---|---|
| Convex Cloud free | $0 | 40 deployments, generous limits |
| Convex Cloud Pro | $25/mo base | Per-seat pricing, unlimited deployments |
| Self-hosted: Fly.io | ~$5–15/mo | 1 shared-CPU VM + 10GB volume |
| Self-hosted: Railway | ~$5/mo | $5 credit/mo free, usage-based |
| Self-hosted: VPS (Hetzner/DO) | ~$5–10/mo | Full control, nginx + Docker |
| Supabase free (comparison) | $0 | 2 projects, 500MB DB |
| Supabase Pro (comparison) | $25/mo | Per-org pricing |

---

## Troubleshooting

### CORS error in browser console

```
Access to fetch at 'https://xxx.convex.site/submitQuestion'
from origin 'https://sekolahmania.com' has been blocked by CORS policy
```

**Fix:** Your `http.ts` CORS helper needs to match your actual frontend origin.
Replace `"*"` with your domain in the `corsHeaders()` function:

```typescript
function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "https://sekolahmania.com",
    // ... rest unchanged
  };
}
```

For local development, use `"*"` or `"http://localhost:3000"`.

---

### Self-hosted: Docker container exits immediately

```bash
docker compose logs backend
# Check for missing environment variables or port conflicts
```

Common fix — ensure ports 3210, 3211, 6791 are free:
```bash
lsof -i :3210
kill -9 <PID>
```

---

### Self-hosted: "admin key not found" when deploying

Regenerate the admin key:
```bash
docker compose exec backend ./generate_admin_key.sh
# Update CONVEX_SELF_HOSTED_ADMIN_KEY in .env.local
```

---

### Convex deploy fails with TypeScript errors

```bash
# Confirm you're on the latest Convex version
npm install convex@latest

# Check generated types are up to date
npx convex codegen
```

---

### Self-hosted on VPS: HTTP Actions not reachable externally

The HTTP Actions port is `3211`, not `3210` (which is the internal API).
Make sure your nginx `proxy_pass` points to `:3211`, not `:3210`.

---

### Upgrading self-hosted Convex

```bash
# Pull latest image
docker compose pull

# Restart with new image
docker compose up -d

# Check version
docker compose exec backend ./convex-local-backend --version
```

See: `convex-backend/self-hosted/advanced/upgrading.md`

---

*SekolahMania.com · Bali, Indonesia · 2026*
*Convex migration guide — based on convex.dev/compare/supabase and github.com/get-convex/convex-backend/self-hosted/README.md*

# Step 4 — Railway deployment

**Goal:** Deploy the backend (Step 1–3) to Railway with MySQL. No frontend or draw-logic changes.

**Prerequisites:**

- Backend repo pushed to GitHub (e.g. from `~/Projects/DSLuckyDraw/backend`).
- Railway account ([railway.app](https://railway.app)); sign in with GitHub.

---

## 1. Create project and add MySQL

1. In Railway dashboard: **New Project**.
2. **Add service** → **Database** → **MySQL**.
3. Wait for MySQL to provision. Note the service name (e.g. `MySQL`).

---

## 2. Add backend service from GitHub

1. In the same project: **New** → **GitHub Repo**.
2. Select the **backend** repository (the one whose root is this folder).
3. If the repo is monorepo at root, set **Root Directory** to `backend` (or deploy from a repo that has only the backend as root).
4. Railway will detect Node.js. Confirm **Build Command** and **Start Command** as below.

---

## 3. Build and start commands

| Setting | Value |
|--------|--------|
| **Build** | `npm install` (or leave default; Railway usually runs `npm install` for Node). |
| **Start** | `npm run step3:start` or `node server.js` |

Set **Start Command** in the backend service → **Settings** → **Deploy** if needed.

---

## 4. Environment variables (backend service)

The app expects: `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`. Railway’s MySQL service exposes different names, so map them.

**Option A — Variable references (recommended)**  
In the **backend** service → **Variables**, add:

| Variable   | Value (use Railway “Reference” from your MySQL service) |
|-----------|---------------------------------------------------------|
| `DB_HOST` | Reference → `MySQL` → `MYSQLHOST` (or your MySQL service name) |
| `DB_USER` | Reference → `MySQL` → `MYSQLUSER` |
| `DB_PASSWORD` | Reference → `MySQL` → `MYSQLPASSWORD` |
| `DB_NAME`  | Reference → `MySQL` → `MYSQLDATABASE` |

`PORT` is set by Railway automatically; the app uses `process.env.PORT || 3000`.

**Option B — Copy from MySQL service**  
In the MySQL service → **Variables** (or **Connect**), copy `MYSQLHOST`, `MYSQLUSER`, `MYSQLPASSWORD`, `MYSQLDATABASE` and create `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` in the backend service with those values.

---

## 5. Deploy and run pool init (Step 1) once

1. Deploy the backend (push to `main` or trigger deploy in Railway).
2. After the first successful deploy, run the pool initialization **once** so the `signs` table and 10,000 rows exist.

**Using Railway CLI:**

```bash
cd ~/Projects/DSLuckyDraw/backend
railway link   # select the backend service’s project
railway run npm run step1:init
```

**Without CLI:** Use **Railway** → backend service → **Settings** → **One-off command** / **Run command** (if available), or a temporary “run” job, with command: `npm run step1:init`. Ensure the same env vars (DB_*) are available to that run.

3. Optional: verify pool: `railway run npm run step1:verify`.

---

## 6. Get API URL and test

1. Backend service → **Settings** → **Networking** → **Generate Domain** (or use the default).
2. Note the URL (e.g. `https://your-backend.up.railway.app`).
3. Test:

```bash
curl -X POST https://your-backend.up.railway.app/draw
```

Expect `200` with `{ "status": "OK", "sign": { ... } }` or `{ "status": "OUT_OF_STOCK" }`.

---

## 7. Optional

- **Health/readiness:** Add a GET route (e.g. `GET /health` returning 200) if you want Railway or a load balancer to check liveness.
- **Custom domain:** In **Settings** → **Networking** add your domain and follow Railway’s DNS instructions.
- **H5 frontend:** Point the frontend’s API base URL to `https://your-backend.up.railway.app`.

---

## Summary checklist

| Step | Action |
|------|--------|
| 1 | New Project → Add MySQL service |
| 2 | New service from GitHub (backend repo) |
| 3 | Set start: `npm run step3:start` (or `node server.js`) |
| 4 | Set `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` (from MySQL service) |
| 5 | Deploy, then run `npm run step1:init` once |
| 6 | Generate domain, test POST /draw |

No application logic or Step 1–3 code is changed for deployment.

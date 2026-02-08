# H5 Lucky Draw — Backend

Backend API and database layer for the Lucky Draw H5 event. This repository is the **single source of truth** for the backend and is ready for deployment (e.g. Railway).

---

## Project purpose

- **Lucky Draw** is an H5 (mobile web) event where users receive one draw per request.
- The backend manages a **fixed pool of 10,000 signs** (rewards + empty slots), ensures **no duplicate draws**, and exposes a **POST /draw** HTTP API.
- This repo contains the database schema, pool initialization, draw algorithm, and HTTP API. No frontend code lives here.

---

## Architecture

| Layer | Role |
|-------|------|
| **Frontend (H5)** | Separate codebase; consumes this backend’s API. |
| **Backend (this repo)** | Node.js + Express. POST /draw → deterministic draw from MySQL pool. |
| **MySQL** | Single `signs` table (10,000 rows). Schema and init scripts in this repo. |

Flow: **H5 app** → **POST /draw** → **Backend** → **MySQL** (select + mark drawn) → **JSON response** (sign or OUT_OF_STOCK).

---

## Current status

- **Step 1** — Database schema & pool initialization: done.
- **Step 2** — Draw algorithm (deterministic, transactional, no double-draw): done.
- **Step 3** — Draw API (POST /draw, 200/503/500): done and tested locally.
- **Step 4** — Railway deployment: see **README_STEP4.md** for full guidance.

No frontend changes are included in this step.

---

## Quick start (local)

```bash
cp .env.example .env   # set DB_HOST, DB_USER, DB_PASSWORD, DB_NAME
npm install
npm run step1:init     # create table + 10,000 rows
npm run step1:verify   # optional check
npm run step3:start    # API on PORT or 3000
# POST http://localhost:3000/draw
```

See **README_STEP1.md**, **README_STEP2.md**, **README_STEP3.md** for schema, algorithm, and API details. For deploying to Railway, see **README_STEP4.md**.

# Step 3 — Draw API (no frontend, no deployment)

**Goal:** Expose Step 2 draw algorithm via HTTP. No changes to draw logic, Step 1 schema, or frontend.

## Endpoint

- **POST /draw**
  - Calls `draw()` from `draw.js` (unchanged).
  - **200 OK** + `{ status: 'OK', sign: { id, level, type, reward_code } }` on success.
  - **200 OK** + `{ status: 'OUT_OF_STOCK' }` when no undrawn signs.
  - **503** when DB unavailable (connection/access errors).
  - **500** when draw throws (e.g. transaction failure after retry).

## Usage

1. Ensure MySQL is running and pool is initialized: `npm run step1:init`
2. Start API: `npm run step3:start` (listens on `PORT` or 3000)
3. Request:
   ```bash
   curl -X POST http://localhost:3000/draw
   ```

Optional audit logging: set `LOG_DRAWS=1` in env. Logs do not affect the algorithm.

## Tests

1. Start the server: `npm run step3:start`
2. In another terminal: `npm run step3:test`

Or set `API_BASE_URL` if the server runs elsewhere.

| Test | Expectation |
|------|-------------|
| Single POST /draw | 200, body has `sign` with `id`, `level`, `type`, `reward_code` |
| 10 sequential POST /draw | 10 responses with 10 distinct `sign.id` |
| Deplete | Repeated POST until body `status === 'OUT_OF_STOCK'`; then drawn=10000, undrawn=0 |
| DB integrity | total=10000, drawn+undrawn=10000 |

After full test run, pool is fully drawn. Reset for another test run: `npm run step1:reset` (or `npm run step1:init` after truncating if you need a full re-insert).

## Red lines

- Do **not** modify `draw.js` (draw algorithm).
- Do **not** change Step 1 schema or data.
- Do **not** touch frontend or CSS.
- Do **not** add new random or probability logic.
- Transactional integrity and uniqueness remain as in Step 2.

## Deliverables

- `api/draw-api.js` — POST /draw handler, wraps `draw()`
- `server.js` — Express app, mounts draw route
- `step3-test.js` — API tests
- `package.json` — `step3:start`, `step3:test`
- This README

**No deployment in Step 3.** Wait for explicit instructions for Step 4.

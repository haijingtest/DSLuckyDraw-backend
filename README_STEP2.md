# Step 2 — Technical Archive (Draw Algorithm)

**Status:** Completed. No API, no frontend, no deployment.  
**Artifacts:** `draw.js`, `step2-test.js`, `STEP2_RISK_REVIEW.md`.  
**Version:** Preserve this document and referenced files for future reference (version control recommended).

---

## 1. Step 2 objectives

- Implement **deterministic** backend draw logic using the pre-generated MySQL pool (Step 1).
- Guarantee **no sign is ever drawn twice** and **inventory invariants** hold under concurrency.
- Provide **OUT_OF_STOCK** when no undrawn signs remain.
- **Scope:** Backend only. No HTTP API, no frontend changes, no schema or data changes, no deployment.

---

## 2. Draw algorithm explanation

**Source:** `draw.js`. Do not modify for Step 3; wrap only.

**Flow:**

1. Open a dedicated DB connection (env: `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`).
2. **Transaction start.**
3. **COUNT:** `SELECT COUNT(*) FROM signs WHERE is_drawn = false`. If 0 → rollback, return `{ status: 'OUT_OF_STOCK' }`.
4. **Offset:** Random integer in `[0, count - 1]` (inclusive).
5. **Select and lock:** `SELECT id, level, type, reward_code FROM signs WHERE is_drawn = false ORDER BY id LIMIT 1 OFFSET ? FOR UPDATE`. This locks the chosen row until commit.
6. **Update:** `UPDATE signs SET is_drawn = true WHERE id = ? AND is_drawn = false`.
7. If **UPDATE** affects 0 rows (e.g. race), **retry the entire draw once** (one more attempt). If still 0, return `OUT_OF_STOCK`.
8. **Commit.** Return `{ status: 'OK', sign: { id, level, type, reward_code } }`.

**Concurrency:** `SELECT ... FOR UPDATE` plus single-row UPDATE inside one transaction makes selection and mark-as-drawn atomic. No probability at draw time; selection is from a fixed undrawn set via offset.

---

## 3. Inventory invariants

- **Total rows:** Always 10,000. No INSERT/DELETE in draw logic.
- **Drawn + undrawn:** At any time, `COUNT(*) WHERE is_drawn = true` + `COUNT(*) WHERE is_drawn = false` = 10,000.
- **Uniqueness:** A sign is drawn at most once; after UPDATE it is never selected again (only `is_drawn = false` are candidates).
- **No regeneration:** Rows are only updated in place (`is_drawn`). Pool is not re-shuffled or recreated.

---

## 4. Testing methodology and results

**Script:** `step2-test.js`. Run: `npm run step2:test`. Requires a fresh pool (`npm run step1:init` first).

| Test | Description | Pass condition |
|------|-------------|----------------|
| Single draw | One call to `draw()` | Returns `status: 'OK'` and a valid `sign` with `id`, `level`, `type`, `reward_code`. |
| 10 sequential | Ten consecutive `draw()` calls | Ten distinct `sign.id` values. |
| Stock depletion | Call `draw()` until `OUT_OF_STOCK` | Final state: `drawn = 10,000`, `undrawn = 0`. |
| DB integrity | After tests, query `signs` | `total = 10,000`, `drawn + undrawn = 10,000`. |

**Result (post–Step 2):** All four tests passed. After full test run, pool is fully drawn; run `npm run step1:init` to reset for Step 3.

---

## 5. Red lines / constraints

- Do **not** change the draw algorithm (no new random or probability logic).
- Do **not** change Step 1 schema or data (no new columns, no DELETE/TRUNCATE/INSERT into pool).
- Do **not** add API, frontend, or deployment in Step 2 (Step 2 is algorithm only).
- Do **not** remove transaction or `FOR UPDATE` or retry-on-failed-update behavior.
- **Allowed:** Wrapping `draw()` in an HTTP API (Step 3), logging for audit (without changing algorithm), and tests that call `draw()` directly or via API.

---

## Archive confirmation

- This document and the referenced files (`draw.js`, `step2-test.js`, `STEP2_RISK_REVIEW.md`) form the **Step 2 technical archive**.
- No code or database was changed for this archival; documentation only.
- **Recommendation:** Keep under version control (e.g. commit `backend/README_STEP2.md`, `backend/draw.js`, `backend/step2-test.js`, `backend/STEP2_RISK_REVIEW.md`) for future reference.

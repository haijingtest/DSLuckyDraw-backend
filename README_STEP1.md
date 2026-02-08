# Step 1 — Database schema & pool initialization

**Scope:** MySQL table `signs` + 10,000 pre-generated rows. No API, no draw logic, no frontend changes.

## Schema

| Column       | Type         | Description |
|-------------|--------------|-------------|
| id          | VARCHAR(20) | PK, sign ID: `S<levelNumber>-<runningIndex>` (e.g. S01-0001) |
| level       | INT          | 0=Empty, 1=Top-Top, 2=Top, 3=Special |
| type        | VARCHAR(20)  | Empty \| Top-Top \| Top \| Special |
| reward_code | VARCHAR(20)  | R01 \| R02 \| R03 \| EMPTY |
| is_drawn    | BOOLEAN      | Default false |

## Distribution

| Type     | Level | reward_code | Count |
|----------|-------|-------------|-------|
| Top-Top  | 1     | R01         | 40    |
| Top      | 2     | R02         | 200   |
| Special  | 3     | R03         | 150   |
| Empty    | 0     | EMPTY       | 9610  |
| **Total**|       |             | **10,000** |

## Setup

1. Create MySQL DB (e.g. `CREATE DATABASE luckydraw;`).
2. Copy env and set credentials:
   ```bash
   cp .env.example .env
   # Edit .env: DB_HOST, DB_USER, DB_PASSWORD, DB_NAME
   ```
3. Install and run:
   ```bash
   npm install
   npm run step1:init
   ```

## Verification (after init)

```bash
npm run step1:verify
```

Or manually:

- `SELECT COUNT(*) FROM signs;` → 10000
- `SELECT level, COUNT(*) FROM signs GROUP BY level;` → 0: 9610, 1: 40, 2: 200, 3: 150
- `SELECT COUNT(DISTINCT id) FROM signs;` → 10000
- `SELECT COUNT(*) FROM signs WHERE is_drawn = false;` → 10000

## Red lines (Step 1)

- Do not add API or draw logic.
- Do not change distribution, ID format, or table structure.
- Do not modify frontend.

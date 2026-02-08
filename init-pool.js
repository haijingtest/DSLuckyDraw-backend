/**
 * Step 1 — Database pool initialization.
 * Creates `signs` table and inserts 10,000 pre-generated signs.
 * Uses env: DB_HOST, DB_USER, DB_PASSWORD, DB_NAME. No API, no draw logic.
 */

import 'dotenv/config';
import mysql from 'mysql2/promise';

const POOL_SPEC = [
  { level: 1, type: 'Top-Top', reward_code: 'R01', count: 40 },
  { level: 2, type: 'Top', reward_code: 'R02', count: 200 },
  { level: 3, type: 'Special', reward_code: 'R03', count: 150 },
  { level: 0, type: 'Empty', reward_code: 'EMPTY', count: 9610 },
];

function signId(levelNumber, runningIndex) {
  const levelStr = String(levelNumber).padStart(2, '0');
  const indexStr = String(runningIndex).padStart(4, '0');
  return `S${levelStr}-${indexStr}`;
}

async function run() {
  const host = process.env.DB_HOST || 'localhost';
  const user = process.env.DB_USER || 'root';
  const password = process.env.DB_PASSWORD || '';
  const database = process.env.DB_NAME || 'luckydraw';

  if (!process.env.DB_HOST && !process.env.DB_USER) {
    console.warn('Using defaults. Set DB_HOST, DB_USER, DB_PASSWORD, DB_NAME for your environment.');
  }

  const conn = await mysql.createConnection({
    host,
    user,
    password,
    database,
    multipleStatements: true,
  });

  try {
    console.log('Creating table `signs`...');
    await conn.query(`
      CREATE TABLE IF NOT EXISTS signs (
        id         VARCHAR(20) PRIMARY KEY COMMENT 'Sign ID: S<levelNumber>-<runningIndex>',
        level      INT         NOT NULL COMMENT '0=Empty, 1=Top-Top, 2=Top, 3=Special',
        type       VARCHAR(20) NOT NULL,
        reward_code VARCHAR(20) NOT NULL,
        is_drawn   BOOLEAN     NOT NULL DEFAULT FALSE
      );
    `);
    try {
      await conn.query('CREATE INDEX idx_signs_level_drawn ON signs (level, is_drawn)');
    } catch (e) {
      if (e.code !== 'ER_DUP_KEYNAME') throw e;
    }

    const existing = await conn.query('SELECT COUNT(*) AS n FROM signs');
    const count = existing[0][0].n;
    if (count === 10000) {
      console.log('Pool already has 10,000 rows. Skipping insert.');
    } else if (count > 0) {
      console.log(`Table has ${count} rows (expected 0 or 10000). Truncating and re-inserting.`);
      await conn.query('TRUNCATE TABLE signs');
    }

    if (count !== 10000) {
      console.log('Inserting 10,000 signs...');
      const rows = [];
      for (const spec of POOL_SPEC) {
        for (let i = 1; i <= spec.count; i++) {
          rows.push([
            signId(spec.level, i),
            spec.level,
            spec.type,
            spec.reward_code,
            false,
          ]);
        }
      }
      const BATCH = 500;
      for (let i = 0; i < rows.length; i += BATCH) {
        const batch = rows.slice(i, i + BATCH);
        const placeholders = batch.map(() => '(?, ?, ?, ?, ?)').join(', ');
        const values = batch.flat();
        await conn.query(
          `INSERT INTO signs (id, level, type, reward_code, is_drawn) VALUES ${placeholders}`,
          values
        );
      }
      console.log('Insert complete.');
    }

    console.log('Verification:');
    const [total] = await conn.query('SELECT COUNT(*) AS n FROM signs');
    console.log('  Total rows:', total[0].n);

    const [byLevel] = await conn.query(
      'SELECT level, type, COUNT(*) AS n FROM signs GROUP BY level, type ORDER BY level'
    );
    for (const row of byLevel) {
      console.log(`  level=${row.level} (${row.type}): ${row.n}`);
    }

    const [distinctIds] = await conn.query('SELECT COUNT(DISTINCT id) AS n FROM signs');
    console.log('  Distinct ids:', distinctIds[0].n);

    const [undrawn] = await conn.query('SELECT COUNT(*) AS n FROM signs WHERE is_drawn = false');
    console.log('  is_drawn = false:', undrawn[0].n);

    const ok =
      total[0].n === 10000 &&
      distinctIds[0].n === 10000 &&
      undrawn[0].n === 10000 &&
      byLevel.length === 4;
    if (ok) {
      console.log('\nStep 1 verification PASSED.');
    } else {
      console.error('\nStep 1 verification FAILED.');
      process.exit(1);
    }
  } finally {
    await conn.end();
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});

/**
 * Step 1 — Verification only. Reads DB via env, no writes.
 * Run after init-pool.js to confirm: 10k rows, correct distribution, unique ids, is_drawn false.
 */

import 'dotenv/config';
import mysql from 'mysql2/promise';

async function run() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'luckydraw',
  });

  try {
    const [total] = await conn.query('SELECT COUNT(*) AS n FROM signs');
    const [byLevel] = await conn.query(
      'SELECT level, type, COUNT(*) AS n FROM signs GROUP BY level, type ORDER BY level'
    );
    const [distinctIds] = await conn.query('SELECT COUNT(DISTINCT id) AS n FROM signs');
    const [undrawn] = await conn.query('SELECT COUNT(*) AS n FROM signs WHERE is_drawn = false');

    console.log('Total rows:', total[0].n);
    console.log('By level:', byLevel.map((r) => `level ${r.level} (${r.type}): ${r.n}`).join(', '));
    console.log('Distinct ids:', distinctIds[0].n);
    console.log('is_drawn = false:', undrawn[0].n);

    const expected = { 0: 9610, 1: 40, 2: 200, 3: 150 };
    let ok = total[0].n === 10000 && distinctIds[0].n === 10000 && undrawn[0].n === 10000;
    for (const row of byLevel) {
      if (expected[row.level] !== row.n) ok = false;
    }
    if (ok) console.log('\nStep 1 verification PASSED.');
    else {
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

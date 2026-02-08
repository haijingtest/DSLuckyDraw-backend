/**
 * Reset pool for testing: set all is_drawn = false. Does not change row count or schema.
 */

import 'dotenv/config';
import mysql from 'mysql2/promise';
import { getConnectionConfig } from './draw.js';

async function run() {
  const conn = await mysql.createConnection(getConnectionConfig());
  try {
    const [r] = await conn.query('UPDATE signs SET is_drawn = false');
    console.log('Reset: %d rows set is_drawn = false', r.affectedRows);
  } finally {
    await conn.end();
  }
}

run().catch((e) => { console.error(e); process.exit(1); });

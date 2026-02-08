/**
 * Step 3 — Draw API. Wraps Step 2 draw() only. No algorithm changes.
 * POST /draw → { status, sign? }. OUT_OF_STOCK → 200 + { status: 'OUT_OF_STOCK' }.
 * 503 if DB unavailable, 500 if transaction fails after retry.
 */

import { draw } from '../draw.js';

const CONNECTION_ERROR_CODES = new Set([
  'ECONNREFUSED', 'ETIMEDOUT', 'ENOTFOUND', 'ECONNRESET', 'ER_ACCESS_DENIED_ERROR',
  'ER_BAD_DB_ERROR', 'ER_CON_COUNT_ERROR',
]);

export function registerDrawRoute(app) {
  app.post('/draw', async (req, res) => {
    try {
      const result = await draw();
      if (result.status === 'OUT_OF_STOCK') {
        res.status(200).json({ status: 'OUT_OF_STOCK' });
        if (process.env.LOG_DRAWS === '1') {
          console.log('[draw] OUT_OF_STOCK');
        }
        return;
      }
      res.status(200).json(result);
      if (process.env.LOG_DRAWS === '1') {
        console.log('[draw]', result.sign?.id, result.sign?.type);
      }
    } catch (err) {
      const isConnection = err.code && CONNECTION_ERROR_CODES.has(err.code);
      if (isConnection) {
        res.status(503).json({ error: 'Service Unavailable', message: 'Database unavailable' });
      } else {
        res.status(500).json({ error: 'Internal Server Error', message: 'Draw failed' });
      }
    }
  });
}

/**
 * Step 3 — API server. Exposes POST /draw only. No frontend, no schema changes.
 */

import 'dotenv/config';
import express from 'express';
import { registerDrawRoute } from './api/draw-api.js';

const app = express();
app.use(express.json());

registerDrawRoute(app);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Step 3 API listening on http://localhost:${PORT}`);
});

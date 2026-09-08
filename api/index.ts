import express from 'express';
import { apiRouter } from '../src/api/routes.ts';

const app = express();

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Permissive CORS for serverless & multi-domain deployment
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, x-organization-id');
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', healthy: true, timestamp: new Date().toISOString() });
});

// REST API v1 mounts (handles both /api/v1 and rewritten /v1 paths)
app.use('/api/v1', apiRouter);
app.use('/v1', apiRouter);

// Root fallback for serverless invocation
app.get('/', (_req, res) => {
  res.json({ status: 'Sports Platform API is online', v: '1.0' });
});

export default app;


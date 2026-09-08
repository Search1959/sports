import express from 'express';
import { apiRouter } from '../src/api/routes.ts';

const app = express();

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// REST API v1
app.use('/api/v1', apiRouter);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', healthy: true, timestamp: new Date().toISOString() });
});

export default app;

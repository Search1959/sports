import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { apiRouter } from './src/api/routes.ts';
import { seedDatabase } from './src/db/seed.ts';

dotenv.config();

const PORT = 3000;

async function startServer() {
  const app = express();

  // Body parsers
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));

  // Request logger
  app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
      if (req.path.startsWith('/api')) {
        console.log(`[API] ${req.method} ${req.path} -> ${res.statusCode} (${Date.now() - start}ms)`);
      }
    });
    next();
  });

  // REST API v1 Routes FIRST
  app.use('/api/v1', apiRouter);

  // Health check
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', healthy: true, timestamp: new Date().toISOString() });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`SportOrg Platform server running on http://0.0.0.0:${PORT}`);

    // Auto seed on boot in background microtask
    setTimeout(() => {
      seedDatabase().catch((e) => {
        console.error('Initial seed notice:', e);
      });
    }, 100);
  });

  process.on('SIGTERM', () => {
    server.close(() => {
      process.exit(0);
    });
  });
  process.on('SIGINT', () => {
    server.close(() => {
      process.exit(0);
    });
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});

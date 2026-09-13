import express from 'express';
import cors from 'cors';
import config from './config.js';
import emailRoutes from './routes/email.routes.js';
import { errorHandler } from './middleware/errorHandler.js';

export function createApp() {
  const app = express();

  app.use(
    cors(
      config.allowedOrigins.length
        ? { origin: config.allowedOrigins }
        : undefined,
    ),
  );
  app.use(express.json({ limit: config.jsonBodyLimit }));

  app.get('/api/health', (req, res) => res.json({ ok: true }));
  app.use('/api', emailRoutes);
  app.use('/', (req, res) => res.json({ message: 'CertDesk API is working!' }));

  app.use(errorHandler);

  return app;
}

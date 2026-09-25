import cors from 'cors';
import express from 'express';
import { existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import healthRouter from './routes/health.js';

const app = express();

app.disable('x-powered-by');
app.use(cors({ origin: process.env.FRONTEND_ORIGIN || 'http://localhost:5173' }));
app.use(express.json({ limit: '100kb' }));
app.use('/api/health', healthRouter);

const currentDirectory = dirname(fileURLToPath(import.meta.url));
const frontendBuild = resolve(currentDirectory, '../../frontend/dist');

if (existsSync(frontendBuild)) {
  app.use(express.static(frontendBuild, {
    maxAge: '1h',
    setHeaders(response, filePath) {
      if (filePath.endsWith('index.html') || filePath.endsWith('.css')) {
        response.setHeader('Cache-Control', 'no-cache');
      }
    }
  }));

  app.use((request, response, next) => {
    if (request.method === 'GET' && !request.path.startsWith('/api/')) {
      response.sendFile(resolve(frontendBuild, 'index.html'));
      return;
    }
    next();
  });
}

app.use((request, response) => {
  response.status(404).json({ message: 'Route not found' });
});

export default app;

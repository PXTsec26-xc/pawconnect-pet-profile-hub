import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { apiRouter } from './routes.js';
import { runSeed } from './seed.js';
import { db } from './db.js';

dotenv.config();

const app = express();

// Enable CORS
app.use(cors({
  origin: process.env.CLIENT_URL || true,
  credentials: true,
}));

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Request logging in development
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
    next();
  });
}

// Auto-seed database if empty
if (db.getPets().length === 0) {
  runSeed().catch(console.error);
}

// Mount API routes at both /api and root to handle any proxy/rewrite prefix
app.use('/api', apiRouter);
app.use(apiRouter);

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({
    message: 'An internal server error occurred',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

export default app;

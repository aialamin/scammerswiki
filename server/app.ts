import express from 'express';
import path from 'path';
import mongoose from 'mongoose';
import authRoutes from './routes/authRoutes.ts';
import searchRoutes from './routes/searchRoutes.ts';
import reportRoutes from './routes/reportRoutes.ts';
import adminRoutes from './routes/adminRoutes.ts';
import notificationRoutes from './routes/notificationRoutes.ts';
import { inAppDB } from './services/mockDatabase.ts';

export function createApp() {
  const app = express();

  // Basic security headers
  app.use((_req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    next();
  });

  // Body parsers
  app.use(express.json({ limit: '15mb' }));
  app.use(express.urlencoded({ extended: true, limit: '15mb' }));

  // Static uploads directory
  const uploadsDir = path.resolve(process.cwd(), 'uploads');
  app.use('/uploads', express.static(uploadsDir));

  // Health and public statistics check
  app.get('/api/health', (_req, res) => {
    const stats = inAppDB.getStatistics();
    const isMongoConnected = mongoose.connection.readyState === 1;
    res.json({
      status: 'ok',
      service: 'ScamAlert BD API',
      database: {
        type: 'MongoDB Atlas',
        status: isMongoConnected ? 'connected' : 'connecting_or_fallback',
        cluster: 'cluster0.buyadm8.mongodb.net',
        dbName: 'scamalert_bd',
      },
      timestamp: new Date().toISOString(),
      stats,
    });
  });

  // Mount API routes
  app.use('/api/auth', authRoutes);
  app.use('/api/search', searchRoutes);
  app.use('/api/reports', reportRoutes);
  app.use('/api/admin', adminRoutes);
  app.use('/api/notifications', notificationRoutes);

  // Global Error Handler
  app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error('[API Error]:', err);
    res.status(err.status || 500).json({
      success: false,
      message: err.message || 'Internal Server Error',
    });
  });

  return app;
}

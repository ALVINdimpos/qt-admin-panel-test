import express from 'express';
import { applyMiddlewares } from './middlewares';
import { appRoutes } from './routes';
import { errorHandler, notFoundHandler } from './errors';
import { logger } from '../lib/logger';
import { config } from '../config';

/**
 * Create and configure Express application
 */
export function createApp(): express.Application {
  const app = express();

  // Apply global middlewares
  applyMiddlewares(app);

  // API routes
  app.use('/api', appRoutes);

  // Root endpoint
  app.get('/', (_req, res) => {
    res.json({
      success: true,
      message: 'QT Admin Panel API',
      version: '1.0.0',
      endpoints: {
        health: '/api/health',
        users: '/api/users',
        export: '/api/users/export',
        stats: '/api/stats/users-per-day',
      },
    });
  });

  // 404 handler
  app.use(notFoundHandler);

  // Global error handler
  app.use(errorHandler);

  logger.info('Express application configured', {
    environment: config.nodeEnv,
    port: config.port,
  });

  return app;
}

/**
 * Start the HTTP server
 */
export function startServer(app: express.Application): void {
  const server = app.listen(config.port, () => {
    logger.info('Server started successfully', {
      port: config.port,
      environment: config.nodeEnv,
      nodeVersion: process.version,
    });
  });

  // Graceful shutdown
  process.on('SIGTERM', () => {
    logger.info('SIGTERM received, shutting down gracefully');
    server.close(() => {
      logger.info('Server closed');
      process.exit(0);
    });
  });

  process.on('SIGINT', () => {
    logger.info('SIGINT received, shutting down gracefully');
    server.close(() => {
      logger.info('Server closed');
      process.exit(0);
    });
  });

  // Handle uncaught exceptions
  process.on('uncaughtException', (error) => {
    logger.error('Uncaught exception', { error });
    process.exit(1);
  });

  process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled rejection', { reason, promise });
    process.exit(1);
  });
}

import { Request, Response } from 'express';
import { logger } from '../../lib/logger';

export class HealthController {
  /**
   * Health check endpoint
   * GET /health
   */
  health = async (_req: Request, res: Response): Promise<void> => {
    try {
      const uptime = process.uptime();
      const memoryUsage = process.memoryUsage();
      
      const response = {
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: Math.floor(uptime),
        version: process.env.npm_package_version || '1.0.0',
        environment: process.env.NODE_ENV || 'development',
        memory: {
          rss: Math.round(memoryUsage.rss / 1024 / 1024), // MB
          heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024), // MB
          heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024), // MB
          external: Math.round(memoryUsage.external / 1024 / 1024), // MB
        },
      };
      
      res.json(response);
      
      logger.debug('Health check completed', {
        uptime: response.uptime,
        memoryUsage: response.memory,
        requestId: res.getHeader ? res.getHeader('x-request-id') : 'unknown',
      });
    } catch (error) {
      logger.error('Health check failed', { error });
      throw error;
    }
  };
}

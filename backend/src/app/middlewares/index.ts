import express, { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import pinoHttp from 'pino-http';
import { requestIdMiddleware } from '../../lib/http';
import { config } from '../../config';

/**
 * Security middleware
 */
export const securityMiddleware = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
});

/**
 * CORS middleware
 */
export const corsMiddleware = cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    
    // In development, allow all origins
    if (config.nodeEnv === 'development') {
      return callback(null, true);
    }
    
    // In production, configure allowed origins
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3001',
      // Add your frontend domains here
    ];
    
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
});

/**
 * Rate limiting middleware
 */
export const rateLimitMiddleware = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  limit: 120, // Limit each IP to 120 requests per windowMs
  message: {
    success: false,
    error: 'Too many requests, please try again later',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Request logging middleware
 */
export const loggingMiddleware = pinoHttp({
  genReqId: (req) => req.headers['x-request-id'] as string,
  serializers: {
    req: (req) => ({
      id: req.id,
      method: req.method,
      url: req.url,
      headers: {
        host: req.headers.host,
        'user-agent': req.headers['user-agent'],
        'content-type': req.headers['content-type'],
      },
      remoteAddress: req.ip,
      remotePort: req.socket?.remotePort,
    }),
    res: (res) => ({
      statusCode: res.statusCode,
      headers: {
        'content-type': res.headers['content-type'],
        'content-length': res.headers['content-length'],
      },
    }),
  },
});

/**
 * Body parsing middleware
 */
export const bodyParserMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  // Express 5 has built-in JSON parsing, but we can add size limits
  express.json({
    limit: '1mb',
    type: 'application/json',
  })(req, res, next);
};

/**
 * Request ID middleware (already defined in lib/http, re-export here)
 */
export { requestIdMiddleware };

/**
 * Apply all middlewares to the app
 */
export function applyMiddlewares(app: express.Application): void {
  // Security and CORS
  app.use(securityMiddleware);
  app.use(corsMiddleware);
  
  // Request ID and logging
  app.use(requestIdMiddleware);
  app.use(loggingMiddleware);
  
  // Rate limiting
  app.use(rateLimitMiddleware);
  
  // Body parsing
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));
}

import { Router } from 'express';
import { HealthController } from './controller';
import { asyncHandler } from '../../lib/http';

const router = Router();

// Initialize dependencies
const healthController = new HealthController();

// Routes
router.get('/', asyncHandler(healthController.health));

export { router as healthRoutes };

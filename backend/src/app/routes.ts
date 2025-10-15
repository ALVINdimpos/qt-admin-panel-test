import { Router } from 'express';
import { healthRoutes } from '../modules/health/routes';
import { usersRoutes } from '../modules/users/routes';
import { exportRoutes } from '../modules/export/routes';
import { statsRoutes } from '../modules/stats/routes';

const router = Router();

// Health check
router.use('/health', healthRoutes);

// Users export (protobuf) - must come before /users to avoid conflicts
router.use('/users/export', exportRoutes);

// Users CRUD
router.use('/users', usersRoutes);

// Statistics
router.use('/stats', statsRoutes);

export { router as appRoutes };

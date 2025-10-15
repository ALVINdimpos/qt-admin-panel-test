import { Router } from 'express';
import { StatsController } from './controller';
import { StatsService } from './service';
import { UsersRepository } from '../users/repository';
import { asyncHandler } from '../../lib/http';

const router = Router();

// Initialize dependencies
const usersRepository = new UsersRepository();
const statsService = new StatsService(usersRepository);
const statsController = new StatsController(statsService);

// Routes
router.get('/users-per-day', asyncHandler(statsController.usersPerDay));

export { router as statsRoutes };

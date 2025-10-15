import { Router } from 'express';
import { ExportController } from './controller';
import { ExportService } from './service';
import { UsersRepository } from '../users/repository';
import { asyncHandler } from '../../lib/http';

const router = Router();

// Initialize dependencies
const usersRepository = new UsersRepository();
const exportService = new ExportService(usersRepository);
const exportController = new ExportController(exportService);

// Routes
router.get('/', asyncHandler(exportController.usersExport));

export { router as exportRoutes };

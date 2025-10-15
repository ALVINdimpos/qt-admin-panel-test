import { Router } from 'express';
import { UsersController } from './controller';
import { UsersService } from './service';
import { UsersRepository } from './repository';
import { asyncHandler } from '../../lib/http';

const router = Router();

// Initialize dependencies
const usersRepository = new UsersRepository();
const usersService = new UsersService(usersRepository);
const usersController = new UsersController(usersService);

// Routes
router.post('/', asyncHandler(usersController.create));
router.get('/', asyncHandler(usersController.getMany));
router.get('/:id', asyncHandler(usersController.getById));
router.put('/:id', asyncHandler(usersController.update));
router.delete('/:id', asyncHandler(usersController.delete));

export { router as usersRoutes };

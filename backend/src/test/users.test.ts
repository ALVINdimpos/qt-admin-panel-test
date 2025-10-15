import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { UsersService } from '../modules/users/service';
import { UsersRepository } from '../modules/users/repository';
import { CreateUserDto } from '../modules/users/dto';
import { initKeypair } from '../lib/crypto';
import { testDb } from './setup';

describe('Users Module', () => {
  let usersRepository: UsersRepository;
  let usersService: UsersService;

  beforeEach(async () => {
    // Initialize crypto
    initKeypair();
    
    // Initialize services
    usersRepository = new UsersRepository(testDb);
    usersService = new UsersService(usersRepository);
    
    // Clean up database
    await testDb.user.deleteMany();
  });

  afterEach(async () => {
    // Clean up after each test
    await testDb.user.deleteMany();
  });

  describe('UsersService', () => {
    describe('create', () => {
      it('should create a user with crypto artifacts', async () => {
        const userData: CreateUserDto = {
          email: 'test@example.com',
          role: 'user',
          status: 'active',
        };

        const user = await usersService.create(userData);

        expect(user).toBeDefined();
        expect(user.id).toBeDefined();
        expect(user.email).toBe(userData.email);
        expect(user.role).toBe(userData.role);
        expect(user.status).toBe(userData.status);
        expect(user.emailHash).toBeInstanceOf(Buffer);
        expect(user.signature).toBeInstanceOf(Buffer);
        expect(user.publicKey).toBeInstanceOf(Buffer);
        expect(user.createdAt).toBeInstanceOf(Date);
      });

      it('should throw error for duplicate email', async () => {
        const userData: CreateUserDto = {
          email: 'test@example.com',
          role: 'user',
          status: 'active',
        };

        await usersService.create(userData);

        await expect(usersService.create(userData)).rejects.toThrow(
          'User with this email already exists'
        );
      });

      it('should create admin user', async () => {
        const userData: CreateUserDto = {
          email: 'admin@example.com',
          role: 'admin',
          status: 'active',
        };

        const user = await usersService.create(userData);

        expect(user.role).toBe('admin');
      });
    });

    describe('getById', () => {
      it('should return user by ID', async () => {
        const userData: CreateUserDto = {
          email: 'test@example.com',
          role: 'user',
          status: 'active',
        };

        const createdUser = await usersService.create(userData);
        const foundUser = await usersService.getById(createdUser.id);

        expect(foundUser).toBeDefined();
        expect(foundUser!.id).toBe(createdUser.id);
        expect(foundUser!.email).toBe(userData.email);
      });

      it('should return null for non-existent user', async () => {
        const user = await usersService.getById('non-existent-id');
        expect(user).toBeNull();
      });
    });

    describe('getMany', () => {
      it('should return paginated users', async () => {
        // Create test users
        const users = [
          { email: 'user1@example.com', role: 'user' as const, status: 'active' as const },
          { email: 'user2@example.com', role: 'user' as const, status: 'inactive' as const },
          { email: 'admin@example.com', role: 'admin' as const, status: 'active' as const },
        ];

        for (const userData of users) {
          await usersService.create(userData);
        }

        const result = await usersService.getMany(
          { page: 1, limit: 10 },
          { page: 1, limit: 10, offset: 0 }
        );

        expect(result.users).toHaveLength(3);
        expect(result.total).toBe(3);
      });

      it('should filter by role', async () => {
        // Create test users
        await usersService.create({ email: 'user1@example.com', role: 'user', status: 'active' });
        await usersService.create({ email: 'admin@example.com', role: 'admin', status: 'active' });

        const result = await usersService.getMany(
          { page: 1, limit: 10, role: 'admin' },
          { page: 1, limit: 10, offset: 0 }
        );

        expect(result.users).toHaveLength(1);
        expect(result.users[0]!.role).toBe('admin');
      });
    });

    describe('update', () => {
      it('should update user', async () => {
        const userData: CreateUserDto = {
          email: 'test@example.com',
          role: 'user',
          status: 'active',
        };

        const createdUser = await usersService.create(userData);
        const updatedUser = await usersService.update(createdUser.id, {
          role: 'admin',
          status: 'inactive',
        });

        expect(updatedUser).toBeDefined();
        expect(updatedUser!.role).toBe('admin');
        expect(updatedUser!.status).toBe('inactive');
      });

      it('should return null for non-existent user', async () => {
        const result = await usersService.update('non-existent-id', {
          role: 'admin',
        });

        expect(result).toBeNull();
      });
    });

    describe('delete', () => {
      it('should delete user', async () => {
        const userData: CreateUserDto = {
          email: 'test@example.com',
          role: 'user',
          status: 'active',
        };

        const createdUser = await usersService.create(userData);
        const deleted = await usersService.delete(createdUser.id);

        expect(deleted).toBe(true);

        const foundUser = await usersService.getById(createdUser.id);
        expect(foundUser).toBeNull();
      });

      it('should return false for non-existent user', async () => {
        const deleted = await usersService.delete('non-existent-id');
        expect(deleted).toBe(false);
      });
    });

    describe('getUsersPerDay', () => {
      it('should return user stats for last 7 days', async () => {
        const stats = await usersService.getUsersPerDay(7);

        expect(stats).toHaveLength(7);
        expect(stats[0]).toHaveProperty('date');
        expect(stats[0]).toHaveProperty('count');
        expect(typeof stats[0]!.count).toBe('number');
      });

      it('should throw error for invalid days', async () => {
        await expect(usersService.getUsersPerDay(0)).rejects.toThrow(
          'Days must be between 1 and 365'
        );

        await expect(usersService.getUsersPerDay(366)).rejects.toThrow(
          'Days must be between 1 and 365'
        );
      });
    });
  });
});

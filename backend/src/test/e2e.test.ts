import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../app/server';
import { initKeypair } from '../lib/crypto';
import { initProtobuf } from '../lib/proto';
import { testDb } from './setup';

describe('E2E Tests', () => {
  let app: any;

  beforeAll(async () => {
    // Initialize crypto and protobuf
    initKeypair();
    initProtobuf();
    
    // Create Express app
    app = createApp();
  });

  beforeEach(async () => {
    // Clean up database before each test
    await testDb.user.deleteMany();
  });

  afterAll(async () => {
    // Clean up after all tests
    await testDb.user.deleteMany();
  });

  describe('Health Check', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'ok');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('uptime');
      expect(response.body).toHaveProperty('version');
    });
  });

  describe('Users CRUD', () => {
    it('should create a user', async () => {
      const userData = {
        email: 'test@example.com',
        role: 'user',
        status: 'active',
      };

      const response = await request(app)
        .post('/api/users')
        .send(userData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.email).toBe(userData.email);
      expect(response.body.data.role).toBe(userData.role);
      expect(response.body.data.status).toBe(userData.status);
      expect(response.body.data).toHaveProperty('emailHash');
      expect(response.body.data).toHaveProperty('signature');
      expect(response.body.data).toHaveProperty('publicKey');
    });

    it('should get users list', async () => {
      // Create a test user first
      const userData = {
        email: 'test@example.com',
        role: 'user',
        status: 'active',
      };

      await request(app)
        .post('/api/users')
        .send(userData);

      const response = await request(app)
        .get('/api/users')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.pagination).toHaveProperty('total', 1);
    });

    it('should get user by ID', async () => {
      // Create a test user first
      const userData = {
        email: 'test@example.com',
        role: 'user',
        status: 'active',
      };

      const createResponse = await request(app)
        .post('/api/users')
        .send(userData);

      const userId = createResponse.body.data.id;

      const response = await request(app)
        .get(`/api/users/${userId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(userId);
      expect(response.body.data.email).toBe(userData.email);
    });

    it('should update user', async () => {
      // Create a test user first
      const userData = {
        email: 'test@example.com',
        role: 'user',
        status: 'active',
      };

      const createResponse = await request(app)
        .post('/api/users')
        .send(userData);

      const userId = createResponse.body.data.id;

      const updateData = {
        role: 'admin',
        status: 'inactive',
      };

      const response = await request(app)
        .put(`/api/users/${userId}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.role).toBe('admin');
      expect(response.body.data.status).toBe('inactive');
    });

    it('should delete user', async () => {
      // Create a test user first
      const userData = {
        email: 'test@example.com',
        role: 'user',
        status: 'active',
      };

      const createResponse = await request(app)
        .post('/api/users')
        .send(userData);

      const userId = createResponse.body.data.id;

      const response = await request(app)
        .delete(`/api/users/${userId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('User deleted successfully');
    });

    it('should return 404 for non-existent user', async () => {
      const response = await request(app)
        .get('/api/users/non-existent-id')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('User not found');
    });
  });

  describe('Users Export', () => {
    it('should export users as protobuf', async () => {
      // Create test users
      const users = [
        { email: 'user1@example.com', role: 'user', status: 'active' },
        { email: 'user2@example.com', role: 'admin', status: 'inactive' },
      ];

      for (const userData of users) {
        await request(app)
          .post('/api/users')
          .send(userData);
      }

      const response = await request(app)
        .get('/api/users/export')
        .expect(200);

      expect(response.headers['content-type']).toBe('application/x-protobuf');
      expect(response.headers['content-disposition']).toContain('attachment');
      expect(response.body).toBeInstanceOf(Buffer);
      expect(response.body.length).toBeGreaterThan(0);
    });
  });

  describe('Stats', () => {
    it('should return user stats per day', async () => {
      const response = await request(app)
        .get('/api/stats/users-per-day?days=7')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(7);
      expect(response.body.meta).toHaveProperty('days', 7);
      expect(response.body.meta).toHaveProperty('totalUsers');
      expect(response.body.meta).toHaveProperty('period');
    });

    it('should validate days parameter', async () => {
      const response = await request(app)
        .get('/api/stats/users-per-day?days=0')
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('Error Handling', () => {
    it('should handle validation errors', async () => {
      const response = await request(app)
        .post('/api/users')
        .send({
          email: 'invalid-email',
          role: 'invalid-role',
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Validation failed');
      expect(response.body.details).toBeDefined();
    });

    it('should handle 404 for unknown routes', async () => {
      const response = await request(app)
        .get('/api/unknown-route')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Route not found');
    });
  });
});

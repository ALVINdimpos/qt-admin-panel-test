import { beforeAll, afterAll } from 'vitest';
import { PrismaClient } from '@prisma/client';

// Test database setup
const testDb = new PrismaClient({
  datasources: {
    db: {
      url: process.env.TEST_DATABASE_URL || 'postgresql://username:password@localhost:5432/qt_admin_test_db?schema=public',
    },
  },
});

beforeAll(async () => {
  // Initialize test database
  await testDb.$connect();
});

afterAll(async () => {
  // Clean up test database
  await testDb.$disconnect();
});

export { testDb };

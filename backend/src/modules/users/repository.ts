import { PrismaClient } from '@prisma/client';
import { prisma } from '../../db/client';
import { User, prismaUserToUser, UserCreateDataWithCrypto } from './entity';
import { UserQueryDto } from './dto';
import { PaginationParams } from '../../lib/http';
import { logger } from '../../lib/logger';

export class UsersRepository {
  constructor(private db: PrismaClient = prisma) {}

  /**
   * Create a new user
   */
  async create(data: UserCreateDataWithCrypto): Promise<User> {
    try {
      const prismaUser = await this.db.user.create({
        data: {
          email: data.email,
          role: data.role,
          status: data.status,
          emailHash: data.emailHash,
          signature: data.signature,
          publicKey: data.publicKey,
        },
      });

      logger.info('User created', { userId: prismaUser.id, email: prismaUser.email });
      return prismaUserToUser(prismaUser);
    } catch (error) {
      logger.error('Failed to create user', { error, email: data.email });
      throw error;
    }
  }

  /**
   * Find user by ID
   */
  async findById(id: string): Promise<User | null> {
    try {
      const prismaUser = await this.db.user.findUnique({
        where: { id },
      });

      return prismaUser ? prismaUserToUser(prismaUser) : null;
    } catch (error) {
      logger.error('Failed to find user by ID', { error, userId: id });
      throw error;
    }
  }

  /**
   * Find user by email
   */
  async findByEmail(email: string): Promise<User | null> {
    try {
      const prismaUser = await this.db.user.findUnique({
        where: { email },
      });

      return prismaUser ? prismaUserToUser(prismaUser) : null;
    } catch (error) {
      logger.error('Failed to find user by email', { error, email });
      throw error;
    }
  }

  /**
   * Find users with pagination and filtering
   */
  async findMany(query: UserQueryDto, pagination: PaginationParams): Promise<{
    users: User[];
    total: number;
  }> {
    try {
      const where: any = {};

      if (query.role) {
        where.role = query.role;
      }

      if (query.status) {
        where.status = query.status;
      }

      if (query.search) {
        where.email = {
          contains: query.search,
          mode: 'insensitive',
        };
      }

      const [prismaUsers, total] = await Promise.all([
        this.db.user.findMany({
          where,
          skip: pagination.offset,
          take: pagination.limit,
          orderBy: { createdAt: 'desc' },
        }),
        this.db.user.count({ where }),
      ]);

      const users = prismaUsers.map(prismaUserToUser);

      logger.debug('Users found', { 
        count: users.length, 
        total, 
        filters: { role: query.role, status: query.status, search: query.search }
      });

      return { users, total };
    } catch (error) {
      logger.error('Failed to find users', { error, query, pagination });
      throw error;
    }
  }

  /**
   * Update user by ID
   */
  async update(id: string, data: Partial<Pick<User, 'role' | 'status'>>): Promise<User | null> {
    try {
      const prismaUser = await this.db.user.update({
        where: { id },
        data: {
          role: data.role,
          status: data.status,
        },
      });

      logger.info('User updated', { userId: id, updates: data });
      return prismaUserToUser(prismaUser);
    } catch (error) {
      logger.error('Failed to update user', { error, userId: id, updates: data });
      throw error;
    }
  }

  /**
   * Delete user by ID
   */
  async delete(id: string): Promise<boolean> {
    try {
      await this.db.user.delete({
        where: { id },
      });

      logger.info('User deleted', { userId: id });
      return true;
    } catch (error) {
      logger.error('Failed to delete user', { error, userId: id });
      throw error;
    }
  }

  /**
   * Count users created in the last N days
   */
  async countUsersPerDay(days: number): Promise<Array<{ date: string; count: number }>> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);

      const results = await this.db.user.groupBy({
        by: ['createdAt'],
        where: {
          createdAt: {
            gte: cutoffDate,
          },
        },
        _count: {
          id: true,
        },
        orderBy: {
          createdAt: 'asc',
        },
      });

      // Group by date and sum counts
      const dateCounts = new Map<string, number>();
      
      for (const result of results) {
        const date = result.createdAt.toISOString().split('T')[0]!;
        const currentCount = dateCounts.get(date) || 0;
        dateCounts.set(date, currentCount + result._count.id);
      }

      // Convert to array and fill missing dates with 0
      const stats: Array<{ date: string; count: number }> = [];
      for (let i = days - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0]!;
        stats.push({
          date: dateStr,
          count: dateCounts.get(dateStr) || 0,
        });
      }

      logger.debug('User stats calculated', { days, totalDates: stats.length });
      return stats;
    } catch (error) {
      logger.error('Failed to count users per day', { error, days });
      throw error;
    }
  }
}

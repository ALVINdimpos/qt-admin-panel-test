import { UsersRepository } from './repository';
import { User, UserCreateDataWithCrypto } from './entity';
import { CreateUserDto, UpdateUserDto, UserQueryDto } from './dto';
import { PaginationParams } from '../../lib/http';
import { hashEmail, signDigest, getPublicKey } from '../../lib/crypto';
import { logger } from '../../lib/logger';

export class UsersService {
  constructor(private repository: UsersRepository) {}

  /**
   * Create a new user with crypto operations
   */
  async create(dto: CreateUserDto): Promise<User> {
    try {
      // Check if user already exists
      const existingUser = await this.repository.findByEmail(dto.email);
      if (existingUser) {
        throw new Error('User with this email already exists');
      }

      // Perform crypto operations
      const digest = hashEmail(dto.email);
      const signature = signDigest(digest);
      const publicKey = getPublicKey();

      const userData: UserCreateDataWithCrypto = {
        email: dto.email,
        role: dto.role,
        status: dto.status,
        emailHash: digest,
        signature,
        publicKey,
      };

      const user = await this.repository.create(userData);

      logger.info('User created with crypto artifacts', {
        userId: user.id,
        email: user.email,
        emailHashLength: digest.length,
        signatureLength: signature.length,
        publicKeyLength: publicKey.length,
      });

      return user;
    } catch (error) {
      logger.error('Failed to create user', { error, email: dto.email });
      throw error;
    }
  }

  /**
   * Get user by ID
   */
  async getById(id: string): Promise<User | null> {
    try {
      return await this.repository.findById(id);
    } catch (error) {
      logger.error('Failed to get user by ID', { error, userId: id });
      throw error;
    }
  }

  /**
   * Get users with pagination and filtering
   */
  async getMany(query: UserQueryDto, pagination: PaginationParams): Promise<{
    users: User[];
    total: number;
  }> {
    try {
      return await this.repository.findMany(query, pagination);
    } catch (error) {
      logger.error('Failed to get users', { error, query, pagination });
      throw error;
    }
  }

  /**
   * Update user
   */
  async update(id: string, dto: UpdateUserDto): Promise<User | null> {
    try {
      // Check if user exists
      const existingUser = await this.repository.findById(id);
      if (!existingUser) {
        return null;
      }

      const updateData: Partial<Pick<User, 'role' | 'status'>> = {};
      
      if (dto.role !== undefined) {
        updateData.role = dto.role;
      }
      
      if (dto.status !== undefined) {
        updateData.status = dto.status;
      }

      const updatedUser = await this.repository.update(id, updateData);

      logger.info('User updated', { 
        userId: id, 
        updates: updateData,
        oldRole: existingUser.role,
        oldStatus: existingUser.status,
      });

      return updatedUser;
    } catch (error) {
      logger.error('Failed to update user', { error, userId: id, updates: dto });
      throw error;
    }
  }

  /**
   * Delete user
   */
  async delete(id: string): Promise<boolean> {
    try {
      // Check if user exists
      const existingUser = await this.repository.findById(id);
      if (!existingUser) {
        return false;
      }

      const deleted = await this.repository.delete(id);

      logger.info('User deleted', { 
        userId: id, 
        email: existingUser.email 
      });

      return deleted;
    } catch (error) {
      logger.error('Failed to delete user', { error, userId: id });
      throw error;
    }
  }

  /**
   * Get user statistics per day
   */
  async getUsersPerDay(days: number = 7): Promise<Array<{ date: string; count: number }>> {
    try {
      if (days < 1 || days > 365) {
        throw new Error('Days must be between 1 and 365');
      }

      const stats = await this.repository.countUsersPerDay(days);

      logger.debug('User stats retrieved', { days, statsCount: stats.length });
      return stats;
    } catch (error) {
      logger.error('Failed to get user stats', { error, days });
      throw error;
    }
  }

  /**
   * Verify user's crypto signature (for testing/debugging)
   */
  async verifyUserSignature(userId: string): Promise<boolean> {
    try {
      const user = await this.repository.findById(userId);
      if (!user) {
        return false;
      }

      // Recompute hash
      const expectedHash = hashEmail(user.email);
      
      // Verify hash matches
      if (!user.emailHash.equals(expectedHash)) {
        logger.warn('User email hash mismatch', { userId, email: user.email });
        return false;
      }

      // Verify signature
      const { verifySignature } = await import('../../lib/crypto');
      const isValid = verifySignature(user.signature, user.emailHash);

      logger.debug('User signature verification', { 
        userId, 
        email: user.email, 
        isValid 
      });

      return isValid;
    } catch (error) {
      logger.error('Failed to verify user signature', { error, userId });
      return false;
    }
  }
}

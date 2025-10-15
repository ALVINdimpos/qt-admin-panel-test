import { UsersRepository } from '../users/repository';
import { User } from '../users/entity';
import { encodeUserList } from '../../lib/proto';
import { logger } from '../../lib/logger';

export class ExportService {
  constructor(private usersRepository: UsersRepository) {}

  /**
   * Build protobuf UserList from all users
   */
  async buildUsersProtobuf(): Promise<Buffer> {
    try {
      // Get all users (no pagination for export)
      const { users } = await this.usersRepository.findMany(
        { page: 1, limit: 10000 }, // no filters
        { page: 1, limit: 10000, offset: 0 } // large limit to get all users
      );

      // Convert users to protobuf format
      const userList = {
        users: users.map(user => this.mapUserToProtobuf(user)),
      };

      // Encode to protobuf buffer
      const buffer = encodeUserList(userList);

      logger.info('Users exported to protobuf', {
        userCount: users.length,
        bufferSize: buffer.length,
      });

      return buffer;
    } catch (error) {
      logger.error('Failed to build users protobuf', { error });
      throw error;
    }
  }

  /**
   * Map User entity to protobuf User message
   */
  private mapUserToProtobuf(user: User): any {
    return {
      id: user.id,
      email: user.email,
      role: user.role,
      status: user.status,
      createdAt: user.createdAt.toISOString(),
      emailHash: user.emailHash, // Keep as Buffer for protobuf
      signature: user.signature, // Keep as Buffer for protobuf
      publicKey: user.publicKey, // Keep as Buffer for protobuf
    };
  }
}

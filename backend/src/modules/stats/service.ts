import { UsersRepository } from '../users/repository';
import { StatsQueryDto, UserStatsResponseDto } from './dto';
import { logger } from '../../lib/logger';

export class StatsService {
  constructor(private usersRepository: UsersRepository) {}

  /**
   * Get user registration stats per day
   */
  async getUsersPerDay(query: StatsQueryDto): Promise<{
    stats: UserStatsResponseDto[];
    totalUsers: number;
    startDate: string;
    endDate: string;
  }> {
    try {
      const { days } = query;
      
      // Get user counts per day
      const stats = await this.usersRepository.countUsersPerDay(days);
      
      // Calculate total users in the period
      const totalUsers = stats.reduce((sum, stat) => sum + stat.count, 0);
      
      // Calculate date range
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - (days - 1));
      
      const result = {
        stats,
        totalUsers,
        startDate: startDate.toISOString().split('T')[0]!,
        endDate: endDate.toISOString().split('T')[0]!,
      };
      
      logger.info('User stats retrieved', {
        days,
        totalUsers,
        startDate: result.startDate,
        endDate: result.endDate,
        statsCount: stats.length,
      });
      
      return result;
    } catch (error) {
      logger.error('Failed to get user stats', { error, query });
      throw error;
    }
  }
}

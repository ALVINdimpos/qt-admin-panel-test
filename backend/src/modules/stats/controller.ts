import { Request, Response } from 'express';
import { StatsService } from './service';
import { StatsQueryDto, StatsResponseDto } from './dto';
import { logger } from '../../lib/logger';

export class StatsController {
  constructor(private service: StatsService) {}

  /**
   * Get user registration stats per day
   * GET /stats/users-per-day?days=7
   */
  usersPerDay = async (req: Request, res: Response): Promise<void> => {
    try {
      const query = StatsQueryDto.parse(req.query);
      const result = await this.service.getUsersPerDay(query);
      
      const response: StatsResponseDto = {
        success: true,
        data: result.stats,
        meta: {
          days: query.days,
          totalUsers: result.totalUsers,
          period: {
            startDate: result.startDate,
            endDate: result.endDate,
          },
        },
      };
      
      res.json(response);
      
      logger.debug('User stats response sent', {
        days: query.days,
        totalUsers: result.totalUsers,
        requestId: res.getHeader ? res.getHeader('x-request-id') : 'unknown',
      });
    } catch (error) {
      logger.error('Get user stats failed', { error, query: req.query });
      throw error;
    }
  };
}

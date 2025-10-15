import { Request, Response } from 'express';
import { ExportService } from './service';
import { logger } from '../../lib/logger';

export class ExportController {
  constructor(private service: ExportService) {}

  /**
   * Export users as protobuf
   * GET /users/export
   */
  usersExport = async (_req: Request, res: Response): Promise<void> => {
    try {
      const buffer = await this.service.buildUsersProtobuf();
      
      // Set appropriate headers for protobuf response
      res.set({
        'Content-Type': 'application/x-protobuf',
        'Content-Disposition': 'attachment; filename="users.pb"',
        'Content-Length': buffer.length.toString(),
      });
      
      res.send(buffer);
      
      logger.info('Users exported successfully', {
        bufferSize: buffer.length,
        requestId: res.getHeader ? res.getHeader('x-request-id') : 'unknown',
      });
    } catch (error) {
      logger.error('Export users failed', { error });
      throw error;
    }
  };
}

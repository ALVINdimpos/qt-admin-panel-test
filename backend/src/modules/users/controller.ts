import { Request, Response } from 'express';
import { UsersService } from './service';
import { CreateUserDto, UpdateUserDto, UserQueryDto, UserResponseDto } from './dto';
import { getPaginationParams, createPaginatedResponse, bufferToBase64 } from '../../lib/http';
import { logger } from '../../lib/logger';

export class UsersController {
  constructor(private service: UsersService) {}

  /**
   * Create a new user
   * POST /users
   */
  create = async (req: Request, res: Response): Promise<void> => {
    try {
      const dto = CreateUserDto.parse(req.body);
      const user = await this.service.create(dto);
      
      const response = this.mapUserToResponse(user);
      
      res.status(201).json({
        success: true,
        data: response,
      });
    } catch (error) {
      logger.error('Create user failed', { error, body: req.body });
      throw error;
    }
  };

  /**
   * Get user by ID
   * GET /users/:id
   */
  getById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const user = await this.service.getById(id);
      
      if (!user) {
        res.status(404).json({
          success: false,
          error: 'User not found',
        });
        return;
      }
      
      const response = this.mapUserToResponse(user);
      
      res.json({
        success: true,
        data: response,
      });
    } catch (error) {
      logger.error('Get user by ID failed', { error, userId: req.params.id });
      throw error;
    }
  };

  /**
   * Get users with pagination and filtering
   * GET /users
   */
  getMany = async (req: Request, res: Response): Promise<void> => {
    try {
      const query = UserQueryDto.parse(req.query);
      const pagination = getPaginationParams(req);
      
      const { users, total } = await this.service.getMany(query, pagination);
      
      const responseData = users.map(user => this.mapUserToResponse(user));
      const paginatedResponse = createPaginatedResponse(responseData, total, pagination);
      
      res.json({
        success: true,
        ...paginatedResponse,
      });
    } catch (error) {
      logger.error('Get users failed', { error, query: req.query });
      throw error;
    }
  };

  /**
   * Update user
   * PUT /users/:id
   */
  update = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const dto = UpdateUserDto.parse(req.body);
      
      const user = await this.service.update(id, dto);
      
      if (!user) {
        res.status(404).json({
          success: false,
          error: 'User not found',
        });
        return;
      }
      
      const response = this.mapUserToResponse(user);
      
      res.json({
        success: true,
        data: response,
      });
    } catch (error) {
      logger.error('Update user failed', { error, userId: req.params.id, body: req.body });
      throw error;
    }
  };

  /**
   * Delete user
   * DELETE /users/:id
   */
  delete = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const deleted = await this.service.delete(id);
      
      if (!deleted) {
        res.status(404).json({
          success: false,
          error: 'User not found',
        });
        return;
      }
      
      res.json({
        success: true,
        message: 'User deleted successfully',
      });
    } catch (error) {
      logger.error('Delete user failed', { error, userId: req.params.id });
      throw error;
    }
  };

  /**
   * Map User entity to UserResponseDto
   */
  private mapUserToResponse(user: any): UserResponseDto {
    return {
      id: user.id,
      email: user.email,
      role: user.role,
      status: user.status,
      createdAt: user.createdAt.toISOString(),
      emailHash: bufferToBase64(user.emailHash),
      signature: bufferToBase64(user.signature),
      publicKey: bufferToBase64(user.publicKey),
    };
  }
}

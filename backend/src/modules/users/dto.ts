import { z } from 'zod';

// Create User DTO
export const CreateUserDto = z.object({
  email: z.string().email('Invalid email format'),
  role: z.enum(['admin', 'user']).default('user'),
  status: z.enum(['active', 'inactive']).default('active'),
});

export type CreateUserDto = z.infer<typeof CreateUserDto>;

// Update User DTO
export const UpdateUserDto = z.object({
  role: z.enum(['admin', 'user']).optional(),
  status: z.enum(['active', 'inactive']).optional(),
});

export type UpdateUserDto = z.infer<typeof UpdateUserDto>;

// User response DTO (for JSON API responses)
export const UserResponseDto = z.object({
  id: z.string(),
  email: z.string(),
  role: z.string(),
  status: z.string(),
  createdAt: z.string(), // ISO string
  emailHash: z.string(), // base64 encoded
  signature: z.string(), // base64 encoded
  publicKey: z.string(), // base64 encoded
});

export type UserResponseDto = z.infer<typeof UserResponseDto>;

// Query parameters for user listing
export const UserQueryDto = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  role: z.enum(['admin', 'user']).optional(),
  status: z.enum(['active', 'inactive']).optional(),
  search: z.string().optional(),
});

export type UserQueryDto = z.infer<typeof UserQueryDto>;

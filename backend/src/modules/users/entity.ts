import { User as PrismaUser } from '@prisma/client';

/**
 * Domain entity representing a User
 * This is the internal representation used throughout the application
 */
export interface User {
  id: string;
  email: string;
  role: 'admin' | 'user';
  status: 'active' | 'inactive';
  createdAt: Date;
  emailHash: Buffer;
  signature: Buffer;
  publicKey: Buffer;
}

/**
 * Convert Prisma User to domain User
 */
export function prismaUserToUser(prismaUser: PrismaUser): User {
  return {
    id: prismaUser.id,
    email: prismaUser.email,
    role: prismaUser.role as 'admin' | 'user',
    status: prismaUser.status as 'active' | 'inactive',
    createdAt: prismaUser.createdAt,
    emailHash: Buffer.from(prismaUser.emailHash),
    signature: Buffer.from(prismaUser.signature),
    publicKey: Buffer.from(prismaUser.publicKey),
  };
}

/**
 * User creation data (before crypto operations)
 */
export interface UserCreateData {
  email: string;
  role: 'admin' | 'user';
  status: 'active' | 'inactive';
}

/**
 * User creation data with crypto artifacts
 */
export interface UserCreateDataWithCrypto extends UserCreateData {
  emailHash: Buffer;
  signature: Buffer;
  publicKey: Buffer;
}

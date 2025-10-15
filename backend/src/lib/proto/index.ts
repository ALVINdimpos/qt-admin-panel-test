import { loadSync } from 'protobufjs';
import { join } from 'path';
import { logger } from '../logger';

let _root: any = null;
let _UserList: any = null;

/**
 * Initialize protobuf root and load schemas
 */
export function initProtobuf(): void {
  try {
    const protoPath = join(__dirname, '../../shared/user.proto');
    _root = loadSync(protoPath);
    _UserList = _root.lookupType('qt.UserList');
    
    logger.info('Protobuf schemas loaded', { protoPath });
  } catch (error) {
    logger.error('Failed to load protobuf schemas', { error });
    throw new Error('Protobuf initialization failed');
  }
}

/**
 * Get the UserList protobuf type
 */
export function getUserListType(): any {
  if (!_UserList) {
    throw new Error('Protobuf not initialized. Call initProtobuf() first.');
  }
  return _UserList;
}

/**
 * Encode UserList to protobuf buffer
 */
export function encodeUserList(userList: any): Buffer {
  try {
    const UserListType = getUserListType();
    const message = UserListType.create(userList);
    const buffer = UserListType.encode(message).finish();
    
    logger.debug('UserList encoded to protobuf', { 
      userCount: userList.users?.length || 0,
      bufferSize: buffer.length 
    });
    
    return Buffer.from(buffer);
  } catch (error) {
    logger.error('Failed to encode UserList to protobuf', { error });
    throw error;
  }
}

/**
 * Decode protobuf buffer to UserList (for testing)
 */
export function decodeUserList(buffer: Buffer): any {
  try {
    const UserListType = getUserListType();
    const message = UserListType.decode(buffer);
    const userList = UserListType.toObject(message, {
      longs: String,
      enums: String,
      bytes: Buffer,
    });
    
    logger.debug('UserList decoded from protobuf', { 
      userCount: userList.users?.length || 0 
    });
    
    return userList;
  } catch (error) {
    logger.error('Failed to decode UserList from protobuf', { error });
    throw error;
  }
}

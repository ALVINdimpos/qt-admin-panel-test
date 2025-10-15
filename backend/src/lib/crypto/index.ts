import { createHash, generateKeyPairSync, sign as nodeSign, createVerify, KeyObject } from 'crypto';
import { logger } from '../logger';

let _privateKey: KeyObject | null = null;
let _publicKeyDer: Buffer | null = null; // SPKI DER for portability

/**
 * Initialize Ed25519 keypair on application boot
 * This keypair is used to sign email hashes for all users
 */
export function initKeypair(): void {
  try {
    const { privateKey, publicKey } = generateKeyPairSync('ed25519');
    _privateKey = privateKey;
    _publicKeyDer = publicKey.export({ type: 'spki', format: 'der' }) as Buffer;
    
    logger.info('Crypto keypair initialized', {
      algorithm: 'Ed25519',
      publicKeyLength: _publicKeyDer.length,
    });
  } catch (error) {
    logger.error('Failed to initialize crypto keypair', { error });
    throw new Error('Crypto initialization failed');
  }
}

/**
 * Hash email using SHA-384
 * @param email - Email address to hash
 * @returns SHA-384 digest as Buffer
 */
export function hashEmail(email: string): Buffer {
  if (!email || typeof email !== 'string') {
    throw new Error('Email must be a non-empty string');
  }
  
  return createHash('sha384').update(email, 'utf8').digest();
}

/**
 * Sign a digest using the private key
 * @param digest - Hash digest to sign
 * @returns Signature as Buffer
 */
export function signDigest(digest: Buffer): Buffer {
  if (!_privateKey) {
    throw new Error('Crypto keypair not initialized. Call initKeypair() first.');
  }
  
  if (!Buffer.isBuffer(digest)) {
    throw new Error('Digest must be a Buffer');
  }
  
  return nodeSign(null, digest, _privateKey);
}

/**
 * Get the public key in SPKI DER format
 * @returns Public key as Buffer
 */
export function getPublicKey(): Buffer {
  if (!_publicKeyDer) {
    throw new Error('Crypto keypair not initialized. Call initKeypair() first.');
  }
  
  return _publicKeyDer;
}

/**
 * Verify a signature against a digest using the public key
 * This is primarily for testing purposes
 * @param signature - Signature to verify
 * @param digest - Original digest
 * @returns True if signature is valid
 */
export function verifySignature(signature: Buffer, digest: Buffer): boolean {
  if (!_publicKeyDer) {
    throw new Error('Crypto keypair not initialized. Call initKeypair() first.');
  }
  
  try {
    const verify = createVerify('sha384');
    verify.update(digest);
    return verify.verify(_publicKeyDer, signature);
  } catch (error) {
    logger.error('Signature verification failed', { error });
    return false;
  }
}

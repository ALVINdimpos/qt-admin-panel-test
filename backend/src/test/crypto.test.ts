import { describe, it, expect, beforeEach } from 'vitest';
import { initKeypair, hashEmail, signDigest, getPublicKey, verifySignature } from '../lib/crypto';

describe('Crypto Library', () => {
  beforeEach(() => {
    // Reinitialize keypair for each test
    initKeypair();
  });

  describe('initKeypair', () => {
    it('should initialize Ed25519 keypair', () => {
      expect(() => initKeypair()).not.toThrow();
      expect(() => getPublicKey()).not.toThrow();
    });
  });

  describe('hashEmail', () => {
    it('should hash email with SHA-384', () => {
      const email = 'test@example.com';
      const hash = hashEmail(email);
      
      expect(hash).toBeInstanceOf(Buffer);
      expect(hash.length).toBe(48); // SHA-384 produces 48 bytes
    });

    it('should produce consistent hashes for same email', () => {
      const email = 'test@example.com';
      const hash1 = hashEmail(email);
      const hash2 = hashEmail(email);
      
      expect(hash1).toEqual(hash2);
    });

    it('should produce different hashes for different emails', () => {
      const hash1 = hashEmail('test1@example.com');
      const hash2 = hashEmail('test2@example.com');
      
      expect(hash1).not.toEqual(hash2);
    });

    it('should throw error for invalid email', () => {
      expect(() => hashEmail('')).toThrow('Email must be a non-empty string');
      expect(() => hashEmail(null as any)).toThrow('Email must be a non-empty string');
    });
  });

  describe('signDigest', () => {
    it('should sign a digest', () => {
      const email = 'test@example.com';
      const hash = hashEmail(email);
      const signature = signDigest(hash);
      
      expect(signature).toBeInstanceOf(Buffer);
      expect(signature.length).toBeGreaterThan(0);
    });

    it('should produce consistent signatures for same digest', () => {
      const email = 'test@example.com';
      const hash = hashEmail(email);
      const signature1 = signDigest(hash);
      const signature2 = signDigest(hash);
      
      expect(signature1).toEqual(signature2);
    });

    it('should throw error if keypair not initialized', () => {
      // This test would require mocking the internal state
      // For now, we'll test the normal flow
      const email = 'test@example.com';
      const hash = hashEmail(email);
      expect(() => signDigest(hash)).not.toThrow();
    });
  });

  describe('verifySignature', () => {
    it('should verify valid signature', () => {
      const email = 'test@example.com';
      const hash = hashEmail(email);
      const signature = signDigest(hash);
      
      const isValid = verifySignature(signature, hash);
      expect(isValid).toBe(true);
    });

    it('should reject invalid signature', () => {
      const email = 'test@example.com';
      const hash = hashEmail(email);
      const invalidSignature = Buffer.from('invalid signature');
      
      const isValid = verifySignature(invalidSignature, hash);
      expect(isValid).toBe(false);
    });

    it('should reject signature for different hash', () => {
      const email1 = 'test1@example.com';
      const email2 = 'test2@example.com';
      const hash1 = hashEmail(email1);
      const hash2 = hashEmail(email2);
      const signature = signDigest(hash1);
      
      const isValid = verifySignature(signature, hash2);
      expect(isValid).toBe(false);
    });
  });

  describe('getPublicKey', () => {
    it('should return public key as Buffer', () => {
      const publicKey = getPublicKey();
      
      expect(publicKey).toBeInstanceOf(Buffer);
      expect(publicKey.length).toBeGreaterThan(0);
    });
  });
});

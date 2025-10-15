import 'dotenv/config';
import { createApp, startServer } from './app/server';
import { initKeypair } from './lib/crypto';
import { initProtobuf } from './lib/proto';
import { logger } from './lib/logger';
import { config } from './config';

/**
 * Main application entry point
 */
async function main(): Promise<void> {
  try {
    logger.info('Starting QT Admin Panel Backend', {
      nodeVersion: process.version,
      environment: config.nodeEnv,
      port: config.port,
    });

    // Initialize crypto keypair
    initKeypair();
    logger.info('Crypto keypair initialized');

    // Initialize protobuf schemas
    initProtobuf();
    logger.info('Protobuf schemas loaded');

    // Create and start Express app
    const app = createApp();
    startServer(app);

  } catch (error) {
    logger.error('Failed to start application', { error });
    process.exit(1);
  }
}

// Start the application
main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});

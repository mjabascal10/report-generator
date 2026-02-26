import { logger } from '@report-generator/shared';
import { initializeDatabase } from './database/connection';
import { initializeRedis } from './services/redis.service';
import { app } from './app';
import { config } from './config';

/**
 * Initialize all connections (Database, Redis)
 * Throws error if any connection fails
 */
async function initializeConnections(): Promise<void> {
  logger.info('Initializing Backend...');

  try {
    await initializeDatabase();
    logger.info('PostgreSQL connected');
  } catch (error) {
    logger.error({ error }, 'Failed to connect to PostgreSQL');
    throw error;
  }

  try {
    await initializeRedis();
    logger.info('Redis connected');
  } catch (error) {
    logger.error({ error }, 'Failed to connect to Redis');
    throw error;
  }
}

/**
 * Bootstrap the backend application
 */
export async function bootstrap(): Promise<void> {
  try {
    await initializeConnections();
    logger.info('All connections initialized successfully');

    app.listen(config.server.port, () => {
      logger.info({ port: config.server.port }, `Server running at http://localhost:${config.server.port}`);
    });
  } catch (error) {
    logger.error({ error }, 'Fatal error during bootstrap');
    process.exit(1);
  }
}

/**
 * Setup graceful shutdown handlers
 */
export function setupShutdownHandlers(): void {
  process.on('SIGTERM', () => {
    logger.info('SIGTERM signal received, shutting down server...');
    process.exit(0);
  });

  process.on('SIGINT', () => {
    logger.info('SIGINT signal received, shutting down server...');
    process.exit(0);
  });
}


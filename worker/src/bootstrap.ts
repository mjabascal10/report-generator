import { logger, initializeDatabase, initializeRedis } from '@report-generator/shared';
import { WorkerService } from './services/worker.service';
import { initializeReportModel } from './models/Report';

/**
 * Initialize all connections (Database, Redis)
 * Throws error if any connection fails
 */
async function initializeConnections(): Promise<void> {
  logger.info('Initializing Worker...');

  try {
    await initializeDatabase();
    logger.info('PostgreSQL connected');

    // Initialize models after database connection
    initializeReportModel();
    logger.info('Models initialized');
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
 * Bootstrap the worker application
 */
export async function bootstrap(): Promise<void> {
  try {
    await initializeConnections();
    logger.info('All connections initialized successfully');

    const workerService = new WorkerService();
    logger.info('Worker service created, starting job processing...');

    await workerService.start();
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
    logger.info('SIGTERM signal received, shutting down worker...');
    process.exit(0);
  });

  process.on('SIGINT', () => {
    logger.info('SIGINT signal received, shutting down worker...');
    process.exit(0);
  });
}


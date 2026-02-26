import { createClient, RedisClientType } from 'redis';
import { logger } from '../logger';

let redisClientInstance: RedisClientType | null = null;

/**
 * Initialize Redis client connection
 * Returns singleton instance
 */
export async function initializeRedis(): Promise<RedisClientType> {
  if (redisClientInstance) {
    return redisClientInstance;
  }

  const redisHost = process.env.REDIS_HOST || 'localhost';
  const redisPort = parseInt(process.env.REDIS_PORT || '6379');

  redisClientInstance = createClient({
    socket: {
      host: redisHost,
      port: redisPort,
    },
  });

  redisClientInstance.on('error', (err) => {
    logger.error({ error: err }, 'Redis client error');
  });

  redisClientInstance.on('connect', () => {
    logger.info('Redis client connected');
  });

  try {
    await redisClientInstance.connect();
    logger.info('Redis connection established');
    return redisClientInstance;
  } catch (error) {
    logger.error({ error }, 'Failed to connect to Redis');
    throw error;
  }
}

/**
 * Get existing Redis client instance
 */
export function getRedisClient(): RedisClientType {
  if (!redisClientInstance) {
    throw new Error('Redis client not initialized. Call initializeRedis() first.');
  }
  return redisClientInstance;
}

/**
 * Close Redis connection
 */
export async function closeRedis(): Promise<void> {
  if (redisClientInstance) {
    await redisClientInstance.quit();
    redisClientInstance = null;
    logger.info('Redis connection closed');
  }
}


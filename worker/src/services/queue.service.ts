import { RedisClientType } from 'redis';
import { logger, getRedisClient } from '@report-generator/shared';

export class QueueService {
  private readonly QUEUE_KEY = 'report_queue';
  private readonly PUB_SUB_CHANNEL = process.env.REDIS_PUB_SUB_CHANNEL || 'report_updates';
  private redisClient: RedisClientType;

  constructor(redisClient?: RedisClientType) {
    this.redisClient = redisClient || getRedisClient();
  }

  async dequeueJob(timeoutSeconds: number = 5): Promise<any | null> {
    try {
      const result = await this.redisClient.brPop(this.QUEUE_KEY, timeoutSeconds);

      if (!result) {
        return null;
      }

      const job = JSON.parse(result.element);
      logger.debug({ jobId: job.jobId, reportId: job.reportId }, 'Job dequeued');
      return job;
    } catch (error) {
      logger.error({ error }, 'Error dequeuing job');
      throw error;
    }
  }

  async publishStatusUpdate(reportId: string, status: string): Promise<void> {
    try {
      const update = {
        reportId,
        status,
        updatedAt: new Date(),
      };

      await this.redisClient.publish(this.PUB_SUB_CHANNEL, JSON.stringify(update));
      logger.debug({ reportId, status }, 'Status update published');
    } catch (error) {
      logger.error({ error }, 'Error publishing update');
      throw error;
    }
  }
}


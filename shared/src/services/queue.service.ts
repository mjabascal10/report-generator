import {QueueJob, ReportStatusUpdate, logger, getRedisClient, ReportStatus} from '../index';
import { v4 as uuid4 } from 'uuid';
import { RedisClientType } from 'redis';

const QUEUE_NAME = 'report_queue';
const UPDATES_CHANNEL = 'report_updates';

export class QueueService {
  private redisClient: RedisClientType | null = null;

  constructor(redisClient?: RedisClientType) {
    if (redisClient) {
      this.redisClient = redisClient;
    }
  }

  private getClient(): RedisClientType {
    if (!this.redisClient) {
      this.redisClient = getRedisClient();
    }
    return this.redisClient;
  }

  async enqueueReport(reportId: string): Promise<QueueJob> {
    const job: QueueJob = {
      reportId,
      jobId: uuid4(),
      createdAt: new Date(),
    };

    await this.getClient().lPush(QUEUE_NAME, JSON.stringify(job));

    logger.info(
      {
        queue: QUEUE_NAME,
        reportId,
        jobId: job.jobId,
      },
      'Report enqueued successfully'
    );

    return job;
  }

  async dequeueReport(timeoutSeconds: number = 5): Promise<QueueJob | null> {
    try {
      const jobData = await this.getClient().brPop(QUEUE_NAME, timeoutSeconds);

      if (!jobData) {
        logger.debug(
          { queue: QUEUE_NAME },
          'No job found in queue'
        );
        return null;
      }

      const job: QueueJob = JSON.parse(jobData.element);

      logger.info(
        {
          queue: QUEUE_NAME,
          reportId: job.reportId,
          jobId: job.jobId,
        },
        'Report dequeued for processing'
      );

      return job;
    } catch (error) {
      logger.error({ error }, 'Error dequeuing job');
      throw error;
    }
  }

  async publishStatusUpdate(reportId: string, status: string | ReportStatus): Promise<void> {
    try {
      const update: ReportStatusUpdate = {
        reportId,
        status: status as ReportStatus,
        updatedAt: new Date(),
      };

      await this.getClient().publish(UPDATES_CHANNEL, JSON.stringify(update));

      logger.info(
        {
          channel: UPDATES_CHANNEL,
          reportId,
          status,
        },
        'Report status update published'
      );
    } catch (error) {
      logger.error({ error }, 'Error publishing update');
      throw error;
    }
  }

  async subscribeToUpdates(
    callback: (update: ReportStatusUpdate) => void
  ): Promise<() => Promise<void>> {
    const subscriber = this.getClient().duplicate();
    await subscriber.connect();

    logger.info(
      { channel: UPDATES_CHANNEL },
      'Subscribed to report updates channel'
    );

    await subscriber.subscribe(UPDATES_CHANNEL, (message: string) => {
      try {
        const update: ReportStatusUpdate = JSON.parse(message);
        logger.debug({ update }, 'Received status update');
        callback(update);
      } catch (error) {
        logger.error({ error }, 'Error parsing status update');
      }
    });

    return async () => {
      await subscriber.unsubscribe();
      await subscriber.disconnect();
      logger.info('Unsubscribed from report updates channel');
    };
  }
}

export const queueService = new QueueService();


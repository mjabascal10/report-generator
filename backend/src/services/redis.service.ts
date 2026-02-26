import { initializeRedis as initRedisFromShared, getRedisClient as getRedisClientFromShared } from '@report-generator/shared';
import { QueueJob, ReportStatusUpdate, logger } from '@report-generator/shared';
import { v4 as uuidv4 } from 'uuid';

export async function initializeRedis() {
  return await initRedisFromShared();
}

export function getRedisClient() {
  return getRedisClientFromShared();
}

const QUEUE_NAME = 'report_queue';

export async function enqueueReport(reportId: string): Promise<QueueJob> {
  const client = getRedisClient();

  const job: QueueJob = {
    reportId,
    jobId: uuidv4(),
    createdAt: new Date(),
  };

  await client.lPush(QUEUE_NAME, JSON.stringify(job));

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

export async function dequeueReport(): Promise<QueueJob | null> {
  const client = getRedisClient();

  const jobData = await client.brPop(QUEUE_NAME, 5);

  if (!jobData) {
    logger.debug(
        { queue: QUEUE_NAME },
        'No job found in queue (timeout)'
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
}

// Pub/Sub Service
const UPDATES_CHANNEL = 'report_updates';

export async function publishStatusUpdate(update: ReportStatusUpdate): Promise<void> {
  const client = getRedisClient();

  await client.publish(UPDATES_CHANNEL, JSON.stringify(update));

  logger.info(
      {
        channel: UPDATES_CHANNEL,
        reportId: update.reportId,
        status: update.status,
      },
      'Report status update published'
  );
}

export async function subscribeToUpdates(
    callback: (update: ReportStatusUpdate) => void
): Promise<() => Promise<void>> {
  const client = getRedisClient();

  const subscriber = client.duplicate();
  await subscriber.connect();

  logger.info(
      { channel: UPDATES_CHANNEL },
      'Subscribed to report updates channel'
  );

  await subscriber.subscribe(UPDATES_CHANNEL, (message: string) => {
    try {
      const update: ReportStatusUpdate = JSON.parse(message);

      logger.debug(
          {
            channel: UPDATES_CHANNEL,
            reportId: update.reportId,
            status: update.status,
          },
          'Received report update from Redis'
      );

      callback(update);
    } catch (error: any) {
      logger.error(
          { error: error.message, stack: error.stack },
          'Failed to process Redis update message'
      );
    }
  });

  return async () => {
    await subscriber.unsubscribe(UPDATES_CHANNEL);
    await subscriber.disconnect();

    logger.info(
        { channel: UPDATES_CHANNEL },
        'Unsubscribed from report updates channel'
    );
  };
}

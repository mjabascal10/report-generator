import { logger, getRedisClient } from '@report-generator/shared';
import { QueueService } from './queue.service';
import { ReportProcessorService } from './report-processor.service';

const POLL_INTERVAL = 1000; // 1 second between retry attempts

export class WorkerService {
  private queueService: QueueService;
  private processorService: ReportProcessorService;

  constructor() {
    this.queueService = new QueueService(getRedisClient());
    this.processorService = new ReportProcessorService();
  }

  /**
   * Start the main worker loop
   * Continuously polls the queue and processes jobs
   */
  async start(): Promise<void> {
    logger.info('Worker service started');
    await this.processJobsLoop();
  }

  /**
   * Main processing loop
   * Continuously dequeues jobs and processes them
   */
  private async processJobsLoop(): Promise<void> {
    while (true) {
      try {
        const job = await this.queueService.dequeueJob();

        if (!job) {
          logger.debug('Waiting for jobs...');
          await this.sleep(POLL_INTERVAL);
          continue;
        }

        logger.info({ reportId: job.reportId }, 'Job found, processing...');
        await this.processorService.processReport(job.reportId);

      } catch (error) {
        logger.error({ error }, 'Error in processing loop');
        await this.sleep(POLL_INTERVAL);
      }
    }
  }

  /**
   * Utility function to sleep for a given duration
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}


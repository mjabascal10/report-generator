import { logger, queueService } from '@report-generator/shared';
import { ReportProcessorService } from './report-processor.service';

const POLL_INTERVAL = 1000;

export class WorkerService {

  private processorService: ReportProcessorService;

  constructor() {
    this.processorService = new ReportProcessorService();
  }

  async start(): Promise<void> {
    logger.info('Worker service started');
    await this.processJobsLoop();
  }

  private async processJobsLoop(): Promise<void> {
    while (true) {
      try {
        const job = await queueService.dequeueReport();

        if (!job) {
          logger.debug('Waiting for jobs...');
          await this.sleep(POLL_INTERVAL);
          continue;
        }

        logger.info({ reportId: job.reportId }, 'Job found, processing...');
        await this.processorService.processReport(job.reportId);

      } catch (error) {

          logger.error({
            error: error instanceof Error ? error.message : 'Unknown error',
            errorType: typeof error,
            errorObject: error
          }, 'Error in processing loop');
        await this.sleep(POLL_INTERVAL);
      }
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const workerService = new WorkerService();


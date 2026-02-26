import { logger, getRedisClient } from '@report-generator/shared';
import Report from '../models/report';
import { QueueService } from './queue.service';

export class ReportProcessorService {
  private queueService: QueueService;

  constructor() {
    this.queueService = new QueueService(getRedisClient());
  }

  /**
   * Process a complete report:
   * 1. Update to PROCESSING
   * 2. Publish event
   * 3. Simulate work (5 seconds)
   * 4. Update to COMPLETED
   * 5. Publish final event
   */
  async processReport(reportId: string): Promise<void> {
    try {
      logger.info({ reportId }, 'Processing report');
      await this.updateReportStatus(reportId, 'PROCESSING');

      await this.queueService.publishStatusUpdate(reportId, 'PROCESSING');

      await this.generateReport(reportId);

      await this.updateReportStatus(reportId, 'COMPLETED');

      await this.queueService.publishStatusUpdate(reportId, 'COMPLETED');

      logger.info({ reportId }, 'Report completed successfully');

    } catch (error) {
      logger.error({ error, reportId }, 'Error processing report');

      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      // Mark as FAILED
      await this.updateReportStatus(reportId, 'FAILED', errorMessage);

      // Publish FAILED event
      await this.queueService.publishStatusUpdate(reportId, 'FAILED');
    }
  }

  /**
   * Update report status in the database
   */
  async updateReportStatus(
    id: string,
    status: string,
    errorMessage?: string
  ): Promise<any> {
    try {
      const report = await Report.findByPk(id);
      if (!report) {
        throw new Error(`Report with ID ${id} not found`);
      }

      await report.update({
        status,
        errorMessage: errorMessage || null,
        completedAt: ['COMPLETED', 'FAILED'].includes(status) ? new Date() : null,
      });

      logger.debug({ reportId: id, status }, 'Report status updated');
      return report;
    } catch (error) {
      logger.error({ error, reportId: id }, 'Error updating report status');
      throw error;
    }
  }

  /**
   * Simulate report generation (5-second delay)
   */
  async generateReport(reportId: string): Promise<boolean> {
    return new Promise((resolve) => {
      logger.debug({ reportId }, 'Generating report');
      setTimeout(() => {
        logger.debug({ reportId }, 'Report generation completed');
        resolve(true);
      }, 5000);
    });
  }
}



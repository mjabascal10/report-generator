import { logger, queueService } from '@report-generator/shared';
import Report from '../models/report';

export class ReportProcessorService {

  async processReport(reportId: string): Promise<void> {
    try {

      logger.info({ reportId }, 'Processing report');
      await this.updateReportStatus(reportId, 'PROCESSING');

      await queueService.publishStatusUpdate(reportId, 'PROCESSING');

      await this.generateReport(reportId);

      await this.updateReportStatus(reportId, 'COMPLETED');

      await queueService.publishStatusUpdate(reportId, 'COMPLETED');

      logger.info({ reportId }, 'Report completed successfully');

    } catch (error) {
      logger.error({ error, reportId }, 'Error processing report');

      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      await this.updateReportStatus(reportId, 'FAILED', errorMessage);

      await queueService.publishStatusUpdate(reportId, 'FAILED');
    }
  }

  async updateReportStatus(id: string, status: string, errorMessage?: string): Promise<any> {
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



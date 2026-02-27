import { ReportModel, CreateReportRequest, queueService } from '@report-generator/shared';

export class ReportService {

  async createReport(data: CreateReportRequest) {
    if (!data.name || !data.name.trim()) {
      throw new Error('Report name is required');
    }

    if (!data.requestedBy || !data.requestedBy.trim()) {
      throw new Error('Requested by field is required');
    }

    const report = await ReportModel.create({
      name: data.name.trim(),
      requestedBy: data.requestedBy.trim(),
      status: 'PENDING',
    });

    await queueService.enqueueReport(report.id);

    return report.toJSON();
  }

  async getAllReports() {

    const reports = await ReportModel.findAll({
      order: [['createdAt', 'DESC']],
    });

    return reports.map((report: any) => report.toJSON());
  }

  async getReportById(id: string) {

    const report = await ReportModel.findByPk(id);

    if (!report) {
      throw new Error(`Report not found: ${id}`);
    }

    return report.toJSON();
  }

}

export const reportService = new ReportService();


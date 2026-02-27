import {ReportModel, queueService, AppError} from '@report-generator/shared';
import {CreateReportDto} from "../dtos/create-report.dto";

export class ReportService {

  async createReport(data: CreateReportDto) {
    if (!data.name || !data.name.trim()) {
      throw new AppError('Report name field is required', 400);
    }

    if (!data.requestedBy || !data.requestedBy.trim()) {
      throw new AppError('Requested by field is required', 400);
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
      throw new AppError(`Report not found: ${id}`, 404);
    }

    return report.toJSON();
  }

}

export const reportService = new ReportService();


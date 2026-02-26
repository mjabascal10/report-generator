import { Report } from '../models/report';
import { CreateReportRequest } from '@report-generator/shared';
import { enqueueReport } from './redis.service';

export class ReportService {
  async createReport(data: CreateReportRequest) {
    // Validar entrada
    if (!data.name || !data.name.trim()) {
      throw new Error('El nombre del reporte es requerido');
    }

    if (!data.requestedBy || !data.requestedBy.trim()) {
      throw new Error('El campo requestedBy es requerido');
    }

    // Crear el reporte en la base de datos
    const report = await Report.create({
      name: data.name.trim(),
      requestedBy: data.requestedBy.trim(),
      status: 'PENDING',
    });

    // Encolar el trabajo
    await enqueueReport(report.id);

    // Retornar el reporte creado
    return report.toJSON();
  }

  async getAllReports() {
    const reports = await Report.findAll({
      order: [['createdAt', 'DESC']],
    });

    return reports.map((report) => report.toJSON());
  }

  async getReportById(id: string) {
    const report = await Report.findByPk(id);

    if (!report) {
      throw new Error(`Reporte no encontrado: ${id}`);
    }

    return report.toJSON();
  }

  async updateReportStatus(
    id: string,
    status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED',
    errorMessage?: string
  ) {
    const report = await Report.findByPk(id);

    if (!report) {
      throw new Error(`Reporte no encontrado: ${id}`);
    }

    await report.update({
      status,
      errorMessage,
      completedAt: status === 'COMPLETED' || status === 'FAILED' ? new Date() : report.completedAt,
    });

    return report.toJSON();
  }
}

export const reportService = new ReportService();


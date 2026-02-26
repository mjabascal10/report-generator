import { ReportResponseDto } from '../dtos/report-response.dto';
import { InferAttributes } from 'sequelize';
import {Report} from "../models/report";

export function toReportResponse(
    report: Report | InferAttributes<Report>
): ReportResponseDto {
    return {
        id: report.id,
        name: report.name,
        requestedBy: report.requestedBy,
        status: report.status,
        createdAt: report.createdAt,
    };
}

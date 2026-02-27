import { ReportResponseDto } from '../dtos/report-response.dto';
import {Report} from "@report-generator/shared";

export function toReportResponse(
    report: Report
): ReportResponseDto {
    return {
        id: report.id,
        name: report.name,
        requestedBy: report.requestedBy,
        status: report.status,
        createdAt: report.createdAt,
    };
}

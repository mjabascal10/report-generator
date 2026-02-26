export interface Report {
  id: string;
  name: string;
  requestedBy: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
  errorMessage?: string;
}

export interface CreateReportRequest {
  name: string;
  requestedBy: string;
}

export interface ReportStatusUpdate {
  reportId: string;
  status: Report['status'];
  updatedAt: Date;
  errorMessage?: string;
}


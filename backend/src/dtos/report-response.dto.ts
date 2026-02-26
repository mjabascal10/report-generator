export interface ReportResponseDto {
    id: string;
    name: string;
    requestedBy: string;
    status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
    createdAt: Date;
}

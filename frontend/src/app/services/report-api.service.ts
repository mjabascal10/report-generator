import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// Types from shared package
export interface Report {
  id: string;
  name: string;
  requestedBy: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  errorMessage?: string;
}

export interface CreateReportRequest {
  name: string;
  requestedBy: string;
}

@Injectable({
  providedIn: 'root'
})
export class ReportApiService {
  private readonly http = inject(HttpClient);
  // Use relative URL in production (proxied by nginx), localhost in development
  private readonly API_URL = window.location.hostname === 'localhost'
    ? 'http://localhost:3000/api/reports'
    : '/api/reports';

  /**
   * Get all reports
   */
  getAllReports(): Observable<Report[]> {
    return this.http.get<Report[]>(this.API_URL);
  }

  /**
   * Get a single report by ID
   */
  getReportById(id: string): Observable<Report> {
    return this.http.get<Report>(`${this.API_URL}/${id}`);
  }

  /**
   * Create a new report
   */
  createReport(data: CreateReportRequest): Observable<Report> {
    return this.http.post<Report>(this.API_URL, data);
  }

  /**
   * Get SSE stream URL for real-time updates
   */
  getSSEStreamUrl(): string {
    return `${this.API_URL}/stream`;
  }
}


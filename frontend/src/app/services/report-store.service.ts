import {Injectable, signal, computed, inject} from '@angular/core';
import {Report, ReportApiService} from './report-api.service';
import {ReportSSEService} from './report-sse.service';

@Injectable({
  providedIn: 'root'
})
export class ReportStoreService {

  private readonly apiService = inject(ReportApiService);
  private readonly sseService = inject(ReportSSEService);


  private readonly reports = signal<Report[]>([]);

  private readonly loading = signal<boolean>(false);

  private readonly error = signal<string | null>(null);

  readonly pendingReports = computed(() =>
    this.reports().filter(r => r.status === 'PENDING')
  );

  readonly processingReports = computed(() =>
    this.reports().filter(r => r.status === 'PROCESSING')
  );

  readonly completedReports = computed(() =>
    this.reports().filter(r => r.status === 'COMPLETED')
  );

  readonly failedReports = computed(() =>
    this.reports().filter(r => r.status === 'FAILED')
  );

  readonly pendingCount = computed(() => this.pendingReports().length);
  readonly processingCount = computed(() => this.processingReports().length);
  readonly completedCount = computed(() => this.completedReports().length);
  readonly failedCount = computed(() => this.failedReports().length);
  readonly totalCount = computed(() => this.reports().length);

  readonly allReports = this.reports.asReadonly();
  readonly isLoading = this.loading.asReadonly();
  readonly errorMessage = this.error.asReadonly();

  initialize(): void {
    this.loadAllReports();

    setTimeout(() => {
      this.connectToSSE();
    }, 1000);
  }

  loadAllReports(): void {
    this.loading.set(true);
    this.error.set(null);

    this.apiService.getAllReports().subscribe({
      next: (reports) => {
        this.reports.set(reports);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading reports:', err);
        this.error.set('Failed to connect to backend. Make sure the API server is running on http://localhost:3000');
        this.loading.set(false);
      }
    });
  }

  createReport(name: string, requestedBy: string): void {
    this.loading.set(true);
    this.error.set(null);

    this.apiService.createReport({name, requestedBy}).subscribe({
      next: (newReport) => {
        this.reports.update(reports => [newReport, ...reports]);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error creating report:', err);
        this.error.set('Failed to create report');
        this.loading.set(false);
      }
    });
  }

  updateReport(updatedReport: Report): void {
    this.reports.update(reports => {
      const index = reports.findIndex(r => r.id === updatedReport.id);
      if (index !== -1) {
        const newReports = [...reports];
        newReports[index] = {
          ...newReports[index],
          ...updatedReport
        };
        return newReports;
      } else {
        return [updatedReport, ...reports];
      }
    });
  }

  /**
   * Connect to SSE for real-time updates
   */
  private connectToSSE(): void {
    const sseUrl = this.apiService.getSSEStreamUrl();

    this.sseService.connect(sseUrl,

      (report) => {
        this.updateReport(report);
      },
      (error) => {
        console.error('SSE error:', error);
      }
    );
  }

  destroy(): void {
    this.sseService.disconnect();
  }
}


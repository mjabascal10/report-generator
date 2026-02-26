import { Injectable, signal, computed, inject } from '@angular/core';
import { Report, ReportApiService } from './report-api.service';
import { ReportSSEService } from './report-sse.service';

@Injectable({
  providedIn: 'root'
})
export class ReportStoreService {
  private readonly apiService = inject(ReportApiService);
  private readonly sseService = inject(ReportSSEService);

  // State: All reports
  private readonly reports = signal<Report[]>([]);

  // State: Loading flag
  private readonly loading = signal<boolean>(false);

  // State: Error message
  private readonly error = signal<string | null>(null);

  // Computed: Reports by status
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

  // Computed: Counts
  readonly pendingCount = computed(() => this.pendingReports().length);
  readonly processingCount = computed(() => this.processingReports().length);
  readonly completedCount = computed(() => this.completedReports().length);
  readonly failedCount = computed(() => this.failedReports().length);
  readonly totalCount = computed(() => this.reports().length);

  // Readonly signals for components
  readonly allReports = this.reports.asReadonly();
  readonly isLoading = this.loading.asReadonly();
  readonly errorMessage = this.error.asReadonly();

  /**
   * Initialize: Load all reports and start SSE connection
   */
  initialize(): void {
    this.loadAllReports();

    setTimeout(() => {
      this.connectToSSE();
    }, 1000);
  }

  /**
   * Load all reports from API
   */
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

  /**
   * Create a new report
   */
  createReport(name: string, requestedBy: string): void {
    this.loading.set(true);
    this.error.set(null);

    this.apiService.createReport({ name, requestedBy }).subscribe({
      next: (newReport) => {
        console.log('✅ Report created:', newReport);
        // Add to beginning of array
        this.reports.update(reports => [newReport, ...reports]);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('❌ Error creating report:', err);
        this.error.set('Failed to create report');
        this.loading.set(false);
      }
    });
  }

  /**
   * Update a report in the store (from SSE)
   */
  updateReport(updatedReport: Report): void {
    this.reports.update(reports => {
      const index = reports.findIndex(r => r.id === updatedReport.id);
      if (index !== -1) {
        // Merge the update with existing report data
        const newReports = [...reports];
        newReports[index] = {
          ...newReports[index],  // Keep existing fields
          ...updatedReport       // Override with new fields from SSE
        };
        return newReports;
      } else {
        // Report doesn't exist, add it (shouldn't happen normally)
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
        console.log('Real-time update received:', report);
        this.updateReport(report);
      },
      (error) => {
        console.error('SSE error:', error);
      }
    );
  }

  /**
   * Cleanup
   */
  destroy(): void {
    this.sseService.disconnect();
  }
}


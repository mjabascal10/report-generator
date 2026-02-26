import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef } from 'ag-grid-community';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ReportStoreService } from './services/report-store.service';
import { CreateReportModalComponent } from './components/add-report/create-report-modal.component';
import { Report } from './services/report-api.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, AgGridAngular],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit, OnDestroy {
  private readonly store = inject(ReportStoreService);
  private readonly modalService = inject(NgbModal);

  protected readonly reports = this.store.allReports;
  protected readonly isLoading = this.store.isLoading;
  protected readonly errorMessage = this.store.errorMessage;

  protected readonly totalCount = this.store.totalCount;
  protected readonly pendingCount = this.store.pendingCount;
  protected readonly processingCount = this.store.processingCount;
  protected readonly completedCount = this.store.completedCount;
  protected readonly failedCount = this.store.failedCount;

  protected readonly theme = 'legacy';

  protected readonly columnDefs: ColDef<Report>[] = [
    {
      field: 'id',
      headerName: 'Report ID',
      width: 120,
      cellRenderer: (params: any) => {
        // Show only first 8 characters of UUID
        return params.value ? params.value.substring(0, 8) : '';
      }
    },
    {
      field: 'name',
      headerName: 'Report Name',
      flex: 1,
      minWidth: 200
    },
    {
      field: 'requestedBy',
      headerName: 'Requested By',
      width: 180
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 150,
      cellRenderer: (params: any) => {
        const status = params.value;
        if (!status) return '';

        let className = 'status-badge';

        switch (status) {
          case 'PENDING':
            className += ' status-pending';
            break;
          case 'PROCESSING':
            className += ' status-processing';
            break;
          case 'COMPLETED':
            className += ' status-completed';
            break;
          case 'FAILED':
            className += ' status-failed';
            break;
        }

        return `<span class="${className}">${status}</span>`;
      }
    },
    {
      field: 'createdAt',
      headerName: 'Created At',
      width: 100,
      valueFormatter: (params: any) => {
        if (!params.value) return '';
        try {
          return new Date(params.value).toLocaleString();
        } catch (e) {
          return params.value;
        }
      }
    }
  ];

  protected readonly defaultColDef: ColDef = {
    sortable: true,
    filter: true,
    resizable: true
  };

  protected readonly rowHeight = 50;
  protected readonly headerHeight = 50;
  protected readonly animateRows = true;

  ngOnInit(): void {
    this.store.initialize();
    console.log(this.store.allReports());
  }

  ngOnDestroy(): void {
    this.store.destroy();
  }

  protected openModal(): void {
    const modalRef = this.modalService.open(CreateReportModalComponent, {
      centered: true,
      backdrop: 'static'
    });

    modalRef.result.then(
      (data: { name: string; requestedBy: string }) => {
        console.log('📝 Creating report:', data);
        this.store.createReport(data.name, data.requestedBy);
      },
      () => {
        // Modal dismissed
        console.log('Modal dismissed');
      }
    );
  }
}

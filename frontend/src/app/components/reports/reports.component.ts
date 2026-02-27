import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef } from 'ag-grid-community';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ReportStoreService } from '../../services/report-store.service';
import { CreateReportModalComponent } from '../add-report/create-report-modal.component';
import { Report } from '../../services/report-api.service';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, AgGridAngular],
  templateUrl: './reports.component.html',
  styleUrl: './reports.component.css'
})
export class ReportsComponent implements OnInit, OnDestroy {
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

        let badgeClass = 'badge';

        switch (status) {
          case 'PENDING':
            badgeClass += ' bg-warning text-dark';
            break;
          case 'PROCESSING':
            badgeClass += ' bg-info text-white';
            break;
          case 'COMPLETED':
            badgeClass += ' bg-success text-white';
            break;
          case 'FAILED':
            badgeClass += ' bg-danger text-white';
            break;
          default:
            badgeClass += ' bg-secondary text-white';
        }

        return `<span class="${badgeClass}">${status}</span>`;
      }
    },
    {
      field: 'createdAt',
      headerName: 'Created At',
      width: 200,
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
        this.store.createReport(data.name, data.requestedBy);
      },
      () => {
        console.log('Modal dismissed');
      }
    );
  }
}


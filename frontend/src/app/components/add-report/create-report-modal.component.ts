import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-create-report-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./create-report-modal.component.html",
  styleUrl: "./create-report-modal.component.css"
})
export class CreateReportModalComponent {
  readonly activeModal = inject(NgbActiveModal);

  reportName = '';
  requestedBy = '';

  onSubmit(): void {
    const name = this.reportName.trim();
    const requester = this.requestedBy.trim();

    if (name && requester) {
      this.activeModal.close({ name, requestedBy: requester });
    }
  }
}


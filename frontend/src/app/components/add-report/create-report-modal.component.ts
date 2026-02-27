import { Component, inject } from '@angular/core';
import {FormBuilder, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-create-report-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: "./create-report-modal.component.html",
  styleUrl: "./create-report-modal.component.css"
})
export class CreateReportModalComponent {
  readonly activeModal = inject(NgbActiveModal);
  private fb = inject(FormBuilder);

  form = this.fb.group({
    name: ['', Validators.required],
    requestedBy: ['', [Validators.required]],
  });

  onSubmit(): void {

    if(this.form.valid) {
      const data = this.form.value;
      this.activeModal.close(data);
    } else {
      this.form.markAllAsTouched();
    }
  }

  isInvalid(formControlName: string){
    const control = this.form.get(formControlName);

    return !!(control?.invalid && (control?.dirty || control?.touched));
  }
}


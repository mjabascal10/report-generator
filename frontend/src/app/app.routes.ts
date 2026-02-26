import { Routes } from '@angular/router';
import { ReportsComponent } from './components/reports/reports.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'reports',
    pathMatch: 'full'
  },
  {
    path: 'reports',
    component: ReportsComponent
  }
];

import { type Routes } from '@angular/router';
import { ngxProtectedGuard, ngxPublicGuard } from 'ngx-auth';

export const routes = [
  {
    canActivate: [ngxPublicGuard],
    loadComponent: () => import('./login/login.component').then(m => m.LoginComponent),
    path: 'login',
  },
  {
    canActivate: [ngxProtectedGuard],
    loadComponent: () => import('./dashboard/dashboard.component').then(m => m.DashboardComponent),
    path: 'dashboard',
  },
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'dashboard',
  },
  {
    path: '**',
    pathMatch: 'full',
    redirectTo: 'dashboard',
  },
] as Routes;

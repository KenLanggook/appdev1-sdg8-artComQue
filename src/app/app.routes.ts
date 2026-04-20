import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', loadComponent: () => import('./comps/auth/login/login.component').then(m => m.LoginComponent) },
  { path: 'register', loadComponent: () => import('./comps/auth/register/register.component').then(m => m.RegisterComponent) },
  { path: 'dashboard', loadComponent: () => import('./comps/dashboard/dashboard.component').then(m => m.DashboardComponent) },
  { path: 'map', loadComponent: () => import('./comps/incident-map/incident-map.component').then(m => m.IncidentMapComponent) },
  { path: 'report', loadComponent: () => import('./comps/report-incident/report-incident.component').then(m => m.ReportIncidentComponent) },
  { path: 'incidents', loadComponent: () => import('./comps/incident-list/incident-list.component').then(m => m.IncidentListComponent) },
  { path: 'incidents/:id', loadComponent: () => import('./comps/incident-details/incident-details.component').then(m => m.IncidentDetailsComponent) },
  { path: '**', redirectTo: 'login' }
];

import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component').then((m) => m.LoginComponent),
  },
  {
    // Public : formulaire de candidature, pas de garde d'authentification
    // -- un candidat a la location n'a pas de compte (voir ApplyComponent).
    path: 'apply/:propertyId/:unitId',
    loadComponent: () => import('./features/apply/apply.component').then((m) => m.ApplyComponent),
  },
  {
    path: '',
    loadComponent: () => import('./layout/shell/shell.component').then((m) => m.ShellComponent),
    canActivate: [authGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard.component').then((m) => m.DashboardComponent),
      },
      {
        path: 'properties',
        loadComponent: () => import('./features/properties/property-list/property-list.component').then((m) => m.PropertyListComponent),
      },
      {
        path: 'properties/:propertyId',
        loadComponent: () =>
          import('./features/properties/property-detail/property-detail.component').then((m) => m.PropertyDetailComponent),
      },
      {
        path: 'properties/:propertyId/units/:unitId',
        loadComponent: () => import('./features/properties/unit-detail/unit-detail.component').then((m) => m.UnitDetailComponent),
      },
      {
        path: 'properties/:propertyId/units/:unitId/leases/:leaseId',
        loadComponent: () => import('./features/properties/lease-detail/lease-detail.component').then((m) => m.LeaseDetailComponent),
      },
      {
        path: 'owners',
        loadComponent: () => import('./features/owners/owner-list.component').then((m) => m.OwnerListComponent),
      },
      {
        path: 'tenants',
        loadComponent: () => import('./features/tenants/tenant-list.component').then((m) => m.TenantListComponent),
      },
      {
        path: 'admin/jurisdiction-rules',
        loadComponent: () =>
          import('./features/admin/jurisdiction-rule-list.component').then((m) => m.JurisdictionRuleListComponent),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];

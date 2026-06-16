import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard }       from './core/guards/role.guard';
import { permissionGuard } from './core/guards/permission.guard';

export const routes: Routes = [

  // ── Public ────────────────────────────────────────────────────────────────
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login.component').then(m => m.LoginComponent),
  },

  // ── Protected shell with sidebar/header layout ────────────────────────────
  {
    path: '',
    loadComponent: () =>
      import('./layout/layout.component').then(m => m.LayoutComponent),
    canActivate: [authGuard],
    children: [

      // Dashboard
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
      },

      // ── MMBL Case Management ───────────────────────────────────────────────

      // Draft Case Queue (email-ingested drafts)
      {
        path: 'draft-cases',
        loadComponent: () =>
          import('./features/draft-queue/draft-queue').then(m => m.DraftQueueComponent),
      },

      // Confirmed Case Queue (active cases)
      {
        path: 'cases',
        loadComponent: () =>
          import('./features/cases/cases.component').then(m => m.CasesComponent),
      },

      // Todo
      {
        path: 'todos',
        loadComponent: () =>
          import('./features/todo/todo').then(m => m.Todo),
      },

      // Reports
      {
        path: 'reports',
        loadComponent: () =>
          import('./features/reports/reports.component').then(m => m.ReportsComponent),
      },

      // Users (admin only)
      {
        path: 'users',
        loadComponent: () =>
          import('./features/users/users.component').then(m => m.UsersComponent),
        canActivate: [permissionGuard],
        data: { permission: 'manage-users' },
      },

      // Default redirect
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    ],
  },

  // ── Fallback ──────────────────────────────────────────────────────────────
  { path: '**', redirectTo: '/dashboard' },
];
/**
 * src/app/core/services/auth.service.ts
 *
 * RELOAD LOOP FIX:
 * The infinite reload was caused by fetchUserProfile() calling GET /api/auth/me
 * which doesn't exist on the backend yet. The failure triggered keycloak.login()
 * again → redirect loop.
 *
 * Fix: in live mode, read the user profile directly from the JWT token that
 * Keycloak already gave us. No backend call needed at this stage.
 *
 * When your Spring Boot /api/auth/me endpoint is ready:
 *   1. Uncomment fetchUserProfile() method at the bottom
 *   2. Replace syncFromToken() call with fetchUserProfile() in constructor
 *   3. The rest of the app needs zero changes
 */

import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import Keycloak from 'keycloak-js';

import { environment } from '../../../environments/environment';
import { MOCK_USER_PROFILES } from '../mock/mock-auth.data';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export type UserRole = 'admin' | 'editor' | 'viewer';

export type Permission =
  | 'read' | 'write' | 'delete' | 'create'
  | 'manage-users' | 'view-users' | 'edit-users' | 'delete-users'
  | 'view-analytics' | 'export-data' | 'generate-reports' | 'view-reports'
  | 'system-logs' | 'user-manual' | 'system-settings'
  | 'products' | 'reports' | 'orders' | 'inventory' | 'revenue' | 'conversion'
  | 'dashboard' | 'profile' | 'settings' | 'team-dashboard'
  | 'file-upload' | 'file-download' | 'file-share' | 'file-delete' | 'file-manage'
  | 'crm-view' | 'crm-customers' | 'crm-leads' | 'crm-tasks' | 'crm-calendar'
  | 'customer-create' | 'customer-edit' | 'customer-delete' | 'customer-view'
  | 'lead-create' | 'lead-edit' | 'lead-delete' | 'lead-convert'
  | 'task-create' | 'task-edit' | 'task-complete' | 'task-assign'
  | 'appointment-create' | 'appointment-edit' | 'appointment-cancel'
  | 'email-compose' | 'email-send' | 'email-delete' | 'email-inbox'
  | 'notifications-manage' | 'notifications-view'
  | 'pages-access' | 'signin-page' | 'change-password' | 'forgot-password'
  | 'user-profile-page' | 'timeline-page' | 'not-found-page'
  | 'components-view' | 'forms-access' | 'alerts-access' | 'cards-access'
  | 'tables-access' | 'buttons-access' | 'loaders-access' | 'accordion-access'
  | 'autocomplete-access' | 'chips-access' | 'select-access'
  | 'multiselect-tree-access' | 'calendar-access' | 'file-uploads-access'
  | 'drag-drop-access' | 'grids-access' | 'modal-popup-access'
  | 'headers-access' | 'footers-access' | 'sliders-access'
  | 'carousel-sliders-access' | 'gallery-access' | 'portfolio-access'
  | 'editors-access' | 'cases-view' | 'todo-access';

export interface AuthUser {
  id:          string;
  email:       string;
  name:        string;
  role:        UserRole;
  permissions: Permission[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Role → Permission map
// Used in live mode until backend /api/auth/me is ready.
// Must match what Spring Boot will eventually return.
// ─────────────────────────────────────────────────────────────────────────────

const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  admin: [
    'read', 'write', 'delete', 'create',
    'manage-users', 'view-users', 'edit-users', 'delete-users',
    'view-analytics', 'export-data', 'generate-reports', 'view-reports',
    'system-logs', 'user-manual', 'system-settings',
    'products', 'reports', 'orders', 'inventory', 'revenue', 'conversion',
    'dashboard', 'profile', 'settings', 'team-dashboard',
    'file-upload', 'file-download', 'file-share', 'file-delete', 'file-manage',
    'crm-view', 'crm-customers', 'crm-leads', 'crm-tasks', 'crm-calendar',
    'customer-create', 'customer-edit', 'customer-delete', 'customer-view',
    'lead-create', 'lead-edit', 'lead-delete', 'lead-convert',
    'task-create', 'task-edit', 'task-complete', 'task-assign',
    'appointment-create', 'appointment-edit', 'appointment-cancel',
    'email-compose', 'email-send', 'email-delete', 'email-inbox',
    'notifications-manage', 'notifications-view',
    'pages-access', 'signin-page', 'change-password', 'forgot-password',
    'user-profile-page', 'timeline-page', 'not-found-page',
    'components-view', 'forms-access', 'alerts-access', 'cards-access',
    'tables-access', 'buttons-access', 'loaders-access', 'accordion-access',
    'autocomplete-access', 'chips-access', 'select-access',
    'multiselect-tree-access', 'calendar-access', 'file-uploads-access',
    'drag-drop-access', 'grids-access', 'modal-popup-access',
    'headers-access', 'footers-access', 'sliders-access',
    'carousel-sliders-access', 'gallery-access', 'portfolio-access',
    'editors-access', 'cases-view', 'todo-access',
  ],
  editor: [
    'read', 'write', 'create',
    'view-users',
    'view-analytics', 'export-data', 'generate-reports', 'view-reports',
    'products', 'reports', 'orders', 'inventory', 'revenue', 'conversion',
    'dashboard', 'profile', 'settings',
    'file-upload', 'file-download', 'file-share', 'file-manage',
    'crm-view', 'crm-customers', 'crm-leads', 'crm-tasks',
    'customer-create', 'customer-edit', 'customer-view',
    'lead-create', 'lead-edit', 'lead-convert',
    'task-create', 'task-edit', 'task-complete',
    'appointment-create', 'appointment-edit',
    'email-compose', 'email-send', 'email-inbox',
    'notifications-view',
    'pages-access', 'signin-page', 'change-password', 'forgot-password',
    'user-profile-page', 'timeline-page', 'not-found-page',
    'components-view', 'forms-access', 'alerts-access', 'cards-access',
    'tables-access', 'buttons-access', 'loaders-access', 'accordion-access',
    'autocomplete-access', 'chips-access', 'select-access',
    'multiselect-tree-access', 'calendar-access', 'file-uploads-access',
    'drag-drop-access', 'grids-access', 'modal-popup-access',
    'headers-access', 'footers-access', 'sliders-access',
    'carousel-sliders-access', 'gallery-access', 'portfolio-access',
    'editors-access', 'cases-view', 'todo-access',
  ],
  viewer: [
    'read',
    'dashboard', 'profile',
    'view-analytics', 'view-reports',
    'file-download',
    'crm-view', 'customer-view',
    'notifications-view',
    'pages-access', 'signin-page', 'change-password', 'forgot-password',
    'user-profile-page', 'timeline-page', 'not-found-page',
    'components-view', 'alerts-access', 'cards-access', 'tables-access',
    'buttons-access', 'loaders-access', 'accordion-access',
    'autocomplete-access', 'chips-access', 'select-access',
    'multiselect-tree-access', 'calendar-access', 'grids-access',
    'headers-access', 'footers-access', 'sliders-access',
    'carousel-sliders-access', 'gallery-access', 'portfolio-access',
    'cases-view', 'todo-access',
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// Service
// ─────────────────────────────────────────────────────────────────────────────

@Injectable({ providedIn: 'root' })
export class AuthService {
  private keycloak = !environment.mockAuth ? inject(Keycloak) : null;
  private http     = inject(HttpClient);
  private router   = inject(Router);

  private _user          = signal<AuthUser | null>(null);
  private _authenticated = signal(false);

  user            = this._user.asReadonly();
  authenticated   = this._authenticated.asReadonly();
  userRole        = computed(() => this._user()?.role        ?? null);
  userPermissions = computed(() => this._user()?.permissions ?? []);

  constructor() {
    if (environment.mockAuth) {
      // ── MOCK MODE ────────────────────────────────────────────────────────
      this.restoreMockSession();
    } else {
      // ── LIVE MODE ────────────────────────────────────────────────────────
      // Read user directly from the JWT token Keycloak already gave us.
      // No backend call — avoids reload loop while /api/auth/me is not ready.
      if (this.keycloak?.authenticated) {
        this.syncFromToken();
      }
    }
  }

  // ── Public API ─────────────────────────────────────────────────────────────

  login(email?: string): void {
    if (environment.mockAuth) {
      const profile = email
        ? MOCK_USER_PROFILES[email]
        : MOCK_USER_PROFILES['admin@company.com'];

      if (profile) {
        this._user.set(profile);
        this._authenticated.set(true);
        try {
          sessionStorage.setItem('mock-auth-user', JSON.stringify(profile));
        } catch { /* ignore */ }
        this.router.navigate(['/dashboard']);
      }
    } else {
      this.keycloak?.login({
        redirectUri: window.location.origin + '/dashboard',
      });
    }
  }

  logout(): void {
    this._user.set(null);
    this._authenticated.set(false);

    if (environment.mockAuth) {
      try { sessionStorage.removeItem('mock-auth-user'); } catch { /* ignore */ }
      this.router.navigate(['/login']);
    } else {
      this.keycloak?.logout({
        redirectUri: window.location.origin + '/login',
      });
    }
  }

  hasRole(role: UserRole): boolean {
    return this.userRole() === role;
  }

  hasPermission(permission: Permission): boolean {
    return this.userPermissions().includes(permission);
  }

  hasAnyRole(roles: UserRole[]): boolean {
    const current = this.userRole();
    return current ? roles.includes(current) : false;
  }

  async getToken(): Promise<string> {
    if (environment.mockAuth) return 'mock-token';
    return this.keycloak?.token ?? '';
  }

  // ── Private helpers ────────────────────────────────────────────────────────

  /**
   * LIVE MODE — reads user info directly from the parsed JWT token.
   * No HTTP call to backend. Roles come from Keycloak realm_access claim.
   * Permissions are derived from the role using ROLE_PERMISSIONS map above.
   *
   * ─── When backend /api/auth/me is ready ───────────────────────────────────
   * Replace this.syncFromToken() in the constructor with:
   *   this.fetchUserProfile();
   * And uncomment fetchUserProfile() below.
   * ──────────────────────────────────────────────────────────────────────────
   */
  private syncFromToken(): void {
    try {
      const token = this.keycloak?.tokenParsed as any;
      if (!token) return;

      // Extract roles from realm_access claim in the JWT
      const realmRoles: string[] = token?.realm_access?.roles ?? [];

      // Map Keycloak role to our UserRole type
      // Priority: admin > editor > viewer
      let role: UserRole = 'viewer';
      if (realmRoles.includes('admin'))       role = 'admin';
      else if (realmRoles.includes('editor')) role = 'editor';

      const user: AuthUser = {
        id:          token?.sub          ?? '',
        email:       token?.email        ?? '',
        name:        token?.name         ?? token?.preferred_username ?? '',
        role,
        permissions: ROLE_PERMISSIONS[role],
      };

      this._user.set(user);
      this._authenticated.set(true);

    } catch (error) {
      console.error('[AuthService] Failed to sync from token:', error);
    }
  }

  /**
   * FUTURE — uncomment when Spring Boot /api/auth/me is ready.
   * Switch to this by replacing syncFromToken() call in constructor.
   *
   * async fetchUserProfile(): Promise<void> {
   *   try {
   *     await this.keycloak?.updateToken(30);
   *     const token = this.keycloak?.token;
   *     const user = await firstValueFrom(
   *       this.http.get<AuthUser>(`${environment.apiUrl}/auth/me`, {
   *         headers: { Authorization: `Bearer ${token}` },
   *       })
   *     );
   *     this._user.set(user);
   *     this._authenticated.set(true);
   *   } catch (error) {
   *     console.error('[AuthService] Failed to fetch user profile:', error);
   *     this._user.set(null);
   *     this._authenticated.set(false);
   *     this.keycloak?.login();
   *   }
   * }
   */

  private restoreMockSession(): void {
    try {
      const stored = sessionStorage.getItem('mock-auth-user');
      if (stored) {
        const user = JSON.parse(stored) as AuthUser;
        if (user?.id && user?.email && user?.role) {
          this._user.set(user);
          this._authenticated.set(true);
        }
      }
    } catch {
      sessionStorage.removeItem('mock-auth-user');
    }
  }
}


// import { Injectable, signal, computed, inject } from '@angular/core';
// import { Router } from '@angular/router';

// export type UserRole = 'admin' | 'editor' | 'viewer';

// export type Permission =
//   // Basic CRUD
//   | 'read'
//   | 'write'
//   | 'delete'
//   | 'create'
//   // User Management
//   | 'manage-users'
//   | 'view-users'
//   | 'edit-users'
//   | 'delete-users'
//   // Analytics & Reports
//   | 'view-analytics'
//   | 'export-data'
//   | 'generate-reports'
//   | 'view-reports'
//   // System Administration
//   | 'system-logs'
//   | 'user-manual'
//   | 'system-settings'
//   // Business Features
//   | 'products'
//   | 'reports'
//   | 'orders'
//   | 'inventory'
//   | 'revenue'
//   | 'conversion'
//   // Dashboard & Profile
//   | 'dashboard'
//   | 'profile'
//   | 'settings'
//   // Team Management
//   | 'team-dashboard'
//   // File Management
//   | 'file-upload'
//   | 'file-download'
//   | 'file-share'
//   | 'file-delete'
//   | 'file-manage'
//   // CRM Permissions
//   | 'crm-view'
//   | 'crm-customers'
//   | 'crm-leads'
//   | 'crm-tasks'
//   | 'crm-calendar'
//   | 'customer-create'
//   | 'customer-edit'
//   | 'customer-delete'
//   | 'customer-view'
//   | 'lead-create'
//   | 'lead-edit'
//   | 'lead-delete'
//   | 'lead-convert'
//   | 'task-create'
//   | 'task-edit'
//   | 'task-complete'
//   | 'task-assign'
//   | 'appointment-create'
//   | 'appointment-edit'
//   | 'appointment-cancel'
//   // Email & Notifications
//   | 'email-compose'
//   | 'email-send'
//   | 'email-delete'
//   | 'email-inbox'
//   | 'notifications-manage'
//   | 'notifications-view'
//   // Pages Access
//   | 'pages-access'
//   | 'signin-page'
//   | 'change-password'
//   | 'forgot-password'
//   | 'user-profile-page'
//   | 'timeline-page'
//   | 'not-found-page'
//   // Components Access
//   | 'components-view'
//   | 'forms-access'
//   | 'alerts-access'
//   | 'cards-access'
//   | 'tables-access'
//   | 'buttons-access'
//   | 'loaders-access'
//   | 'accordion-access'
//   | 'autocomplete-access'
//   | 'chips-access'
//   | 'select-access'
//   | 'multiselect-tree-access'
//   | 'calendar-access'
//   | 'file-uploads-access'
//   | 'drag-drop-access'
//   | 'grids-access'
//   | 'modal-popup-access'
//   | 'headers-access'
//   | 'footers-access'
//   | 'sliders-access'
//   | 'carousel-sliders-access'
//   | 'gallery-access'
//   | 'portfolio-access'
//   | 'editors-access';

// export interface AuthUser {
//   id: string;
//   email: string;
//   name: string;
//   role: UserRole;
//   permissions: Permission[];
// }

// const DUMMY_USERS: AuthUser[] = [
//   {
//     id: '1',
//     email: 'admin@company.com',
//     name: 'Admin User',
//     role: 'admin',
//     permissions: [
//       // Full access to everything
//       'read',
//       'write',
//       'delete',
//       'create',
//       'manage-users',
//       'view-users',
//       'edit-users',
//       'delete-users',
//       'view-analytics',
//       'export-data',
//       'generate-reports',
//       'view-reports',
//       'system-logs',
//       'user-manual',
//       'system-settings',
//       'products',
//       'reports',
//       'orders',
//       'inventory',
//       'revenue',
//       'conversion',
//       'dashboard',
//       'team-dashboard',
//       'profile',
//       'settings',
//       'file-upload',
//       'file-download',
//       'file-share',
//       'file-delete',
//       'file-manage',
//       'crm-view',
//       'crm-customers',
//       'crm-leads',
//       'crm-tasks',
//       'crm-calendar',
//       'customer-create',
//       'customer-edit',
//       'customer-delete',
//       'customer-view',
//       'lead-create',
//       'lead-edit',
//       'lead-delete',
//       'lead-convert',
//       'task-create',
//       'task-edit',
//       'task-complete',
//       'task-assign',
//       'appointment-create',
//       'appointment-edit',
//       'appointment-cancel',
//       'email-compose',
//       'email-send',
//       'email-delete',
//       'email-inbox',
//       'notifications-manage',
//       'notifications-view',
//       'pages-access',
//       'signin-page',
//       'change-password',
//       'forgot-password',
//       'user-profile-page',
//       'timeline-page',
//       'not-found-page',
//       'components-view',
//       'forms-access',
//       'alerts-access',
//       'cards-access',
//       'tables-access',
//       'buttons-access',
//       'loaders-access',
//       'accordion-access',
//       'autocomplete-access',
//       'chips-access',
//       'select-access',
//       'multiselect-tree-access',
//       'calendar-access',
//       'file-uploads-access',
//       'drag-drop-access',
//       'grids-access',
//       'modal-popup-access',
//       'headers-access',
//       'footers-access',
//       'sliders-access',
//       'carousel-sliders-access',
//       'gallery-access',
//       'portfolio-access',
//       'editors-access',
//     ],
//   },
//   {
//     id: '2',
//     email: 'editor@company.com',
//     name: 'Editor User',
//     role: 'editor',
//     permissions: [
//       // Business operations access (no admin-only features)
//       'read',
//       'write',
//       'create',
//       'view-users',
//       'view-analytics',
//       'export-data',
//       'generate-reports',
//       'view-reports',
//       'products',
//       'reports',
//       'orders',
//       'inventory',
//       'revenue',
//       'conversion',
//       'dashboard',
//       'profile',
//       'settings',
//       'file-upload',
//       'file-download',
//       'file-share',
//       'file-manage',
//       'crm-view',
//       'crm-customers',
//       'crm-leads',
//       'crm-tasks',
//       'customer-create',
//       'customer-edit',
//       'customer-view',
//       'lead-create',
//       'lead-edit',
//       'lead-convert',
//       'task-create',
//       'task-edit',
//       'task-complete',
//       'appointment-create',
//       'appointment-edit',
//       'email-compose',
//       'email-send',
//       'email-inbox',
//       'notifications-view',
//       'pages-access',
//       'signin-page',
//       'change-password',
//       'forgot-password',
//       'user-profile-page',
//       'timeline-page',
//       'not-found-page',
//       'components-view',
//       'forms-access',
//       'alerts-access',
//       'cards-access',
//       'tables-access',
//       'buttons-access',
//       'loaders-access',
//       'accordion-access',
//       'autocomplete-access',
//       'chips-access',
//       'select-access',
//       'multiselect-tree-access',
//       'calendar-access',
//       'file-uploads-access',
//       'drag-drop-access',
//       'grids-access',
//       'modal-popup-access',
//       'headers-access',
//       'footers-access',
//       'sliders-access',
//       'carousel-sliders-access',
//       'gallery-access',
//       'portfolio-access',
//       'editors-access',
//     ],
//   },
//   {
//     id: '3',
//     email: 'viewer@company.com',
//     name: 'Viewer User',
//     role: 'viewer',
//     permissions: [
//       // Read-only access (no write/edit/delete permissions)
//       'read',
//       'dashboard',
//       'profile',
//       'view-analytics',
//       'view-reports',
//       'file-download',
//       'crm-view',
//       'customer-view',
//       'notifications-view',
//       'pages-access',
//       'signin-page',
//       'change-password',
//       'forgot-password',
//       'user-profile-page',
//       'timeline-page',
//       'not-found-page',
//       'components-view',
//       'alerts-access',
//       'cards-access',
//       'tables-access',
//       'buttons-access',
//       'loaders-access',
//       'accordion-access',
//       'autocomplete-access',
//       'chips-access',
//       'select-access',
//       'multiselect-tree-access',
//       'calendar-access',
//       'grids-access',
//       'headers-access',
//       'footers-access',
//       'sliders-access',
//       'carousel-sliders-access',
//       'gallery-access',
//       'portfolio-access',
//     ],
//   },
// ];

// @Injectable({
//   providedIn: 'root',
// })
// export class AuthService {
//   private router = inject(Router);

//   private currentUser = signal<AuthUser | null>(null);
//   private isAuthenticated = signal(false);

//   user = this.currentUser.asReadonly();
//   authenticated = this.isAuthenticated.asReadonly();

//   userRole = computed(() => this.currentUser()?.role || null);
//   userPermissions = computed(() => this.currentUser()?.permissions || []);

//   constructor() {
//     this.loadUserFromStorage();
//   }

//   login(email: string, password: string, rememberMe: boolean = false): boolean {
//     const user = this.authenticateUser(email, password);

//     if (user) {
//       this.currentUser.set(user);
//       this.isAuthenticated.set(true);

//       try {
//         if (rememberMe) {
//           localStorage.setItem('auth-user', JSON.stringify(user));
//           localStorage.setItem('remember-me', 'true');
//         } else {
//           sessionStorage.setItem('auth-user', JSON.stringify(user));
//           localStorage.removeItem('remember-me');
//         }
//       } catch (error) {
//         console.error('Error saving user to storage:', error);
//       }

//       this.router.navigate(['/dashboard']);
//       return true;
//     }

//     return false;
//   }

//   logout(): void {
//     this.currentUser.set(null);
//     this.isAuthenticated.set(false);

//     try {
//       localStorage.removeItem('auth-user');
//       sessionStorage.removeItem('auth-user');
//       localStorage.removeItem('remember-me');
//     } catch (error) {
//       console.error('Error clearing storage during logout:', error);
//     }

//     this.router.navigate(['/login']);
//   }

//   hasRole(role: UserRole): boolean {
//     return this.userRole() === role;
//   }

//   hasPermission(permission: Permission): boolean {
//     return this.userPermissions().includes(permission);
//   }

//   hasAnyRole(roles: UserRole[]): boolean {
//     const currentRole = this.userRole();
//     return currentRole ? roles.includes(currentRole) : false;
//   }

//   private loadUserFromStorage(): void {
//     try {
//       // Check localStorage first (remember me)
//       let stored = localStorage.getItem('auth-user');

//       // If not found, check sessionStorage (current session)
//       if (!stored) {
//         stored = sessionStorage.getItem('auth-user');
//       }

//       if (stored) {
//         const user = JSON.parse(stored) as AuthUser;
//         // Validate user object structure
//         if (user && user.id && user.email && user.role) {
//           this.currentUser.set(user);
//           this.isAuthenticated.set(true);
//         } else {
//           // Clear invalid data
//           this.clearStoredAuth();
//         }
//       }
//     } catch (error) {
//       console.error('Error loading user from storage:', error);
//       this.clearStoredAuth();
//     }
//   }

//   private clearStoredAuth(): void {
//     try {
//       localStorage.removeItem('auth-user');
//       sessionStorage.removeItem('auth-user');
//       localStorage.removeItem('remember-me');
//     } catch (error) {
//       console.error('Error clearing stored auth data:', error);
//     }
//   }

//   private authenticateUser(email: string, password: string): AuthUser | null {
//     if (password === 'password123') {
//       return DUMMY_USERS.find((user) => user.email === email) || null;
//     }
//     return null;
//   }
// }

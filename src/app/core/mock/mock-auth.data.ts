/**
 * src/app/core/mock/mock-auth.data.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * TESTING PHASE ONLY
 *
 * This file mirrors the exact JSON shape that your Spring Boot backend
 * will return from  GET /api/auth/me  once Keycloak is wired up.
 *
 * When the backend is ready:
 *   1. Set  MOCK_AUTH = 'false'  in  src/assets/env.js
 *   2. Delete this file
 *   3. AuthService will automatically switch to the real HTTP call
 *
 * Backend contract (what Spring Boot must return):
 * ─────────────────────────────────────────────────
 * GET /api/auth/me
 * Authorization: Bearer <keycloak-jwt>
 *
 * Response 200:
 * {
 *   "id":          "uuid-from-keycloak-sub",
 *   "email":       "user@company.com",
 *   "name":        "Full Name",
 *   "role":        "admin" | "editor" | "viewer",
 *   "permissions": ["read", "write", "dashboard", ...]
 * }
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { AuthUser } from '../services/auth.service';

export const MOCK_USER_PROFILES: Record<string, AuthUser> = {

  // ── Simulate login as admin ───────────────────────────────────────────────
  'admin@company.com': {
    id:    'mock-id-001',
    email: 'admin@company.com',
    name:  'Admin User',
    role:  'admin',
    permissions: [
      'read', 'write', 'delete', 'create',
      'manage-users', 'view-users', 'edit-users', 'delete-users',
      'view-analytics', 'export-data', 'generate-reports', 'view-reports',
      'system-logs', 'user-manual', 'system-settings',
      'products', 'reports', 'orders', 'inventory', 'revenue', 'conversion',
      'dashboard', 'profile', 'settings',
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
      'editors-access',
    ],
  },

  // ── Simulate login as editor ──────────────────────────────────────────────
  'editor@company.com': {
    id:    'mock-id-002',
    email: 'editor@company.com',
    name:  'Editor User',
    role:  'editor',
    permissions: [
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
      'editors-access',
    ],
  },

  // ── Simulate login as viewer ──────────────────────────────────────────────
  'viewer@company.com': {
    id:    'mock-id-003',
    email: 'viewer@company.com',
    name:  'Viewer User',
    role:  'viewer',
    permissions: [
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
    ],
  },
};

/**
 * During mock mode the login component lets the user pick a profile.
 * This list drives the "Demo Accounts" buttons — same as your original UI.
 */
export const MOCK_LOGIN_ACCOUNTS = [
  { email: 'admin@company.com',  role: 'Admin'  },
  { email: 'editor@company.com', role: 'Editor' },
  { email: 'viewer@company.com', role: 'Viewer' },
];
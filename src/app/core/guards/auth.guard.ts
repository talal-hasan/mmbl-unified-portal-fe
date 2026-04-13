/**
 * src/app/core/guards/auth.guard.ts
 *
 * keycloak-angular v20: inject Keycloak directly, no KeycloakService.
 */

import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import Keycloak from 'keycloak-js';
import { AuthService, UserRole } from '../services/auth.service';
import { environment } from '../../../environments/environment';

export const authGuard: CanActivateFn = async (route, state) => {
  const authService = inject(AuthService);
  const router      = inject(Router);

  // ── MOCK MODE ──────────────────────────────────────────────────────────────
  if (environment.mockAuth) {
    if (authService.authenticated()) return true;
    router.navigate(['/login']);
    return false;
  }

  // ── LIVE MODE ──────────────────────────────────────────────────────────────
  const keycloak = inject(Keycloak);

  if (keycloak.authenticated) return true;

  await keycloak.login({
    redirectUri: window.location.origin + state.url,
  });
  return false;
};

/**
 * Inline role guard factory — backward compatible with existing routes
 * that use  canActivate: [roleGuard(['admin'])]
 */
export const roleGuard = (allowedRoles: UserRole[]): CanActivateFn => {
  return async (route, state) => {
    const authService = inject(AuthService);
    const router      = inject(Router);

    if (!authService.authenticated()) {
      if (environment.mockAuth) {
        router.navigate(['/login']);
      } else {
        await inject(Keycloak).login({
          redirectUri: window.location.origin + state.url,
        });
      }
      return false;
    }

    if (!authService.hasAnyRole(allowedRoles)) {
      router.navigate(['/dashboard']);
      return false;
    }

    return true;
  };
};

// import { inject } from '@angular/core';
// import { Router } from '@angular/router';
// import { CanActivateFn } from '@angular/router';
// import { AuthService, UserRole } from '../services/auth.service';

// export const authGuard: CanActivateFn = (route, state) => {
//   const authService = inject(AuthService);
//   const router = inject(Router);

//   if (!authService.authenticated()) {
//     router.navigate(['/login']);
//     return false;
//   }

//   return true;
// };

// export const roleGuard = (allowedRoles: UserRole[]): CanActivateFn => {
//   return (route, state) => {
//     const authService = inject(AuthService);
//     const router = inject(Router);

//     if (!authService.authenticated()) {
//       router.navigate(['/login']);
//       return false;
//     }

//     const userRole = authService.userRole();
//     if (!userRole || !allowedRoles.includes(userRole)) {
//       router.navigate(['/dashboard']);
//       return false;
//     }

//     return true;
//   };
// };

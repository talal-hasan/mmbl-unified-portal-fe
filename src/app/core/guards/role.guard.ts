/**
 * src/app/core/guards/role.guard.ts
 * Data-driven: data: { roles: ['admin', 'editor'] }
 */

import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import Keycloak from 'keycloak-js';
import { AuthService, UserRole } from '../services/auth.service';
import { environment } from '../../../environments/environment';

export const roleGuard: CanActivateFn = async (route, state) => {
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

  const requiredRoles = route.data?.['roles'] as UserRole[] | undefined;
  if (!requiredRoles || requiredRoles.length === 0) return true;
  if (authService.hasAnyRole(requiredRoles)) return true;

  router.navigate(['/dashboard']);
  return false;
};

// import { inject } from '@angular/core';
// import { CanActivateFn, Router } from '@angular/router';
// import { AuthService, UserRole } from '../services/auth.service';

// export const roleGuard: CanActivateFn = (route, state) => {
//   const authService = inject(AuthService);
//   const router = inject(Router);

//   const requiredRoles = route.data?.['roles'] as UserRole[];

//   if (!authService.authenticated()) {
//     router.navigate(['/login']);
//     return false;
//   }

//   if (requiredRoles && !authService.hasAnyRole(requiredRoles)) {
//     router.navigate(['/dashboard']);
//     return false;
//   }

//   return true;
// };

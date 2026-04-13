/**
 * src/app/core/guards/permission.guard.ts
 * Data-driven: data: { permission: 'manage-users' }
 */

import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import Keycloak from 'keycloak-js';
import { AuthService, Permission } from '../services/auth.service';
import { environment } from '../../../environments/environment';

export const permissionGuard: CanActivateFn = async (route, state) => {
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

  const requiredPermission = route.data?.['permission'] as Permission | undefined;
  if (!requiredPermission) return true;
  if (authService.hasPermission(requiredPermission)) return true;

  router.navigate(['/dashboard']);
  return false;
};

// import { inject } from '@angular/core';
// import { CanActivateFn, Router } from '@angular/router';
// import { AuthService, Permission } from '../services/auth.service';

// export const permissionGuard: CanActivateFn = (route, state) => {
//   const authService = inject(AuthService);
//   const router = inject(Router);

//   const requiredPermission = route.data?.['permission'] as Permission;

//   if (!authService.authenticated()) {
//     router.navigate(['/login']);
//     return false;
//   }

//   if (requiredPermission && !authService.hasPermission(requiredPermission)) {
//     router.navigate(['/dashboard']);
//     return false;
//   }

//   return true;
// };

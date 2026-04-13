/**
 * src/app/core/interceptors/auth.interceptor.ts
 *
 * keycloak-angular v20: inject Keycloak directly from 'keycloak-js'
 * instead of KeycloakService.
 */

import { inject } from '@angular/core';
import { HttpInterceptorFn, HttpRequest, HttpHandlerFn } from '@angular/common/http';
import { from, switchMap, catchError, throwError } from 'rxjs';
import Keycloak from 'keycloak-js';
import { environment } from '../../../environments/environment';

export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
) => {
  const isApiCall =
    req.url.startsWith(environment.apiUrl) ||
    req.url.startsWith('/api');

  if (!isApiCall) {
    return next(req);
  }

  // ── MOCK MODE ──────────────────────────────────────────────────────────────
  if (environment.mockAuth) {
    return next(
      req.clone({ setHeaders: { Authorization: 'Bearer mock-token' } })
    );
  }

  // ── LIVE MODE ──────────────────────────────────────────────────────────────
  const keycloak = inject(Keycloak);

  if (!keycloak.authenticated) {
    return next(req);
  }

  // updateToken refreshes silently if token is about to expire
  return from(keycloak.updateToken(30)).pipe(
    switchMap(() => {
      const authReq = req.clone({
        setHeaders: { Authorization: `Bearer ${keycloak.token}` },
      });
      return next(authReq);
    }),
    catchError(err => {
      keycloak.login();
      return throwError(() => err);
    })
  );
};
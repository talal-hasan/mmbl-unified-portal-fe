import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
  isDevMode,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideServiceWorker } from '@angular/service-worker';
import { provideKeycloak } from 'keycloak-angular';

import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptors';
import { keycloakConfig, keycloakInitOptions } from './core/keycloak/keycloak.factory';
import { environment } from '../environments/environment';

// Keycloak only initialized in live mode
// Mock mode: no Keycloak server needed
const keycloakProviders = environment.mockAuth
  ? []
  : [
      provideKeycloak({
        config:      keycloakConfig,
        initOptions: keycloakInitOptions,
      }),
    ];

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes),
    provideAnimationsAsync(),
    provideHttpClient(withInterceptors([authInterceptor])),

    // Restores SwUpdate provider so PwaService keeps working
    // isDevMode() = true during ng serve → service worker OFF locally
    // isDevMode() = false in prod build → service worker ON
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000',
    }),

    ...keycloakProviders,
  ],
};

// import {
//   ApplicationConfig,
//   provideBrowserGlobalErrorListeners,
//   provideZonelessChangeDetection,
//   isDevMode,
// } from '@angular/core';
// import { provideRouter } from '@angular/router';

// import { routes } from './app.routes';
// import { provideHttpClient } from '@angular/common/http';
// import { provideServiceWorker } from '@angular/service-worker';

// export const appConfig: ApplicationConfig = {
//   providers: [
//     provideBrowserGlobalErrorListeners(),
//     provideZonelessChangeDetection(),
//     provideRouter(routes),
//     provideHttpClient(),
//     provideServiceWorker('ngsw-worker.js', {
//       enabled: !isDevMode(),
//       registrationStrategy: 'registerWhenStable:30000',
//     }),
//   ],
// };

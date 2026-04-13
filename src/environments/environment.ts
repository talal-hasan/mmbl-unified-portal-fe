/**
 * ─────────────────────────────────────────────────────────────────────────────
 * ENVIRONMENT CONFIGURATION  —  src/environments/environment.ts
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * URLs are NEVER hardcoded in the Angular bundle.
 * They are injected at runtime via  src/assets/env.js
 * which is loaded in index.html BEFORE the Angular bundle runs.
 *
 * ── Local development ────────────────────────────────────────────────────────
 * Create  src/assets/env.js  (add this file to .gitignore):
 *
 *   (function (window) {
 *     window.__env = {
 *       KEYCLOAK_URL:    'http://localhost:8080',
 *       KEYCLOAK_REALM:  'mmbl-realm',
 *       KEYCLOAK_CLIENT: 'mmbl-angular',
 *       API_URL:         'http://localhost:8081/api',
 *       MOCK_AUTH:       'true',    // ← 'false' once Keycloak is live
 *     };
 *   }(window));
 *
 * ── Docker / CI/CD ───────────────────────────────────────────────────────────
 * In your entrypoint.sh (runs before nginx starts), generate env.js
 * from real OS environment variables:
 *
 *   #!/bin/sh
 *   cat > /usr/share/nginx/html/assets/env.js <<EOF
 *   (function(window){ window.__env = {
 *     KEYCLOAK_URL:    '${KEYCLOAK_URL}',
 *     KEYCLOAK_REALM:  '${KEYCLOAK_REALM}',
 *     KEYCLOAK_CLIENT: '${KEYCLOAK_CLIENT}',
 *     API_URL:         '${API_URL}',
 *     MOCK_AUTH:       '${MOCK_AUTH}',
 *   }; }(window));
 *   EOF
 *   exec nginx -g 'daemon off;'
 *
 * Then in docker-compose.yml / Kubernetes set:
 *   environment:
 *     KEYCLOAK_URL:    http://keycloak:8080
 *     KEYCLOAK_REALM:  mmbl-realm
 *     KEYCLOAK_CLIENT: mmbl-angular
 *     API_URL:         http://springboot-api:8081/api
 *     MOCK_AUTH:       "false"
 * ─────────────────────────────────────────────────────────────────────────────
 */

declare global {
  interface Window {
    __env?: {
      KEYCLOAK_URL?:    string;
      KEYCLOAK_REALM?:  string;
      KEYCLOAK_CLIENT?: string;
      API_URL?:         string;
      MOCK_AUTH?:       string;  // 'true' | 'false'
    };
  }
}

/** Reads from window.__env first; falls back to the compile-time default. */
function env(key: keyof NonNullable<Window['__env']>, fallback: string): string {
  return window.__env?.[key] ?? fallback;
}

export const environment = {
  production: false,

  keycloak: {
    url:      env('KEYCLOAK_URL',    'http://localhost:8080'),
    realm:    env('KEYCLOAK_REALM',  'mmbl-realm'),
    clientId: env('KEYCLOAK_CLIENT', 'mmbl-angular'),
  },

  apiUrl: env('API_URL', 'http://localhost:8081/api'),

  /**
   * Toggle this flag to switch between mock data and live Keycloak.
   *   true  → app uses MOCK_USER_PROFILES (no Keycloak server needed)
   *   false → app reads the real JWT returned by Keycloak PKCE flow
   */
  mockAuth: env('MOCK_AUTH', 'true') === 'true',
};
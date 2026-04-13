import { KeycloakConfig, KeycloakInitOptions } from 'keycloak-js';
import { environment } from '../../../environments/environment';

export const keycloakConfig: KeycloakConfig = {
  url:      environment.keycloak.url,
  realm:    environment.keycloak.realm,
  clientId: environment.keycloak.clientId,
};

export const keycloakInitOptions: KeycloakInitOptions = {
  flow:              'standard',   // Authorization Code Flow + PKCE
  pkceMethod:        'S256',
  onLoad:            'check-sso',
  checkLoginIframe:  false,        // disables iframe → fixes CSP error
};
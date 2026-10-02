export const environment = {
  production: true,
  apiCoreUrl: 'http://localhost:8080/api/v1',
  apiIdentityUrl: 'http://localhost:8081/api/v1',
  // Authentification locale (HS256, voir core/auth) : utilisee tant que le
  // User Pool Cognito n'est pas deploye (voir infra/dev/identity dans
  // immotran-ms-identity). Les deux backends doivent tourner avec le
  // profil Spring "local" pour accepter ces jetons -- jamais en production.
  useMockAuth: true,
  mockAuthSharedSecret: 'local-dev-only-shared-secret-please-change-0123456789',
};

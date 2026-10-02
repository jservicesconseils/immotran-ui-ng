immotran-ui-ng — frontend Angular de la plateforme Immotran

Rôle dans l'architecture
Application Angular 21 (standalone, PrimeNG 21) consommant les deux services backend :
- immotran-ms-identity (organisations/authentification) — http://localhost:8081
- immotran-ms-core (propriétés, unités, propriétaires, locataires, baux, finance, maintenance, documents, dashboard, règles) — http://localhost:8080

Authentification locale (sans Cognito)
Aucun User Pool Cognito n'est encore déployé (voir infra/bootstrap et infra/dev/identity dans immotran-ms-identity). En attendant, ce frontend génère lui-même un jeton JWT HS256 signé avec un secret partagé (voir src/environments/environment.ts, `mockAuthSharedSecret`) et les deux backends doivent tourner avec le profil Spring `local` (`--spring.profiles.active=local`) pour l'accepter — voir SecurityConfig.localJwtDecoder dans chaque service.

Remplacer src/app/core/auth/auth.service.ts par un vrai flux OIDC/Cognito (ex. oidc-client-ts) est le travail restant avant la mise en production ; l'interface publique (session(), token(), login(), logout()) ne devrait pas changer pour les composants qui la consomment.

Démarrer en local
1. immotran-ms-identity : `mvn spring-boot:run -Dspring-boot.run.profiles=local` (port 8081)
2. immotran-ms-core : `mvn spring-boot:run -Dspring-boot.run.profiles=local` (port 8080)
3. Ce frontend : `npm install` puis `npm start` (port 4200)

Thème
Préréglage PrimeNG personnalisé (voir src/app/core/theme/immotran-preset.ts) : primaire indigo, surfaces ardoise (slate) — palette professionnelle cohérente avec un produit de gestion financière/immobilière. Les icônes (PrimeIcons) sont systématiquement affichées dans un encadré teinté avec bordure (classe utilitaire `.icon-box`, voir src/styles.scss), jamais nues.

Modules couverts
- Tableau de bord : indicateurs clés + graphiques (occupation en donut, revenus/dépenses en barres) via p-chart/Chart.js, alimentés par GET /organizations/{id}/dashboard.
- Propriétés : liste, création, détail à onglets (Unités, Propriétaires, Finances, Maintenance, Documents).
- Unité : informations, historique des baux, création de bail (locataires multiples via multiselect).
- Bail : échéancier de loyer, enregistrement de paiement (complet ou partiel).
- Propriétaires / Locataires : listes et création, indépendantes d'une propriété précise.
- Règles juridictionnelles (admin) : catalogue filtrable par province, création d'une règle (donnée partagée, pas de contrôle de tenant).

Tests
`npm test` (vitest, via @angular/build:unit-test — le runner par défaut d'Angular 21). Couvre tous les services HTTP (core/services), le service et le guard d'authentification (core/auth), avec `HttpClientTestingModule`/`provideHttpClientTesting`.

Limites connues (volontaires, voir aussi les README des deux backends)
- Pas de vrai téléversement de documents (S3) : seules les métadonnées sont enregistrées.
- Pas de RBAC : tous les utilisateurs authentifiés ont les mêmes droits dans l'UI (les rôles ne sont pas encore modélisés côté immotran-ms-identity).
- Le catalogue de règles juridictionnelles est une structure vide à remplir, pas un contenu réel par province.

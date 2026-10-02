/** Claims pertinents extraits du jeton JWT courant (voir TenantClaims cote backend). */
export interface Session {
  organizationId: string;
  organizationName: string;
  displayName: string;
  actorId: string;
}

/** "Tenant" = locataire (vocabulaire du cahier des charges), a ne pas confondre avec le tenant SaaS (organisation). */
export interface TenantResponse {
  id: string;
  organizationId: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  createdAt: string;
}

export interface CreateTenantRequest {
  organizationId: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
}

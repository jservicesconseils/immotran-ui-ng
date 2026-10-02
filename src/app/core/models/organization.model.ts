export interface OrganizationResponse {
  id: string;
  name: string;
  createdAt: string;
}

export interface CreateOrganizationRequest {
  name: string;
}

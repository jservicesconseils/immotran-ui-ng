export type OwnerType = 'PARTICULIER' | 'SOCIETE';

export interface OwnerResponse {
  id: string;
  organizationId: string;
  type: OwnerType;
  name: string;
  email: string | null;
  phone: string | null;
  createdAt: string;
}

export interface CreateOwnerRequest {
  organizationId: string;
  type: OwnerType;
  name: string;
  email: string | null;
  phone: string | null;
}

export interface AttachOwnerRequest {
  ownerId: string;
  sharePercentage: number;
}

export interface PropertyOwnerResponse {
  id: string;
  propertyId: string;
  ownerId: string;
  ownerName: string;
  sharePercentage: number;
  createdAt: string;
}

export const OWNER_TYPE_LABELS: Record<string, string> = {
  PARTICULIER: 'Particulier',
  SOCIETE: 'Société',
};

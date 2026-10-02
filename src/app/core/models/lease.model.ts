export type LeaseStatus = 'ACTIVE' | 'RENOUVELE' | 'RESILIE' | 'EXPIRE';

export interface LeaseResponse {
  id: string;
  propertyId: string;
  unitId: string;
  tenantIds: string[];
  startDate: string;
  endDate: string | null;
  monthlyRent: number;
  securityDeposit: number;
  securityDepositPaidAt: string | null;
  status: LeaseStatus;
  createdAt: string;
}

export interface CreateLeaseRequest {
  tenantIds: string[];
  startDate: string;
  endDate: string | null;
  monthlyRent: number;
  securityDeposit: number;
}

export const LEASE_STATUS_LABELS: Record<string, string> = {
  ACTIVE: 'Actif',
  RENOUVELE: 'Renouvelé',
  RESILIE: 'Résilié',
  EXPIRE: 'Expiré',
};

export const LEASE_STATUS_SEVERITY: Record<string, 'success' | 'info' | 'danger' | 'secondary'> = {
  ACTIVE: 'success',
  RENOUVELE: 'info',
  RESILIE: 'danger',
  EXPIRE: 'secondary',
};

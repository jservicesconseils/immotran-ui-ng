export type MaintenancePriority = 'BASSE' | 'NORMALE' | 'HAUTE' | 'URGENTE';
export type MaintenanceStatus = 'OUVERTE' | 'EN_COURS' | 'TERMINEE' | 'ANNULEE';

export interface MaintenanceRequestResponse {
  id: string;
  propertyId: string;
  unitId: string | null;
  description: string;
  priority: MaintenancePriority;
  status: MaintenanceStatus;
  vendorName: string | null;
  cost: number | null;
  createdAt: string;
  closedAt: string | null;
}

export interface CreateMaintenanceRequestRequest {
  unitId: string | null;
  description: string;
  priority: MaintenancePriority;
}

export interface CloseMaintenanceRequestRequest {
  vendorName: string | null;
  cost: number | null;
}

export const MAINTENANCE_PRIORITY_LABELS: Record<string, string> = {
  BASSE: 'Basse',
  NORMALE: 'Normale',
  HAUTE: 'Haute',
  URGENTE: 'Urgente',
};

export const MAINTENANCE_PRIORITY_SEVERITY: Record<string, 'secondary' | 'info' | 'warn' | 'danger'> = {
  BASSE: 'secondary',
  NORMALE: 'info',
  HAUTE: 'warn',
  URGENTE: 'danger',
};

export const MAINTENANCE_STATUS_LABELS: Record<string, string> = {
  OUVERTE: 'Ouverte',
  EN_COURS: 'En cours',
  TERMINEE: 'Terminée',
  ANNULEE: 'Annulée',
};

export const MAINTENANCE_STATUS_SEVERITY: Record<string, 'warn' | 'info' | 'success' | 'secondary'> = {
  OUVERTE: 'warn',
  EN_COURS: 'info',
  TERMINEE: 'success',
  ANNULEE: 'secondary',
};

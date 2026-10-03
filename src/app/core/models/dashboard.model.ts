import { ApplicationStatus } from './application.model';

export interface RecentApplicationResponse {
  id: string;
  propertyId: string;
  unitId: string;
  firstName: string;
  lastName: string;
  unitLabel: string;
  status: ApplicationStatus;
  submittedAt: string;
}

export interface DashboardResponse {
  organizationId: string;
  totalProperties: number;
  totalUnits: number;
  occupiedUnits: number;
  vacantUnits: number;
  openMaintenanceRequests: number;
  totalRevenue: number;
  totalExpenses: number;
  leasesExpiringNext30Days: number;
  openApplications: number;
  recentApplications: RecentApplicationResponse[];
}

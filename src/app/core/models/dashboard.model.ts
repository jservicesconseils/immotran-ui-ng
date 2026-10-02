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
}

export type PropertyType =
  | 'MAISON_INDIVIDUELLE'
  | 'CONDO'
  | 'DUPLEX'
  | 'TRIPLEX'
  | 'QUADRUPLEX'
  | 'IMMEUBLE_MULTI_UNITES'
  | 'MAISON_AVEC_LOGEMENT_SECONDAIRE';

export type PropertyStatus = 'VACANTE' | 'OCCUPEE' | 'EN_MAINTENANCE' | 'HORS_MARCHE' | 'ARCHIVEE';

export type UnitStatus = 'DISPONIBLE' | 'OCCUPEE' | 'EN_MAINTENANCE';

export interface PropertyResponse {
  id: string;
  organizationId: string;
  type: PropertyType;
  street: string;
  city: string;
  province: string;
  postalCode: string;
  status: PropertyStatus;
  createdAt: string;
}

export interface CreatePropertyRequest {
  organizationId: string;
  type: PropertyType;
  street: string;
  city: string;
  province: string;
  postalCode: string;
}

export interface UnitResponse {
  id: string;
  propertyId: string;
  label: string;
  principal: boolean;
  floor: number | null;
  areaSquareMeters: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  status: UnitStatus;
  createdAt: string;
}

export interface CreateUnitRequest {
  label: string;
  principal: boolean;
  floor: number | null;
  areaSquareMeters: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
}

export const PROPERTY_TYPE_LABELS: Record<string, string> = {
  MAISON_INDIVIDUELLE: 'Maison individuelle',
  CONDO: 'Condo',
  DUPLEX: 'Duplex',
  TRIPLEX: 'Triplex',
  QUADRUPLEX: 'Quadruplex',
  IMMEUBLE_MULTI_UNITES: 'Immeuble multi-unités',
  MAISON_AVEC_LOGEMENT_SECONDAIRE: 'Maison avec logement secondaire',
};

export const PROPERTY_STATUS_LABELS: Record<string, string> = {
  VACANTE: 'Vacante',
  OCCUPEE: 'Occupée',
  EN_MAINTENANCE: 'En maintenance',
  HORS_MARCHE: 'Hors marché',
  ARCHIVEE: 'Archivée',
};

export const PROPERTY_STATUS_SEVERITY: Record<string, 'success' | 'warn' | 'danger' | 'secondary' | 'info'> = {
  VACANTE: 'warn',
  OCCUPEE: 'success',
  EN_MAINTENANCE: 'info',
  HORS_MARCHE: 'secondary',
  ARCHIVEE: 'secondary',
};

export const UNIT_STATUS_LABELS: Record<string, string> = {
  DISPONIBLE: 'Disponible',
  OCCUPEE: 'Occupée',
  EN_MAINTENANCE: 'En maintenance',
};

export const UNIT_STATUS_SEVERITY: Record<string, 'success' | 'warn' | 'info'> = {
  DISPONIBLE: 'warn',
  OCCUPEE: 'success',
  EN_MAINTENANCE: 'info',
};

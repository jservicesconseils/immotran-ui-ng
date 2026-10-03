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

export type BuildingStatus = 'NEUF' | 'RENOVE' | 'A_RENOVER';

export type UnitType = 'STUDIO' | 'UNE_CHAMBRE' | 'DEUX_CHAMBRES' | 'TROIS_CHAMBRES' | 'QUATRE_CHAMBRES_PLUS';

export interface PropertyResponse {
  id: string;
  organizationId: string;
  type: PropertyType;
  street: string;
  city: string;
  province: string;
  postalCode: string;
  status: PropertyStatus;
  cadastreNumber: string | null;
  taxId: string | null;
  buildingStatus: BuildingStatus | null;
  yearBuilt: number | null;
  floorCount: number | null;
  totalSurfaceArea: number | null;
  estimatedValue: number | null;
  description: string | null;
  createdAt: string;
}

export interface CreatePropertyRequest {
  organizationId: string;
  type: PropertyType;
  street: string;
  city: string;
  province: string;
  postalCode: string;
  cadastreNumber: string | null;
  taxId: string | null;
  buildingStatus: BuildingStatus | null;
  yearBuilt: number | null;
  floorCount: number | null;
  totalSurfaceArea: number | null;
  estimatedValue: number | null;
  description: string | null;
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
  type: UnitType | null;
  description: string | null;
  listedRent: number | null;
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
  type: UnitType | null;
  description: string | null;
  listedRent: number | null;
}

/**
 * Vue publique minimale d'une unite (annonce), consultable sans jeton
 * par un candidat avant qu'il postule -- voir
 * PropertyController.getUnitListing cote backend.
 */
export interface UnitListingResponse {
  propertyId: string;
  unitId: string;
  unitLabel: string;
  type: UnitType | null;
  bedrooms: number | null;
  bathrooms: number | null;
  areaSquareMeters: number | null;
  listedRent: number | null;
  propertyStreet: string;
  propertyCity: string;
  propertyProvince: string;
  status: UnitStatus;
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

export const BUILDING_STATUS_LABELS: Record<string, string> = {
  NEUF: 'Neuf',
  RENOVE: 'Rénové',
  A_RENOVER: 'À rénover',
};

export const UNIT_TYPE_LABELS: Record<string, string> = {
  STUDIO: 'Studio',
  UNE_CHAMBRE: '1 chambre',
  DEUX_CHAMBRES: '2 chambres',
  TROIS_CHAMBRES: '3 chambres',
  QUATRE_CHAMBRES_PLUS: '4 chambres et plus',
};

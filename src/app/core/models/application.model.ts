export type ApplicationStatus = 'EN_ATTENTE_VERIFICATION' | 'EN_EVALUATION' | 'EN_ATTENTE_INFO' | 'ACCEPTEE' | 'REFUSEE';

export interface ReferenceRequest {
  name: string;
  phone: string | null;
  email: string | null;
}

export interface ReferenceResponse {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
}

export interface SubmitApplicationRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  employerName: string | null;
  monthlyIncome: number | null;
  dateOfBirth: string | null;
  currentAddress: string | null;
  socialInsuranceNumber: string | null;
  profession: string | null;
  references: ReferenceRequest[];
}

export interface ApplicationResponse {
  id: string;
  propertyId: string;
  unitId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  employerName: string | null;
  monthlyIncome: number | null;
  dateOfBirth: string | null;
  currentAddress: string | null;
  socialInsuranceNumber: string | null;
  profession: string | null;
  status: ApplicationStatus;
  solvencyScore: number | null;
  reviewComments: string | null;
  decisionReason: string | null;
  references: ReferenceResponse[];
  submittedAt: string;
  decidedAt: string | null;
}

export interface ReviewApplicationRequest {
  solvencyScore: number | null;
  reviewComments: string | null;
}

export interface RequestAdditionalInfoRequest {
  reviewComments: string;
}

export interface DecideApplicationRequest {
  accepted: boolean;
  decisionReason: string | null;
}

/**
 * Vue publique minimale consultable par le candidat lui-meme (espace
 * locataire), par id de candidature seul -- voir
 * ApplicationService.getPublicStatus cote backend. Ne contient jamais
 * solvencyScore ni reviewComments (reserves au personnel).
 */
export interface TenantApplicationStatusResponse {
  id: string;
  firstName: string;
  lastName: string;
  status: ApplicationStatus;
  unitLabel: string;
  propertyStreet: string;
  propertyCity: string;
  propertyProvince: string;
  monthlyRent: number | null;
  submittedAt: string;
  decidedAt: string | null;
}

export const APPLICATION_STATUS_LABELS: Record<string, string> = {
  EN_ATTENTE_VERIFICATION: 'En attente de vérification',
  EN_EVALUATION: 'En évaluation',
  EN_ATTENTE_INFO: 'Information manquante',
  ACCEPTEE: 'Acceptée',
  REFUSEE: 'Refusée',
};

export const APPLICATION_STATUS_SEVERITY: Record<string, 'success' | 'warn' | 'danger' | 'secondary' | 'info'> = {
  EN_ATTENTE_VERIFICATION: 'info',
  EN_EVALUATION: 'warn',
  EN_ATTENTE_INFO: 'secondary',
  ACCEPTEE: 'success',
  REFUSEE: 'danger',
};

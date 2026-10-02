export type DocumentType = 'BAIL' | 'ETAT_DES_LIEUX' | 'FACTURE' | 'ASSURANCE' | 'INSPECTION' | 'AUTRE';

export interface DocumentResponse {
  id: string;
  organizationId: string;
  entityType: string;
  entityId: string;
  type: DocumentType;
  fileName: string;
  s3Key: string;
  uploadedAt: string;
}

export interface CreateDocumentRequest {
  organizationId: string;
  entityType: string;
  entityId: string;
  type: DocumentType;
  fileName: string;
  s3Key: string;
}

export const DOCUMENT_TYPE_LABELS: Record<string, string> = {
  BAIL: 'Bail',
  ETAT_DES_LIEUX: 'État des lieux',
  FACTURE: 'Facture',
  ASSURANCE: 'Assurance',
  INSPECTION: 'Inspection',
  AUTRE: 'Autre',
};

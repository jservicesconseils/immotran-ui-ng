export type PaymentStatus = 'DUE' | 'PARTIAL' | 'PAID';
export type TransactionType = 'REVENU' | 'DEPENSE';
export type TransactionCategory =
  | 'LOYER'
  | 'ASSURANCE'
  | 'ENTRETIEN'
  | 'REPARATION'
  | 'SERVICES_PUBLICS'
  | 'TAXES'
  | 'COPROPRIETE'
  | 'AUTRE';

export interface PaymentResponse {
  id: string;
  leaseId: string;
  dueDate: string;
  amountDue: number;
  amountPaid: number;
  paidAt: string | null;
  status: PaymentStatus;
  createdAt: string;
}

export interface CreatePaymentRequest {
  dueDate: string;
  amountDue: number;
}

export interface RecordPaymentRequest {
  amountPaid: number;
  paidAt: string | null;
}

export interface TransactionResponse {
  id: string;
  propertyId: string;
  type: TransactionType;
  category: TransactionCategory;
  amount: number;
  description: string | null;
  transactionDate: string;
  createdAt: string;
}

export interface CreateTransactionRequest {
  type: TransactionType;
  category: TransactionCategory;
  amount: number;
  description: string | null;
  transactionDate: string;
}

export const PAYMENT_STATUS_LABELS: Record<string, string> = {
  DUE: 'À percevoir',
  PARTIAL: 'Partiel',
  PAID: 'Payé',
};

export const PAYMENT_STATUS_SEVERITY: Record<string, 'warn' | 'info' | 'success'> = {
  DUE: 'warn',
  PARTIAL: 'info',
  PAID: 'success',
};

export const TRANSACTION_CATEGORY_LABELS: Record<string, string> = {
  LOYER: 'Loyer',
  ASSURANCE: 'Assurance',
  ENTRETIEN: 'Entretien',
  REPARATION: 'Réparation',
  SERVICES_PUBLICS: 'Services publics',
  TAXES: 'Taxes',
  COPROPRIETE: 'Copropriété',
  AUTRE: 'Autre',
};

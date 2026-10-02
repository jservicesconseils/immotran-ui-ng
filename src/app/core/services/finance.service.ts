import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  CreatePaymentRequest,
  CreateTransactionRequest,
  PaymentResponse,
  RecordPaymentRequest,
  TransactionResponse,
} from '../models/finance.model';

@Injectable({ providedIn: 'root' })
export class FinanceService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiCoreUrl;

  private paymentsUrl(propertyId: string, unitId: string, leaseId: string): string {
    return `${this.baseUrl}/properties/${propertyId}/units/${unitId}/leases/${leaseId}/payments`;
  }

  createPayment(propertyId: string, unitId: string, leaseId: string, request: CreatePaymentRequest): Observable<PaymentResponse> {
    return this.http.post<PaymentResponse>(this.paymentsUrl(propertyId, unitId, leaseId), request);
  }

  recordPayment(
    propertyId: string,
    unitId: string,
    leaseId: string,
    paymentId: string,
    request: RecordPaymentRequest,
  ): Observable<PaymentResponse> {
    return this.http.post<PaymentResponse>(`${this.paymentsUrl(propertyId, unitId, leaseId)}/${paymentId}/record`, request);
  }

  listPayments(propertyId: string, unitId: string, leaseId: string): Observable<PaymentResponse[]> {
    return this.http.get<PaymentResponse[]>(this.paymentsUrl(propertyId, unitId, leaseId));
  }

  createTransaction(propertyId: string, request: CreateTransactionRequest): Observable<TransactionResponse> {
    return this.http.post<TransactionResponse>(`${this.baseUrl}/properties/${propertyId}/transactions`, request);
  }

  listTransactions(propertyId: string): Observable<TransactionResponse[]> {
    return this.http.get<TransactionResponse[]>(`${this.baseUrl}/properties/${propertyId}/transactions`);
  }
}

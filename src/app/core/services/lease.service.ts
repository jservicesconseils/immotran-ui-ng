import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CreateLeaseRequest, LeaseResponse } from '../models/lease.model';

@Injectable({ providedIn: 'root' })
export class LeaseService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiCoreUrl;

  private leasesUrl(propertyId: string, unitId: string): string {
    return `${this.baseUrl}/properties/${propertyId}/units/${unitId}/leases`;
  }

  create(propertyId: string, unitId: string, request: CreateLeaseRequest): Observable<LeaseResponse> {
    return this.http.post<LeaseResponse>(this.leasesUrl(propertyId, unitId), request);
  }

  getById(propertyId: string, unitId: string, leaseId: string): Observable<LeaseResponse> {
    return this.http.get<LeaseResponse>(`${this.leasesUrl(propertyId, unitId)}/${leaseId}`);
  }

  list(propertyId: string, unitId: string): Observable<LeaseResponse[]> {
    return this.http.get<LeaseResponse[]>(this.leasesUrl(propertyId, unitId));
  }

  recordSecurityDepositPayment(propertyId: string, unitId: string, leaseId: string): Observable<LeaseResponse> {
    return this.http.put<LeaseResponse>(`${this.leasesUrl(propertyId, unitId)}/${leaseId}/depot-garantie`, {});
  }
}

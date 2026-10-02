import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CreateTenantRequest, TenantResponse } from '../models/tenant.model';

@Injectable({ providedIn: 'root' })
export class TenantService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiCoreUrl}/tenants`;

  create(request: CreateTenantRequest): Observable<TenantResponse> {
    return this.http.post<TenantResponse>(this.baseUrl, request);
  }

  getById(id: string): Observable<TenantResponse> {
    return this.http.get<TenantResponse>(`${this.baseUrl}/${id}`);
  }

  listByOrganization(organizationId: string): Observable<TenantResponse[]> {
    const params = new HttpParams().set('organizationId', organizationId);
    return this.http.get<TenantResponse[]>(this.baseUrl, { params });
  }
}

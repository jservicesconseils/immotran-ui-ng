import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuditLogResponse, CreateJurisdictionRuleRequest, JurisdictionRuleResponse } from '../models/admin.model';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiCoreUrl;

  createJurisdictionRule(request: CreateJurisdictionRuleRequest): Observable<JurisdictionRuleResponse> {
    return this.http.post<JurisdictionRuleResponse>(`${this.baseUrl}/admin/jurisdiction-rules`, request);
  }

  listJurisdictionRulesByProvince(province: string): Observable<JurisdictionRuleResponse[]> {
    const params = new HttpParams().set('province', province);
    return this.http.get<JurisdictionRuleResponse[]>(`${this.baseUrl}/admin/jurisdiction-rules`, { params });
  }

  listAuditLogs(organizationId: string): Observable<AuditLogResponse[]> {
    return this.http.get<AuditLogResponse[]>(`${this.baseUrl}/organizations/${organizationId}/audit-logs`);
  }
}

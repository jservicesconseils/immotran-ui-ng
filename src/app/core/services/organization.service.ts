import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CreateOrganizationRequest, OrganizationResponse } from '../models/organization.model';

@Injectable({ providedIn: 'root' })
export class OrganizationService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiIdentityUrl}/organizations`;

  create(request: CreateOrganizationRequest): Observable<OrganizationResponse> {
    return this.http.post<OrganizationResponse>(this.baseUrl, request);
  }

  getById(id: string): Observable<OrganizationResponse> {
    return this.http.get<OrganizationResponse>(`${this.baseUrl}/${id}`);
  }
}

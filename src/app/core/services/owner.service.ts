import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AttachOwnerRequest, CreateOwnerRequest, OwnerResponse, PropertyOwnerResponse } from '../models/owner.model';

@Injectable({ providedIn: 'root' })
export class OwnerService {
  private readonly http = inject(HttpClient);
  private readonly ownersUrl = `${environment.apiCoreUrl}/owners`;
  private readonly propertiesUrl = `${environment.apiCoreUrl}/properties`;

  create(request: CreateOwnerRequest): Observable<OwnerResponse> {
    return this.http.post<OwnerResponse>(this.ownersUrl, request);
  }

  getById(id: string): Observable<OwnerResponse> {
    return this.http.get<OwnerResponse>(`${this.ownersUrl}/${id}`);
  }

  listByOrganization(organizationId: string): Observable<OwnerResponse[]> {
    const params = new HttpParams().set('organizationId', organizationId);
    return this.http.get<OwnerResponse[]>(this.ownersUrl, { params });
  }

  attachToProperty(propertyId: string, request: AttachOwnerRequest): Observable<PropertyOwnerResponse> {
    return this.http.post<PropertyOwnerResponse>(`${this.propertiesUrl}/${propertyId}/owners`, request);
  }

  listForProperty(propertyId: string): Observable<PropertyOwnerResponse[]> {
    return this.http.get<PropertyOwnerResponse[]>(`${this.propertiesUrl}/${propertyId}/owners`);
  }
}

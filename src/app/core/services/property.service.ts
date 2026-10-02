import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CreatePropertyRequest, CreateUnitRequest, PropertyResponse, UnitResponse } from '../models/property.model';

@Injectable({ providedIn: 'root' })
export class PropertyService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiCoreUrl}/properties`;

  create(request: CreatePropertyRequest): Observable<PropertyResponse> {
    return this.http.post<PropertyResponse>(this.baseUrl, request);
  }

  getById(id: string): Observable<PropertyResponse> {
    return this.http.get<PropertyResponse>(`${this.baseUrl}/${id}`);
  }

  listByOrganization(organizationId: string): Observable<PropertyResponse[]> {
    const params = new HttpParams().set('organizationId', organizationId);
    return this.http.get<PropertyResponse[]>(this.baseUrl, { params });
  }

  createUnit(propertyId: string, request: CreateUnitRequest): Observable<UnitResponse> {
    return this.http.post<UnitResponse>(`${this.baseUrl}/${propertyId}/units`, request);
  }

  getUnit(propertyId: string, unitId: string): Observable<UnitResponse> {
    return this.http.get<UnitResponse>(`${this.baseUrl}/${propertyId}/units/${unitId}`);
  }

  listUnits(propertyId: string): Observable<UnitResponse[]> {
    return this.http.get<UnitResponse[]>(`${this.baseUrl}/${propertyId}/units`);
  }
}

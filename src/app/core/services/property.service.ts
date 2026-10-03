import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  CreatePropertyRequest,
  CreateUnitRequest,
  PropertyResponse,
  UnitListingResponse,
  UnitResponse,
  UpdatePropertyRequest,
  UpdateUnitRequest,
} from '../models/property.model';

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

  update(id: string, request: UpdatePropertyRequest): Observable<PropertyResponse> {
    return this.http.put<PropertyResponse>(`${this.baseUrl}/${id}`, request);
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

  updateUnit(propertyId: string, unitId: string, request: UpdateUnitRequest): Observable<UnitResponse> {
    return this.http.put<UnitResponse>(`${this.baseUrl}/${propertyId}/units/${unitId}`, request);
  }

  listUnits(propertyId: string): Observable<UnitResponse[]> {
    return this.http.get<UnitResponse[]>(`${this.baseUrl}/${propertyId}/units`);
  }

  // Public (voir SecurityConfig cote backend) : annonce consultable sans
  // jeton, utilisee par le formulaire public de candidature.
  getUnitListing(propertyId: string, unitId: string): Observable<UnitListingResponse> {
    return this.http.get<UnitListingResponse>(`${this.baseUrl}/${propertyId}/units/${unitId}/listing`);
  }
}

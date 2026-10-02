import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  CloseMaintenanceRequestRequest,
  CreateMaintenanceRequestRequest,
  MaintenanceRequestResponse,
} from '../models/maintenance.model';

@Injectable({ providedIn: 'root' })
export class MaintenanceService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiCoreUrl;

  private requestsUrl(propertyId: string): string {
    return `${this.baseUrl}/properties/${propertyId}/maintenance-requests`;
  }

  create(propertyId: string, request: CreateMaintenanceRequestRequest): Observable<MaintenanceRequestResponse> {
    return this.http.post<MaintenanceRequestResponse>(this.requestsUrl(propertyId), request);
  }

  close(propertyId: string, id: string, request: CloseMaintenanceRequestRequest): Observable<MaintenanceRequestResponse> {
    return this.http.post<MaintenanceRequestResponse>(`${this.requestsUrl(propertyId)}/${id}/close`, request);
  }

  list(propertyId: string): Observable<MaintenanceRequestResponse[]> {
    return this.http.get<MaintenanceRequestResponse[]>(this.requestsUrl(propertyId));
  }
}

import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  ApplicationResponse,
  DecideApplicationRequest,
  RequestAdditionalInfoRequest,
  ReviewApplicationRequest,
  SubmitApplicationRequest,
  TenantApplicationStatusResponse,
} from '../models/application.model';

@Injectable({ providedIn: 'root' })
export class ApplicationService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiCoreUrl;

  private applicationsUrl(propertyId: string, unitId: string): string {
    return `${this.baseUrl}/properties/${propertyId}/units/${unitId}/applications`;
  }

  // Endpoint public cote backend (aucun jeton envoye) : un candidat a la
  // location n'a pas de compte. L'interceptor d'auth ajoute quand meme le
  // jeton s'il y en a un en session, mais le backend ne l'exige pas ici.
  submit(propertyId: string, unitId: string, request: SubmitApplicationRequest): Observable<ApplicationResponse> {
    return this.http.post<ApplicationResponse>(this.applicationsUrl(propertyId, unitId), request);
  }

  getById(propertyId: string, unitId: string, applicationId: string): Observable<ApplicationResponse> {
    return this.http.get<ApplicationResponse>(`${this.applicationsUrl(propertyId, unitId)}/${applicationId}`);
  }

  list(propertyId: string, unitId: string): Observable<ApplicationResponse[]> {
    return this.http.get<ApplicationResponse[]>(this.applicationsUrl(propertyId, unitId));
  }

  review(propertyId: string, unitId: string, applicationId: string, request: ReviewApplicationRequest): Observable<ApplicationResponse> {
    return this.http.put<ApplicationResponse>(`${this.applicationsUrl(propertyId, unitId)}/${applicationId}/evaluation`, request);
  }

  requestAdditionalInfo(
    propertyId: string,
    unitId: string,
    applicationId: string,
    request: RequestAdditionalInfoRequest,
  ): Observable<ApplicationResponse> {
    return this.http.put<ApplicationResponse>(
      `${this.applicationsUrl(propertyId, unitId)}/${applicationId}/demande-information`,
      request,
    );
  }

  decide(propertyId: string, unitId: string, applicationId: string, request: DecideApplicationRequest): Observable<ApplicationResponse> {
    return this.http.put<ApplicationResponse>(`${this.applicationsUrl(propertyId, unitId)}/${applicationId}/decision`, request);
  }

  // Suivi public (espace locataire, voir ApplicationPublicStatusController) :
  // le candidat consulte sa propre candidature par le seul id, sans jeton.
  getPublicStatus(applicationId: string): Observable<TenantApplicationStatusResponse> {
    return this.http.get<TenantApplicationStatusResponse>(`${this.baseUrl}/applications/${applicationId}/status`);
  }
}

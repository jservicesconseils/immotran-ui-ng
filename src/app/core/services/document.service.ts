import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CreateDocumentRequest, DocumentResponse } from '../models/document.model';

@Injectable({ providedIn: 'root' })
export class DocumentService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiCoreUrl}/documents`;

  create(request: CreateDocumentRequest): Observable<DocumentResponse> {
    return this.http.post<DocumentResponse>(this.baseUrl, request);
  }

  listForEntity(organizationId: string, entityType: string, entityId: string): Observable<DocumentResponse[]> {
    const params = new HttpParams().set('organizationId', organizationId).set('entityType', entityType).set('entityId', entityId);
    return this.http.get<DocumentResponse[]>(this.baseUrl, { params });
  }
}

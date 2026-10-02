import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { DocumentService } from './document.service';
import { environment } from '../../../environments/environment';

describe('DocumentService', () => {
  let service: DocumentService;
  let httpMock: HttpTestingController;
  const baseUrl = `${environment.apiCoreUrl}/documents`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(DocumentService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('creerUnDocument_posteVersDocuments', () => {
    service
      .create({ organizationId: 'org-1', entityType: 'LEASE', entityId: 'l-1', type: 'BAIL', fileName: 'bail.pdf', s3Key: 'key' })
      .subscribe();

    const req = httpMock.expectOne(baseUrl);
    expect(req.request.method).toBe('POST');
    req.flush({});
  });

  it('listerLesDocuments_envoieLesTroisParametres', () => {
    service.listForEntity('org-1', 'LEASE', 'l-1').subscribe((result) => expect(result).toEqual([]));

    const req = httpMock.expectOne(
      (r) => r.url === baseUrl && r.params.get('organizationId') === 'org-1' && r.params.get('entityType') === 'LEASE' && r.params.get('entityId') === 'l-1',
    );
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });
});

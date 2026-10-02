import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { OrganizationService } from './organization.service';
import { environment } from '../../../environments/environment';

describe('OrganizationService', () => {
  let service: OrganizationService;
  let httpMock: HttpTestingController;
  const baseUrl = `${environment.apiIdentityUrl}/organizations`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(OrganizationService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('creerUneOrganisation_posteVersIdentity', () => {
    service.create({ name: 'ABC Immobilier inc.' }).subscribe();

    const req = httpMock.expectOne(baseUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ name: 'ABC Immobilier inc.' });
    req.flush({});
  });

  it('lireUneOrganisation_appelleGetAvecId', () => {
    service.getById('org-1').subscribe();

    const req = httpMock.expectOne(`${baseUrl}/org-1`);
    expect(req.request.method).toBe('GET');
    req.flush({});
  });
});

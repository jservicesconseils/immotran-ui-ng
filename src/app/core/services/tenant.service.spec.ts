import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { TenantService } from './tenant.service';
import { environment } from '../../../environments/environment';

describe('TenantService', () => {
  let service: TenantService;
  let httpMock: HttpTestingController;
  const baseUrl = `${environment.apiCoreUrl}/tenants`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(TenantService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('creerUnLocataire_posteVersTenants', () => {
    service.create({ organizationId: 'org-1', firstName: 'Marie', lastName: 'Gagnon', email: null, phone: null }).subscribe();

    const req = httpMock.expectOne(baseUrl);
    expect(req.request.method).toBe('POST');
    req.flush({});
  });

  it('lireUnLocataire_appelleGetAvecId', () => {
    service.getById('t-1').subscribe();

    const req = httpMock.expectOne(`${baseUrl}/t-1`);
    expect(req.request.method).toBe('GET');
    req.flush({});
  });

  it('listerParOrganisation_envoieLeParametreOrganizationId', () => {
    service.listByOrganization('org-1').subscribe((result) => expect(result).toEqual([]));

    const req = httpMock.expectOne((r) => r.url === baseUrl && r.params.get('organizationId') === 'org-1');
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });
});

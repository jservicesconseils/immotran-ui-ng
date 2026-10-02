import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { OwnerService } from './owner.service';
import { environment } from '../../../environments/environment';
import { PropertyOwnerResponse } from '../models/owner.model';

describe('OwnerService', () => {
  let service: OwnerService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(OwnerService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('creerUnProprietaire_posteVersOwners', () => {
    service.create({ organizationId: 'org-1', type: 'PARTICULIER', name: 'Jean Tremblay', email: null, phone: null }).subscribe();

    const req = httpMock.expectOne(`${environment.apiCoreUrl}/owners`);
    expect(req.request.method).toBe('POST');
    req.flush({});
  });

  it('associerUnProprietaire_posteSousLaPropriete', () => {
    const response: PropertyOwnerResponse = {
      id: 'po-1',
      propertyId: 'p-1',
      ownerId: 'o-1',
      ownerName: 'Jean Tremblay',
      sharePercentage: 100,
      createdAt: '2026-01-01T00:00:00Z',
    };

    service.attachToProperty('p-1', { ownerId: 'o-1', sharePercentage: 100 }).subscribe((result) => expect(result).toEqual(response));

    const req = httpMock.expectOne(`${environment.apiCoreUrl}/properties/p-1/owners`);
    expect(req.request.method).toBe('POST');
    req.flush(response);
  });

  it('listerLesProprietaires_appelleLeBonChemin', () => {
    service.listForProperty('p-1').subscribe((result) => expect(result).toEqual([]));

    const req = httpMock.expectOne(`${environment.apiCoreUrl}/properties/p-1/owners`);
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('listerParOrganisation_envoieLeParametreOrganizationId', () => {
    service.listByOrganization('org-1').subscribe((result) => expect(result).toEqual([]));

    const req = httpMock.expectOne((r) => r.url === `${environment.apiCoreUrl}/owners` && r.params.get('organizationId') === 'org-1');
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });
});

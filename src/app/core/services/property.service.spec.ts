import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { PropertyService } from './property.service';
import { environment } from '../../../environments/environment';
import {
  CreatePropertyRequest,
  CreateUnitRequest,
  PropertyResponse,
  UnitResponse,
  UpdatePropertyRequest,
  UpdateUnitRequest,
} from '../models/property.model';

describe('PropertyService', () => {
  let service: PropertyService;
  let httpMock: HttpTestingController;
  const baseUrl = `${environment.apiCoreUrl}/properties`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(PropertyService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('creerUnePropriete_envoieUnPostVersLeBonEndpoint', () => {
    const request: CreatePropertyRequest = {
      organizationId: 'org-1',
      type: 'MAISON_INDIVIDUELLE',
      name: null,
      street: '123 rue des Lilas',
      city: 'Montreal',
      province: 'QC',
      postalCode: 'H1A 1A1',
      cadastreNumber: null,
      taxId: null,
      buildingStatus: null,
      yearBuilt: null,
      floorCount: null,
      totalSurfaceArea: null,
      estimatedValue: null,
      description: null,
    };
    const response: PropertyResponse = { id: 'p-1', ...request, status: 'VACANTE', createdAt: '2026-01-01T00:00:00Z' };

    service.create(request).subscribe((result) => expect(result).toEqual(response));

    const req = httpMock.expectOne(baseUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(request);
    req.flush(response);
  });

  it('lireUnePropriete_appelleGetAvecId', () => {
    const response: PropertyResponse = {
      id: 'p-1',
      organizationId: 'org-1',
      type: 'CONDO',
      name: null,
      street: '1 rue Principale',
      city: 'Quebec',
      province: 'QC',
      postalCode: 'G1A 1A1',
      status: 'OCCUPEE',
      cadastreNumber: null,
      taxId: null,
      buildingStatus: null,
      yearBuilt: null,
      floorCount: null,
      totalSurfaceArea: null,
      estimatedValue: null,
      description: null,
      createdAt: '2026-01-01T00:00:00Z',
    };

    service.getById('p-1').subscribe((result) => expect(result).toEqual(response));

    const req = httpMock.expectOne(`${baseUrl}/p-1`);
    expect(req.request.method).toBe('GET');
    req.flush(response);
  });

  it('modifierUnePropriete_envoieUnPutVersLeBonEndpoint', () => {
    const request: UpdatePropertyRequest = {
      type: 'MAISON_INDIVIDUELLE',
      name: null,
      street: '123 rue des Lilas',
      city: 'Montreal',
      province: 'QC',
      postalCode: 'H1A 1A1',
      cadastreNumber: null,
      taxId: null,
      buildingStatus: null,
      yearBuilt: null,
      floorCount: null,
      totalSurfaceArea: null,
      estimatedValue: null,
      description: null,
    };
    const response: PropertyResponse = { id: 'p-1', organizationId: 'org-1', ...request, status: 'VACANTE', createdAt: '2026-01-01T00:00:00Z' };

    service.update('p-1', request).subscribe((result) => expect(result).toEqual(response));

    const req = httpMock.expectOne(`${baseUrl}/p-1`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(request);
    req.flush(response);
  });

  it('creerUneUnite_posteSurLeSousChemin', () => {
    const request: CreateUnitRequest = {
      label: 'Principal',
      principal: true,
      floor: null,
      areaSquareMeters: null,
      bedrooms: 3,
      bathrooms: 1,
      type: null,
      description: null,
      listedRent: null,
      listedSecurityDeposit: null,
      status: null,
    };
    const response: UnitResponse = { id: 'u-1', propertyId: 'p-1', ...request, status: 'DISPONIBLE', createdAt: '2026-01-01T00:00:00Z' };

    service.createUnit('p-1', request).subscribe((result) => expect(result).toEqual(response));

    const req = httpMock.expectOne(`${baseUrl}/p-1/units`);
    expect(req.request.method).toBe('POST');
    req.flush(response);
  });

  it('modifierUneUnite_envoieUnPutSurLeSousChemin', () => {
    const request: UpdateUnitRequest = {
      label: '304',
      floor: 3,
      areaSquareMeters: 55.5,
      bedrooms: 2,
      bathrooms: 1,
      type: null,
      description: null,
      listedRent: null,
      listedSecurityDeposit: null,
    };
    const response: UnitResponse = {
      id: 'u-1',
      propertyId: 'p-1',
      ...request,
      principal: false,
      status: 'DISPONIBLE',
      createdAt: '2026-01-01T00:00:00Z',
    };

    service.updateUnit('p-1', 'u-1', request).subscribe((result) => expect(result).toEqual(response));

    const req = httpMock.expectOne(`${baseUrl}/p-1/units/u-1`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(request);
    req.flush(response);
  });

  it('listerLesUnites_appelleLaListeDuSousChemin', () => {
    service.listUnits('p-1').subscribe((result) => expect(result).toEqual([]));

    const req = httpMock.expectOne(`${baseUrl}/p-1/units`);
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('listerParOrganisation_envoieLeParametreOrganizationId', () => {
    service.listByOrganization('org-1').subscribe((result) => expect(result).toEqual([]));

    const req = httpMock.expectOne((r) => r.url === baseUrl && r.params.get('organizationId') === 'org-1');
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('consulterLAnnonceDUneUnite_appelleLeChminPublic', () => {
    service.getUnitListing('p-1', 'u-1').subscribe();

    const req = httpMock.expectOne(`${baseUrl}/p-1/units/u-1/listing`);
    expect(req.request.method).toBe('GET');
    req.flush({});
  });
});

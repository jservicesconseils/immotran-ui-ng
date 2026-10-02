import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { MaintenanceService } from './maintenance.service';
import { environment } from '../../../environments/environment';

describe('MaintenanceService', () => {
  let service: MaintenanceService;
  let httpMock: HttpTestingController;
  const baseUrl = `${environment.apiCoreUrl}/properties/p-1/maintenance-requests`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(MaintenanceService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('creerUneDemande_posteSurLeBonChemin', () => {
    service.create('p-1', { unitId: null, description: 'Fuite', priority: 'NORMALE' }).subscribe();

    const req = httpMock.expectOne(baseUrl);
    expect(req.request.method).toBe('POST');
    req.flush({});
  });

  it('cloturerUneDemande_posteSurClose', () => {
    service.close('p-1', 'm-1', { vendorName: 'Plomberie ABC', cost: 150 }).subscribe();

    const req = httpMock.expectOne(`${baseUrl}/m-1/close`);
    expect(req.request.method).toBe('POST');
    req.flush({});
  });

  it('listerLesDemandes_appelleLeBonChemin', () => {
    service.list('p-1').subscribe((result) => expect(result).toEqual([]));

    const req = httpMock.expectOne(baseUrl);
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });
});

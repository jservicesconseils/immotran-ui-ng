import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { LeaseService } from './lease.service';
import { environment } from '../../../environments/environment';

describe('LeaseService', () => {
  let service: LeaseService;
  let httpMock: HttpTestingController;
  const leasesUrl = `${environment.apiCoreUrl}/properties/p-1/units/u-1/leases`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(LeaseService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('creerUnBail_posteSurLeChminImbrique', () => {
    service.create('p-1', 'u-1', { tenantIds: ['t-1'], startDate: '2026-01-01', endDate: null, monthlyRent: 1500 }).subscribe();

    const req = httpMock.expectOne(leasesUrl);
    expect(req.request.method).toBe('POST');
    req.flush({});
  });

  it('lireUnBail_appelleGetAvecLeasesId', () => {
    service.getById('p-1', 'u-1', 'l-1').subscribe();

    const req = httpMock.expectOne(`${leasesUrl}/l-1`);
    expect(req.request.method).toBe('GET');
    req.flush({});
  });

  it('listerLesBaux_appelleLeChminImbrique', () => {
    service.list('p-1', 'u-1').subscribe((result) => expect(result).toEqual([]));

    const req = httpMock.expectOne(leasesUrl);
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });
});

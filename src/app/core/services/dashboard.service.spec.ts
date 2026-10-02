import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { DashboardService } from './dashboard.service';
import { environment } from '../../../environments/environment';
import { DashboardResponse } from '../models/dashboard.model';

describe('DashboardService', () => {
  let service: DashboardService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(DashboardService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('lireLeDashboard_appelleLeBonChemin', () => {
    const response: DashboardResponse = {
      organizationId: 'org-1',
      totalProperties: 5,
      totalUnits: 12,
      occupiedUnits: 9,
      vacantUnits: 3,
      openMaintenanceRequests: 2,
      totalRevenue: 18000,
      totalExpenses: 3200,
      leasesExpiringNext30Days: 1,
    };

    service.getForOrganization('org-1').subscribe((result) => expect(result).toEqual(response));

    const req = httpMock.expectOne(`${environment.apiCoreUrl}/organizations/org-1/dashboard`);
    expect(req.request.method).toBe('GET');
    req.flush(response);
  });
});

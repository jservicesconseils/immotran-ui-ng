import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { AdminService } from './admin.service';
import { environment } from '../../../environments/environment';

describe('AdminService', () => {
  let service: AdminService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(AdminService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('creerUneRegle_posteVersJurisdictionRules', () => {
    service
      .createJurisdictionRule({
        province: 'QC',
        ruleType: 'PREAVIS_RESILIATION',
        description: 'Preavis de 3 mois',
        effectiveDate: '2026-01-01',
        source: 'https://example.com',
        version: 1,
      })
      .subscribe();

    const req = httpMock.expectOne(`${environment.apiCoreUrl}/admin/jurisdiction-rules`);
    expect(req.request.method).toBe('POST');
    req.flush({});
  });

  it('listerLesRegles_envoieLeParametreProvince', () => {
    service.listJurisdictionRulesByProvince('QC').subscribe((result) => expect(result).toEqual([]));

    const req = httpMock.expectOne((r) => r.url === `${environment.apiCoreUrl}/admin/jurisdiction-rules` && r.params.get('province') === 'QC');
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('listerLesEntreesAudit_appelleLeBonChemin', () => {
    service.listAuditLogs('org-1').subscribe((result) => expect(result).toEqual([]));

    const req = httpMock.expectOne(`${environment.apiCoreUrl}/organizations/org-1/audit-logs`);
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });
});

import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { ApplicationService } from './application.service';
import { environment } from '../../../environments/environment';
import { SubmitApplicationRequest } from '../models/application.model';

describe('ApplicationService', () => {
  let service: ApplicationService;
  let httpMock: HttpTestingController;
  const applicationsUrl = `${environment.apiCoreUrl}/properties/p-1/units/u-1/applications`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(ApplicationService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('soumettreUneCandidature_posteSurLeChminImbrique', () => {
    const request: SubmitApplicationRequest = {
      firstName: 'Jean',
      lastName: 'Tremblay',
      email: 'jean@example.com',
      phone: '514-555-0100',
      employerName: null,
      monthlyIncome: null,
      references: [{ name: 'Marie Leblanc', phone: null, email: null }],
    };

    service.submit('p-1', 'u-1', request).subscribe();

    const req = httpMock.expectOne(applicationsUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(request);
    req.flush({});
  });

  it('lireUneCandidature_appelleGetAvecApplicationId', () => {
    service.getById('p-1', 'u-1', 'a-1').subscribe();

    const req = httpMock.expectOne(`${applicationsUrl}/a-1`);
    expect(req.request.method).toBe('GET');
    req.flush({});
  });

  it('listerLesCandidatures_appelleLeChminImbrique', () => {
    service.list('p-1', 'u-1').subscribe((result) => expect(result).toEqual([]));

    const req = httpMock.expectOne(applicationsUrl);
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('evaluerUneCandidature_appellePutSurLeChminEvaluation', () => {
    service.review('p-1', 'u-1', 'a-1', { solvencyScore: 80, reviewComments: null }).subscribe();

    const req = httpMock.expectOne(`${applicationsUrl}/a-1/evaluation`);
    expect(req.request.method).toBe('PUT');
    req.flush({});
  });

  it('demanderUneInformationComplementaire_appellePutSurLeChminDedie', () => {
    service.requestAdditionalInfo('p-1', 'u-1', 'a-1', { reviewComments: 'Preuve de revenu manquante' }).subscribe();

    const req = httpMock.expectOne(`${applicationsUrl}/a-1/demande-information`);
    expect(req.request.method).toBe('PUT');
    req.flush({});
  });

  it('deciderUneCandidature_appellePutSurLeChminDecision', () => {
    service.decide('p-1', 'u-1', 'a-1', { accepted: true, decisionReason: null }).subscribe();

    const req = httpMock.expectOne(`${applicationsUrl}/a-1/decision`);
    expect(req.request.method).toBe('PUT');
    req.flush({});
  });
});

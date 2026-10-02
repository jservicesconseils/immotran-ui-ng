import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { FinanceService } from './finance.service';
import { environment } from '../../../environments/environment';

describe('FinanceService', () => {
  let service: FinanceService;
  let httpMock: HttpTestingController;
  const paymentsUrl = `${environment.apiCoreUrl}/properties/p-1/units/u-1/leases/l-1/payments`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(FinanceService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('creerUneEcheance_posteSurLeChminDesPaiements', () => {
    service.createPayment('p-1', 'u-1', 'l-1', { dueDate: '2026-02-01', amountDue: 1500 }).subscribe();

    const req = httpMock.expectOne(paymentsUrl);
    expect(req.request.method).toBe('POST');
    req.flush({});
  });

  it('enregistrerUnPaiement_posteSurLeChminRecord', () => {
    service.recordPayment('p-1', 'u-1', 'l-1', 'pay-1', { amountPaid: 500, paidAt: null }).subscribe();

    const req = httpMock.expectOne(`${paymentsUrl}/pay-1/record`);
    expect(req.request.method).toBe('POST');
    req.flush({});
  });

  it('creerUneTransaction_posteSurLeChminDesTransactions', () => {
    service
      .createTransaction('p-1', { type: 'DEPENSE', category: 'ENTRETIEN', amount: 250, description: null, transactionDate: '2026-01-15' })
      .subscribe();

    const req = httpMock.expectOne(`${environment.apiCoreUrl}/properties/p-1/transactions`);
    expect(req.request.method).toBe('POST');
    req.flush({});
  });

  it('listerLesTransactions_appelleLeBonChemin', () => {
    service.listTransactions('p-1').subscribe((result) => expect(result).toEqual([]));

    const req = httpMock.expectOne(`${environment.apiCoreUrl}/properties/p-1/transactions`);
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });
});

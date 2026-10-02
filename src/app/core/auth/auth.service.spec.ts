import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(AuthService);
  });

  it('auDepart_sansSessionEnregistree_nestPasAuthentifie', () => {
    expect(service.isAuthenticated()).toBe(false);
    expect(service.session()).toBeNull();
  });

  it('login_enregistreLaSessionEtUnJeton', async () => {
    await service.login('org-1', 'ABC Immobilier inc.', 'Jean Tremblay');

    expect(service.isAuthenticated()).toBe(true);
    expect(service.session()).toEqual(
      expect.objectContaining({ organizationId: 'org-1', organizationName: 'ABC Immobilier inc.', displayName: 'Jean Tremblay' }),
    );
    expect(service.token()).toBeTruthy();
  });

  it('login_produitUnJetonJwtAvecLeClaimTenantId', async () => {
    await service.login('org-42', 'Org Test', 'Utilisateur Test');

    const token = service.token();
    expect(token).toBeTruthy();
    const payload = JSON.parse(atob(token!.split('.')[1]));
    expect(payload.tenant_id).toBe('org-42');
    expect(JSON.parse(payload.tenant_scope)).toEqual(['org-42']);
  });

  it('logout_effaceLaSessionEtLeJeton', async () => {
    await service.login('org-1', 'ABC Immobilier inc.', 'Jean Tremblay');

    service.logout();

    expect(service.isAuthenticated()).toBe(false);
    expect(service.session()).toBeNull();
    expect(service.token()).toBeNull();
  });

  it('login_persisteDansLeLocalStorage_etUneNouvelleInstanceLaRestaure', async () => {
    await service.login('org-1', 'ABC Immobilier inc.', 'Jean Tremblay');

    const restored = TestBed.inject(AuthService);
    // meme instance singleton dans ce TestBed, donc on simule une vraie
    // restauration en relisant le constructeur sur un module frais
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({});
    const freshService = TestBed.inject(AuthService);

    expect(freshService.isAuthenticated()).toBe(true);
    expect(freshService.session()?.organizationId).toBe('org-1');
  });
});

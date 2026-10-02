import { TestBed } from '@angular/core/testing';
import { Router, UrlTree } from '@angular/router';
import { provideRouter } from '@angular/router';
import { authGuard } from './auth.guard';
import { AuthService } from './auth.service';

describe('authGuard', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideRouter([])],
    });
  });

  function runGuard() {
    return TestBed.runInInjectionContext(() => authGuard({} as never, {} as never));
  }

  it('sansSession_redirigeVersLogin', () => {
    const result = runGuard();

    expect(result).toBeInstanceOf(UrlTree);
    expect((result as UrlTree).toString()).toBe('/login');
  });

  it('avecSession_autoriseLAcces', async () => {
    const auth = TestBed.inject(AuthService);
    await auth.login('org-1', 'ABC Immobilier inc.', 'Jean Tremblay');

    const result = runGuard();

    expect(result).toBe(true);
  });
});

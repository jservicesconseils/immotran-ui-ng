import { Injectable, computed, signal } from '@angular/core';
import { SignJWT } from 'jose';
import { environment } from '../../../environments/environment';
import { Session } from './session.model';

const STORAGE_KEY = 'immotran.session';
const TOKEN_KEY = 'immotran.token';

/**
 * Authentification locale (HS256) utilisee tant qu'aucun User Pool
 * Cognito n'est deploye pour immotran-ms-identity (voir infra/bootstrap
 * et infra/dev/identity dans ce repo). Les backends doivent tourner
 * avec le profil Spring "local", qui accepte un jeton signe avec le
 * MEME secret partage (voir environment.mockAuthSharedSecret) au lieu
 * de verifier une signature Cognito reelle.
 *
 * Remplacer cette implementation par un vrai flux OIDC/Cognito
 * (ex. amazon-cognito-identity-js ou oidc-client-ts) est le travail
 * restant pour la mise en production -- l'interface (session(), token(),
 * login(), logout()) ne devrait pas avoir a changer cote consommateurs.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly sessionSignal = signal<Session | null>(this.restoreSession());
  private readonly tokenSignal = signal<string | null>(localStorage.getItem(TOKEN_KEY));

  readonly session = computed(() => this.sessionSignal());
  readonly token = computed(() => this.tokenSignal());
  readonly isAuthenticated = computed(() => this.sessionSignal() !== null);

  async login(organizationId: string, organizationName: string, displayName: string): Promise<void> {
    const actorId = crypto.randomUUID();

    // jose (variante webapi, utilisee en navigateur/jsdom) exige une
    // CryptoKey Web Crypto -- un Uint8Array brut est refuse depuis la
    // v6. On importe donc explicitement la cle HMAC avant de signer.
    const keyMaterial = new TextEncoder().encode(environment.mockAuthSharedSecret);
    const secretKey = await crypto.subtle.importKey('raw', keyMaterial, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);

    const token = await new SignJWT({
      tenant_id: organizationId,
      tenant_scope: JSON.stringify([organizationId]),
      name: displayName,
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setSubject(actorId)
      .setIssuedAt()
      .setExpirationTime('12h')
      .sign(secretKey);

    const session: Session = { organizationId, organizationName, displayName, actorId };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    localStorage.setItem(TOKEN_KEY, token);
    this.sessionSignal.set(session);
    this.tokenSignal.set(token);
  }

  logout(): void {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(TOKEN_KEY);
    this.sessionSignal.set(null);
    this.tokenSignal.set(null);
  }

  private restoreSession(): Session | null {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }
    try {
      return JSON.parse(raw) as Session;
    } catch {
      return null;
    }
  }
}

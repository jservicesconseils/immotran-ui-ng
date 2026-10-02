import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, ButtonModule, InputTextModule, MessageModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly submitting = signal(false);

  readonly form = this.fb.nonNullable.group({
    organizationName: ['', [Validators.required, Validators.maxLength(200)]],
    displayName: ['', [Validators.required, Validators.maxLength(200)]],
  });

  async submit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    const { organizationName, displayName } = this.form.getRawValue();

    // Mode local (sans Cognito) : l'id d'organisation est derive du nom
    // pour rester stable d'une session a l'autre, tant qu'aucun vrai
    // compte Cognito/Organization n'existe. Voir AuthService.
    const organizationId = await this.deriveOrganizationId(organizationName);

    await this.auth.login(organizationId, organizationName, displayName);
    this.submitting.set(false);
    this.router.navigateByUrl('/dashboard');
  }

  private async deriveOrganizationId(organizationName: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(organizationName.trim().toLowerCase());
    const digest = await crypto.subtle.digest('SHA-256', data);
    const bytes = Array.from(new Uint8Array(digest)).slice(0, 16);

    // Formate les 16 premiers octets du hash en UUID (v4-like, suffisant
    // pour un identifiant stable et accepte par les champs UUID du backend).
    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;
    const hex = bytes.map((b) => b.toString(16).padStart(2, '0')).join('');
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
  }
}

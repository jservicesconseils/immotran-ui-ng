import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { MessageService, PrimeTemplate } from 'primeng/api';
import { AuthService } from '../../core/auth/auth.service';
import { TenantResponse } from '../../core/models/tenant.model';
import { TenantService } from '../../core/services/tenant.service';

@Component({
  selector: 'app-tenant-list',
  standalone: true,
  imports: [ReactiveFormsModule, ButtonModule, DialogModule, InputTextModule, TableModule, PrimeTemplate],
  templateUrl: './tenant-list.component.html',
  styleUrl: './tenant-list.component.scss',
})
export class TenantListComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly tenantService = inject(TenantService);
  private readonly messageService = inject(MessageService);

  readonly session = this.auth.session;
  readonly tenants = signal<TenantResponse[]>([]);
  readonly loading = signal(true);
  readonly dialogVisible = signal(false);
  readonly submitting = signal(false);

  readonly form = this.fb.nonNullable.group({
    firstName: ['', [Validators.required, Validators.maxLength(100)]],
    lastName: ['', [Validators.required, Validators.maxLength(100)]],
    email: this.fb.control<string | null>(null, [Validators.email, Validators.maxLength(200)]),
    phone: this.fb.control<string | null>(null, Validators.maxLength(20)),
  });

  constructor() {
    this.load();
  }

  load(): void {
    const organizationId = this.session()?.organizationId;
    if (!organizationId) {
      this.loading.set(false);
      return;
    }

    this.loading.set(true);
    this.tenantService.listByOrganization(organizationId).subscribe({
      next: (tenants) => {
        this.tenants.set(tenants);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Impossible de charger les locataires.' });
      },
    });
  }

  openDialog(): void {
    this.form.reset();
    this.dialogVisible.set(true);
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const organizationId = this.session()?.organizationId;
    if (!organizationId) {
      return;
    }

    const value = this.form.getRawValue();
    this.submitting.set(true);

    this.tenantService
      .create({ organizationId, firstName: value.firstName, lastName: value.lastName, email: value.email, phone: value.phone })
      .subscribe({
        next: () => {
          this.submitting.set(false);
          this.dialogVisible.set(false);
          this.messageService.add({ severity: 'success', summary: 'Locataire créé', detail: 'Le locataire a été ajouté.' });
          this.load();
        },
        error: () => {
          this.submitting.set(false);
          this.messageService.add({ severity: 'error', summary: 'Erreur', detail: "La création du locataire a échoué." });
        },
      });
  }
}

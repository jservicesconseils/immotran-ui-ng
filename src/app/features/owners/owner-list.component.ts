import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { MessageService, PrimeTemplate } from 'primeng/api';
import { AuthService } from '../../core/auth/auth.service';
import { OWNER_TYPE_LABELS, OwnerResponse, OwnerType } from '../../core/models/owner.model';
import { OwnerService } from '../../core/services/owner.service';

@Component({
  selector: 'app-owner-list',
  standalone: true,
  imports: [ReactiveFormsModule, ButtonModule, DialogModule, InputTextModule, SelectModule, TableModule, TagModule, PrimeTemplate],
  templateUrl: './owner-list.component.html',
  styleUrl: './owner-list.component.scss',
})
export class OwnerListComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly ownerService = inject(OwnerService);
  private readonly messageService = inject(MessageService);

  readonly session = this.auth.session;
  readonly owners = signal<OwnerResponse[]>([]);
  readonly loading = signal(true);
  readonly dialogVisible = signal(false);
  readonly submitting = signal(false);

  readonly ownerTypeOptions = Object.entries(OWNER_TYPE_LABELS).map(([value, label]) => ({ label, value }));
  readonly typeLabels = OWNER_TYPE_LABELS;

  readonly form = this.fb.nonNullable.group({
    type: this.fb.nonNullable.control<OwnerType | null>(null, Validators.required),
    name: ['', [Validators.required, Validators.maxLength(200)]],
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
    this.ownerService.listByOrganization(organizationId).subscribe({
      next: (owners) => {
        this.owners.set(owners);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Impossible de charger les propriétaires.' });
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

    this.ownerService
      .create({ organizationId, type: value.type!, name: value.name, email: value.email, phone: value.phone })
      .subscribe({
        next: () => {
          this.submitting.set(false);
          this.dialogVisible.set(false);
          this.messageService.add({ severity: 'success', summary: 'Propriétaire créé', detail: 'Le propriétaire a été ajouté.' });
          this.load();
        },
        error: () => {
          this.submitting.set(false);
          this.messageService.add({ severity: 'error', summary: 'Erreur', detail: "La création du propriétaire a échoué." });
        },
      });
  }
}

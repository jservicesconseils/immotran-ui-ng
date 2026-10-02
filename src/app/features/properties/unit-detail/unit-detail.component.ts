import { CurrencyPipe, DatePipe, Location } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService, PrimeTemplate } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { DialogModule } from 'primeng/dialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { MultiSelectModule } from 'primeng/multiselect';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';

import { AuthService } from '../../../core/auth/auth.service';
import { LEASE_STATUS_LABELS, LEASE_STATUS_SEVERITY, LeaseResponse } from '../../../core/models/lease.model';
import {
  PROPERTY_TYPE_LABELS,
  PropertyResponse,
  UNIT_STATUS_LABELS,
  UNIT_STATUS_SEVERITY,
  UnitResponse,
} from '../../../core/models/property.model';
import { TenantResponse } from '../../../core/models/tenant.model';
import { LeaseService } from '../../../core/services/lease.service';
import { PropertyService } from '../../../core/services/property.service';
import { TenantService } from '../../../core/services/tenant.service';

@Component({
  selector: 'app-unit-detail',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    ButtonModule,
    DatePickerModule,
    DialogModule,
    InputNumberModule,
    MultiSelectModule,
    TableModule,
    TagModule,
    CurrencyPipe,
    DatePipe,
    PrimeTemplate,
  ],
  templateUrl: './unit-detail.component.html',
  styleUrl: './unit-detail.component.scss',
})
export class UnitDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly location = inject(Location);
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly propertyService = inject(PropertyService);
  private readonly tenantService = inject(TenantService);
  private readonly leaseService = inject(LeaseService);
  private readonly messageService = inject(MessageService);

  readonly propertyId = this.route.snapshot.paramMap.get('propertyId')!;
  readonly unitId = this.route.snapshot.paramMap.get('unitId')!;

  readonly property = signal<PropertyResponse | null>(null);
  readonly unit = signal<UnitResponse | null>(null);
  readonly leases = signal<LeaseResponse[]>([]);
  readonly tenants = signal<TenantResponse[]>([]);
  readonly loading = signal(true);
  readonly dialogVisible = signal(false);
  readonly submitting = signal(false);

  readonly typeLabels = PROPERTY_TYPE_LABELS;
  readonly unitStatusLabels = UNIT_STATUS_LABELS;
  readonly unitStatusSeverity = UNIT_STATUS_SEVERITY;
  readonly leaseStatusLabels = LEASE_STATUS_LABELS;
  readonly leaseStatusSeverity = LEASE_STATUS_SEVERITY;

  readonly form = this.fb.nonNullable.group({
    tenantIds: this.fb.nonNullable.control<string[]>([], Validators.required),
    startDate: this.fb.control<Date | null>(null, Validators.required),
    endDate: this.fb.control<Date | null>(null),
    monthlyRent: this.fb.control<number | null>(null, Validators.required),
  });

  constructor() {
    this.load();
  }

  goBack(): void {
    this.location.back();
  }

  // Arrow function (pas une methode de classe) : utilisee comme callback
  // direct dans lease.tenantIds.map(tenantName) au template, ou une
  // methode perdrait son "this" en etant passee par reference.
  readonly tenantName = (tenantId: string): string => {
    const tenant = this.tenants().find((t) => t.id === tenantId);
    return tenant ? `${tenant.firstName} ${tenant.lastName}` : tenantId;
  };

  private load(): void {
    this.loading.set(true);
    this.propertyService.getById(this.propertyId).subscribe((property) => this.property.set(property));
    this.propertyService.getUnit(this.propertyId, this.unitId).subscribe({
      next: (unit) => {
        this.unit.set(unit);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Unité introuvable.' });
      },
    });
    this.loadLeases();

    const organizationId = this.auth.session()?.organizationId;
    if (organizationId) {
      this.tenantService.listByOrganization(organizationId).subscribe((tenants) => this.tenants.set(tenants));
    }
  }

  loadLeases(): void {
    this.leaseService.list(this.propertyId, this.unitId).subscribe((leases) => this.leases.set(leases));
  }

  openDialog(): void {
    this.form.reset({ tenantIds: [] });
    this.dialogVisible.set(true);
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.submitting.set(true);
    const value = this.form.getRawValue();
    this.leaseService
      .create(this.propertyId, this.unitId, {
        tenantIds: value.tenantIds,
        startDate: value.startDate!.toISOString().slice(0, 10),
        endDate: value.endDate ? value.endDate.toISOString().slice(0, 10) : null,
        monthlyRent: value.monthlyRent!,
      })
      .subscribe({
        next: () => {
          this.submitting.set(false);
          this.dialogVisible.set(false);
          this.messageService.add({ severity: 'success', summary: 'Bail créé' });
          this.loadLeases();
        },
        error: (err) => {
          this.submitting.set(false);
          const detail = err?.status === 409 ? "Un des locataires n'appartient pas à la même organisation que l'unité." : 'La création a échoué.';
          this.messageService.add({ severity: 'error', summary: 'Erreur', detail });
        },
      });
  }

  openLease(lease: LeaseResponse): void {
    this.router.navigate(['/properties', this.propertyId, 'units', this.unitId, 'leases', lease.id]);
  }
}

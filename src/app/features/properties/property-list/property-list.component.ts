import { DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { TextareaModule } from 'primeng/textarea';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { MessageService, PrimeTemplate } from 'primeng/api';
import { AuthService } from '../../../core/auth/auth.service';
import { CANADIAN_PROVINCES } from '../../../core/constants/provinces';
import {
  BUILDING_STATUS_LABELS,
  BuildingStatus,
  PROPERTY_STATUS_LABELS,
  PROPERTY_STATUS_SEVERITY,
  PROPERTY_TYPE_LABELS,
  PropertyResponse,
  PropertyType,
} from '../../../core/models/property.model';
import { PropertyService } from '../../../core/services/property.service';

@Component({
  selector: 'app-property-list',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    ButtonModule,
    DialogModule,
    InputTextModule,
    InputNumberModule,
    TextareaModule,
    SelectModule,
    TableModule,
    TagModule,
    DatePipe,
    PrimeTemplate,
  ],
  templateUrl: './property-list.component.html',
  styleUrl: './property-list.component.scss',
})
export class PropertyListComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly propertyService = inject(PropertyService);
  private readonly messageService = inject(MessageService);
  private readonly router = inject(Router);

  readonly session = this.auth.session;
  readonly properties = signal<PropertyResponse[]>([]);
  readonly loading = signal(true);
  readonly dialogVisible = signal(false);
  readonly submitting = signal(false);

  readonly propertyTypeOptions = Object.entries(PROPERTY_TYPE_LABELS).map(([value, label]) => ({ label, value }));
  readonly buildingStatusOptions = Object.entries(BUILDING_STATUS_LABELS).map(([value, label]) => ({ label, value }));
  readonly provinceOptions = CANADIAN_PROVINCES;
  readonly statusLabels = PROPERTY_STATUS_LABELS;
  readonly statusSeverity = PROPERTY_STATUS_SEVERITY;
  readonly typeLabels = PROPERTY_TYPE_LABELS;

  readonly form = this.fb.nonNullable.group({
    type: this.fb.nonNullable.control<PropertyType | null>(null, Validators.required),
    street: ['', [Validators.required, Validators.maxLength(200)]],
    city: ['', [Validators.required, Validators.maxLength(100)]],
    province: this.fb.nonNullable.control<string | null>(null, Validators.required),
    postalCode: ['', [Validators.required, Validators.maxLength(10)]],
    cadastreNumber: this.fb.nonNullable.control<string | null>(null, Validators.maxLength(50)),
    taxId: this.fb.nonNullable.control<string | null>(null, Validators.maxLength(50)),
    buildingStatus: this.fb.nonNullable.control<BuildingStatus | null>(null),
    yearBuilt: this.fb.nonNullable.control<number | null>(null),
    floorCount: this.fb.nonNullable.control<number | null>(null),
    totalSurfaceArea: this.fb.nonNullable.control<number | null>(null),
    estimatedValue: this.fb.nonNullable.control<number | null>(null),
    description: this.fb.nonNullable.control<string | null>(null, Validators.maxLength(2000)),
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
    this.propertyService.listByOrganization(organizationId).subscribe({
      next: (properties) => {
        this.properties.set(properties);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Impossible de charger les propriétés.' });
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

    this.propertyService
      .create({
        organizationId,
        type: value.type!,
        street: value.street,
        city: value.city,
        province: value.province!,
        postalCode: value.postalCode,
        cadastreNumber: value.cadastreNumber,
        taxId: value.taxId,
        buildingStatus: value.buildingStatus,
        yearBuilt: value.yearBuilt,
        floorCount: value.floorCount,
        totalSurfaceArea: value.totalSurfaceArea,
        estimatedValue: value.estimatedValue,
        description: value.description,
      })
      .subscribe({
        next: () => {
          this.submitting.set(false);
          this.dialogVisible.set(false);
          this.messageService.add({ severity: 'success', summary: 'Propriété créée', detail: 'La propriété a été ajoutée au portefeuille.' });
          this.load();
        },
        error: () => {
          this.submitting.set(false);
          this.messageService.add({ severity: 'error', summary: 'Erreur', detail: "La création de la propriété a échoué." });
        },
      });
  }

  openProperty(property: PropertyResponse): void {
    this.router.navigate(['/properties', property.id]);
  }
}

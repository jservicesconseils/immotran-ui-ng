import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { DialogModule } from 'primeng/dialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';
import { MessageService, PrimeTemplate } from 'primeng/api';

import { AuthService } from '../../../core/auth/auth.service';
import { CANADIAN_PROVINCES } from '../../../core/constants/provinces';
import { DocumentResponse } from '../../../core/models/document.model';
import { OwnerResponse, PropertyOwnerResponse } from '../../../core/models/owner.model';
import {
  BUILDING_STATUS_LABELS,
  BuildingStatus,
  PropertyResponse,
  PROPERTY_TYPE_LABELS,
  PropertyType,
} from '../../../core/models/property.model';
import { DocumentService } from '../../../core/services/document.service';
import { OwnerService } from '../../../core/services/owner.service';
import { PropertyService } from '../../../core/services/property.service';

const STEP_TITLES = ['Informations générales', 'Caractéristiques', 'Propriétaire', 'Finances', 'Photos et documents'];

/**
 * Creation ET edition d'une propriete, dans le meme stepper 5 etapes que
 * la maquette (ecrans "Nouvelle propriete" / "Modifier la propriete" --
 * meme hierarchie de champs, seule la source des valeurs initiales change).
 */
@Component({
  selector: 'app-property-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    ButtonModule,
    CheckboxModule,
    DialogModule,
    InputNumberModule,
    InputTextModule,
    SelectModule,
    TextareaModule,
    PrimeTemplate,
  ],
  templateUrl: './property-form.component.html',
  styleUrl: './property-form.component.scss',
})
export class PropertyFormComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly propertyService = inject(PropertyService);
  private readonly ownerService = inject(OwnerService);
  private readonly documentService = inject(DocumentService);
  private readonly messageService = inject(MessageService);

  readonly propertyId = this.route.snapshot.paramMap.get('propertyId');
  readonly mode = computed<'create' | 'edit'>(() => (this.propertyId ? 'edit' : 'create'));
  readonly stepTitles = STEP_TITLES;
  readonly currentStep = signal(1);
  readonly loading = signal(!!this.propertyId);
  readonly submitting = signal(false);

  readonly propertyTypeOptions = Object.entries(PROPERTY_TYPE_LABELS).map(([value, label]) => ({ label, value }));
  readonly buildingStatusOptions = Object.entries(BUILDING_STATUS_LABELS).map(([value, label]) => ({ label, value }));
  readonly provinceOptions = CANADIAN_PROVINCES;

  readonly availableOwners = signal<OwnerResponse[]>([]);
  readonly currentOwners = signal<PropertyOwnerResponse[]>([]);
  readonly documents = signal<DocumentResponse[]>([]);

  readonly form = this.fb.nonNullable.group({
    type: this.fb.nonNullable.control<PropertyType | null>(null, Validators.required),
    name: this.fb.nonNullable.control<string | null>(null, Validators.maxLength(200)),
    street: ['', [Validators.required, Validators.maxLength(200)]],
    city: ['', [Validators.required, Validators.maxLength(100)]],
    province: this.fb.nonNullable.control<string | null>(null, Validators.required),
    postalCode: ['', [Validators.required, Validators.maxLength(10)]],
    description: this.fb.nonNullable.control<string | null>(null, Validators.maxLength(2000)),
    active: [true],

    buildingStatus: this.fb.nonNullable.control<BuildingStatus | null>(null),
    yearBuilt: this.fb.nonNullable.control<number | null>(null),
    floorCount: this.fb.nonNullable.control<number | null>(null),
    totalSurfaceArea: this.fb.nonNullable.control<number | null>(null),
    cadastreNumber: this.fb.nonNullable.control<string | null>(null, Validators.maxLength(50)),
    taxId: this.fb.nonNullable.control<string | null>(null, Validators.maxLength(50)),

    ownerId: this.fb.nonNullable.control<string | null>(null),
    sharePercentage: this.fb.nonNullable.control(100, [Validators.min(0), Validators.max(100)]),

    estimatedValue: this.fb.nonNullable.control<number | null>(null),
  });

  private readonly stepFields: Record<number, (keyof typeof this.form.controls)[]> = {
    1: ['type', 'street', 'city', 'province', 'postalCode'],
  };

  constructor() {
    const organizationId = this.auth.session()?.organizationId;
    if (organizationId) {
      this.ownerService.listByOrganization(organizationId).subscribe((owners) => this.availableOwners.set(owners));
    }

    if (this.propertyId) {
      this.propertyService.getById(this.propertyId).subscribe({
        next: (property) => {
          this.applyProperty(property);
          this.loading.set(false);
        },
        error: () => {
          this.loading.set(false);
          this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Propriété introuvable.' });
        },
      });
      this.ownerService.listForProperty(this.propertyId).subscribe((owners) => this.currentOwners.set(owners));
      if (organizationId) {
        this.documentService.listForEntity(organizationId, 'PROPERTY', this.propertyId).subscribe((docs) => this.documents.set(docs));
      }
    }
  }

  private applyProperty(property: PropertyResponse): void {
    this.form.patchValue({
      type: property.type,
      name: property.name,
      street: property.street,
      city: property.city,
      province: property.province,
      postalCode: property.postalCode,
      description: property.description,
      active: property.status !== 'ARCHIVEE',
      buildingStatus: property.buildingStatus,
      yearBuilt: property.yearBuilt,
      floorCount: property.floorCount,
      totalSurfaceArea: property.totalSurfaceArea,
      cadastreNumber: property.cadastreNumber,
      taxId: property.taxId,
      estimatedValue: property.estimatedValue,
    });
  }

  goToStep(step: number): void {
    if (step < this.currentStep()) {
      this.currentStep.set(step);
    }
  }

  nextStep(): void {
    const step = this.currentStep();
    const fields = this.stepFields[step];
    if (fields) {
      let valid = true;
      for (const field of fields) {
        const control = this.form.controls[field];
        control.markAsTouched();
        if (control.invalid) {
          valid = false;
        }
      }
      if (!valid) {
        return;
      }
    }
    this.currentStep.set(step + 1);
  }

  previousStep(): void {
    this.currentStep.set(this.currentStep() - 1);
  }

  cancel(): void {
    if (this.propertyId) {
      this.router.navigate(['/properties', this.propertyId]);
    } else {
      this.router.navigate(['/properties']);
    }
  }

  addPhotos(): void {
    this.messageService.add({ severity: 'info', summary: 'Bientôt disponible', detail: "L'envoi de photos sera ajouté prochainement." });
  }

  submit(): void {
    for (const field of this.stepFields[1]) {
      this.form.controls[field].markAsTouched();
    }
    if (this.form.controls.type.invalid || this.form.controls.street.invalid || this.form.controls.city.invalid ||
        this.form.controls.province.invalid || this.form.controls.postalCode.invalid) {
      this.currentStep.set(1);
      return;
    }

    const organizationId = this.auth.session()?.organizationId;
    const value = this.form.getRawValue();
    this.submitting.set(true);

    const payload = {
      type: value.type!,
      name: value.name,
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
    };

    if (this.mode() === 'edit' && this.propertyId) {
      this.propertyService.update(this.propertyId, payload).subscribe({
        next: () => {
          this.attachOwnerIfSelected(this.propertyId!, () => {
            this.submitting.set(false);
            this.messageService.add({ severity: 'success', summary: 'Propriété modifiée' });
            this.router.navigate(['/properties', this.propertyId]);
          });
        },
        error: () => {
          this.submitting.set(false);
          this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'La modification a échoué.' });
        },
      });
      return;
    }

    if (!organizationId) {
      this.submitting.set(false);
      return;
    }

    this.propertyService.create({ organizationId, ...payload }).subscribe({
      next: (created) => {
        this.attachOwnerIfSelected(created.id, () => {
          this.submitting.set(false);
          this.messageService.add({ severity: 'success', summary: 'Propriété créée', detail: 'La propriété a été ajoutée au portefeuille.' });
          this.router.navigate(['/properties', created.id]);
        });
      },
      error: () => {
        this.submitting.set(false);
        this.messageService.add({ severity: 'error', summary: 'Erreur', detail: "La création de la propriété a échoué." });
      },
    });
  }

  private attachOwnerIfSelected(propertyId: string, done: () => void): void {
    const ownerId = this.form.controls.ownerId.value;
    const alreadyAttached = this.currentOwners().some((po) => po.ownerId === ownerId);
    if (!ownerId || alreadyAttached) {
      done();
      return;
    }
    this.ownerService.attachToProperty(propertyId, { ownerId, sharePercentage: this.form.controls.sharePercentage.value }).subscribe({
      next: done,
      error: done,
    });
  }
}

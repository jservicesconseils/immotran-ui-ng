import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';
import { MessageService } from 'primeng/api';

import { PropertyResponse, UNIT_STATUS_LABELS, UNIT_TYPE_LABELS, UnitStatus, UnitType } from '../../../core/models/property.model';
import { PropertyService } from '../../../core/services/property.service';

/**
 * Ajout ET edition d'un appartement (ecran "Ajout d'un appartement" de la
 * maquette), meme formulaire pour les deux cas -- seule la source des
 * valeurs initiales et l'appel de service different.
 */
@Component({
  selector: 'app-unit-form',
  standalone: true,
  imports: [ReactiveFormsModule, ButtonModule, InputNumberModule, InputTextModule, SelectModule, TextareaModule],
  templateUrl: './unit-form.component.html',
  styleUrl: './unit-form.component.scss',
})
export class UnitFormComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly propertyService = inject(PropertyService);
  private readonly messageService = inject(MessageService);

  readonly propertyId = this.route.snapshot.paramMap.get('propertyId')!;
  readonly unitId = this.route.snapshot.paramMap.get('unitId');
  readonly mode = computed<'create' | 'edit'>(() => (this.unitId ? 'edit' : 'create'));

  readonly property = signal<PropertyResponse | null>(null);
  readonly loading = signal(!!this.unitId);
  readonly submitting = signal(false);

  readonly unitTypeOptions = Object.entries(UNIT_TYPE_LABELS).map(([value, label]) => ({ label, value }));
  readonly statusOptions = Object.entries(UNIT_STATUS_LABELS).map(([value, label]) => ({ label, value }));

  readonly form = this.fb.nonNullable.group({
    label: ['', [Validators.required, Validators.maxLength(50)]],
    floor: this.fb.control<number | null>(null),
    type: this.fb.control<UnitType | null>(null),
    bedrooms: this.fb.control<number | null>(null),
    bathrooms: this.fb.control<number | null>(null),
    areaSquareMeters: this.fb.control<number | null>(null),
    listedRent: this.fb.control<number | null>(null),
    listedSecurityDeposit: this.fb.control<number | null>(null),
    status: this.fb.control<UnitStatus | null>('DISPONIBLE'),
    description: this.fb.control<string | null>(null, Validators.maxLength(2000)),
  });

  constructor() {
    this.propertyService.getById(this.propertyId).subscribe((property) => this.property.set(property));

    if (this.unitId) {
      this.propertyService.getUnit(this.propertyId, this.unitId).subscribe({
        next: (unit) => {
          this.form.patchValue({
            label: unit.label,
            floor: unit.floor,
            type: unit.type,
            bedrooms: unit.bedrooms,
            bathrooms: unit.bathrooms,
            areaSquareMeters: unit.areaSquareMeters,
            listedRent: unit.listedRent,
            listedSecurityDeposit: unit.listedSecurityDeposit,
            status: unit.status,
            description: unit.description,
          });
          this.loading.set(false);
        },
        error: () => {
          this.loading.set(false);
          this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Appartement introuvable.' });
        },
      });
    }
  }

  addPhotos(): void {
    this.messageService.add({ severity: 'info', summary: 'Bientôt disponible', detail: "L'envoi de photos sera ajouté prochainement." });
  }

  cancel(): void {
    if (this.unitId) {
      this.router.navigate(['/properties', this.propertyId, 'units', this.unitId]);
    } else {
      this.router.navigate(['/properties', this.propertyId]);
    }
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    const value = this.form.getRawValue();

    if (this.mode() === 'edit' && this.unitId) {
      this.propertyService
        .updateUnit(this.propertyId, this.unitId, {
          label: value.label,
          floor: value.floor,
          areaSquareMeters: value.areaSquareMeters,
          bedrooms: value.bedrooms,
          bathrooms: value.bathrooms,
          type: value.type,
          description: value.description,
          listedRent: value.listedRent,
          listedSecurityDeposit: value.listedSecurityDeposit,
        })
        .subscribe({
          next: () => {
            this.submitting.set(false);
            this.messageService.add({ severity: 'success', summary: 'Appartement modifié' });
            this.router.navigate(['/properties', this.propertyId, 'units', this.unitId]);
          },
          error: () => {
            this.submitting.set(false);
            this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'La modification a échoué.' });
          },
        });
      return;
    }

    this.propertyService
      .createUnit(this.propertyId, {
        label: value.label,
        principal: false,
        floor: value.floor,
        areaSquareMeters: value.areaSquareMeters,
        bedrooms: value.bedrooms,
        bathrooms: value.bathrooms,
        type: value.type,
        description: value.description,
        listedRent: value.listedRent,
        listedSecurityDeposit: value.listedSecurityDeposit,
        status: value.status,
      })
      .subscribe({
        next: (created) => {
          this.submitting.set(false);
          this.messageService.add({ severity: 'success', summary: 'Appartement ajouté' });
          this.router.navigate(['/properties', this.propertyId, 'units', created.id]);
        },
        error: () => {
          this.submitting.set(false);
          this.messageService.add({ severity: 'error', summary: 'Erreur', detail: "L'ajout de l'appartement a échoué." });
        },
      });
  }
}

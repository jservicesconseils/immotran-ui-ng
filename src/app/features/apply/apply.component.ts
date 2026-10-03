import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { DatePickerModule } from 'primeng/datepicker';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';
import { ApplicationResponse, SubmitApplicationRequest } from '../../core/models/application.model';
import { UnitListingResponse, UNIT_TYPE_LABELS } from '../../core/models/property.model';
import { ApplicationService } from '../../core/services/application.service';
import { PropertyService } from '../../core/services/property.service';

interface DocumentSlot {
  key: string;
  icon: string;
  colorClass: string;
  title: string;
  description: string;
  required: boolean;
}

const DOCUMENT_SLOTS: DocumentSlot[] = [
  { key: 'identite', icon: 'pi-id-card', colorClass: 'doc-icon-tan', title: "Pièce d'identité", description: 'Permis de conduire, passeport, etc.', required: false },
  { key: 'revenus', icon: 'pi-file', colorClass: 'doc-icon-blue', title: 'Preuve de revenus', description: "Bulletins de paie, avis d'imposition, contrat de travail, etc.", required: true },
  { key: 'bancaires', icon: 'pi-wallet', colorClass: 'doc-icon-red', title: 'Relevés bancaires', description: '3 derniers mois', required: true },
  { key: 'references', icon: 'pi-users', colorClass: 'doc-icon-orange', title: 'Références personnelles ou professionnelles', description: 'Nom, téléphone, courriel', required: true },
  { key: 'bauxAnterieurs', icon: 'pi-file-edit', colorClass: 'doc-icon-green', title: 'Anciens baux', description: "Pour vérifier l'historique locatif", required: false },
  { key: 'autorisationCredit', icon: 'pi-shield', colorClass: 'doc-icon-blue', title: 'Autorisation de vérification de crédit', description: 'Si applicable', required: false },
];

const LEASE_DURATION_OPTIONS = [
  { label: '6 mois', value: '6_MOIS' },
  { label: '1 an', value: '1_AN' },
  { label: '2 ans', value: '2_ANS' },
  { label: 'Indéterminée', value: 'INDETERMINEE' },
];

/**
 * Formulaire PUBLIC de soumission de candidature, reproduit a l'identique
 * de la maquette de reference (4 etapes + confirmation). Aucun compte
 * requis -- voir ApplicationController cote backend (POST non
 * authentifie), et PropertyController.getUnitListing pour l'annonce.
 */
@Component({
  selector: 'app-apply',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    FormsModule,
    ButtonModule,
    CheckboxModule,
    DatePickerModule,
    InputNumberModule,
    InputTextModule,
    SelectModule,
    TextareaModule,
    CurrencyPipe,
    DatePipe,
  ],
  templateUrl: './apply.component.html',
  styleUrl: './apply.component.scss',
})
export class ApplyComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly applicationService = inject(ApplicationService);
  private readonly propertyService = inject(PropertyService);

  private readonly propertyId = this.route.snapshot.paramMap.get('propertyId')!;
  readonly unitId = this.route.snapshot.paramMap.get('unitId')!;

  readonly documentSlots = DOCUMENT_SLOTS;
  readonly leaseDurationOptions = LEASE_DURATION_OPTIONS;
  readonly unitTypeLabels = UNIT_TYPE_LABELS;

  readonly currentStep = signal(1);
  readonly submitting = signal(false);
  readonly submitted = signal(false);
  readonly submissionFailed = signal(false);
  readonly result = signal<ApplicationResponse | null>(null);

  readonly listing = signal<UnitListingResponse | null>(null);
  readonly uploadedDocs = signal<Set<string>>(new Set());

  readonly requiredDocsUploaded = computed(() => {
    const uploaded = this.uploadedDocs();
    return this.documentSlots.filter((slot) => slot.required).every((slot) => uploaded.has(slot.key));
  });

  readonly roomCount = computed(() => {
    const bedrooms = this.listing()?.bedrooms;
    return bedrooms != null ? `${bedrooms + 1} ½` : null;
  });

  readonly trackingNumber = computed(() => {
    const app = this.result();
    if (!app) {
      return null;
    }
    const year = new Date(app.submittedAt).getFullYear();
    const shortId = app.id.split('-')[0].toUpperCase();
    return `DL-${year}-${shortId}`;
  });

  readonly form = this.fb.nonNullable.group({
    fullName: ['', [Validators.required, Validators.maxLength(200)]],
    dateOfBirth: this.fb.control<Date | null>(null, Validators.required),
    currentAddress: ['', [Validators.required, Validators.maxLength(300)]],
    phone: ['', [Validators.required, Validators.maxLength(30)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(200)]],
    socialInsuranceNumber: this.fb.control<string | null>(null, Validators.maxLength(20)),
    profession: ['', [Validators.required, Validators.maxLength(150)]],
    employerName: ['', [Validators.required, Validators.maxLength(200)]],
    monthlyIncome: this.fb.control<number | null>(null, Validators.required),

    desiredMoveInDate: this.fb.control<Date | null>(null, Validators.required),
    leaseDuration: ['1_AN', Validators.required],
    comments: this.fb.control<string | null>(null),

    confirmAccurate: [true, Validators.requiredTrue],
    acceptDataUse: [false, Validators.requiredTrue],
  });

  private readonly stepFields: Record<number, (keyof typeof this.form.controls)[]> = {
    1: ['fullName', 'dateOfBirth', 'currentAddress', 'phone', 'email', 'profession', 'employerName', 'monthlyIncome'],
    3: ['desiredMoveInDate', 'leaseDuration'],
    4: ['confirmAccurate', 'acceptDataUse'],
  };

  constructor() {
    this.propertyService.getUnitListing(this.propertyId, this.unitId).subscribe((listing) => this.listing.set(listing));
  }

  toggleUpload(key: string): void {
    const next = new Set(this.uploadedDocs());
    if (next.has(key)) {
      next.delete(key);
    } else {
      next.add(key);
    }
    this.uploadedDocs.set(next);
  }

  goToStep(step: number): void {
    this.currentStep.set(step);
  }

  nextStep(): void {
    const step = this.currentStep();

    if (step === 2 && !this.requiredDocsUploaded()) {
      return;
    }

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

  submit(): void {
    for (const field of this.stepFields[4]) {
      this.form.controls[field].markAsTouched();
    }
    if (this.form.controls.confirmAccurate.invalid || this.form.controls.acceptDataUse.invalid) {
      return;
    }

    this.submitting.set(true);
    this.submissionFailed.set(false);
    const value = this.form.getRawValue();
    const spaceIndex = value.fullName.trim().indexOf(' ');
    const firstName = spaceIndex === -1 ? value.fullName.trim() : value.fullName.slice(0, spaceIndex).trim();
    const lastName = spaceIndex === -1 ? '' : value.fullName.slice(spaceIndex + 1).trim();

    const request: SubmitApplicationRequest = {
      firstName,
      lastName,
      email: value.email,
      phone: value.phone,
      employerName: value.employerName,
      monthlyIncome: value.monthlyIncome,
      dateOfBirth: value.dateOfBirth ? value.dateOfBirth.toISOString().slice(0, 10) : null,
      currentAddress: value.currentAddress,
      socialInsuranceNumber: value.socialInsuranceNumber,
      profession: value.profession,
      references: [],
    };

    this.applicationService.submit(this.propertyId, this.unitId, request).subscribe({
      next: (created) => {
        this.submitting.set(false);
        this.submitted.set(true);
        this.result.set(created);
      },
      error: () => {
        this.submitting.set(false);
        this.submissionFailed.set(true);
      },
    });
  }

  copyTrackingNumber(): void {
    const value = this.trackingNumber();
    if (value) {
      navigator.clipboard.writeText(value).catch(() => undefined);
    }
  }

  goHome(): void {
    this.router.navigateByUrl('/login');
  }

  goToStatus(): void {
    const app = this.result();
    if (app) {
      this.router.navigate(['/locataire/dossiers', app.id]);
    }
  }
}

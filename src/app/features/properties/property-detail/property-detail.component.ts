import { CurrencyPipe, DatePipe, Location } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService, PrimeTemplate } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { DatePickerModule } from 'primeng/datepicker';
import { DialogModule } from 'primeng/dialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { TabsModule } from 'primeng/tabs';
import { TagModule } from 'primeng/tag';
import { TextareaModule } from 'primeng/textarea';

import { AuthService } from '../../../core/auth/auth.service';
import { DocumentService } from '../../../core/services/document.service';
import { FinanceService } from '../../../core/services/finance.service';
import { MaintenanceService } from '../../../core/services/maintenance.service';
import { OwnerService } from '../../../core/services/owner.service';
import { PropertyService } from '../../../core/services/property.service';

import { DocumentResponse, DOCUMENT_TYPE_LABELS, DocumentType } from '../../../core/models/document.model';
import {
  TRANSACTION_CATEGORY_LABELS,
  TransactionCategory,
  TransactionResponse,
  TransactionType,
} from '../../../core/models/finance.model';
import {
  MAINTENANCE_PRIORITY_LABELS,
  MAINTENANCE_PRIORITY_SEVERITY,
  MAINTENANCE_STATUS_LABELS,
  MAINTENANCE_STATUS_SEVERITY,
  MaintenancePriority,
  MaintenanceRequestResponse,
} from '../../../core/models/maintenance.model';
import { OwnerResponse, OwnerType, PropertyOwnerResponse } from '../../../core/models/owner.model';
import {
  PROPERTY_STATUS_LABELS,
  PROPERTY_STATUS_SEVERITY,
  PROPERTY_TYPE_LABELS,
  PropertyResponse,
  UNIT_STATUS_LABELS,
  UNIT_STATUS_SEVERITY,
  UnitResponse,
} from '../../../core/models/property.model';

@Component({
  selector: 'app-property-detail',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    ButtonModule,
    CheckboxModule,
    DatePickerModule,
    DialogModule,
    InputNumberModule,
    InputTextModule,
    SelectModule,
    TableModule,
    TabsModule,
    TagModule,
    TextareaModule,
    CurrencyPipe,
    DatePipe,
    PrimeTemplate,
  ],
  templateUrl: './property-detail.component.html',
  styleUrl: './property-detail.component.scss',
})
export class PropertyDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly location = inject(Location);
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly propertyService = inject(PropertyService);
  private readonly ownerService = inject(OwnerService);
  private readonly financeService = inject(FinanceService);
  private readonly maintenanceService = inject(MaintenanceService);
  private readonly documentService = inject(DocumentService);
  private readonly messageService = inject(MessageService);

  readonly propertyId = this.route.snapshot.paramMap.get('propertyId')!;

  readonly property = signal<PropertyResponse | null>(null);
  readonly loading = signal(true);

  readonly typeLabels = PROPERTY_TYPE_LABELS;
  readonly statusLabels = PROPERTY_STATUS_LABELS;
  readonly statusSeverity = PROPERTY_STATUS_SEVERITY;
  readonly unitStatusLabels = UNIT_STATUS_LABELS;
  readonly unitStatusSeverity = UNIT_STATUS_SEVERITY;
  readonly maintenancePriorityLabels = MAINTENANCE_PRIORITY_LABELS;
  readonly maintenancePrioritySeverity = MAINTENANCE_PRIORITY_SEVERITY;
  readonly maintenanceStatusLabels = MAINTENANCE_STATUS_LABELS;
  readonly maintenanceStatusSeverity = MAINTENANCE_STATUS_SEVERITY;
  readonly transactionCategoryLabels = TRANSACTION_CATEGORY_LABELS;
  readonly documentTypeLabels = DOCUMENT_TYPE_LABELS;

  // --- Units -------------------------------------------------------
  readonly units = signal<UnitResponse[]>([]);
  readonly unitDialogVisible = signal(false);
  readonly unitSubmitting = signal(false);
  readonly unitForm = this.fb.nonNullable.group({
    label: ['', [Validators.required, Validators.maxLength(50)]],
    principal: [false],
    floor: this.fb.control<number | null>(null),
    areaSquareMeters: this.fb.control<number | null>(null),
    bedrooms: this.fb.control<number | null>(null),
    bathrooms: this.fb.control<number | null>(null),
  });

  // --- Owners --------------------------------------------------------
  readonly propertyOwners = signal<PropertyOwnerResponse[]>([]);
  readonly availableOwners = signal<OwnerResponse[]>([]);
  readonly ownerDialogVisible = signal(false);
  readonly ownerSubmitting = signal(false);
  readonly ownerForm = this.fb.nonNullable.group({
    ownerId: this.fb.nonNullable.control<string | null>(null, Validators.required),
    sharePercentage: this.fb.nonNullable.control(100, [Validators.required, Validators.min(0), Validators.max(100)]),
  });

  // --- Transactions ----------------------------------------------
  readonly transactions = signal<TransactionResponse[]>([]);
  readonly transactionDialogVisible = signal(false);
  readonly transactionSubmitting = signal(false);
  readonly transactionTypeOptions: { label: string; value: TransactionType }[] = [
    { label: 'Revenu', value: 'REVENU' },
    { label: 'Dépense', value: 'DEPENSE' },
  ];
  readonly transactionCategoryOptions = Object.entries(TRANSACTION_CATEGORY_LABELS).map(([value, label]) => ({ label, value }));
  readonly transactionForm = this.fb.nonNullable.group({
    type: this.fb.nonNullable.control<TransactionType | null>(null, Validators.required),
    category: this.fb.nonNullable.control<TransactionCategory | null>(null, Validators.required),
    amount: this.fb.nonNullable.control<number | null>(null, Validators.required),
    description: this.fb.control<string | null>(null, Validators.maxLength(500)),
    transactionDate: this.fb.control<Date | null>(null, Validators.required),
  });

  // --- Maintenance -----------------------------------------------
  readonly maintenanceRequests = signal<MaintenanceRequestResponse[]>([]);
  readonly maintenanceDialogVisible = signal(false);
  readonly maintenanceSubmitting = signal(false);
  readonly closeDialogVisible = signal(false);
  readonly closingRequestId = signal<string | null>(null);
  readonly priorityOptions = Object.entries(MAINTENANCE_PRIORITY_LABELS).map(([value, label]) => ({ label, value }));
  readonly maintenanceForm = this.fb.nonNullable.group({
    description: ['', [Validators.required, Validators.maxLength(1000)]],
    priority: this.fb.nonNullable.control<MaintenancePriority | null>(null, Validators.required),
  });
  readonly closeForm = this.fb.nonNullable.group({
    vendorName: this.fb.control<string | null>(null, Validators.maxLength(200)),
    cost: this.fb.control<number | null>(null),
  });

  // --- Documents -------------------------------------------------
  readonly documents = signal<DocumentResponse[]>([]);
  readonly documentDialogVisible = signal(false);
  readonly documentSubmitting = signal(false);
  readonly documentTypeOptions = Object.entries(DOCUMENT_TYPE_LABELS).map(([value, label]) => ({ label, value }));
  readonly documentForm = this.fb.nonNullable.group({
    type: this.fb.nonNullable.control<DocumentType | null>(null, Validators.required),
    fileName: ['', [Validators.required, Validators.maxLength(255)]],
  });

  constructor() {
    this.loadProperty();
  }

  goBack(): void {
    this.location.back();
  }

  private loadProperty(): void {
    this.loading.set(true);
    this.propertyService.getById(this.propertyId).subscribe({
      next: (property) => {
        this.property.set(property);
        this.loading.set(false);
        this.loadUnits();
        this.loadOwners();
        this.loadTransactions();
        this.loadMaintenance();
        this.loadDocuments();
      },
      error: () => {
        this.loading.set(false);
        this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Propriété introuvable.' });
      },
    });
  }

  // --- Units -------------------------------------------------------
  loadUnits(): void {
    this.propertyService.listUnits(this.propertyId).subscribe((units) => this.units.set(units));
  }

  openUnitDialog(): void {
    this.unitForm.reset({ principal: false });
    this.unitDialogVisible.set(true);
  }

  submitUnit(): void {
    if (this.unitForm.invalid) {
      this.unitForm.markAllAsTouched();
      return;
    }
    this.unitSubmitting.set(true);
    const value = this.unitForm.getRawValue();
    this.propertyService.createUnit(this.propertyId, value).subscribe({
      next: () => {
        this.unitSubmitting.set(false);
        this.unitDialogVisible.set(false);
        this.messageService.add({ severity: 'success', summary: 'Unité ajoutée' });
        this.loadUnits();
      },
      error: () => {
        this.unitSubmitting.set(false);
        this.messageService.add({ severity: 'error', summary: 'Erreur', detail: "L'ajout de l'unité a échoué." });
      },
    });
  }

  openUnit(unit: UnitResponse): void {
    this.router.navigate(['/properties', this.propertyId, 'units', unit.id]);
  }

  // --- Owners --------------------------------------------------------
  loadOwners(): void {
    this.ownerService.listForProperty(this.propertyId).subscribe((owners) => this.propertyOwners.set(owners));
    const organizationId = this.auth.session()?.organizationId;
    if (organizationId) {
      this.ownerService.listByOrganization(organizationId).subscribe((owners) => this.availableOwners.set(owners));
    }
  }

  openOwnerDialog(): void {
    this.ownerForm.reset({ sharePercentage: 100, ownerId: null });
    this.ownerDialogVisible.set(true);
  }

  submitOwner(): void {
    if (this.ownerForm.invalid) {
      this.ownerForm.markAllAsTouched();
      return;
    }
    this.ownerSubmitting.set(true);
    const value = this.ownerForm.getRawValue();
    this.ownerService.attachToProperty(this.propertyId, { ownerId: value.ownerId!, sharePercentage: value.sharePercentage }).subscribe({
      next: () => {
        this.ownerSubmitting.set(false);
        this.ownerDialogVisible.set(false);
        this.messageService.add({ severity: 'success', summary: 'Propriétaire associé' });
        this.loadOwners();
      },
      error: (err) => {
        this.ownerSubmitting.set(false);
        const detail = err?.status === 409 ? 'Ce propriétaire est déjà associé, ou appartient à une autre organisation.' : "L'association a échoué.";
        this.messageService.add({ severity: 'error', summary: 'Erreur', detail });
      },
    });
  }

  ownerTypeLabel(type: OwnerType): string {
    return type === 'PARTICULIER' ? 'Particulier' : 'Société';
  }

  // --- Transactions ----------------------------------------------
  loadTransactions(): void {
    this.financeService.listTransactions(this.propertyId).subscribe((transactions) => this.transactions.set(transactions));
  }

  openTransactionDialog(): void {
    this.transactionForm.reset();
    this.transactionDialogVisible.set(true);
  }

  submitTransaction(): void {
    if (this.transactionForm.invalid) {
      this.transactionForm.markAllAsTouched();
      return;
    }
    this.transactionSubmitting.set(true);
    const value = this.transactionForm.getRawValue();
    this.financeService
      .createTransaction(this.propertyId, {
        type: value.type!,
        category: value.category!,
        amount: value.amount!,
        description: value.description,
        transactionDate: value.transactionDate!.toISOString().slice(0, 10),
      })
      .subscribe({
        next: () => {
          this.transactionSubmitting.set(false);
          this.transactionDialogVisible.set(false);
          this.messageService.add({ severity: 'success', summary: 'Transaction enregistrée' });
          this.loadTransactions();
        },
        error: () => {
          this.transactionSubmitting.set(false);
          this.messageService.add({ severity: 'error', summary: 'Erreur', detail: "L'enregistrement a échoué." });
        },
      });
  }

  // --- Maintenance -----------------------------------------------
  loadMaintenance(): void {
    this.maintenanceService.list(this.propertyId).subscribe((requests) => this.maintenanceRequests.set(requests));
  }

  openMaintenanceDialog(): void {
    this.maintenanceForm.reset();
    this.maintenanceDialogVisible.set(true);
  }

  submitMaintenance(): void {
    if (this.maintenanceForm.invalid) {
      this.maintenanceForm.markAllAsTouched();
      return;
    }
    this.maintenanceSubmitting.set(true);
    const value = this.maintenanceForm.getRawValue();
    this.maintenanceService.create(this.propertyId, { unitId: null, description: value.description, priority: value.priority! }).subscribe({
      next: () => {
        this.maintenanceSubmitting.set(false);
        this.maintenanceDialogVisible.set(false);
        this.messageService.add({ severity: 'success', summary: 'Demande créée' });
        this.loadMaintenance();
      },
      error: () => {
        this.maintenanceSubmitting.set(false);
        this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'La création a échoué.' });
      },
    });
  }

  openCloseDialog(request: MaintenanceRequestResponse): void {
    this.closingRequestId.set(request.id);
    this.closeForm.reset();
    this.closeDialogVisible.set(true);
  }

  submitClose(): void {
    const id = this.closingRequestId();
    if (!id) {
      return;
    }
    this.maintenanceSubmitting.set(true);
    const value = this.closeForm.getRawValue();
    this.maintenanceService.close(this.propertyId, id, { vendorName: value.vendorName, cost: value.cost }).subscribe({
      next: () => {
        this.maintenanceSubmitting.set(false);
        this.closeDialogVisible.set(false);
        this.messageService.add({ severity: 'success', summary: 'Demande clôturée' });
        this.loadMaintenance();
      },
      error: () => {
        this.maintenanceSubmitting.set(false);
        this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'La clôture a échoué.' });
      },
    });
  }

  // --- Documents -------------------------------------------------
  loadDocuments(): void {
    const organizationId = this.auth.session()?.organizationId;
    if (!organizationId) {
      return;
    }
    this.documentService.listForEntity(organizationId, 'PROPERTY', this.propertyId).subscribe((docs) => this.documents.set(docs));
  }

  openDocumentDialog(): void {
    this.documentForm.reset();
    this.documentDialogVisible.set(true);
  }

  submitDocument(): void {
    if (this.documentForm.invalid) {
      this.documentForm.markAllAsTouched();
      return;
    }
    const organizationId = this.auth.session()?.organizationId;
    if (!organizationId) {
      return;
    }
    this.documentSubmitting.set(true);
    const value = this.documentForm.getRawValue();
    this.documentService
      .create({
        organizationId,
        entityType: 'PROPERTY',
        entityId: this.propertyId,
        type: value.type!,
        fileName: value.fileName,
        s3Key: `${organizationId}/property/${this.propertyId}/${value.fileName}`,
      })
      .subscribe({
        next: () => {
          this.documentSubmitting.set(false);
          this.documentDialogVisible.set(false);
          this.messageService.add({ severity: 'success', summary: 'Document enregistré' });
          this.loadDocuments();
        },
        error: () => {
          this.documentSubmitting.set(false);
          this.messageService.add({ severity: 'error', summary: 'Erreur', detail: "L'enregistrement a échoué." });
        },
      });
  }
}

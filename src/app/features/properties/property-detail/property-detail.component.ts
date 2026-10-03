import { CurrencyPipe, DatePipe, Location, NgClass } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService, PrimeTemplate } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { DialogModule } from 'primeng/dialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { TabsModule } from 'primeng/tabs';
import { TagModule } from 'primeng/tag';
import { TextareaModule } from 'primeng/textarea';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { AuthService } from '../../../core/auth/auth.service';
import { DocumentService } from '../../../core/services/document.service';
import { FinanceService } from '../../../core/services/finance.service';
import { LeaseService } from '../../../core/services/lease.service';
import { MaintenanceService } from '../../../core/services/maintenance.service';
import { OwnerService } from '../../../core/services/owner.service';
import { PropertyService } from '../../../core/services/property.service';
import { TenantService } from '../../../core/services/tenant.service';

import { DocumentResponse, DOCUMENT_TYPE_LABELS, DocumentType } from '../../../core/models/document.model';
import {
  TRANSACTION_CATEGORY_LABELS,
  TransactionCategory,
  TransactionResponse,
  TransactionType,
} from '../../../core/models/finance.model';
import { LeaseResponse } from '../../../core/models/lease.model';
import {
  MAINTENANCE_PRIORITY_LABELS,
  MAINTENANCE_PRIORITY_SEVERITY,
  MAINTENANCE_STATUS_LABELS,
  MAINTENANCE_STATUS_SEVERITY,
  MaintenancePriority,
  MaintenanceRequestResponse,
} from '../../../core/models/maintenance.model';
import { OwnerResponse, PropertyOwnerResponse } from '../../../core/models/owner.model';
import {
  BUILDING_STATUS_LABELS,
  PROPERTY_STATUS_LABELS,
  PROPERTY_STATUS_SEVERITY,
  PROPERTY_TYPE_LABELS,
  PropertyResponse,
  UNIT_STATUS_LABELS,
  UNIT_STATUS_SEVERITY,
  UNIT_TYPE_LABELS,
  UnitResponse,
  UnitStatus,
  UnitType,
} from '../../../core/models/property.model';
import { TenantResponse } from '../../../core/models/tenant.model';

interface HistoryEntry {
  date: string;
  icon: string;
  iconClass: string;
  title: string;
  detail: string;
}

@Component({
  selector: 'app-property-detail',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    FormsModule,
    ButtonModule,
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
    NgClass,
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
  private readonly leaseService = inject(LeaseService);
  private readonly tenantService = inject(TenantService);
  private readonly messageService = inject(MessageService);

  readonly propertyId = this.route.snapshot.paramMap.get('propertyId')!;

  readonly property = signal<PropertyResponse | null>(null);
  readonly loading = signal(true);

  readonly typeLabels = PROPERTY_TYPE_LABELS;
  readonly statusLabels = PROPERTY_STATUS_LABELS;
  readonly statusSeverity = PROPERTY_STATUS_SEVERITY;
  readonly unitStatusLabels = UNIT_STATUS_LABELS;
  readonly unitStatusSeverity = UNIT_STATUS_SEVERITY;
  readonly unitTypeLabels = UNIT_TYPE_LABELS;
  readonly unitTypeOptions = Object.entries(UNIT_TYPE_LABELS).map(([value, label]) => ({ label, value }));
  readonly unitStatusOptions = Object.entries(UNIT_STATUS_LABELS).map(([value, label]) => ({ label, value }));
  readonly buildingStatusLabels = BUILDING_STATUS_LABELS;
  readonly maintenancePriorityLabels = MAINTENANCE_PRIORITY_LABELS;
  readonly maintenancePrioritySeverity = MAINTENANCE_PRIORITY_SEVERITY;
  readonly maintenanceStatusLabels = MAINTENANCE_STATUS_LABELS;
  readonly maintenanceStatusSeverity = MAINTENANCE_STATUS_SEVERITY;
  readonly transactionCategoryLabels = TRANSACTION_CATEGORY_LABELS;
  readonly documentTypeLabels = DOCUMENT_TYPE_LABELS;

  // --- Vue d'ensemble : KPI --------------------------------------------
  readonly occupancyRate = computed(() => {
    const units = this.units();
    if (!units.length) {
      return null;
    }
    const occupied = units.filter((u) => u.status === 'OCCUPEE').length;
    return Math.round((occupied / units.length) * 100);
  });

  readonly monthlyRevenue = computed(() =>
    this.units()
      .filter((u) => u.status === 'OCCUPEE')
      .reduce((sum, u) => sum + (u.listedRent ?? 0), 0)
  );

  // --- Units -------------------------------------------------------
  readonly units = signal<UnitResponse[]>([]);
  readonly unitLeasesByUnitId = signal<Record<string, LeaseResponse | null>>({});
  readonly tenants = signal<TenantResponse[]>([]);

  readonly unitSearchTerm = signal('');
  readonly unitFloorFilter = signal<number | null>(null);
  readonly unitStatusFilter = signal<UnitStatus | null>(null);
  readonly unitTypeFilter = signal<UnitType | null>(null);

  readonly floorOptions = computed(() => {
    const floors = new Set(this.units().map((u) => u.floor).filter((f): f is number => f != null));
    return [...floors].sort((a, b) => a - b).map((floor) => ({ label: `Étage ${floor}`, value: floor }));
  });

  readonly availableUnitsCount = computed(() => this.units().filter((u) => u.status === 'DISPONIBLE').length);
  readonly occupiedUnitsCount = computed(() => this.units().filter((u) => u.status === 'OCCUPEE').length);
  readonly renovationUnitsCount = computed(() => this.units().filter((u) => u.status === 'EN_MAINTENANCE').length);

  readonly filteredUnits = computed(() => {
    const term = this.unitSearchTerm().trim().toLowerCase();
    const floor = this.unitFloorFilter();
    const status = this.unitStatusFilter();
    const type = this.unitTypeFilter();
    return this.units().filter((unit) => {
      const matchesTerm = !term || unit.label.toLowerCase().includes(term);
      const matchesFloor = floor == null || unit.floor === floor;
      const matchesStatus = !status || unit.status === status;
      const matchesType = !type || unit.type === type;
      return matchesTerm && matchesFloor && matchesStatus && matchesType;
    });
  });

  // Arrow function (pas une methode de classe) : utilisee comme callback
  // direct au template (unitTenantName(unit.id)).
  readonly unitTenantName = (unitId: string): string | null => {
    const lease = this.unitLeasesByUnitId()[unitId];
    if (!lease || !lease.tenantIds.length) {
      return null;
    }
    const names = lease.tenantIds.map((id) => {
      const tenant = this.tenants().find((t) => t.id === id);
      return tenant ? `${tenant.firstName} ${tenant.lastName}` : null;
    }).filter((n): n is string => !!n);
    return names.length ? names.join(', ') : null;
  };

  // --- Owners --------------------------------------------------------
  readonly propertyOwners = signal<PropertyOwnerResponse[]>([]);
  readonly availableOwners = signal<OwnerResponse[]>([]);
  readonly ownerDialogVisible = signal(false);
  readonly ownerSubmitting = signal(false);
  readonly ownerForm = this.fb.nonNullable.group({
    ownerId: this.fb.nonNullable.control<string | null>(null, Validators.required),
    sharePercentage: this.fb.nonNullable.control(100, [Validators.required, Validators.min(0), Validators.max(100)]),
  });

  readonly ownerRows = computed(() =>
    this.propertyOwners().map((po) => ({
      ...po,
      owner: this.availableOwners().find((o) => o.id === po.ownerId) ?? null,
    }))
  );

  readonly managerName = computed(() => this.auth.session()?.organizationName ?? '—');

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

  // --- Documents / Photos -----------------------------------------
  readonly documents = signal<DocumentResponse[]>([]);
  readonly documentDialogVisible = signal(false);
  readonly documentSubmitting = signal(false);
  readonly documentTypeOptions = Object.entries(DOCUMENT_TYPE_LABELS).map(([value, label]) => ({ label, value }));
  readonly documentForm = this.fb.nonNullable.group({
    type: this.fb.nonNullable.control<DocumentType | null>(null, Validators.required),
    fileName: ['', [Validators.required, Validators.maxLength(255)]],
  });

  // --- Historique ----------------------------------------------------
  readonly historyEntries = computed<HistoryEntry[]>(() => {
    const entries: HistoryEntry[] = [];
    const property = this.property();
    if (property) {
      entries.push({
        date: property.createdAt,
        icon: 'pi-building',
        iconClass: 'icon-box-primary',
        title: 'Propriété créée',
        detail: `${property.street}, ${property.city}`,
      });
    }
    for (const tx of this.transactions()) {
      entries.push({
        date: tx.transactionDate,
        icon: tx.type === 'REVENU' ? 'pi-arrow-up-right' : 'pi-arrow-down-right',
        iconClass: tx.type === 'REVENU' ? 'icon-box-success' : 'icon-box-danger',
        title: tx.type === 'REVENU' ? 'Revenu enregistré' : 'Dépense enregistrée',
        detail: `${this.transactionCategoryLabels[tx.category]} · ${tx.amount}$`,
      });
    }
    for (const request of this.maintenanceRequests()) {
      entries.push({
        date: request.createdAt,
        icon: 'pi-wrench',
        iconClass: 'icon-box-warning',
        title: 'Demande de maintenance',
        detail: request.description,
      });
    }
    return entries.sort((a, b) => (a.date < b.date ? 1 : -1));
  });

  constructor() {
    this.loadProperty();
  }

  editProperty(): void {
    this.router.navigate(['/properties', this.propertyId, 'edit']);
  }

  moreActions(): void {
    this.messageService.add({ severity: 'info', summary: 'Bientôt disponible' });
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
    this.propertyService.listUnits(this.propertyId).subscribe((units) => {
      this.units.set(units);
      this.loadUnitLeases(units);
    });

    const organizationId = this.auth.session()?.organizationId;
    if (organizationId) {
      this.tenantService.listByOrganization(organizationId).subscribe((tenants) => this.tenants.set(tenants));
    }
  }

  // Pas d'endpoint "locataire actuel par unite" -- on va chercher les baux
  // de chaque unite (acceptable pour un portefeuille de cette taille) pour
  // afficher la colonne Locataire du tableau des appartements.
  private loadUnitLeases(units: UnitResponse[]): void {
    if (!units.length) {
      this.unitLeasesByUnitId.set({});
      return;
    }
    forkJoin(
      units.map((unit) =>
        this.leaseService.list(this.propertyId, unit.id).pipe(catchError(() => of<LeaseResponse[]>([])))
      )
    ).subscribe((leasesByUnit) => {
      const map: Record<string, LeaseResponse | null> = {};
      units.forEach((unit, index) => {
        map[unit.id] = leasesByUnit[index].find((lease) => lease.status === 'ACTIVE') ?? null;
      });
      this.unitLeasesByUnitId.set(map);
    });
  }

  openNewUnit(): void {
    this.router.navigate(['/properties', this.propertyId, 'units', 'new']);
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

  addPhotos(): void {
    this.messageService.add({ severity: 'info', summary: 'Bientôt disponible', detail: "L'envoi de photos sera ajouté prochainement." });
  }
}

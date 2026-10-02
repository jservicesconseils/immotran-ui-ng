import { CurrencyPipe, DatePipe, Location } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { MessageService, PrimeTemplate } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { DialogModule } from 'primeng/dialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';

import { AuthService } from '../../../core/auth/auth.service';
import { PAYMENT_STATUS_LABELS, PAYMENT_STATUS_SEVERITY, PaymentResponse } from '../../../core/models/finance.model';
import { LEASE_STATUS_LABELS, LEASE_STATUS_SEVERITY, LeaseResponse } from '../../../core/models/lease.model';
import { TenantResponse } from '../../../core/models/tenant.model';
import { FinanceService } from '../../../core/services/finance.service';
import { LeaseService } from '../../../core/services/lease.service';
import { TenantService } from '../../../core/services/tenant.service';

@Component({
  selector: 'app-lease-detail',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    ButtonModule,
    DatePickerModule,
    DialogModule,
    InputNumberModule,
    TableModule,
    TagModule,
    CurrencyPipe,
    DatePipe,
    PrimeTemplate,
  ],
  templateUrl: './lease-detail.component.html',
  styleUrl: './lease-detail.component.scss',
})
export class LeaseDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly location = inject(Location);
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly leaseService = inject(LeaseService);
  private readonly financeService = inject(FinanceService);
  private readonly tenantService = inject(TenantService);
  private readonly messageService = inject(MessageService);

  readonly propertyId = this.route.snapshot.paramMap.get('propertyId')!;
  readonly unitId = this.route.snapshot.paramMap.get('unitId')!;
  readonly leaseId = this.route.snapshot.paramMap.get('leaseId')!;

  readonly lease = signal<LeaseResponse | null>(null);
  readonly payments = signal<PaymentResponse[]>([]);
  readonly tenants = signal<TenantResponse[]>([]);
  readonly loading = signal(true);

  readonly paymentDialogVisible = signal(false);
  readonly paymentSubmitting = signal(false);
  readonly recordDialogVisible = signal(false);
  readonly recordSubmitting = signal(false);
  readonly recordingPaymentId = signal<string | null>(null);

  readonly leaseStatusLabels = LEASE_STATUS_LABELS;
  readonly leaseStatusSeverity = LEASE_STATUS_SEVERITY;
  readonly paymentStatusLabels = PAYMENT_STATUS_LABELS;
  readonly paymentStatusSeverity = PAYMENT_STATUS_SEVERITY;

  readonly paymentForm = this.fb.nonNullable.group({
    dueDate: this.fb.control<Date | null>(null, Validators.required),
    amountDue: this.fb.control<number | null>(null, Validators.required),
  });

  readonly recordForm = this.fb.nonNullable.group({
    amountPaid: this.fb.control<number | null>(null, Validators.required),
  });

  readonly tenantName = (tenantId: string): string => {
    const tenant = this.tenants().find((t) => t.id === tenantId);
    return tenant ? `${tenant.firstName} ${tenant.lastName}` : tenantId;
  };

  constructor() {
    this.load();
  }

  goBack(): void {
    this.location.back();
  }

  private load(): void {
    this.loading.set(true);
    this.leaseService.getById(this.propertyId, this.unitId, this.leaseId).subscribe({
      next: (lease) => {
        this.lease.set(lease);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Bail introuvable.' });
      },
    });
    this.loadPayments();

    const organizationId = this.auth.session()?.organizationId;
    if (organizationId) {
      this.tenantService.listByOrganization(organizationId).subscribe((tenants) => this.tenants.set(tenants));
    }
  }

  loadPayments(): void {
    this.financeService.listPayments(this.propertyId, this.unitId, this.leaseId).subscribe((payments) => this.payments.set(payments));
  }

  recordSecurityDepositPayment(): void {
    this.leaseService.recordSecurityDepositPayment(this.propertyId, this.unitId, this.leaseId).subscribe({
      next: (lease) => {
        this.lease.set(lease);
        this.messageService.add({ severity: 'success', summary: 'Dépôt de garantie enregistré' });
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Erreur', detail: "L'enregistrement du dépôt a échoué." });
      },
    });
  }

  openPaymentDialog(): void {
    this.paymentForm.reset();
    this.paymentDialogVisible.set(true);
  }

  submitPayment(): void {
    if (this.paymentForm.invalid) {
      this.paymentForm.markAllAsTouched();
      return;
    }
    this.paymentSubmitting.set(true);
    const value = this.paymentForm.getRawValue();
    this.financeService
      .createPayment(this.propertyId, this.unitId, this.leaseId, {
        dueDate: value.dueDate!.toISOString().slice(0, 10),
        amountDue: value.amountDue!,
      })
      .subscribe({
        next: () => {
          this.paymentSubmitting.set(false);
          this.paymentDialogVisible.set(false);
          this.messageService.add({ severity: 'success', summary: 'Échéance créée' });
          this.loadPayments();
        },
        error: () => {
          this.paymentSubmitting.set(false);
          this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'La création a échoué.' });
        },
      });
  }

  openRecordDialog(payment: PaymentResponse): void {
    this.recordingPaymentId.set(payment.id);
    this.recordForm.reset();
    this.recordDialogVisible.set(true);
  }

  submitRecord(): void {
    const paymentId = this.recordingPaymentId();
    if (!paymentId || this.recordForm.invalid) {
      this.recordForm.markAllAsTouched();
      return;
    }
    this.recordSubmitting.set(true);
    const value = this.recordForm.getRawValue();
    this.financeService
      .recordPayment(this.propertyId, this.unitId, this.leaseId, paymentId, { amountPaid: value.amountPaid!, paidAt: null })
      .subscribe({
        next: () => {
          this.recordSubmitting.set(false);
          this.recordDialogVisible.set(false);
          this.messageService.add({ severity: 'success', summary: 'Paiement enregistré' });
          this.loadPayments();
        },
        error: () => {
          this.recordSubmitting.set(false);
          this.messageService.add({ severity: 'error', summary: 'Erreur', detail: "L'enregistrement a échoué." });
        },
      });
  }
}

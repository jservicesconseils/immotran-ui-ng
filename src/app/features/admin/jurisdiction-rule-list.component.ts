import { DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { DialogModule } from 'primeng/dialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { TextareaModule } from 'primeng/textarea';
import { MessageService, PrimeTemplate } from 'primeng/api';
import { CANADIAN_PROVINCES } from '../../core/constants/provinces';
import { JurisdictionRuleResponse } from '../../core/models/admin.model';
import { AdminService } from '../../core/services/admin.service';

@Component({
  selector: 'app-jurisdiction-rule-list',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    ButtonModule,
    DialogModule,
    InputTextModule,
    InputNumberModule,
    TextareaModule,
    SelectModule,
    DatePickerModule,
    TableModule,
    DatePipe,
    PrimeTemplate,
  ],
  templateUrl: './jurisdiction-rule-list.component.html',
  styleUrl: './jurisdiction-rule-list.component.scss',
})
export class JurisdictionRuleListComponent {
  private readonly fb = inject(FormBuilder);
  private readonly adminService = inject(AdminService);
  private readonly messageService = inject(MessageService);

  readonly provinceOptions = CANADIAN_PROVINCES;
  readonly rules = signal<JurisdictionRuleResponse[]>([]);
  readonly loading = signal(false);
  readonly dialogVisible = signal(false);
  readonly submitting = signal(false);
  readonly selectedProvince = signal<string>(CANADIAN_PROVINCES[0].value);

  readonly form = this.fb.nonNullable.group({
    province: this.fb.nonNullable.control<string | null>(null, Validators.required),
    ruleType: ['', [Validators.required, Validators.maxLength(100)]],
    description: ['', [Validators.required, Validators.maxLength(1000)]],
    effectiveDate: this.fb.control<Date | null>(null, Validators.required),
    source: ['', [Validators.required, Validators.maxLength(500)]],
    version: this.fb.nonNullable.control(1, [Validators.required, Validators.min(1)]),
  });

  constructor() {
    this.load();
  }

  onProvinceChange(province: string): void {
    this.selectedProvince.set(province);
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.adminService.listJurisdictionRulesByProvince(this.selectedProvince()).subscribe({
      next: (rules) => {
        this.rules.set(rules);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Impossible de charger les règles.' });
      },
    });
  }

  openDialog(): void {
    this.form.reset({ version: 1 });
    this.dialogVisible.set(true);
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    this.submitting.set(true);

    this.adminService
      .createJurisdictionRule({
        province: value.province!,
        ruleType: value.ruleType,
        description: value.description,
        effectiveDate: value.effectiveDate!.toISOString().slice(0, 10),
        source: value.source,
        version: value.version,
      })
      .subscribe({
        next: () => {
          this.submitting.set(false);
          this.dialogVisible.set(false);
          this.messageService.add({ severity: 'success', summary: 'Règle créée', detail: 'La règle juridictionnelle a été ajoutée.' });
          this.load();
        },
        error: () => {
          this.submitting.set(false);
          this.messageService.add({ severity: 'error', summary: 'Erreur', detail: "La création de la règle a échoué." });
        },
      });
  }
}

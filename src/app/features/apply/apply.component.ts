import { Component, inject, signal } from '@angular/core';
import { FormArray, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { ApplicationService } from '../../core/services/application.service';

/**
 * Formulaire PUBLIC de soumission de candidature (voir
 * ApplicationController cote backend : POST non authentifie). Route
 * en dehors du shell authentifie -- un candidat a la location n'a pas
 * de compte et ne doit pas en creer un pour postuler.
 */
@Component({
  selector: 'app-apply',
  standalone: true,
  imports: [ReactiveFormsModule, ButtonModule, InputNumberModule, InputTextModule, MessageModule],
  templateUrl: './apply.component.html',
  styleUrl: './apply.component.scss',
})
export class ApplyComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);
  private readonly applicationService = inject(ApplicationService);

  private readonly propertyId = this.route.snapshot.paramMap.get('propertyId')!;
  private readonly unitId = this.route.snapshot.paramMap.get('unitId')!;

  readonly submitting = signal(false);
  readonly submitted = signal(false);
  readonly submissionFailed = signal(false);

  readonly form = this.fb.nonNullable.group({
    firstName: ['', [Validators.required, Validators.maxLength(100)]],
    lastName: ['', [Validators.required, Validators.maxLength(100)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(200)]],
    phone: ['', [Validators.required, Validators.maxLength(30)]],
    employerName: this.fb.control<string | null>(null, Validators.maxLength(200)),
    monthlyIncome: this.fb.control<number | null>(null, Validators.min(0)),
    references: this.fb.array([this.buildReferenceGroup()], Validators.required),
  });

  get references(): FormArray {
    return this.form.controls.references;
  }

  private buildReferenceGroup() {
    return this.fb.nonNullable.group({
      name: ['', [Validators.required, Validators.maxLength(200)]],
      phone: this.fb.control<string | null>(null, Validators.maxLength(30)),
      email: this.fb.control<string | null>(null, [Validators.email, Validators.maxLength(200)]),
    });
  }

  addReference(): void {
    this.references.push(this.buildReferenceGroup());
  }

  removeReference(index: number): void {
    if (this.references.length > 1) {
      this.references.removeAt(index);
    }
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    this.submissionFailed.set(false);
    const value = this.form.getRawValue();

    this.applicationService
      .submit(this.propertyId, this.unitId, {
        firstName: value.firstName,
        lastName: value.lastName,
        email: value.email,
        phone: value.phone,
        employerName: value.employerName,
        monthlyIncome: value.monthlyIncome,
        references: value.references,
      })
      .subscribe({
        next: () => {
          this.submitting.set(false);
          this.submitted.set(true);
        },
        error: () => {
          this.submitting.set(false);
          this.submissionFailed.set(true);
        },
      });
  }
}

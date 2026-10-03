import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TenantApplicationStatusResponse } from '../../../core/models/application.model';
import { ApplicationService } from '../../../core/services/application.service';

type TimelineState = 'done' | 'current' | 'upcoming';

/** Espace locataire -- "Mon dossier de location" (maquette, ecran 07). */
@Component({
  selector: 'app-tenant-dossier',
  standalone: true,
  imports: [CurrencyPipe, DatePipe],
  templateUrl: './tenant-dossier.component.html',
  styleUrl: './tenant-dossier.component.scss',
})
export class TenantDossierComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly applicationService = inject(ApplicationService);

  private readonly applicationId = this.route.snapshot.paramMap.get('applicationId')!;

  readonly application = signal<TenantApplicationStatusResponse | null>(null);
  readonly loading = signal(true);
  readonly notFound = signal(false);

  readonly isDecided = computed(() => {
    const status = this.application()?.status;
    return status === 'ACCEPTEE' || status === 'REFUSEE';
  });

  readonly statusBadge = computed(() => {
    const status = this.application()?.status;
    if (status === 'ACCEPTEE') {
      return { label: 'Approuvé', severity: 'success' as const };
    }
    if (status === 'REFUSEE') {
      return { label: 'Refusé', severity: 'danger' as const };
    }
    return { label: 'En étude', severity: 'warn' as const };
  });

  readonly submittedState = computed<TimelineState>(() => 'done');

  readonly studyState = computed<TimelineState>(() => (this.isDecided() ? 'done' : 'current'));

  readonly decisionState = computed<TimelineState>(() => {
    if (this.isDecided()) {
      return 'done';
    }
    return 'upcoming';
  });

  constructor() {
    this.applicationService.getPublicStatus(this.applicationId).subscribe({
      next: (application) => {
        this.application.set(application);
        this.loading.set(false);
      },
      error: () => {
        this.notFound.set(true);
        this.loading.set(false);
      },
    });
  }

  trackingNumber(application: TenantApplicationStatusResponse): string {
    const year = new Date(application.submittedAt).getFullYear();
    const shortId = application.id.split('-')[0].toUpperCase();
    return `DL-${year}-${shortId}`;
  }

  goToDecision(): void {
    this.router.navigate(['/locataire/dossiers', this.applicationId, 'decision']);
  }
}

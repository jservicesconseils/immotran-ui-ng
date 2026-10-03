import { CurrencyPipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TenantApplicationStatusResponse } from '../../../core/models/application.model';
import { ApplicationService } from '../../../core/services/application.service';

/** Espace locataire -- "Décision sur votre dossier" (maquette, ecran 08). */
@Component({
  selector: 'app-tenant-decision',
  standalone: true,
  imports: [CurrencyPipe],
  templateUrl: './tenant-decision.component.html',
  styleUrl: './tenant-decision.component.scss',
})
export class TenantDecisionComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly applicationService = inject(ApplicationService);

  private readonly applicationId = this.route.snapshot.paramMap.get('applicationId')!;

  readonly application = signal<TenantApplicationStatusResponse | null>(null);
  readonly loading = signal(true);

  constructor() {
    this.applicationService.getPublicStatus(this.applicationId).subscribe({
      next: (application) => {
        this.application.set(application);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  trackingNumber(application: TenantApplicationStatusResponse): string {
    const year = new Date(application.submittedAt).getFullYear();
    const shortId = application.id.split('-')[0].toUpperCase();
    return `DL-${year}-${shortId}`;
  }

  goToDossier(): void {
    this.router.navigate(['/locataire/dossiers', this.applicationId]);
  }
}

import { CurrencyPipe, DatePipe, UpperCasePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ChartModule } from 'primeng/chart';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { AuthService } from '../../core/auth/auth.service';
import { DashboardService } from '../../core/services/dashboard.service';
import { APPLICATION_STATUS_LABELS, ApplicationStatus } from '../../core/models/application.model';
import { DashboardResponse, RecentApplicationResponse } from '../../core/models/dashboard.model';
import { CHART_COLORS } from '../../core/theme/immotran-preset';

// Libelles simplifies pour le badge "Dossiers recents" (voir maquette,
// ecran 09) : En attente / En etude / Approuve / Refuse, plus synthetiques
// que les statuts internes detailles (voir APPLICATION_STATUS_LABELS).
const RECENT_STATUS_LABELS: Record<ApplicationStatus, string> = {
  EN_ATTENTE_VERIFICATION: 'En attente',
  EN_EVALUATION: 'En étude',
  EN_ATTENTE_INFO: 'En attente',
  ACCEPTEE: 'Approuvé',
  REFUSEE: 'Refusé',
};

const RECENT_STATUS_SEVERITY: Record<ApplicationStatus, 'warn' | 'success' | 'danger'> = {
  EN_ATTENTE_VERIFICATION: 'warn',
  EN_EVALUATION: 'warn',
  EN_ATTENTE_INFO: 'warn',
  ACCEPTEE: 'success',
  REFUSEE: 'danger',
};

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, ChartModule, ProgressSpinnerModule, CurrencyPipe, DatePipe, UpperCasePipe],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent {
  private readonly auth = inject(AuthService);
  private readonly dashboardService = inject(DashboardService);
  private readonly router = inject(Router);

  readonly session = this.auth.session;
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly data = signal<DashboardResponse | null>(null);

  readonly statusLabels = APPLICATION_STATUS_LABELS;
  readonly recentStatusLabels = RECENT_STATUS_LABELS;
  readonly recentStatusSeverity = RECENT_STATUS_SEVERITY;

  readonly occupancyRate = computed(() => {
    const d = this.data();
    if (!d || d.totalUnits === 0) {
      return 0;
    }
    return Math.round((d.occupiedUnits / d.totalUnits) * 100);
  });

  readonly occupancyChartData = computed(() => {
    const d = this.data();
    return {
      labels: ['Occupées', 'Vacantes'],
      datasets: [
        {
          data: [d?.occupiedUnits ?? 0, d?.vacantUnits ?? 0],
          backgroundColor: [CHART_COLORS.occupied, CHART_COLORS.vacant],
          borderWidth: 0,
          hoverOffset: 6,
        },
      ],
    };
  });

  readonly occupancyChartOptions = {
    cutout: '72%',
    plugins: {
      legend: { position: 'bottom', labels: { usePointStyle: true, padding: 16 } },
    },
  };

  constructor() {
    this.load();
  }

  private load(): void {
    const organizationId = this.session()?.organizationId;
    if (!organizationId) {
      this.loading.set(false);
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    this.dashboardService.getForOrganization(organizationId).subscribe({
      next: (response) => {
        this.data.set(response);
        this.loading.set(false);
      },
      error: () => {
        this.error.set("Impossible de charger le tableau de bord. Verifiez que l'API immotran-ms-core est demarree.");
        this.loading.set(false);
      },
    });
  }

  openApplicationReview(application: RecentApplicationResponse): void {
    this.router.navigate([
      '/properties',
      application.propertyId,
      'units',
      application.unitId,
      'applications',
      application.id,
      'review',
    ]);
  }
}

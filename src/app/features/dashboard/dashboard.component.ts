import { CurrencyPipe, NgClass } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { ChartModule } from 'primeng/chart';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TagModule } from 'primeng/tag';
import { AuthService } from '../../core/auth/auth.service';
import { DashboardService } from '../../core/services/dashboard.service';
import { DashboardResponse } from '../../core/models/dashboard.model';
import { CHART_COLORS } from '../../core/theme/immotran-preset';

interface KpiCard {
  label: string;
  value: string;
  icon: string;
  iconClass: string;
  hint?: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [ChartModule, ProgressSpinnerModule, TagModule, CurrencyPipe, NgClass],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent {
  private readonly auth = inject(AuthService);
  private readonly dashboardService = inject(DashboardService);

  readonly session = this.auth.session;
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly data = signal<DashboardResponse | null>(null);

  readonly netProfit = computed(() => {
    const d = this.data();
    return d ? d.totalRevenue - d.totalExpenses : 0;
  });

  readonly occupancyRate = computed(() => {
    const d = this.data();
    if (!d || d.totalUnits === 0) {
      return 0;
    }
    return Math.round((d.occupiedUnits / d.totalUnits) * 100);
  });

  readonly kpiCards = computed<KpiCard[]>(() => {
    const d = this.data();
    if (!d) {
      return [];
    }
    return [
      {
        label: 'Propriétés',
        value: `${d.totalProperties}`,
        icon: 'pi pi-building',
        iconClass: 'icon-box-primary',
        hint: `${d.totalUnits} unité(s) au total`,
      },
      {
        label: "Taux d'occupation",
        value: `${this.occupancyRate()}%`,
        icon: 'pi pi-key',
        iconClass: 'icon-box-success',
        hint: `${d.occupiedUnits} occupée(s) · ${d.vacantUnits} vacante(s)`,
      },
      {
        label: 'Maintenance ouverte',
        value: `${d.openMaintenanceRequests}`,
        icon: 'pi pi-wrench',
        iconClass: 'icon-box-warning',
        hint: 'Demandes en cours ou ouvertes',
      },
      {
        label: 'Baux à échéance',
        value: `${d.leasesExpiringNext30Days}`,
        icon: 'pi pi-calendar-clock',
        iconClass: 'icon-box-danger',
        hint: 'Dans les 30 prochains jours',
      },
    ];
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
    cutout: '68%',
    plugins: {
      legend: { position: 'bottom', labels: { usePointStyle: true, padding: 16 } },
    },
  };

  readonly financeChartData = computed(() => {
    const d = this.data();
    return {
      labels: ['Revenus', 'Dépenses'],
      datasets: [
        {
          label: 'Montant ($)',
          data: [d?.totalRevenue ?? 0, d?.totalExpenses ?? 0],
          backgroundColor: [CHART_COLORS.revenue, CHART_COLORS.expenses],
          borderRadius: 8,
          barThickness: 56,
        },
      ],
    };
  });

  readonly financeChartOptions = {
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { display: false } },
      y: { grid: { color: '#e2e8f0' }, beginAtZero: true },
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
}

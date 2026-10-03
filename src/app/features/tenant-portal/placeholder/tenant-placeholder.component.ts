import { Component, Input } from '@angular/core';

/**
 * Page de reserve pour les sections de l'espace locataire non couvertes
 * par la maquette de reference (seuls "Mes dossiers" et la decision ont
 * un ecran fourni) -- evite un lien mort dans la navigation.
 */
@Component({
  selector: 'app-tenant-placeholder',
  standalone: true,
  template: `
    <h1 class="page-title">{{ title }}</h1>
    <div class="surface-card empty-state">
      <i class="pi pi-hourglass"></i>
      <p>Cette section sera bientôt disponible.</p>
    </div>
  `,
  styles: [
    `
      .page-title {
        font-size: 1.4rem;
        font-weight: 700;
        color: var(--p-surface-900);
        margin: 0 0 1.5rem;
      }
      .empty-state {
        text-align: center;
        padding: 3rem 1rem;
        color: var(--p-surface-400);
      }
      .empty-state .pi {
        font-size: 2rem;
        margin-bottom: 0.75rem;
        display: block;
      }
    `,
  ],
})
export class TenantPlaceholderComponent {
  @Input() title = '';
}

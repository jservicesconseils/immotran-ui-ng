import { Component, Input } from '@angular/core';

/**
 * Page de reserve pour les sections du menu gestionnaire issues de la
 * maquette mais non detaillees par elle (Appartements en liste plate,
 * Dossiers de location, Baux, Paiements, Rapports, Paramètres) -- evite
 * un lien mort plutot que d'inventer une fonctionnalite non specifiee.
 */
@Component({
  selector: 'app-manager-placeholder',
  standalone: true,
  template: `
    <div class="page-header">
      <div>
        <h1>{{ title }}</h1>
      </div>
    </div>
    <div class="surface-card empty-state">
      <i class="pi pi-hourglass"></i>
      <p>Cette section sera bientôt disponible.</p>
    </div>
  `,
  styles: [
    `
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
export class ManagerPlaceholderComponent {
  @Input() title = '';
}

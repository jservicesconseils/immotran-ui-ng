import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { AuthService } from '../../core/auth/auth.service';

interface NavItem {
  label: string;
  icon: string;
  route: string;
}

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, AvatarModule, ButtonModule, TooltipModule],
  templateUrl: './shell.component.html',
  styleUrl: './shell.component.scss',
})
export class ShellComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly session = this.auth.session;

  // Liste et ordre alignes sur la maquette de reference (ecran 09). Les
  // routes sans page dediee dans ce MVP pointent vers une page "bientot
  // disponible" (voir ManagerPlaceholderComponent) plutot que de laisser
  // un lien mort. Propriétaires et Règles juridictionnelles sont des
  // fonctionnalites reelles absentes de la maquette -- ajoutees en fin
  // de liste plutot que supprimees.
  readonly navItems: NavItem[] = [
    { label: 'Tableau de bord', icon: 'pi pi-home', route: '/dashboard' },
    { label: 'Immeubles', icon: 'pi pi-building', route: '/properties' },
    { label: 'Appartements', icon: 'pi pi-th-large', route: '/appartements' },
    { label: 'Dossiers de location', icon: 'pi pi-file', route: '/dossiers-location' },
    { label: 'Locataires', icon: 'pi pi-users', route: '/tenants' },
    { label: 'Baux', icon: 'pi pi-file-edit', route: '/baux' },
    { label: 'Paiements', icon: 'pi pi-wallet', route: '/paiements' },
    { label: 'Rapports', icon: 'pi pi-chart-bar', route: '/rapports' },
    { label: 'Paramètres', icon: 'pi pi-cog', route: '/parametres' },
    { label: 'Propriétaires', icon: 'pi pi-id-card', route: '/owners' },
    { label: 'Règles juridictionnelles', icon: 'pi pi-shield', route: '/admin/jurisdiction-rules' },
  ];

  initials(): string {
    const name = this.session()?.displayName ?? '';
    return name
      .split(' ')
      .map((part) => part.charAt(0))
      .filter(Boolean)
      .slice(0, 2)
      .join('')
      .toUpperCase();
  }

  logout(): void {
    this.auth.logout();
    this.router.navigateByUrl('/login');
  }
}

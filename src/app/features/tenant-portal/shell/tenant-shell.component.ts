import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

interface TenantNavItem {
  label: string;
  icon: string;
  route: string;
}

/**
 * Coquille de l'espace locataire : sidebar blanche dediee (voir
 * maquette ecran 07), distincte de ShellComponent (gestionnaire, sidebar
 * sombre). Pas de garde d'authentification -- un candidat/locataire
 * accede a son dossier par un lien direct (son "numero de suivi"), sans
 * compte, exactement comme ApplicationPublicStatusController cote
 * backend ne verifie que l'id de la candidature.
 */
@Component({
  selector: 'app-tenant-shell',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './tenant-shell.component.html',
  styleUrl: './tenant-shell.component.scss',
})
export class TenantShellComponent {
  readonly navItems: TenantNavItem[] = [
    { label: 'Tableau de bord', icon: 'pi-home', route: '/locataire/tableau-de-bord' },
    { label: 'Mes dossiers', icon: 'pi-file', route: '/locataire/dossiers' },
    { label: 'Mes documents', icon: 'pi-folder', route: '/locataire/documents' },
    { label: 'Mes paiements', icon: 'pi-wallet', route: '/locataire/paiements' },
    { label: 'Mon profil', icon: 'pi-user', route: '/locataire/profil' },
  ];
}

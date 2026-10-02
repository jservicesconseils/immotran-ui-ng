import { NgClass } from '@angular/common';
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
  iconClass: string;
}

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, NgClass, AvatarModule, ButtonModule, TooltipModule],
  templateUrl: './shell.component.html',
  styleUrl: './shell.component.scss',
})
export class ShellComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly session = this.auth.session;

  readonly navItems: NavItem[] = [
    { label: 'Tableau de bord', icon: 'pi pi-home', route: '/dashboard', iconClass: 'icon-box-primary' },
    { label: 'Propriétés', icon: 'pi pi-building', route: '/properties', iconClass: 'icon-box-success' },
    { label: 'Propriétaires', icon: 'pi pi-id-card', route: '/owners', iconClass: 'icon-box-warning' },
    { label: 'Locataires', icon: 'pi pi-users', route: '/tenants', iconClass: 'icon-box-neutral' },
    { label: 'Règles juridictionnelles', icon: 'pi pi-shield', route: '/admin/jurisdiction-rules', iconClass: 'icon-box-danger' },
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

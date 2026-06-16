import { Component, inject, input, output, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { HasPermissionDirective } from '../shared/directives/has-permission.directive';
import { HasRoleDirective } from '../shared/directives/has-role.directive';
import { AuthService } from '../core/services/auth.service';
import { CasesService } from '../features/cases/cases.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    HasPermissionDirective,
    HasRoleDirective,
  ],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent {
  isOpen  = input<boolean>(true);
  navClick    = output<void>();
  sidebarToggle = output<void>();

  private authService  = inject(AuthService);
  private casesService = inject(CasesService);

  // Live draft count for the badge
  readonly draftCount = computed(() => this.casesService.draftStats().awaitingDraft);

  // User display info from JWT
  readonly userName    = computed(() => this.authService.user()?.name  ?? '');
  readonly userRole    = computed(() => this.authService.user()?.role  ?? '');
  readonly userInitials = computed(() => {
    const name = this.userName();
    if (!name) return '?';
    return name.split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase();
  });

  onNavClick(): void { this.navClick.emit(); }

  logout(): void { this.authService.logout(); }
}
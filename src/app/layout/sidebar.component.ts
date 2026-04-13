import { Component, inject, input, output, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';
import { HasPermissionDirective } from '../shared/directives/has-permission.directive';
import { HasRoleDirective } from '../shared/directives/has-role.directive';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { MatBadgeModule } from '@angular/material/badge';
import { ThemeService } from '../core/services/theme.service';
import { AuthService } from '../core/services/auth.service';
import { Router } from '@angular/router';
import { HeaderComponent } from './header.component';

interface Notification {
  id: number;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'info' | 'warning' | 'success' | 'error';
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [HeaderComponent, MatIconModule, MatButtonModule, RouterModule, HasPermissionDirective, HasRoleDirective, MatFormFieldModule, MatInputModule, MatToolbarModule, MatMenuModule, MatDividerModule, MatListModule, MatBadgeModule,MatIconModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent {
  // toggleSidebar = output<void>();
  // themeService = inject(ThemeService);
  // authService = inject(AuthService);
  // router = inject(Router);

  // notifications = signal<Notification[]>([
  //   {
  //     id: 1,
  //     title: 'System Update',
  //     message: 'System will be updated tonight',
  //     time: '5 min ago',
  //     read: false,
  //     type: 'info',
  //   },
  //   {
  //     id: 2,
  //     title: 'New User Registration',
  //     message: 'John Doe has registered',
  //     time: '10 min ago',
  //     read: false,
  //     type: 'success',
  //   },
  //   {
  //     id: 3,
  //     title: 'Payment Failed',
  //     message: 'Payment processing failed for order #123',
  //     time: '15 min ago',
  //     read: true,
  //     type: 'error',
  //   },
  //   {
  //     id: 4,
  //     title: 'Backup Complete',
  //     message: 'Daily backup completed successfully',
  //     time: '1 hour ago',
  //     read: true,
  //     type: 'success',
  //   },
  // ]);

  // unreadCount = signal(2);

  // navigateToProfile() {
  //   this.router.navigate(['/dashboard/profile']);
  // }

  // navigateToSettings() {
  //   this.router.navigate(['/dashboard/settings']);
  // }

  // logout() {
  //   this.authService.logout();
  // }

  // navigateToNotifications() {
  //   this.router.navigate(['/dashboard/pages/notifications']);
  // }

  // markAsRead(notificationId: number) {
  //   this.notifications.update((notifications) =>
  //     notifications.map((n) => (n.id === notificationId ? { ...n, read: true } : n)),
  //   );
  //   this.updateUnreadCount();
  // }

  // private updateUnreadCount() {
  //   const unread = this.notifications().filter((n) => !n.read).length;
  //   this.unreadCount.set(unread);
  // }



  isOpen = input(false);
  navClick = output<void>();
  sidebarToggle = output<void>();

  isCollapsed = signal(false);

  onNavClick() {
    this.navClick.emit();
  }

  toggleSidebar() {
    this.isCollapsed.update((value) => !value);
    this.sidebarToggle.emit();
  }
}

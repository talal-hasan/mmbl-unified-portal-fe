import {
  Component, inject, output, signal, computed,
  ViewChild, ElementRef, AfterViewInit, OnDestroy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule, MatMenuTrigger } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { filter } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { ThemeService } from '../core/services/theme.service';
import { AuthService } from '../core/services/auth.service';
import { CasesService } from '../features/cases/cases.service';

interface NavItem { label: string; path: string; badge?: number; }
interface Notification {
  id: number; title: string; message: string;
  time: string; read: boolean; type: 'info'|'warning'|'success'|'error';
}

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule, MatMenuModule, MatButtonModule, MatDividerModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent implements AfterViewInit, OnDestroy {
  toggleSidebar = output<void>();

  themeService = inject(ThemeService);
  authService  = inject(AuthService);
  casesService = inject(CasesService);
  router       = inject(Router);

  @ViewChild('navScroll') navScrollEl!: ElementRef<HTMLElement>;

  private routerSub!: Subscription;
  currentPath = signal('');
  canScrollLeft  = false;
  canScrollRight = false;

  // Live draft badge from service
  readonly draftCount = computed(() => this.casesService.draftStats().awaitingDraft);

  readonly navItems = computed<NavItem[]>(() => [
    { label: 'Dashboard',   path: '/dashboard' },
    { label: 'Draft Cases', path: '/draft-cases', badge: this.draftCount() },
    { label: 'Cases',       path: '/cases' },
    { label: 'Breached',    path: '/cases' },   // filters to breached — update when route exists
    { label: 'To-Do',       path: '/todos' },
    { label: 'Reports',     path: '/reports' },
  ]);

  readonly userInitials = computed(() => {
    const name = this.authService.user()?.name ?? 'U';
    return name.split(' ').map((p: string) => p[0]).slice(0, 2).join('').toUpperCase();
  });

  notifications = signal<Notification[]>([
    { id: 1, title: 'SLA Breach Alert',      message: '4 cases will breach within 2 hours', time: '5 min ago',  read: false, type: 'warning' },
    { id: 2, title: 'New Draft Ingested',    message: 'Email from ahmed.raza@example.com',  time: '10 min ago', read: false, type: 'info' },
    { id: 3, title: 'Case TC-8892 Resolved', message: 'Closed by Abdullah Kamran',          time: '1h ago',     read: true,  type: 'success' },
    { id: 4, title: 'System Sync Complete',  message: 'CMS sync completed: 142 records',    time: '2h ago',     read: true,  type: 'success' },
  ]);

  unreadCount = computed(() => this.notifications().filter(n => !n.read).length);

  ngAfterViewInit(): void {
    this.routerSub = this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe((e: any) => this.currentPath.set(e.urlAfterRedirects));
    this.currentPath.set(this.router.url);
    setTimeout(() => this.updateScrollState(), 100);
  }

  ngOnDestroy(): void { this.routerSub?.unsubscribe(); }

  isActive(path: string): boolean {
    return this.router.isActive(path, { paths: 'subset', queryParams: 'ignored', fragment: 'ignored', matrixParams: 'ignored' });
  }

  onNavClick(item: NavItem): void { /* router handles navigation */ }

  scrollNav(dir: 1 | -1): void {
    const el = this.navScrollEl?.nativeElement;
    if (!el) return;
    el.scrollBy({ left: dir * 180, behavior: 'smooth' });
    setTimeout(() => this.updateScrollState(), 350);
  }

  updateScrollState(): void {
    const el = this.navScrollEl?.nativeElement;
    if (!el) return;
    this.canScrollLeft  = el.scrollLeft > 0;
    this.canScrollRight = el.scrollLeft + el.clientWidth < el.scrollWidth - 2;
  }

  markAsRead(id: number): void {
    this.notifications.update(ns => ns.map(n => n.id === id ? { ...n, read: true } : n));
  }

  navigateToProfile():       void { this.router.navigate(['/dashboard/profile']); }
  navigateToSettings():      void { this.router.navigate(['/dashboard/settings']); }
  navigateToNotifications(): void { this.router.navigate(['/dashboard/pages/notifications']); }
  logout():                  void { this.authService.logout(); }
}
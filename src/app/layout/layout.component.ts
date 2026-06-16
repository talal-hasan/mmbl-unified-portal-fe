import { Component, signal, inject, OnInit } from '@angular/core';
import { MatSidenavModule } from '@angular/material/sidenav';
import { RouterOutlet } from '@angular/router';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { HeaderComponent } from './header.component';
import { SidebarComponent } from './sidebar.component';
import { FooterComponent } from '../shared/components/footer/footer.component';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [MatSidenavModule, RouterOutlet, HeaderComponent, SidebarComponent, FooterComponent, MatIcon],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.scss',
})
export class LayoutComponent {
  // private breakpointObserver = inject(BreakpointObserver);

  // sidebarOpen = signal(false);
  // isMobile = signal(false);

  // ngOnInit() {
  //   this.breakpointObserver.observe([Breakpoints.Handset]).subscribe((result) => {
  //     this.isMobile.set(result.matches);
  //     this.sidebarOpen.set(!result.matches);
  //   });
  // }

  // toggleSidebar() {
  //   this.sidebarOpen.update((value) => !value);
  // }

  // closeSidebar() {
  //   if (this.isMobile()) {
  //     this.sidebarOpen.set(false);
  //   }
  // }
}

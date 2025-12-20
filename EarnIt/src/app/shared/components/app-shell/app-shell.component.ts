import { Component, signal, inject, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { MatSidenavModule, MatSidenav } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { map } from 'rxjs/operators';

/**
 * App Shell Component
 * Provides the main layout with header and responsive sidebar
 */
@Component({
  selector: 'app-app-shell',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatSidenavModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
  ],
  templateUrl: './app-shell.component.html',
  styleUrl: './app-shell.component.scss',
})
export class AppShellComponent implements OnInit {
  @ViewChild('sidenav') sidenav!: MatSidenav;
  private readonly breakpointObserver = inject(BreakpointObserver);
  protected readonly sidebarOpen = signal(true);

  // Responsive: close sidebar on mobile by default
  protected readonly isHandset$ = this.breakpointObserver
    .observe(Breakpoints.Handset)
    .pipe(map((result) => result.matches));

  ngOnInit(): void {
    // Close sidebar on mobile by default
    this.isHandset$.subscribe((isHandset) => {
      if (isHandset) {
        this.sidebarOpen.set(false);
      } else {
        this.sidebarOpen.set(true);
      }
    });
  }

  protected toggleSidebar(): void {
    this.sidebarOpen.update((value) => !value);
    if (this.sidenav) {
      if (this.sidebarOpen()) {
        this.sidenav.open();
      } else {
        this.sidenav.close();
      }
    }
  }
}


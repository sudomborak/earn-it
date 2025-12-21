import { Component } from '@angular/core';
import { AppShellComponent } from './shared/components/app-shell/app-shell.component';

/**
 * Root App Component
 * Wraps the application with the app shell layout
 */
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [AppShellComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {}

import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';

@Component({
  imports: [RouterLink, RouterOutlet],
  selector: 'app-root',
  styleUrl: './app.css',
  template: `
    <div class="app-shell">
      <header class="border-bottom bg-white">
        <nav class="container py-3 d-flex align-items-center justify-content-between">
          <a class="text-decoration-none fw-bold text-dark" routerLink="/home">ACESSA+</a>
          <span class="text-muted small">Frontend Angular</span>
        </nav>
      </header>
      <router-outlet />
    </div>
  `,
})
export class App {
}

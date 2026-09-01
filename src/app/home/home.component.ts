import { Component } from '@angular/core';

@Component({
  selector: 'app-home',
  standalone: true,
  template: `
    <main class="container py-5">
      <section class="p-4 p-md-5 bg-light border rounded-4">
        <p class="text-uppercase text-primary fw-semibold mb-2">ACESSA+</p>
        <h1 class="display-6 fw-bold mb-3">Base do frontend pronta para o MVP</h1>
        <p class="lead mb-0">
          Estrutura inicial em Angular para a consulta de locais e informações de acessibilidade em Sorocaba.
        </p>
      </section>
    </main>
  `,
})
export class HomeComponent {}

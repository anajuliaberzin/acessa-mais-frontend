import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home-footer',
  imports: [RouterLink],
  template: `
    <footer>
      <div class="footer-inner">
        <div class="identity">
          <a class="brand" routerLink="/home" aria-label="Acessa+, início">Acessa<span>+</span></a>
          <p>Mais informação. Mais autonomia.</p>
        </div>
        <nav aria-label="Links do rodapé">
          <a routerLink="/sobre">Quem somos nós</a>
          <a routerLink="/sobre" fragment="objetivos">Nossos objetivos</a>
          <a routerLink="/explorar">Explorar locais <i class="bi bi-arrow-up-right" aria-hidden="true"></i></a>
        </nav>
      </div>
      <div class="credits"><span>Feito pelo <a routerLink="/sobre" fragment="equipe">Clean Code Squad</a></span><span>Sorocaba · SP</span></div>
    </footer>
  `,
  styleUrl: './home-footer.component.css',
})
export class HomeFooterComponent {}

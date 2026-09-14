import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink],
  template: `
    <main class="landing-page">
      <section class="hero-shell">
        <header class="topbar">
          <a class="brand" routerLink="/home">
            <span class="brand-mark" aria-hidden="true">♿</span>
            <span>Acessa+</span>
          </a>

          <nav class="topnav" aria-label="Navegação principal">
            <a href="#inicio">Início</a>
            <a href="#explorar">Explorar</a>
            <a href="#rotas">Rotas</a>
            <a href="#reportar">Reportar</a>
            <a href="#perfil">Perfil</a>
            <a href="#admin">Admin</a>
            @if (auth.isAuthenticated()) {
              <button class="logout-btn" type="button" (click)="auth.logout()">Sair</button>
            } @else {
              <a routerLink="/login">Entrar</a>
            }
          </nav>
        </header>

        <div class="hero-content" id="inicio">
          <span class="eyebrow">
            <span class="eyebrow-icon">♿</span>
            Acessibilidade urbana em Sorocaba
          </span>

          <h1>
            Encontre lugares que
            <span>realmente</span>
            são acessíveis.
          </h1>

          <p class="hero-copy">
            Descubra locais, rotas e informações de acessibilidade em Sorocaba.
          </p>

          <label class="search-label" for="search">
            O que você está procurando?
          </label>

          <div class="search-row">
            <div class="search-box">
              <span class="search-icon" aria-hidden="true">⌕</span>
              <input
                id="search"
                type="text"
                placeholder="Ex.: restaurantes acessíveis, hospitais, praças..."
                aria-label="Pesquisar locais acessíveis"
              />
            </div>
            <button class="primary-btn" type="button">Buscar</button>
          </div>

          <div class="chips" aria-label="Sugestões de busca">
            <button type="button">Restaurantes acessíveis</button>
            <button type="button">Hospitais</button>
            <button type="button">Shopping</button>
            <button type="button">Praças</button>
            <button type="button">Comércio</button>
          </div>
        </div>
      </section>

      <section class="feature-band" id="explorar">
        <div class="section-header">
          <div>
            <p class="section-kicker">Categorias de acessibilidade</p>
            <h2>Filtre a cidade pelo tipo de necessidade que importa para você.</h2>
          </div>
        </div>

        <div class="category-grid">
          <article class="category-card">
            <span class="category-icon">♿</span>
            <h3>Mobilidade</h3>
            <p>Rampas, elevadores e circulação.</p>
          </article>
          <article class="category-card">
            <span class="category-icon">◉</span>
            <h3>Visual</h3>
            <p>Piso tátil, braile e contraste.</p>
          </article>
          <article class="category-card active">
            <span class="category-icon">◔</span>
            <h3>Auditiva</h3>
            <p>Libra e avisos visuais.</p>
          </article>
          <article class="category-card">
            <span class="category-icon">◌</span>
            <h3>Cognitiva</h3>
            <p>Sinalização clara e apoio.</p>
          </article>
          <article class="category-card">
            <span class="category-icon">⬚</span>
            <h3>Estrutura</h3>
            <p>Banheiros e vagas adaptadas.</p>
          </article>
          <article class="category-card">
            <span class="category-icon">▣</span>
            <h3>Transporte</h3>
            <p>Terminais e pontos acessíveis.</p>
          </article>
        </div>
      </section>

      <section class="steps-section" id="rotas">
        <div class="section-header">
          <div>
            <p class="section-kicker">Como funciona?</p>
            <h2>Três passos para achar um caminho mais acessível.</h2>
          </div>
        </div>

        <div class="steps-grid">
          <article class="step-card">
            <span class="step-badge">1</span>
            <h3>Encontre</h3>
            <p>Procure locais acessíveis próximos a você.</p>
          </article>
          <article class="step-card">
            <span class="step-badge">2</span>
            <h3>Confira</h3>
            <p>Veja avaliações, fotos e recursos disponíveis.</p>
          </article>
          <article class="step-card">
            <span class="step-badge">3</span>
            <h3>Contribua</h3>
            <p>Informe problemas e ajude outras pessoas.</p>
          </article>
        </div>
      </section>

      <section class="places-section">
        <div class="section-header section-header--split">
          <div>
            <p class="section-kicker">Locais mais acessíveis</p>
            <h2>Avaliados pela comunidade Acessa+ em Sorocaba.</h2>
          </div>
          <a class="map-link" href="#admin">Ver todos no mapa →</a>
        </div>

        <div class="places-grid">
          <article class="place-card">
            <div class="place-head">
              <h3>Esplanada Shopping</h3>
              <span class="rating">★ 4.6</span>
            </div>
            <p class="place-meta">Shopping · Votorantim / Divisa</p>
            <div class="score score--good">93/100 · Alta acessibilidade</div>
            <div class="tags">
              <span>Entrada acessível</span>
              <span>Elevador</span>
              <span>Banheiro adaptado</span>
              <span>Vaga acessível</span>
            </div>
            <button type="button" class="secondary-btn">Ver detalhes</button>
          </article>

          <article class="place-card">
            <div class="place-head">
              <h3>Hospital Santa Lucinda</h3>
              <span class="rating">★ 4.4</span>
            </div>
            <p class="place-meta">Hospital · Vila Hortência</p>
            <div class="score score--good">91/100 · Alta acessibilidade</div>
            <div class="tags">
              <span>Entrada acessível</span>
              <span>Elevador</span>
              <span>Banheiro adaptado</span>
              <span>Vaga acessível</span>
            </div>
            <button type="button" class="secondary-btn">Ver detalhes</button>
          </article>

          <article class="place-card">
            <div class="place-head">
              <h3>Shopping Cidade Sorocaba</h3>
              <span class="rating">★ 4.7</span>
            </div>
            <p class="place-meta">Shopping · Centro</p>
            <div class="score score--good">87/100 · Alta acessibilidade</div>
            <div class="tags">
              <span>Entrada acessível</span>
              <span>Elevador</span>
              <span>Banheiro adaptado</span>
              <span>Vaga acessível</span>
            </div>
            <button type="button" class="secondary-btn">Ver detalhes</button>
          </article>
        </div>
      </section>
    </main>
  `,
  styles: [`
    :host {
      display: block;
    }

    .landing-page {
      color: #1a2340;
      background:
        radial-gradient(circle at top left, rgba(95, 93, 236, 0.12), transparent 38%),
        linear-gradient(180deg, #f6f8ff 0%, #f7f8fc 45%, #eef1fb 100%);
      min-height: 100vh;
    }

    .hero-shell,
    .feature-band,
    .steps-section,
    .places-section {
      max-width: 1180px;
      margin: 0 auto;
      padding: 0 24px;
    }

    .hero-shell {
      padding-top: 18px;
    }

    .topbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 24px;
      padding: 14px 20px;
      border: 1px solid rgba(34, 48, 89, 0.08);
      border-radius: 24px 24px 0 0;
      background: rgba(255, 255, 255, 0.82);
      backdrop-filter: blur(16px);
      box-shadow: 0 14px 40px rgba(27, 37, 72, 0.07);
    }

    .brand {
      display: inline-flex;
      align-items: center;
      gap: 12px;
      color: #1a2340;
      font-weight: 800;
      font-size: 1.1rem;
      text-decoration: none;
    }

    .brand-mark {
      display: inline-grid;
      place-items: center;
      width: 36px;
      height: 36px;
      border-radius: 999px;
      background: linear-gradient(135deg, #6f63ff, #4c6fff);
      color: #fff;
      font-size: 1rem;
      box-shadow: 0 10px 24px rgba(79, 93, 225, 0.35);
    }

    .topnav {
      display: flex;
      flex-wrap: wrap;
      justify-content: flex-end;
      gap: 18px;
    }

    .topnav a,
    .map-link {
      color: #5a6380;
      text-decoration: none;
      font-weight: 600;
      transition: color 0.2s ease;
    }

    .logout-btn {
      border: 0;
      background: transparent;
      color: #5a6380;
      font-weight: 600;
      cursor: pointer;
      padding: 0;
    }

    .topnav a:hover,
    .map-link:hover {
      color: #4f5de1;
    }

    .hero-content {
      padding: 74px 0 58px;
      border-left: 1px solid rgba(34, 48, 89, 0.08);
      border-right: 1px solid rgba(34, 48, 89, 0.08);
      border-bottom: 1px solid rgba(34, 48, 89, 0.08);
      border-radius: 0 0 32px 32px;
      background: rgba(255, 255, 255, 0.58);
      box-shadow: 0 18px 42px rgba(27, 37, 72, 0.06);
    }

    .hero-content > * {
      margin-left: 72px;
      margin-right: 72px;
    }

    .eyebrow {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      padding: 8px 14px;
      border-radius: 999px;
      background: #dce8ff;
      color: #2f4fa3;
      font-weight: 700;
      font-size: 0.95rem;
    }

    .eyebrow-icon {
      display: inline-grid;
      place-items: center;
      width: 22px;
      height: 22px;
      border-radius: 8px;
      background: #4d8bff;
      color: #fff;
      font-size: 0.8rem;
    }

    h1 {
      max-width: 860px;
      margin-top: 26px;
      margin-bottom: 18px;
      font-size: clamp(3rem, 6vw, 5.4rem);
      line-height: 0.98;
      letter-spacing: -0.05em;
      font-weight: 800;
      color: #1a2240;
    }

    h1 span {
      color: #5850ea;
    }

    .hero-copy {
      max-width: 720px;
      margin-top: 0;
      margin-bottom: 28px;
      font-size: 1.25rem;
      color: #53607f;
    }

    .search-label {
      display: block;
      margin-bottom: 10px;
      font-size: 1rem;
      font-weight: 700;
      color: #1f2a44;
    }

    .search-row {
      display: flex;
      align-items: center;
      gap: 12px;
      max-width: 720px;
    }

    .search-box {
      flex: 1;
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 18px 18px 18px 16px;
      border: 1px solid rgba(81, 99, 163, 0.18);
      border-radius: 24px;
      background: #fff;
      box-shadow: 0 12px 24px rgba(27, 37, 72, 0.08);
    }

    .search-box input {
      width: 100%;
      border: 0;
      outline: 0;
      font: inherit;
      color: #1a2340;
      background: transparent;
    }

    .search-icon {
      color: #66718f;
      font-size: 1.2rem;
      line-height: 1;
    }

    .primary-btn,
    .secondary-btn {
      border: 0;
      border-radius: 22px;
      font-weight: 700;
      transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
    }

    .primary-btn {
      padding: 18px 22px;
      background: linear-gradient(135deg, #4f5de1, #4a67f0);
      color: #fff;
      box-shadow: 0 12px 24px rgba(79, 93, 225, 0.28);
      min-width: 120px;
    }

    .secondary-btn {
      padding: 14px 18px;
      background: linear-gradient(135deg, #4f5de1, #5b53ef);
      color: #fff;
      width: fit-content;
      box-shadow: 0 10px 22px rgba(79, 93, 225, 0.22);
    }

    .primary-btn:hover,
    .secondary-btn:hover {
      transform: translateY(-1px);
    }

    .chips {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      max-width: 820px;
      margin-top: 14px;
    }

    .chips button {
      padding: 12px 16px;
      border: 0;
      border-radius: 999px;
      background: #e9edff;
      color: #2a3570;
      font-weight: 600;
    }

    .feature-band,
    .steps-section,
    .places-section {
      padding-top: 78px;
      padding-bottom: 72px;
    }

    .section-header {
      margin-bottom: 28px;
    }

    .section-header--split {
      display: flex;
      align-items: end;
      justify-content: space-between;
      gap: 24px;
    }

    .section-kicker {
      margin: 0 0 8px;
      font-weight: 800;
      font-size: clamp(1.8rem, 3vw, 2.4rem);
      letter-spacing: -0.04em;
      color: #1a2340;
    }

    .section-header h2 {
      margin: 0;
      color: #506080;
      font-size: 1.05rem;
      font-weight: 500;
    }

    .category-grid,
    .steps-grid,
    .places-grid {
      display: grid;
      gap: 16px;
    }

    .category-grid {
      grid-template-columns: repeat(6, minmax(0, 1fr));
    }

    .category-card,
    .step-card,
    .place-card {
      border: 1px solid rgba(52, 69, 125, 0.12);
      background: rgba(255, 255, 255, 0.92);
      box-shadow: 0 14px 32px rgba(27, 37, 72, 0.08);
    }

    .category-card {
      border-radius: 26px;
      padding: 18px;
      min-height: 160px;
    }

    .category-card.active {
      border-color: rgba(79, 93, 225, 0.36);
    }

    .category-icon {
      display: inline-flex;
      margin-bottom: 18px;
      font-size: 1.5rem;
    }

    .category-card h3,
    .step-card h3,
    .place-card h3 {
      margin: 0 0 8px;
      color: #1a2340;
      font-size: 1.05rem;
      font-weight: 800;
    }

    .category-card p,
    .step-card p,
    .place-card p {
      margin: 0;
      color: #546181;
      line-height: 1.45;
    }

    .steps-section {
      background: linear-gradient(180deg, rgba(235, 239, 252, 0.85), rgba(242, 246, 255, 0.72));
      border-top: 1px solid rgba(34, 48, 89, 0.08);
      border-bottom: 1px solid rgba(34, 48, 89, 0.08);
    }

    .steps-grid {
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }

    .step-card,
    .place-card {
      border-radius: 28px;
      padding: 24px;
    }

    .step-badge {
      display: inline-grid;
      place-items: center;
      width: 44px;
      height: 44px;
      margin-bottom: 30px;
      border-radius: 999px;
      background: linear-gradient(135deg, #5b53ef, #4c87f7);
      color: #fff;
      font-weight: 800;
      font-size: 1.05rem;
    }

    .places-grid {
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }

    .place-head {
      display: flex;
      align-items: start;
      justify-content: space-between;
      gap: 12px;
      margin-bottom: 8px;
    }

    .rating {
      color: #d59100;
      font-weight: 800;
      white-space: nowrap;
    }

    .place-meta {
      margin-bottom: 16px !important;
    }

    .score {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 16px;
      padding: 8px 12px;
      border-radius: 999px;
      font-weight: 700;
      font-size: 0.92rem;
    }

    .score--good {
      background: #def4e5;
      color: #10804a;
    }

    .tags {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      margin-bottom: 18px;
    }

    .tags span {
      padding: 8px 0;
      color: #47536f;
      font-weight: 600;
    }

    @media (max-width: 1100px) {
      .category-grid,
      .places-grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }

      .steps-grid {
        grid-template-columns: 1fr;
      }
    }

    @media (max-width: 760px) {
      .topbar,
      .section-header--split,
      .search-row {
        flex-direction: column;
        align-items: stretch;
      }

      .topnav {
        justify-content: flex-start;
      }

      .hero-content {
        padding-top: 48px;
      }

      .hero-content > * {
        margin-left: 20px;
        margin-right: 20px;
      }

      .category-grid,
      .places-grid {
        grid-template-columns: 1fr;
      }

      h1 {
        font-size: clamp(2.4rem, 12vw, 4rem);
      }
    }
  `],
})
export class HomeComponent {
  readonly auth = inject(AuthService);
}

import { Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { SessaoService } from '../auth/sessao.service';

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive],
  template: ` <a class="skip-link" href="#conteudo">Pular para o conteúdo</a>
    <header class="site-header" (keydown.escape)="closeMenu($event, menuToggle)">
      <div class="header-inner">
        <a class="brand" routerLink="/home" (click)="open.set(false)" aria-label="Acessa+, início"
          ><span class="brand-mark"><i class="bi bi-universal-access" aria-hidden="true"></i></span
          ><span>Acessa<span class="brand-plus">+</span></span></a
        >
        <button
          class="menu-toggle" #menuToggle
          type="button"
          (click)="open.set(!open())"
          [attr.aria-expanded]="open()"
          aria-controls="main-nav"
          aria-label="Abrir ou fechar navegação"
        >
          <i class="bi bi-list" aria-hidden="true"></i>
        </button>
        <nav id="main-nav" [class.is-open]="open()" aria-label="Navegação principal">
          @for (item of links; track item.path) {
            @if (
              (item.path !== '/perfil' || auth.isAuthenticated()) &&
              (item.path !== '/painel' || (auth.isAuthenticated() && sessao.perfil()?.gestor))
            ) {
              <a
                [routerLink]="item.path"
                routerLinkActive="active"
                ariaCurrentWhenActive="page"
                (click)="open.set(false)"
                ><i [class]="'bi bi-' + item.icon" aria-hidden="true"></i>{{ item.label }}</a
              >
            }
          }
          @if (auth.isAuthenticated()) {
            <button class="login-button" (click)="auth.logout(); open.set(false)">
              <i class="bi bi-box-arrow-right" aria-hidden="true"></i>Sair
            </button>
          } @else {
            <a class="login-button" routerLink="/login" (click)="open.set(false)"
              ><i class="bi bi-box-arrow-in-right" aria-hidden="true"></i>Entrar</a
            >
          }
        </nav>
      </div>
    </header>`,
  styleUrl: './header.component.css',
})
export class HeaderComponent {
  readonly auth = inject(AuthService);
  readonly sessao = inject(SessaoService);
  readonly open = signal(false);
  closeMenu(event: Event, trigger: HTMLButtonElement) { if(this.open()){event.preventDefault();this.open.set(false);trigger.focus();} }
  readonly links = [
    { path: '/home', label: 'Início', icon: 'house-door' },
    { path: '/explorar', label: 'Explorar', icon: 'map' },
    { path: '/rotas', label: 'Rotas', icon: 'signpost-split' },
    { path: '/reportar', label: 'Reportar', icon: 'exclamation-triangle' },
    { path: '/perfil', label: 'Perfil', icon: 'person' },
    { path: '/painel', label: 'Admin', icon: 'grid' },
  ];
}

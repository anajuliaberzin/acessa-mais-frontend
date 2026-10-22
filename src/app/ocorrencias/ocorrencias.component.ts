import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PlataformaService, Pagina, Registro } from '../services/plataforma.service';
import { RegistroComponent } from './registro.component';

@Component({
  imports: [RouterLink, RegistroComponent],
  template: `
    <main class="container py-5" style="max-width:900px">
      <a routerLink="/home">Voltar ao início</a><h1 class="mt-3">Minhas ocorrências</h1>
      <p>Acompanhe os protocolos e as respostas do município.</p><a routerLink="/reportar">Reportar um problema</a>
      <button class="btn btn-outline-secondary ms-3" (click)="carregar()" [disabled]="carregando()">Atualizar</button>
      @if (erro()) { <p role="alert">{{ erro() }}</p> }
      @if (carregando()) { <p role="status">Carregando…</p> }
      @for (item of pagina()?.results; track item.id) { <app-registro [registro]="item" /> }
      @if (!carregando() && pagina()?.count === 0) { <p class="mt-4">Você ainda não registrou ocorrências.</p> }
      @if (pagina(); as p) { <nav class="d-flex gap-3" aria-label="Paginação"><button [disabled]="!p.previous || carregando()" (click)="mudar(-1)">Anterior</button><span>Página {{ numero }} · {{ p.count }} ocorrências</span><button [disabled]="!p.next || carregando()" (click)="mudar(1)">Próxima</button></nav> }
    </main>
  `,
})
export class OcorrenciasComponent {
  private readonly api = inject(PlataformaService);
  readonly pagina = signal<Pagina<Registro> | null>(null); readonly carregando = signal(false); readonly erro = signal('');
  numero = 1;
  constructor() { this.carregar(); }
  carregar() {
    this.carregando.set(true); this.erro.set(''); this.pagina.set(null);
    this.api.ocorrencias(false, { page: this.numero }).subscribe({ next: p => { this.pagina.set(p); this.carregando.set(false); }, error: () => { this.erro.set('Não foi possível carregar suas ocorrências.'); this.carregando.set(false); } });
  }
  mudar(delta: number) { this.numero += delta; this.carregar(); }
}

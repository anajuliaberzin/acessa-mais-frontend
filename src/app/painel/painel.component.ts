import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { PlataformaService, Pagina, Registro, Indicadores, rotuloStatus } from '../services/plataforma.service';
import { RegistroComponent } from '../ocorrencias/registro.component';
import { TIPOS_PROBLEMA } from '../models/ocorrencia.model';

@Component({
  imports: [CommonModule, FormsModule, RouterLink, RegistroComponent],
  template: `
    <main class="container py-5">
      <a routerLink="/home">Voltar ao início</a><h1 class="mt-3">Painel do município</h1><p>Sorocaba/SP · Gestão de acessibilidade</p>
      @if (negado()) { <p role="alert">Acesso restrito aos gestores do município.</p> }
      @else {
        <form class="card p-3 my-4" (ngSubmit)="filtrar()">
          <h2 class="h5">Filtrar ocorrências</h2><div class="row g-3">
            <label class="col-md-2">De<input class="form-control" type="date" name="inicio" [(ngModel)]="inicio" /></label>
            <label class="col-md-2">Até<input class="form-control" type="date" name="fim" [(ngModel)]="fim" /></label>
            <label class="col-md-2">Status<select class="form-select" name="status" [(ngModel)]="filtroStatus"><option value="">Todos</option>@for (s of statuses; track s) { <option [value]="s">{{ status(s) }}</option> }</select></label>
            <label class="col-md-3">Tipo<select class="form-select" name="tipo" [(ngModel)]="tipo"><option value="">Todos</option>@for (t of tipos; track t.valor) { <option [value]="t.valor">{{ t.rotulo }}</option> }</select></label>
            <label class="col-md-3">Endereço<input class="form-control" name="endereco" [(ngModel)]="endereco" /></label>
          </div><button class="btn btn-primary mt-3" [disabled]="carregando()">Aplicar filtros</button>
        </form>
        @if (erro()) { <p role="alert" class="alert alert-danger">{{ erro() }}</p> }
        @if (carregando()) { <p role="status">Carregando indicadores e ocorrências…</p> }
        @if (indicadores(); as i) {
          <div class="row g-3 mb-4">
            <div class="col-md-3"><div class="card p-3"><span>Ocorrências filtradas</span><strong class="fs-2">{{ i.total_ocorrencias }}</strong></div></div>
            <div class="col-md-3"><div class="card p-3"><span>Locais publicados</span><strong class="fs-2">{{ i.total_locais }}</strong></div></div>
            <div class="col-md-3"><div class="card p-3"><span>Nota média dos locais</span><strong class="fs-2">{{ i.media_acessibilidade === null ? 'Sem dados' : (i.media_acessibilidade | number:'1.1-1') }}</strong></div></div>
            <div class="col-md-3"><div class="card p-3"><span>Locais sem nota</span><strong class="fs-2">{{ i.locais_sem_nota }}</strong></div></div>
          </div>
          <p>Os filtros acima afetam ocorrências. A acessibilidade mostra o cadastro atual de locais de Sorocaba: {{ i.locais_com_nota }} de {{ i.total_locais }} com nota calculada.</p>
          <div class="row g-4">
            <section class="col-md-6"><h2 class="h5">Ocorrências por status</h2>@for (item of i.por_status; track item.status) { <div class="grafico"><span>{{ status(item.status) }}: {{ item.total }}</span><meter min="0" [max]="i.total_ocorrencias || 1" [value]="item.total" [attr.aria-label]="status(item.status)"></meter></div> } @empty { <p>Sem ocorrências no período.</p> }</section>
            <section class="col-md-6"><h2 class="h5">Nível de acessibilidade</h2>@for (item of i.por_acessibilidade; track item.classificacao) { <div class="grafico"><span>{{ item.classificacao }}: {{ item.total }}</span><meter min="0" [max]="i.total_locais || 1" [value]="item.total" [attr.aria-label]="item.classificacao"></meter></div> }</section>
            <section class="col-md-6"><h2 class="h5">Tipos de ocorrência</h2>@for (item of i.por_tipo; track item.tipo_problema) { <div class="grafico"><span>{{ rotuloTipo(item.tipo_problema) }}: {{ item.total }}</span><meter min="0" [max]="i.total_ocorrencias || 1" [value]="item.total" [attr.aria-label]="rotuloTipo(item.tipo_problema)"></meter></div> } @empty { <p>Sem dados.</p> }</section>
            <section class="col-md-6"><h2 class="h5">Evolução diária</h2><div style="max-height:300px;overflow:auto">@for (item of i.evolucao; track item.dia) { <div class="grafico"><span>{{ item.dia | date:'dd/MM/yyyy' }}: {{ item.total }}</span><meter min="0" [max]="i.total_ocorrencias || 1" [value]="item.total" [attr.aria-label]="item.dia"></meter></div> } @empty { <p>Sem dados.</p> }</div></section>
          </div>
        }
        @if (pagina(); as p) {
          <h2 class="h4 mt-5">Ocorrências</h2><div class="table-responsive"><table class="table"><thead><tr><th>Protocolo</th><th>Data</th><th>Endereço</th><th>Status</th><th>Ação</th></tr></thead><tbody>
            @for (item of p.results; track item.id) { <tr><td>{{ item.protocolo }}</td><td>{{ item.dataCriacao | date:'dd/MM/yyyy' }}</td><td>{{ item.endereco }}</td><td>{{ status(item.status) }}</td><td><button class="btn btn-outline-primary" (click)="abrir(item)">Gerenciar</button></td></tr> }
            @empty { <tr><td colspan="5">Nenhuma ocorrência encontrada.</td></tr> }
          </tbody></table></div>
          <nav class="d-flex gap-3" aria-label="Paginação"><button [disabled]="!p.previous || carregando()" (click)="mudar(-1)">Anterior</button><span>Página {{ numero }}</span><button [disabled]="!p.next || carregando()" (click)="mudar(1)">Próxima</button></nav>
        }
        @if (selecionada(); as item) {
          <section id="gestao-detalhe" tabindex="-1">
            <app-registro [registro]="item" />
            <form class="card p-3" (ngSubmit)="salvar()">
              <h2 class="h5">Atualizar atendimento</h2>
              <label>Novo status<select class="form-select" name="novoStatus" [(ngModel)]="novoStatus">@for (s of statuses; track s) { <option [value]="s">{{ status(s) }}</option> }</select></label>
              <label class="mt-3">Justificativa<textarea class="form-control" name="justificativa" [(ngModel)]="justificativa" required minlength="5" maxlength="3000"></textarea></label>
              <button class="btn btn-primary mt-3" [disabled]="salvando() || novoStatus === item.status || justificativa.trim().length < 5">{{ salvando() ? 'Salvando…' : 'Salvar atualização' }}</button>
              <p role="status">{{ mensagem() }}</p>
            </form>
          </section>
        }
      }
    </main>
  `,
  styles: [`.grafico { display:grid; gap:4px; margin:12px 0; } meter { width:100%;height:22px; } :focus-visible { outline:3px solid #4f5de1; }`],
})
export class PainelComponent {
  private readonly api = inject(PlataformaService);
  readonly status = rotuloStatus; readonly tipos = TIPOS_PROBLEMA; readonly statuses = ['em_analise', 'confirmada', 'resolvida'];
  readonly pagina = signal<Pagina<Registro> | null>(null); readonly indicadores = signal<Indicadores | null>(null);
  readonly selecionada = signal<Registro | null>(null); readonly carregando = signal(false); readonly salvando = signal(false);
  readonly erro = signal(''); readonly negado = signal(false); readonly mensagem = signal('');
  inicio = ''; fim = ''; filtroStatus = ''; tipo = ''; endereco = ''; numero = 1; novoStatus = ''; justificativa = '';
  private versao = 0;
  private filtrosAtivos: Record<string, string> = {};
  constructor() { this.carregar(); }
  rotuloTipo(valor: string) { return TIPOS_PROBLEMA.find(t => t.valor === valor)?.rotulo ?? valor; }
  filtrar() {
    if (this.inicio && this.fim && this.inicio > this.fim) { this.erro.set('A data inicial deve ser anterior à final.'); return; }
    this.filtrosAtivos = { inicio: this.inicio, fim: this.fim, status: this.filtroStatus, tipo: this.tipo, endereco: this.endereco };
    this.numero = 1; this.selecionada.set(null); this.carregar();
  }
  carregar() {
    const versao = ++this.versao; this.carregando.set(true); this.erro.set(''); this.pagina.set(null); this.indicadores.set(null);
    forkJoin({ pagina: this.api.ocorrencias(true, { ...this.filtrosAtivos, page: this.numero }), indicadores: this.api.indicadores(this.filtrosAtivos) }).subscribe({
      next: dados => { if (versao !== this.versao) return; this.pagina.set(dados.pagina); this.indicadores.set(dados.indicadores); this.carregando.set(false); },
      error: erro => { if (versao !== this.versao) return; this.negado.set(erro.status === 403); this.erro.set('Não foi possível carregar o painel. Confira os filtros e tente novamente.'); this.carregando.set(false); },
    });
  }
  mudar(delta: number) { this.numero += delta; this.carregar(); }
  abrir(item: Registro) { this.selecionada.set(item); this.novoStatus = item.status; this.justificativa = ''; this.mensagem.set(''); setTimeout(() => document.getElementById('gestao-detalhe')?.focus()); }
  salvar() {
    const item = this.selecionada();
    if (!item || this.salvando() || this.novoStatus === item.status || this.justificativa.trim().length < 5) return;
    this.salvando.set(true); this.mensagem.set('');
    this.api.alterarStatus(item.id, this.novoStatus, this.justificativa).subscribe({
      next: registro => { this.selecionada.set(registro); this.justificativa = ''; this.mensagem.set('Atualização registrada.'); this.salvando.set(false); this.numero = 1; this.carregar(); },
      error: () => { this.mensagem.set('Não foi possível atualizar. Recarregue a ocorrência e tente novamente.'); this.salvando.set(false); },
    });
  }
}

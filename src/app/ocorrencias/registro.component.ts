import { Component, input, signal, inject, OnDestroy, OnChanges } from '@angular/core';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { PlataformaService, Registro, rotuloStatus } from '../services/plataforma.service';
import { TIPOS_PROBLEMA } from '../models/ocorrencia.model';

@Component({
  selector: 'app-registro', imports: [CommonModule],
  template: `
    <article class="card p-3 my-3">
      <h2 class="h5">Protocolo {{ registro().protocolo }}</h2>
      <p><strong>{{ status(registro().status) }}</strong> · {{ registro().dataCriacao | date:'dd/MM/yyyy HH:mm' }}</p>
      <p>{{ tipo(registro().tipoProblema) }} · {{ registro().endereco }}</p><p>{{ registro().descricao }}</p>
      @if (registro().fotoUrl) { <button class="btn btn-outline-secondary" (click)="verFoto()" [disabled]="carregando()">{{ carregando() ? 'Carregando foto…' : 'Ver foto' }}</button> }
      @if (foto()) { <img [src]="foto()" alt="Foto anexada à ocorrência" style="max-width:100%;max-height:360px;object-fit:contain;margin-top:12px" /> }
      @if (erro()) { <p role="alert">{{ erro() }}</p> }
      <h3 class="h6 mt-3">Histórico de acompanhamento</h3>
      <ol>@for (evento of registro().historico; track evento.id) { <li>{{ evento.created_at | date:'dd/MM/yyyy HH:mm' }} — {{ status(evento.status) }}<p>{{ evento.justificativa }}</p></li> }</ol>
    </article>
  `,
})
export class RegistroComponent implements OnDestroy, OnChanges {
  readonly registro = input.required<Registro>();
  private readonly api = inject(PlataformaService);
  readonly status = rotuloStatus;
  readonly foto = signal(''); readonly erro = signal(''); readonly carregando = signal(false);
  private destruido = false;
  private consulta?: Subscription;
  private idAtual?: number;
  ngOnChanges() {
    if (this.idAtual === this.registro().id) return;
    this.idAtual = this.registro().id;
    this.consulta?.unsubscribe();
    if (this.foto()) URL.revokeObjectURL(this.foto());
    this.foto.set(''); this.erro.set(''); this.carregando.set(false);
  }
  tipo(valor: string) { return TIPOS_PROBLEMA.find(t => t.valor === valor)?.rotulo ?? valor; }
  verFoto() {
    if (this.carregando() || this.foto()) return;
    this.carregando.set(true); this.erro.set('');
    this.consulta = this.api.foto(this.registro().id).subscribe({ next: blob => { if (!this.destruido) this.foto.set(URL.createObjectURL(blob)); this.carregando.set(false); }, error: () => { this.erro.set('Não foi possível obter a foto.'); this.carregando.set(false); } });
  }
  ngOnDestroy() { this.destruido = true; this.consulta?.unsubscribe(); if (this.foto()) URL.revokeObjectURL(this.foto()); }
}

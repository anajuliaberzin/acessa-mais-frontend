import { CommonModule } from '@angular/common';
import { Component, DestroyRef, EventEmitter, Input, OnChanges, Output, SimpleChanges, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { finalize, forkJoin, of, switchMap } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { Local, MinhaAvaliacao, Pagina, PlataformaService } from '../services/plataforma.service';

@Component({
  selector: 'app-avaliacoes-local',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './avaliacoes-local.component.html',
  styleUrl: './avaliacoes-local.component.css',
})
export class AvaliacoesLocalComponent implements OnChanges {
  @Input({ required: true }) local!: Local;
  @Output() localAtualizado = new EventEmitter<Local>();
  private readonly api = inject(PlataformaService);
  private readonly auth = inject(AuthService);
  private readonly destroyRef = inject(DestroyRef);
  private versao = 0;
  readonly autenticado = this.auth.isAuthenticated;
  readonly avaliacoes = signal<MinhaAvaliacao[]>([]);
  readonly minhaAvaliacao = signal<MinhaAvaliacao | null>(null);
  readonly carregando = signal(false);
  readonly salvando = signal(false);
  readonly erro = signal('');
  readonly mensagem = signal('');
  nota = 5;
  comentario = '';

  ngOnChanges(changes: SimpleChanges) {
    if (changes['local'] && changes['local'].previousValue?.id !== this.local.id) {
      this.carregar();
    }
  }

  carregar() {
    const versao = ++this.versao;
    this.carregando.set(true);
    this.erro.set('');
    const minhaAvaliacao = this.auth.isAuthenticated()
      ? this.api.minhaAvaliacaoLocal(this.local.id)
      : of(null);
    forkJoin({
      local: this.api.local(this.local.id),
      avaliacoes: this.api.avaliacoesLocal(this.local.id),
      minhaAvaliacao,
    })
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => {
          if (versao === this.versao) this.carregando.set(false);
        }),
      )
      .subscribe({
        next: (dados) => {
          if (versao !== this.versao) return;
          this.localAtualizado.emit(dados.local);
          this.avaliacoes.set(dados.avaliacoes.results);
          const propria = dados.minhaAvaliacao?.results[0] ?? null;
          this.minhaAvaliacao.set(propria);
          this.nota = propria?.nota ?? 5;
          this.comentario = propria?.comentario ?? '';
        },
        error: () => {
          if (versao !== this.versao) return;
          this.erro.set('Não foi possível carregar as avaliações deste local.');
        },
      });
  }

  salvar() {
    if (!this.autenticado() || this.salvando() || !Number.isInteger(this.nota) || this.nota < 1 || this.nota > 5) return;
    this.salvando.set(true);
    this.erro.set('');
    this.mensagem.set('');
    const propria = this.minhaAvaliacao();
    const salvar = propria
      ? this.api.atualizarAvaliacao(propria.id, this.nota, this.comentario.trim())
      : this.api.criarAvaliacao(this.local.id, this.nota, this.comentario.trim());
    salvar
      .pipe(
        switchMap(() =>
          forkJoin({
            local: this.api.local(this.local.id),
            avaliacoes: this.api.avaliacoesLocal(this.local.id),
            minhaAvaliacao: this.api.minhaAvaliacaoLocal(this.local.id),
          }),
        ),
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.salvando.set(false)),
      )
      .subscribe({
        next: (dados) => {
          this.localAtualizado.emit(dados.local);
          this.avaliacoes.set(dados.avaliacoes.results);
          this.minhaAvaliacao.set(dados.minhaAvaliacao.results[0] ?? null);
          this.mensagem.set('Sua avaliação foi salva.');
        },
        error: () => this.erro.set('Não foi possível salvar sua avaliação. Tente novamente.'),
      });
  }

  excluir() {
    const propria = this.minhaAvaliacao();
    if (!propria || this.salvando()) return;
    this.salvando.set(true);
    this.erro.set('');
    this.mensagem.set('');
    this.api
      .excluirAvaliacao(propria.id)
      .pipe(
        switchMap(() =>
          forkJoin({
            local: this.api.local(this.local.id),
            avaliacoes: this.api.avaliacoesLocal(this.local.id),
          }),
        ),
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.salvando.set(false)),
      )
      .subscribe({
        next: (dados) => {
          this.localAtualizado.emit(dados.local);
          this.avaliacoes.set(dados.avaliacoes.results);
          this.minhaAvaliacao.set(null);
          this.nota = 5;
          this.comentario = '';
          this.mensagem.set('Sua avaliação foi excluída.');
        },
        error: () => this.erro.set('Não foi possível excluir sua avaliação. Tente novamente.'),
      });
  }

  estrelas(nota: number) {
    return Array.from({ length: 5 }, (_, indice) => indice < nota);
  }
}

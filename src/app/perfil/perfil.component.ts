import { CommonModule } from '@angular/common';
import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { PREFERENCIAS_DISPONIVEIS } from '../models/perfil.model';
import {
  Local,
  MinhaAvaliacao,
  Pagina,
  PerfilAtual,
  PlataformaService,
  Registro,
  rotuloStatus,
} from '../services/plataforma.service';
import { SessaoService } from '../auth/sessao.service';

type Aba = 'avaliacoes' | 'ocorrencias' | 'favoritos';
@Component({
  selector: 'app-perfil',
  imports: [CommonModule, RouterLink],
  templateUrl: './perfil.component.html',
  styleUrl: './perfil.component.css',
})
export class PerfilComponent {
  private readonly api = inject(PlataformaService);
  private readonly sessao = inject(SessaoService);
  private readonly destroyRef = inject(DestroyRef);
  readonly preferenciasDisponiveis = PREFERENCIAS_DISPONIVEIS;
  readonly usuario = signal<PerfilAtual | null>(null);
  readonly abaAtiva = signal<Aba>('avaliacoes');
  readonly avaliacoes = signal<MinhaAvaliacao[]>([]);
  readonly ocorrencias = signal<Registro[]>([]);
  readonly favoritos = signal<Local[]>([]);
  readonly carregando = signal(false);
  readonly carregandoPerfil = signal(false);
  readonly salvando = signal(false);
  readonly erroPerfil = signal('');
  readonly erro = signal('');
  readonly mensagem = signal('');
  readonly paginacao = signal<{
    next: string | null;
    previous: string | null;
    count: number;
  } | null>(null);
  readonly status = rotuloStatus;
  numero = 1;
  private versao = 0;
  readonly iniciais = computed(() =>
    (this.usuario()?.nome.trim().split(/\s+/).filter(Boolean) ?? [])
      .filter((_, i, partes) => i === 0 || i === partes.length - 1)
      .map((p) => p[0])
      .join('')
      .toUpperCase(),
  );
  constructor() {
    this.carregarPerfil();
    this.carregar();
  }
  carregarPerfil() {
    this.carregandoPerfil.set(true);
    this.erroPerfil.set('');
    this.api
      .perfil()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (p) => {
          this.usuario.set(p);
          this.sessao.perfil.set(p);
          this.carregandoPerfil.set(false);
        },
        error: () => {
          this.erroPerfil.set('Não foi possível carregar seu perfil.');
          this.carregandoPerfil.set(false);
        },
      });
  }
  alternarPreferencia(valor: string) {
    const usuario = this.usuario();
    if (!usuario || this.salvando()) return;
    const preferencias = usuario.preferencias.includes(valor)
      ? usuario.preferencias.filter((p) => p !== valor)
      : [...usuario.preferencias, valor];
    this.salvando.set(true);
    this.mensagem.set('');
    this.api
      .salvarPreferencias(preferencias)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (p) => {
          this.usuario.set(p);
          this.sessao.perfil.set(p);
          this.salvando.set(false);
          this.mensagem.set('Preferências salvas.');
        },
        error: () => {
          this.salvando.set(false);
          this.mensagem.set(
            'Não foi possível salvar. Suas preferências anteriores foram mantidas.',
          );
        },
      });
  }
  selecionarAba(aba: Aba) {
    this.abaAtiva.set(aba);
    this.numero = 1;
    this.carregar();
  }
  mudar(delta: number) {
    this.numero += delta;
    this.carregar();
  }
  carregar() {
    const versao = ++this.versao;
    this.carregando.set(true);
    this.erro.set('');
    this.paginacao.set(null);
    this.avaliacoes.set([]);
    this.ocorrencias.set([]);
    this.favoritos.set([]);
    const receber = <T>(p: Pagina<T>, aplicar: () => void) => {
      if (versao !== this.versao) return;
      aplicar();
      this.paginacao.set(p);
      this.carregando.set(false);
    };
    const error = () => {
      if (versao !== this.versao) return;
      this.erro.set('Não foi possível carregar suas contribuições. Tente novamente.');
      this.carregando.set(false);
    };
    if (this.abaAtiva() === 'avaliacoes')
      this.api
        .minhasAvaliacoes(this.numero)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({ next: (p) => receber(p, () => this.avaliacoes.set(p.results)), error });
    else if (this.abaAtiva() === 'favoritos')
      this.api
        .meusFavoritos(this.numero)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({ next: (p) => receber(p, () => this.favoritos.set(p.results)), error });
    else
      this.api
        .ocorrencias(false, { page: this.numero })
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({ next: (p) => receber(p, () => this.ocorrencias.set(p.results)), error });
  }
}

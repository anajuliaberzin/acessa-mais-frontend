import { Component, inject, signal, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HomeFooterComponent } from './home-footer.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AuthService } from '../auth/auth.service';
import { PlataformaService, Local, Pagina, RECURSOS } from '../services/plataforma.service';
import { FavoritosService } from '../services/favoritos.service';
import { finalize } from 'rxjs';
import { AvaliacoesLocalComponent } from '../locais/avaliacoes-local.component';
import { ModalComponent } from '../shared/modal.component';

@Component({
  selector: 'app-home', standalone: true, imports: [RouterLink, CommonModule, FormsModule, HomeFooterComponent, AvaliacoesLocalComponent, ModalComponent],
  templateUrl: './home.component.html', styleUrl: './home.component.css',
})
export class HomeComponent {
  readonly auth = inject(AuthService);
  private readonly api = inject(PlataformaService);
  readonly favoritos = inject(FavoritosService);
  private readonly destroyRef = inject(DestroyRef);
  readonly recursos = RECURSOS;
  readonly categorias = signal<string[]>([]);
  readonly pagina = signal<Pagina<Local> | null>(null);
  readonly selecionado = signal<Local | null>(null);
  readonly carregando = signal(false);
  readonly erro = signal('');
  readonly avisoFavorito = signal('');
  readonly modalLoginFavorito = signal(false);
  readonly locaisSalvando = signal<ReadonlySet<number>>(new Set());
  nome = ''; categoria = ''; necessidade = ''; recurso = ''; destaque = true; numeroPagina = 1;
  private versao = 0;
  constructor() {
    this.carregarCategorias(); this.carregar();
  }
  carregarCategorias() {
    this.api.filtros().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({ next: f => this.categorias.set(f.categorias), error: () => {} });
  }
  carregar() {
    const versao = ++this.versao;
    this.carregando.set(true); this.erro.set(''); this.pagina.set(null); this.selecionado.set(null);
    this.api.locais({ nome: this.nome, categoria: this.categoria, necessidade: this.necessidade, recursos: this.recurso, ordenacao: this.destaque ? 'acessibilidade' : 'nome', page: this.numeroPagina, page_size: 9 })
      .pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: p => { if (versao === this.versao) { this.pagina.set(p); this.carregando.set(false); } },
        error: () => { if (versao === this.versao) { this.erro.set('Não foi possível carregar os locais.'); this.carregando.set(false); } },
      });
  }
  buscar() { this.destaque = false; this.numeroPagina = 1; this.carregar(); }
  selecionarCategoria(valor: string) { this.categoria = valor; this.buscar(); }
  todos() { this.nome = this.categoria = this.necessidade = this.recurso = ''; this.buscar(); }
  mostrarDestaques() { this.nome = this.categoria = this.necessidade = this.recurso = ''; this.destaque = true; this.numeroPagina = 1; this.carregar(); }
  mudarPagina(delta: number) { this.numeroPagina += delta; this.carregar(); }
  atualizarLocal(atualizado: Local) {
    this.selecionado.set(atualizado);
    this.pagina.update((pagina) =>
      pagina
        ? { ...pagina, results: pagina.results.map((local) => local.id === atualizado.id ? atualizado : local) }
        : pagina,
    );
  }
  alternarFavorito(id: number) {
    this.avisoFavorito.set('');
    if (!this.favoritos.autenticado()) {
      this.modalLoginFavorito.set(true);
      return;
    }
    if (this.locaisSalvando().has(id)) return;
    this.locaisSalvando.update((ids) => new Set(ids).add(id));
    const remover = this.favoritos.ids().has(id);
    (remover ? this.favoritos.remover(id) : this.favoritos.adicionar(id))
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() =>
          this.locaisSalvando.update((ids) => {
            const atualizados = new Set(ids);
            atualizados.delete(id);
            return atualizados;
          }),
        ),
      )
      .subscribe({
        next: () =>
          this.avisoFavorito.set(remover ? 'Local removido dos favoritos.' : 'Local adicionado aos favoritos.'),
        error: () => this.avisoFavorito.set('Não foi possível atualizar o favorito. Tente novamente.'),
      });
  }
  private acionador: HTMLElement | null = null;
  fechar() { this.selecionado.set(null); this.acionador?.focus(); }
  abrir(local: Local) { this.acionador = document.activeElement as HTMLElement; this.selecionado.set(local); setTimeout(() => document.getElementById('info-local-painel')?.focus()); }
}

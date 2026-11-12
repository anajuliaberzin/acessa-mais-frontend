import { effect, inject, Injectable, signal } from '@angular/core';
import { EMPTY, expand, reduce, tap } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { Local, Pagina, PlataformaService } from './plataforma.service';

@Injectable({ providedIn: 'root' })
export class FavoritosService {
  private readonly auth = inject(AuthService);
  private readonly api = inject(PlataformaService);
  private versao = 0;
  readonly ids = signal<ReadonlySet<number>>(new Set());
  readonly carregando = signal(false);
  readonly erro = signal('');
  readonly autenticado = this.auth.isAuthenticated;

  constructor() {
    effect(() => {
      this.auth.sessionId();
      if (this.auth.isAuthenticated()) {
        this.carregar();
      } else {
        this.versao++;
        this.ids.set(new Set());
        this.carregando.set(false);
        this.erro.set('');
      }
    });
  }

  carregar() {
    if (!this.auth.isAuthenticated()) return;
    const versao = ++this.versao;
    this.carregando.set(true);
    this.erro.set('');
    this.api
      .meusFavoritos(1, 100)
      .pipe(
        expand((pagina: Pagina<Local>, indice) =>
          pagina.next ? this.api.meusFavoritos(indice + 2, 100) : EMPTY,
        ),
        reduce((ids, pagina) => {
          for (const local of pagina.results) ids.add(local.id);
          return ids;
        }, new Set<number>()),
      )
      .subscribe({
        next: (ids) => {
          if (versao !== this.versao) return;
          this.ids.set(ids);
          this.carregando.set(false);
        },
        error: () => {
          if (versao !== this.versao) return;
          this.erro.set('Não foi possível carregar seus favoritos.');
          this.carregando.set(false);
        },
      });
  }

  adicionar(id: number) {
    return this.api.adicionarFavorito(id).pipe(
      tap(() => this.ids.update((ids) => new Set(ids).add(id))),
    );
  }

  remover(id: number) {
    return this.api.removerFavorito(id).pipe(
      tap(() =>
        this.ids.update((ids) => {
          const atualizados = new Set(ids);
          atualizados.delete(id);
          return atualizados;
        }),
      ),
    );
  }
}

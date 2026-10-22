import { Injectable, effect, inject, signal } from '@angular/core';
import { AuthService } from './auth.service';
import { PerfilAtual, PlataformaService } from '../services/plataforma.service';

@Injectable({ providedIn: 'root' })
export class SessaoService {
  private readonly auth = inject(AuthService);
  private readonly api = inject(PlataformaService);
  readonly perfil = signal<PerfilAtual | null>(null);
  constructor() {
    effect((onCleanup) => {
      this.auth.sessionId();
      const autenticado = this.auth.isAuthenticated();
      this.perfil.set(null);
      if (!autenticado) return;
      const sub = this.api
        .perfil()
        .subscribe({ next: (p) => this.perfil.set(p), error: () => this.perfil.set(null) });
      onCleanup(() => sub.unsubscribe());
    });
  }
}

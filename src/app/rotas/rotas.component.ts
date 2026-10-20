import { Component, computed, inject, OnDestroy, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Subscription, TimeoutError } from 'rxjs';
import { OpcaoRota, RotasService } from './rotas.service';

@Component({
  selector: 'app-rotas',
  imports: [FormsModule, RouterLink, DecimalPipe],
  templateUrl: './rotas.component.html',
  styleUrl: './rotas.component.css',
})
export class RotasComponent implements OnDestroy {
  private readonly service = inject(RotasService);
  private consulta?: Subscription;
  readonly pontos = [
    {
      id: 'origem',
      nome: 'Origem',
      latitude: null as number | null,
      longitude: null as number | null,
    },
    {
      id: 'destino',
      nome: 'Destino',
      latitude: null as number | null,
      longitude: null as number | null,
    },
  ];
  readonly consultou = signal(false);
  readonly carregando = signal(false);
  readonly erro = signal('');
  readonly mensagem = signal('');
  readonly rotas = signal<OpcaoRota[]>([]);
  readonly selecionada = signal<OpcaoRota | null>(null);
  readonly semAcessivel = signal(false);
  readonly projecao = computed(() => {
    const ativa = this.selecionada();
    if (!ativa) return null;
    // Ajuste visual do GeoJSON ao SVG, sem calcular trajetos ou distâncias.
    let minX = Infinity,
      minY = Infinity,
      maxX = -Infinity,
      maxY = -Infinity;
    for (const rota of this.rotas())
      for (const [x, y] of rota.geometria.coordinates) {
        minX = Math.min(minX, x);
        maxX = Math.max(maxX, x);
        minY = Math.min(minY, y);
        maxY = Math.max(maxY, y);
      }
    const dx = maxX - minX,
      dy = maxY - minY;
    const escala = Math.min(dx ? 500 / dx : Infinity, dy ? 300 / dy : Infinity);
    const fator = Number.isFinite(escala) ? escala : 1;
    const pontos = ativa.geometria.coordinates.map(([x, y]) => [
      300 + (x - (minX + maxX) / 2) * fator,
      200 - (y - (minY + maxY) / 2) * fator,
    ]);
    return {
      d: pontos.map(([x, y], i) => (i ? 'L ' : 'M ') + x + ' ' + y).join(' '),
      inicio: pontos[0],
      fim: pontos[pontos.length - 1],
    };
  });

  invalido(valor: number | null, limite: number): boolean {
    return valor === null || !Number.isFinite(valor) || Math.abs(valor) > limite;
  }
  limparConsulta(): void {
    this.consulta?.unsubscribe();
    this.carregando.set(false);
    this.consultou.set(false);
    this.erro.set('');
    this.mensagem.set('');
    this.semAcessivel.set(false);
    this.rotas.set([]);
    this.selecionada.set(null);
  }
  comparar(): void {
    this.limparConsulta();
    this.consultou.set(true);
    if (this.pontos.some((p) => this.invalido(p.latitude, 90) || this.invalido(p.longitude, 180))) {
      this.erro.set(
        'Informe a origem e o destino com latitude entre -90 e 90 e longitude entre -180 e 180.',
      );
      return;
    }
    const [origem, destino] = this.pontos.map((p) => ({
      latitude: p.latitude!,
      longitude: p.longitude!,
    }));
    if (origem.latitude === destino.latitude && origem.longitude === destino.longitude) {
      this.mensagem.set('Origem e destino são iguais. Informe pontos diferentes.');
      return;
    }
    this.carregando.set(true);
    this.consulta = this.service.comparar(origem, destino).subscribe({
      next: (r) => {
        const opcoes: OpcaoRota[] = [{ ...r.rota_rapida, id: 'rapida', nome: 'Rota mais rápida' }];
        if (r.rota_acessivel)
          opcoes.push({
            ...r.rota_acessivel,
            id: 'acessivel',
            nome:
              r.acessibilidade_avaliada && r.rota_acessivel.acessibilidade_avaliada
                ? 'Rota com melhor indicador de acessibilidade'
                : 'Candidata com avaliação limitada',
          });
        r.alternativas.forEach((rota, i) =>
          opcoes.push({
            ...rota,
            id: 'alternativa-' + (i + 1),
            nome: 'Rota alternativa ' + (i + 1),
          }),
        );
        this.rotas.set(opcoes);
        this.selecionada.set(opcoes[0]);
        this.semAcessivel.set(!r.rota_acessivel);
        this.mensagem.set(r.mensagem);
        this.carregando.set(false);
      },
      error: (error) => {
        this.carregando.set(false);
        if (error instanceof HttpErrorResponse && error.status === 404) {
          this.mensagem.set(
            'Nenhuma rota encontrada entre os pontos informados. Tente outros pontos.',
          );
        } else if (
          error instanceof TimeoutError ||
          (error instanceof HttpErrorResponse && error.status === 504)
        ) {
          this.erro.set('A consulta demorou a responder. Tente novamente.');
        } else if (error instanceof HttpErrorResponse) {
          const mensagens: Record<number, string> = {
            0: 'Não foi possível conectar ao backend. Verifique se o serviço está em execução.',
            400: 'O backend rejeitou as coordenadas. Confira a origem e o destino.',
            502: 'O serviço de rotas retornou uma resposta inválida. Tente novamente mais tarde.',
            503: 'O serviço de rotas está indisponível ou ainda não foi configurado. Tente novamente mais tarde.',
          };
          this.erro.set(
            mensagens[error.status] ?? 'Não foi possível consultar as rotas. Tente novamente.',
          );
        } else
          this.erro.set(
            'A resposta de rotas não pôde ser interpretada. Tente novamente mais tarde.',
          );
      },
    });
  }
  ngOnDestroy(): void {
    this.consulta?.unsubscribe();
  }
}

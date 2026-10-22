import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, timeout } from 'rxjs';
import { API_BASE_URL } from '../auth/api.config';

export interface Ponto {
  latitude: number;
  longitude: number;
}
export interface EnderecoEncontrado extends Ponto {
  endereco: string;
  aproximado?: boolean;
}
export interface RotaApi {
  tempo_minutos: number;
  distancia_metros: number;
  geometria: { type: 'LineString'; coordinates: [number, number][] };
  score_acessibilidade: number | null;
  barreiras: { tipo: string; descricao: string; trecho: number[] }[];
  acessibilidade_avaliada: boolean;
  nivel_confianca: string;
}
export interface ComparacaoApi {
  rota_rapida: RotaApi;
  rota_acessivel: RotaApi | null;
  alternativas: RotaApi[];
  acessibilidade_avaliada: boolean;
  nivel_confianca: string;
  mensagem: string;
}
export interface OpcaoRota extends RotaApi {
  id: string;
  nome: string;
}

function rotaValida(r: RotaApi): boolean {
  return (
    !!r &&
    Number.isFinite(r.tempo_minutos) &&
    r.tempo_minutos >= 0 &&
    Number.isFinite(r.distancia_metros) &&
    r.distancia_metros >= 0 &&
    (r.score_acessibilidade === null ||
      (Number.isFinite(r.score_acessibilidade) &&
        r.score_acessibilidade >= 0 &&
        r.score_acessibilidade <= 100)) &&
    typeof r.acessibilidade_avaliada === 'boolean' &&
    typeof r.nivel_confianca === 'string' &&
    r.geometria?.type === 'LineString' &&
    Array.isArray(r.geometria.coordinates) &&
    r.geometria.coordinates.length >= 2 &&
    r.geometria.coordinates.every(
      (p) =>
        Array.isArray(p) &&
        p.length === 2 &&
        Number.isFinite(p[0]) &&
        Math.abs(p[0]) <= 180 &&
        Number.isFinite(p[1]) &&
        Math.abs(p[1]) <= 90,
    ) &&
    Array.isArray(r.barreiras) &&
    r.barreiras.every((b) => b && typeof b.descricao === 'string')
  );
}

@Injectable({ providedIn: 'root' })
export class RotasService {
  enderecos(q: string) {
    return this.http
      .get<{ results: EnderecoEncontrado[] }>(this.base + '/rotas/enderecos/', { params: { q } })
      .pipe(timeout(15000));
  }
  private readonly http = inject(HttpClient);
  private readonly base = inject(API_BASE_URL);
  comparar(origem: Ponto, destino: Ponto) {
    return this.http
      .post<ComparacaoApi>(this.base.replace(/\/$/, '') + '/rotas/comparar/', { origem, destino })
      .pipe(
        timeout(20000),
        map((r) => {
          if (
            !r ||
            !rotaValida(r.rota_rapida) ||
            (r.rota_acessivel !== null && !rotaValida(r.rota_acessivel)) ||
            !Array.isArray(r.alternativas) ||
            !r.alternativas.every(rotaValida) ||
            typeof r.mensagem !== 'string' ||
            typeof r.acessibilidade_avaliada !== 'boolean'
          ) {
            throw new Error('Resposta de rotas inválida.');
          }
          return r;
        }),
      );
  }
}

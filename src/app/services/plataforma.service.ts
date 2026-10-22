import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { API_BASE_URL } from '../auth/api.config';

export interface Pagina<T> { count: number; next: string | null; previous: string | null; results: T[]; }
export interface Local {
  id: number; nome: string; categoria: string; endereco: string; descricao: string;
  recursos: Record<string, string>; fotos: { id: number; foto: string; legenda: string }[];
  acessibilidade: { nota: number | null; classificacao: string | null };
  media_avaliacoes: number | null; total_avaliacoes: number;
}
export const RECURSOS: Record<string, string> = {
  rampa: 'Rampa ou acesso sem degrau', banheiro_adaptado: 'Banheiro adaptado',
  vaga_acessivel: 'Vaga acessível', elevador: 'Elevador', piso_tatil: 'Piso tátil', recurso_auditivo: 'Recurso auditivo',
};

@Injectable({ providedIn: 'root' })
export class PlataformaService {
  private readonly http = inject(HttpClient);
  private readonly base = inject(API_BASE_URL);
  private params(filtros: Record<string, string | number>) {
    let params = new HttpParams();
    for (const [key, value] of Object.entries(filtros)) if (value !== '') params = params.set(key, value);
    return params;
  }
  locais(filtros: Record<string, string | number> = {}) {
    return this.http.get<Pagina<Local>>(this.base + '/locais/', { params: this.params(filtros) });
  }
  filtros() { return this.http.get<{ categorias: string[] }>(this.base + '/locais/filtros/'); }
  local(id: number) { return this.http.get<Local>(`${this.base}/locais/${id}/`); }
}

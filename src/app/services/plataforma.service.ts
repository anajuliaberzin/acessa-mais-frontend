import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpContext, HttpParams } from '@angular/common/http';
import { API_BASE_URL } from '../auth/api.config';
import { REQUIRE_AUTH } from '../auth/auth.interceptor';

export interface Pagina<T> { count: number; next: string | null; previous: string | null; results: T[]; }
export interface Local {
  id: number; nome: string; categoria: string; endereco: string; descricao: string;
  recursos: Record<string, string>; fotos: { id: number; foto: string; legenda: string }[];
  acessibilidade: { nota: number | null; classificacao: string | null };
  media_avaliacoes: number | null; total_avaliacoes: number;
}
export interface Registro {
  id: number; protocolo: string; endereco: string; descricao: string; tipoProblema: string;
  status: string; dataCriacao: string; fotoUrl: string | null;
  historico: { id: number; status: string; justificativa: string; created_at: string }[];
}
export interface Indicadores {
  total_ocorrencias: number; total_locais: number; locais_com_nota: number; locais_sem_nota: number;
  media_acessibilidade: number | null;
  por_status: { status: string; total: number }[];
  por_tipo: { tipo_problema: string; total: number }[];
  evolucao: { dia: string; total: number }[];
  por_acessibilidade: { classificacao: string; total: number }[];
}
export const RECURSOS: Record<string, string> = {
  rampa: 'Rampa ou acesso sem degrau', banheiro_adaptado: 'Banheiro adaptado',
  vaga_acessivel: 'Vaga acessível', elevador: 'Elevador', piso_tatil: 'Piso tátil', recurso_auditivo: 'Recurso auditivo',
};
export function rotuloStatus(status: string): string {
  return ({ em_analise: 'Em análise', confirmada: 'Confirmada', resolvida: 'Resolvida' } as Record<string, string>)[status] ?? status;
}

@Injectable({ providedIn: 'root' })
export class PlataformaService {
  private readonly http = inject(HttpClient);
  private readonly base = inject(API_BASE_URL);
  private contexto() { return new HttpContext().set(REQUIRE_AUTH, true); }
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
  ocorrencias(gestao = false, filtros: Record<string, string | number> = {}) {
    return this.http.get<Pagina<Registro>>(this.base + (gestao ? '/gestao' : '') + '/ocorrencias/', { context: this.contexto(), params: this.params(filtros) });
  }
  ocorrencia(id: number, gestao = false) {
    return this.http.get<Registro>(`${this.base}${gestao ? '/gestao' : ''}/ocorrencias/${id}/`, { context: this.contexto() });
  }
  indicadores(filtros: Record<string, string | number>) {
    return this.http.get<Indicadores>(this.base + '/gestao/indicadores/', { context: this.contexto(), params: this.params(filtros) });
  }
  alterarStatus(id: number, status: string, justificativa: string) {
    return this.http.patch<Registro>(`${this.base}/gestao/ocorrencias/${id}/`, { status, justificativa }, { context: this.contexto() });
  }
  foto(id: number) {
    return this.http.get(`${this.base}/ocorrencias/${id}/foto/`, { context: this.contexto(), responseType: 'blob' });
  }
}

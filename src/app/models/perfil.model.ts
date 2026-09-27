// Modelo de dados para o perfil do usuário (ACESSA+).

export type PreferenciaAcessibilidade =
  | 'cadeirante'
  | 'deficiencia_visual'
  | 'deficiencia_auditiva'
  | 'mobilidade_reduzida';

export const PREFERENCIAS_DISPONIVEIS: { valor: PreferenciaAcessibilidade; rotulo: string; icone: string }[] = [
  { valor: 'cadeirante', rotulo: 'Cadeirante', icone: 'bi-person-wheelchair' },
  { valor: 'deficiencia_visual', rotulo: 'Deficiência visual', icone: 'bi-eye-slash' },
  { valor: 'deficiencia_auditiva', rotulo: 'Deficiência auditiva', icone: 'bi-ear' },
  { valor: 'mobilidade_reduzida', rotulo: 'Mobilidade reduzida', icone: 'bi-crutch' },
];

export interface UsuarioPerfil {
  id: string;
  nome: string;
  cidade: string;
  uf: string;
  membroDesde: string; // ISO date
  preferencias: PreferenciaAcessibilidade[];
}

export interface LocalAvaliado {
  id: string;
  nomeLocal: string;
  nota: number; // 1 a 5
  comentario: string;
  data: string; // ISO date
}

export interface OcorrenciaResumo {
  id: string;
  descricaoResumo: string;
  tipoProblema: string;
  status: 'em_analise' | 'confirmada' | 'resolvida';
  data: string; // ISO date
}

export interface LocalFavorito {
  id: string;
  nomeLocal: string;
  nota: number;
  comentario: string;
}

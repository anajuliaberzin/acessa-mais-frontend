// Modelo de dados para o reporte de problemas de acessibilidade (ACESSA+).
// Alinhado aos recursos de acessibilidade já usados no cadastro de locais
// (rampa, banheiro_adaptado, estacionamento_acessivel, elevador, piso_tatil,
// recurso_auditivo) e às categorias identificadas no protótipo de referência.

export type TipoProblema =
  | 'rampa_ausente_ou_inadequada'
  | 'calcada_em_mau_estado'
  | 'elevador_indisponivel'
  | 'banheiro_nao_adaptado'
  | 'vaga_acessivel_indisponivel'
  | 'piso_tatil_ausente_ou_danificado'
  | 'obstaculo_na_via'
  | 'outro';

export const TIPOS_PROBLEMA: { valor: TipoProblema; rotulo: string }[] = [
  { valor: 'rampa_ausente_ou_inadequada', rotulo: 'Rampa ausente ou inadequada' },
  { valor: 'calcada_em_mau_estado', rotulo: 'Calçada em mau estado' },
  { valor: 'elevador_indisponivel', rotulo: 'Elevador indisponível ou quebrado' },
  { valor: 'banheiro_nao_adaptado', rotulo: 'Banheiro não adaptado' },
  { valor: 'vaga_acessivel_indisponivel', rotulo: 'Vaga acessível indisponível ou ocupada indevidamente' },
  { valor: 'piso_tatil_ausente_ou_danificado', rotulo: 'Piso tátil ausente ou danificado' },
  { valor: 'obstaculo_na_via', rotulo: 'Obstáculo na via ou calçada' },
  { valor: 'outro', rotulo: 'Outro' },
];

export interface NovaOcorrencia {
  confirmadoSorocaba: boolean;
  endereco: string;
  latitude: number | null;
  longitude: number | null;
  tipoProblema: TipoProblema | '';
  descricao: string;
  foto?: File | null;
}

export interface Ocorrencia extends Omit<NovaOcorrencia, 'foto' | 'confirmadoSorocaba'> {
  protocolo: string;
  id: number;
  dataCriacao: string;
  status: 'em_analise' | 'confirmada' | 'resolvida';
  fotoUrl?: string | null;
}

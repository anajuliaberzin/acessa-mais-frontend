export interface OpcaoRota {
  readonly id: 'rapida' | 'acessivel';
  readonly nome: string;
  readonly minutos: number;
  readonly distancia: string;
  readonly score: number;
  readonly barreiras: readonly string[];
  /** Coordenadas de ilustração SVG, sem relação com coordenadas geográficas. */
  readonly tracado: string;
}

// Demonstração fixa: os endereços informados apenas identificam os extremos.
// Substituir esta fonte por um serviço quando houver contrato de API de rotas.
export const ROTAS_MOCK: readonly OpcaoRota[] = [
  {
    id: 'rapida',
    nome: 'Rota mais rápida',
    minutos: 12,
    distancia: '900 m',
    score: 58,
    barreiras: ['Escada', 'Trecho sem rampa'],
    tracado: 'M 80 300 L 240 300 L 240 120 L 520 120',
  },
  {
    id: 'acessivel',
    nome: 'Rota mais acessível',
    minutos: 17,
    distancia: '1,2 km',
    score: 92,
    barreiras: ['Calçada irregular em um trecho'],
    tracado: 'M 80 300 L 80 210 L 390 210 L 390 120 L 520 120',
  },
];

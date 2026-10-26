// Tipos possíveis (limitam o que pode ser escrito em cada campo)
export type Categoria = 'Restaurante' | 'Hospital' | 'Shopping' | 'Praça' | 'Comércio';
export type Necessidade = 'Cadeirante' | 'Visual' | 'Auditiva' | 'Mobilidade reduzida';
export type Recurso =
  | 'Elevador'
  | 'Banheiro acessível'
  | 'Rampa'
  | 'Piso tátil'
  | 'Intérprete de Libras'
  | 'Vaga reservada';

// Listas usadas para montar os botões de filtro
export const CATEGORIAS: Categoria[] = ['Restaurante', 'Hospital', 'Shopping', 'Praça', 'Comércio'];
export const NECESSIDADES: Necessidade[] = ['Cadeirante', 'Visual', 'Auditiva', 'Mobilidade reduzida'];
export const RECURSOS: Recurso[] = [
  'Elevador',
  'Banheiro acessível',
  'Rampa',
  'Piso tátil',
  'Intérprete de Libras',
  'Vaga reservada',
];

// Formato de um local
export interface Local {
  id: number;
  nome: string;
  categoria: Categoria;
  endereco: string;
  score: number; // 0 a 100
  x: number; // posição no mapa SVG (0 a 100)
  y: number; // posição no mapa SVG (0 a 60)
  necessidades: Necessidade[]; // necessidades que o local atende
  recursos: Recurso[]; // recursos que o local oferece
}

// Dados de exemplo
export const LOCAIS: Local[] = [
  { id: 1, nome: 'Praça Frei Baraúna', categoria: 'Praça', endereco: 'Centro', score: 82, x: 30, y: 20,
    necessidades: ['Cadeirante', 'Mobilidade reduzida', 'Visual'], recursos: ['Rampa', 'Piso tátil', 'Banheiro acessível'] },
  { id: 2, nome: 'Hospital Santa Lucinda', categoria: 'Hospital', endereco: 'Centro', score: 76, x: 45, y: 28,
    necessidades: ['Cadeirante', 'Mobilidade reduzida', 'Auditiva'], recursos: ['Elevador', 'Rampa', 'Banheiro acessível', 'Vaga reservada'] },
  { id: 3, nome: 'Shopping Iguatemi Esplanada', categoria: 'Shopping', endereco: 'Éden', score: 91, x: 80, y: 14,
    necessidades: ['Cadeirante', 'Visual', 'Auditiva', 'Mobilidade reduzida'],
    recursos: ['Elevador', 'Banheiro acessível', 'Rampa', 'Piso tátil', 'Vaga reservada', 'Intérprete de Libras'] },
  { id: 4, nome: 'Parque Zoológico', categoria: 'Praça', endereco: 'Jardim Zoológico', score: 58, x: 14, y: 38,
    necessidades: ['Cadeirante', 'Mobilidade reduzida'], recursos: ['Rampa', 'Banheiro acessível'] },
  { id: 5, nome: 'Restaurante Sabor do Centro', categoria: 'Restaurante', endereco: 'Centro', score: 34, x: 38, y: 44,
    necessidades: [], recursos: [] },
  { id: 6, nome: 'Galeria Comercial Campolim', categoria: 'Comércio', endereco: 'Campolim', score: 67, x: 72, y: 44,
    necessidades: ['Cadeirante', 'Visual'], recursos: ['Elevador', 'Piso tátil', 'Banheiro acessível'] },
  { id: 7, nome: 'UPA Éden', categoria: 'Hospital', endereco: 'Éden', score: 49, x: 62, y: 10,
    necessidades: ['Cadeirante'], recursos: ['Rampa'] },
  { id: 8, nome: 'Restaurante Vila Hortência', categoria: 'Restaurante', endereco: 'Vila Hortência', score: 71, x: 22, y: 10,
    necessidades: ['Cadeirante', 'Mobilidade reduzida'], recursos: ['Rampa', 'Banheiro acessível'] },
  { id: 9, nome: 'Mercado Municipal', categoria: 'Comércio', endereco: 'Centro', score: 22, x: 55, y: 52,
    necessidades: [], recursos: [] },
  { id: 10, nome: 'Praça do Campolim', categoria: 'Praça', endereco: 'Campolim', score: 88, x: 88, y: 36,
    necessidades: ['Cadeirante', 'Visual', 'Mobilidade reduzida'], recursos: ['Rampa', 'Piso tátil', 'Banheiro acessível'] },
];
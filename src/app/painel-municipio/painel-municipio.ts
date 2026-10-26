import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

interface Kpi {
  titulo: string;
  valor: string;
  detalhe: string;
  icone: string; 
}

interface Barra {
  rotulo: string;
  total: number;
  cor?: string;
}

@Component({
  selector: 'app-painel-municipio',
  imports: [RouterLink],
  templateUrl: './painel-municipio.html',
  styleUrl: './painel-municipio.css',
})
export class PainelMunicipio {
  kpis: Kpi[] = [
    { titulo: 'Total de locais', valor: '248', detalhe: 'cadastrados em Sorocaba', icone: 'bi-geo-alt' },
    { titulo: 'Ocorrências abertas', valor: '37', detalhe: 'aguardando solução', icone: 'bi-exclamation-triangle' },
    { titulo: 'Score médio', valor: '72/100', detalhe: 'acessibilidade geral', icone: 'bi-star' },
    { titulo: 'Locais acessíveis', valor: '68%', detalhe: 'com score acima de 60', icone: 'bi-check-circle' },
  ];

  
  ocorrenciasPorRegiao: Barra[] = [
    { rotulo: 'Centro', total: 14 },
    { rotulo: 'Campolim', total: 9 },
    { rotulo: 'Éden', total: 7 },
    { rotulo: 'Wanel Ville', total: 4 },
    { rotulo: 'Vila Hortência', total: 2 },
    { rotulo: 'Cajuru', total: 1 },
  ];

  
  distribuicaoScores: Barra[] = [
    { rotulo: '0–20', total: 8, cor: '#e5484d' },
    { rotulo: '21–40', total: 22, cor: '#f5a524' },
    { rotulo: '41–60', total: 49, cor: '#f2d230' },
    { rotulo: '61–80', total: 98, cor: '#7ac36a' },
    { rotulo: '81–100', total: 71, cor: '#2f9e5b' },
  ];

  maxRegiao = Math.max(...this.ocorrenciasPorRegiao.map(b => b.total));
  maxScore = Math.max(...this.distribuicaoScores.map(b => b.total));

  percentual(total: number, max: number): number {
    return (total / max) * 100;
  }
}
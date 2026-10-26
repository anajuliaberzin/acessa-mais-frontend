import { Component, Input } from '@angular/core';

export type NivelScore = 'alto' | 'medio' | 'baixo';

// Função reutilizada também pelo CityMap, para a regra de cores ficar em um só lugar
export function nivelDoScore(score: number): NivelScore {
  if (score >= 70) return 'alto';
  if (score >= 40) return 'medio';
  return 'baixo';
}

@Component({
  selector: 'app-score-badge',
  templateUrl: './score-badge.html',
  styleUrl: './score-badge.css',
})
export class ScoreBadgeComponent {
  @Input() score = 0; // nota de 0 a 100

  get nivel(): NivelScore {
    return nivelDoScore(this.score);
  }

  get rotulo(): string {
    return { alto: 'Alta', medio: 'Média', baixo: 'Baixa' }[this.nivel];
  }
}
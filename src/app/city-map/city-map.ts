import { Component, EventEmitter, Input, Output } from '@angular/core';
import { nivelDoScore } from '../score-badge/score-badge';

// Cada local do mapa: x e y vão de 0 a 100 (posição no desenho)
export interface LocalMapa {
  id: number;
  nome: string;
  x: number;
  y: number;
  score: number;
}

@Component({
  selector: 'app-city-map',
  templateUrl: './city-map.html',
  styleUrl: './city-map.css',
})
export class CityMapComponent {
  @Input() locais: LocalMapa[] = [];
  @Input() selecionadoId: number | null = null; // local destacado no mapa
  @Output() selecionar = new EventEmitter<LocalMapa>();

  // Devolve 'alto', 'medio' ou 'baixo' para escolher a cor do marcador
  nivel(score: number): string {
    return nivelDoScore(score);
  }
}
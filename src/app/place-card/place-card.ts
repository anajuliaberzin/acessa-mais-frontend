import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ScoreBadgeComponent } from '../score-badge/score-badge';

@Component({
  selector: 'app-place-card',
  imports: [ScoreBadgeComponent, RouterLink],
  templateUrl: './place-card.html',
  styleUrl: './place-card.css',
})
export class PlaceCardComponent {
  @Input() nome = '';
  @Input() categoria = '';
  @Input() endereco = '';
  @Input() score = 0;
  @Input() link = '/mapa'; // para onde o botão "Ver detalhes" leva

  // Avisa quem usa o card que o botão foi clicado
  @Output() verDetalhes = new EventEmitter<void>();
}
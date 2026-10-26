import { Component } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ScoreBadgeComponent } from '../score-badge/score-badge';
import { LOCAIS, Local } from '../models/local';

@Component({
  selector: 'app-detalhes-local',
  imports: [RouterLink, ScoreBadgeComponent],
  templateUrl: './detalhes-local.html',
  styleUrl: './detalhes-local.css',
})
export class DetalhesLocal {
  local: Local | undefined;

  constructor(private rota: ActivatedRoute) {
    // Lê o número que vem na URL (/local/3 -> 3) e procura o local na lista
    const id = Number(this.rota.snapshot.paramMap.get('id'));
    this.local = LOCAIS.find((l) => l.id === id);
  }
}
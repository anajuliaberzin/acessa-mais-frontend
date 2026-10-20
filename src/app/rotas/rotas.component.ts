import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { OpcaoRota, ROTAS_MOCK } from './rotas.mock';

@Component({
  selector: 'app-rotas',
  imports: [FormsModule, RouterLink],
  templateUrl: './rotas.component.html',
  styleUrl: './rotas.component.css',
})
export class RotasComponent {
  origem = '';
  destino = '';
  readonly consultou = signal(false);
  readonly erro = signal('');
  readonly rotas = signal<readonly OpcaoRota[]>([]);
  readonly selecionada = signal<OpcaoRota | null>(null);

  limparConsulta(): void {
    this.consultou.set(false);
    this.erro.set('');
    this.rotas.set([]);
    this.selecionada.set(null);
  }

  comparar(): void {
    this.limparConsulta();
    this.consultou.set(true);
    if (!this.origem.trim() || !this.destino.trim()) {
      this.erro.set('Informe a origem e o destino para comparar as rotas.');
      return;
    }
    if (
      this.origem.trim().toLocaleLowerCase('pt-BR') ===
      this.destino.trim().toLocaleLowerCase('pt-BR')
    ) {
      return;
    }
    this.rotas.set(ROTAS_MOCK);
    this.selecionada.set(ROTAS_MOCK[1]);
  }
}

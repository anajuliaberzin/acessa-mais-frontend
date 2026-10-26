import { Component } from '@angular/core';
import { CityMapComponent, LocalMapa } from '../city-map/city-map';
import { PlaceCardComponent } from '../place-card/place-card';
import {
  CATEGORIAS, NECESSIDADES, RECURSOS, LOCAIS,
  Categoria, Necessidade, Recurso, Local,
} from '../models/local';

@Component({
  selector: 'app-mapa',
  imports: [CityMapComponent, PlaceCardComponent],
  templateUrl: './mapa.html',
  styleUrl: './mapa.css',
})
export class Mapa {
  // Listas para montar os botões de filtro
  categorias = CATEGORIAS;
  necessidades = NECESSIDADES;
  recursos = RECURSOS;

  // Estado dos filtros
  categoriaSelecionada: Categoria | null = null; // null = todas
  necessidadesSelecionadas: Necessidade[] = [];
  recursosSelecionados: Recurso[] = [];

  // Local clicado no mapa (para destacar o card)
  selecionadoId: number | null = null;

  // Lista de locais depois de aplicar os filtros
  get locaisFiltrados(): Local[] {
    return LOCAIS.filter((local) => {
      // Categoria: se tiver uma escolhida, o local precisa ser dela
      const okCategoria =
        this.categoriaSelecionada === null || local.categoria === this.categoriaSelecionada;

      // Necessidades: o local precisa atender a TODAS as escolhidas
      const okNecessidade = this.necessidadesSelecionadas.every((n) =>
        local.necessidades.includes(n),
      );

      // Recursos: o local precisa ter TODOS os escolhidos
      const okRecurso = this.recursosSelecionados.every((r) => local.recursos.includes(r));

      return okCategoria && okNecessidade && okRecurso;
    });
  }

  selecionarCategoria(categoria: Categoria | null) {
    this.categoriaSelecionada = categoria;
  }

  // Liga/desliga uma necessidade na lista
  alternarNecessidade(necessidade: Necessidade) {
    this.necessidadesSelecionadas = this.alternar(this.necessidadesSelecionadas, necessidade);
  }

  // Liga/desliga um recurso na lista
  alternarRecurso(recurso: Recurso) {
    this.recursosSelecionados = this.alternar(this.recursosSelecionados, recurso);
  }

  limparFiltros() {
    this.categoriaSelecionada = null;
    this.necessidadesSelecionadas = [];
    this.recursosSelecionados = [];
  }

  // Chamado quando o usuário clica em um marcador do mapa
  selecionarLocal(local: LocalMapa) {
    this.selecionadoId = local.id;
  }

  // Se o item já está na lista, remove; se não está, adiciona
  private alternar<T>(lista: T[], item: T): T[] {
    return lista.includes(item) ? lista.filter((i) => i !== item) : [...lista, item];
  }
}
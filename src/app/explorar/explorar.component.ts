import {
  AfterViewInit,
  Component,
  DestroyRef,
  ElementRef,
  OnDestroy,
  ViewChild,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import * as L from 'leaflet';
import { Local, Pagina, PlataformaService, RECURSOS } from '../services/plataforma.service';

@Component({
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './explorar.component.html',
  styleUrl: './explorar.component.css',
})
export class ExplorarComponent implements AfterViewInit, OnDestroy {
  private readonly api = inject(PlataformaService);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  @ViewChild('mapa') mapa!: ElementRef<HTMLDivElement>;
  readonly categorias = signal<string[]>([]);
  readonly pagina = signal<Pagina<Local> | null>(null);
  readonly selecionado = signal<Local | null>(null);
  readonly carregando = signal(false);
  readonly erro = signal('');
  readonly recursos = RECURSOS;
  readonly necessidades = [
    { id: 'mobilidade', nome: 'Mobilidade' },
    { id: 'visual', nome: 'Deficiência visual' },
    { id: 'auditiva', nome: 'Deficiência auditiva' },
  ];
  nome = '';
  categoria = '';
  necessidade = '';
  escolhidos: string[] = [];
  numero = 1;
  private versao = 0;
  private map?: L.Map;
  private markers = L.layerGroup();
  constructor() {
    this.api
      .filtros()
      .pipe(takeUntilDestroyed())
      .subscribe({ next: (f) => this.categorias.set(f.categorias), error: () => {} });
    this.route.queryParamMap.pipe(takeUntilDestroyed()).subscribe((params) => {
      this.nome = params.get('nome') ?? '';
      this.categoria = params.get('categoria') ?? '';
      this.necessidade = params.get('necessidade') ?? '';
      this.escolhidos = (params.get('recursos') ?? '').split(',').filter((key) => key in RECURSOS);
      this.buscar();
    });
  }
  ngAfterViewInit() {
    this.map = L.map(this.mapa.nativeElement, { scrollWheelZoom: false }).setView(
      [-23.5015, -47.4526],
      13,
    );
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(this.map);
    this.markers.addTo(this.map);
    this.desenhar();
  }
  buscar() {
    this.numero = 1;
    this.carregar();
  }
  limpar() {
    this.nome = this.categoria = this.necessidade = '';
    this.escolhidos = [];
    this.buscar();
  }
  alternar(key: string) {
    this.escolhidos = this.escolhidos.includes(key)
      ? this.escolhidos.filter((k) => k !== key)
      : [...this.escolhidos, key];
    this.buscar();
  }
  mudar(delta: number) {
    this.numero += delta;
    this.carregar();
  }
  carregar() {
    const version = ++this.versao;
    this.carregando.set(true);
    this.erro.set('');
    this.pagina.set(null);
    this.selecionado.set(null);
    this.markers.clearLayers();
    this.api
      .locais({
        nome: this.nome,
        categoria: this.categoria,
        necessidade: this.necessidade,
        recursos: this.escolhidos.join(','),
        page: this.numero,
        page_size: 12,
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (p) => {
          if (version !== this.versao) return;
          this.pagina.set(p);
          this.carregando.set(false);
          this.desenhar();
        },
        error: () => {
          if (version !== this.versao) return;
          this.carregando.set(false);
          this.erro.set('Não foi possível carregar os locais. Tente novamente.');
        },
      });
  }
  private desenhar() {
    this.markers.clearLayers();
    if (!this.map) return;
    for (const local of this.pagina()?.results ?? []) {
      if (local.latitude == null || local.longitude == null) continue;
      const classe =
        (
          {
            'alta acessibilidade': 'high',
            'boa acessibilidade': 'good',
            'acessibilidade parcial': 'partial',
            'baixa acessibilidade': 'low',
          } as Record<string, string>
        )[local.acessibilidade.classificacao ?? ''] ?? '';
      const tooltip = document.createElement('span');
      tooltip.textContent = local.nome;
      L.marker([local.latitude, local.longitude], {
        icon: L.divIcon({
          className: 'map-dot ' + classe,
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        }),
        title: local.nome,
        alt: local.nome + ': ' + (local.acessibilidade.classificacao ?? 'nota não calculada'),
      })
        .bindTooltip(tooltip)
        .on('click', () => this.abrir(local))
        .addTo(this.markers);
    }
  }
  private acionador: HTMLElement | null = null;
  fechar() { this.selecionado.set(null); this.acionador?.focus(); }
  abrir(local: Local) {
    this.acionador = document.activeElement as HTMLElement;
    this.selecionado.set(local);
    if (local.latitude != null && local.longitude != null)
      this.map?.setView([local.latitude, local.longitude], 15);
    setTimeout(() => document.getElementById('explore-detail')?.focus());
  }
  ngOnDestroy() {
    this.map?.remove();
  }
}

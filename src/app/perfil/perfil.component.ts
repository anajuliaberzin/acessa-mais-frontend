import { CommonModule } from '@angular/common';
import { Component, computed, signal } from '@angular/core';
import {
  LocalAvaliado,
  LocalFavorito,
  OcorrenciaResumo,
  PREFERENCIAS_DISPONIVEIS,
  PreferenciaAcessibilidade,
  UsuarioPerfil,
} from '../models/perfil.model';

type Aba = 'avaliacoes' | 'ocorrencias' | 'favoritos';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.css'],
})
export class PerfilComponent {
  readonly preferenciasDisponiveis = PREFERENCIAS_DISPONIVEIS;
  readonly abaAtiva = signal<Aba>('avaliacoes');

  // TODO: substituir pelos dados reais vindos da API (GET /api/usuarios/{id})
  // assim que o backend expuser o endpoint de perfil.
  readonly usuario = signal<UsuarioPerfil>({
    id: 'u1',
    nome: 'Ana Julia Ribeiro',
    cidade: 'Sorocaba',
    uf: 'SP',
    membroDesde: '2025-01-01',
    preferencias: ['cadeirante', 'mobilidade_reduzida'],
  });

  readonly avaliacoes = signal<LocalAvaliado[]>([
    { id: 'a1', nomeLocal: 'Hospital Santa Lucinda', nota: 5, comentario: 'Rampas em todas as entradas e recepção com atendimento prioritário organizado.', data: '2026-06-12' },
    { id: 'a2', nomeLocal: 'Shopping Cidade Sorocaba', nota: 4, comentario: 'Boas vagas de acessibilidade, mas elevador do estacionamento demora.', data: '2026-05-30' },
    { id: 'a3', nomeLocal: 'Esplanada Shopping', nota: 5, comentario: 'Banheiros adaptados bem sinalizados.', data: '2026-04-18' },
  ]);

  readonly ocorrencias = signal<OcorrenciaResumo[]>([
    { id: 'o1', descricaoResumo: 'Rampa danificada na Rua Doutor Álvaro Soares', tipoProblema: 'Rampa ausente ou inadequada', status: 'em_analise', data: '2026-07-02' },
    { id: 'o2', descricaoResumo: 'Piso tátil interrompido na Av. Ipanema', tipoProblema: 'Piso tátil ausente ou danificado', status: 'confirmada', data: '2026-06-20' },
  ]);

  readonly favoritos = signal<LocalFavorito[]>([
    { id: 'f1', nomeLocal: 'Shopping Cidade Sorocaba', nota: 4, comentario: 'Boas vagas de acessibilidade, mas elevador do estacionamento demora.' },
    { id: 'f2', nomeLocal: 'Hospital Santa Lucinda', nota: 5, comentario: 'Rampas em todas as entradas e recepção com atendimento prioritário organizado.' },
    { id: 'f3', nomeLocal: 'Esplanada Shopping', nota: 5, comentario: 'Banheiros adaptados bem sinalizados.' },
  ]);

  readonly iniciais = computed(() => {
    const partes = this.usuario().nome.trim().split(/\s+/);
    const primeira = partes[0]?.[0] ?? '';
    const ultima = partes.length > 1 ? partes[partes.length - 1][0] : '';
    return (primeira + ultima).toUpperCase();
  });

  readonly membroDesdeFormatado = computed(() => {
    const data = new Date(this.usuario().membroDesde);
    return data.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  });

  selecionarAba(aba: Aba): void {
    this.abaAtiva.set(aba);
  }

  alternarPreferencia(pref: PreferenciaAcessibilidade): void {
    this.usuario.update((atual) => {
      const jaSelecionada = atual.preferencias.includes(pref);
      const preferencias = jaSelecionada
        ? atual.preferencias.filter((p) => p !== pref)
        : [...atual.preferencias, pref];
      return { ...atual, preferencias };
    });
    // TODO: persistir a alteração via API (PATCH /api/usuarios/{id}/preferencias).
  }

  estaSelecionada(pref: PreferenciaAcessibilidade): boolean {
    return this.usuario().preferencias.includes(pref);
  }

  estrelas(nota: number): boolean[] {
    return Array.from({ length: 5 }, (_, i) => i < nota);
  }

  rotuloStatus(status: OcorrenciaResumo['status']): string {
    const rotulos: Record<OcorrenciaResumo['status'], string> = {
      em_analise: 'Em análise',
      confirmada: 'Confirmada',
      resolvida: 'Resolvida',
    };
    return rotulos[status];
  }

  classeStatus(status: OcorrenciaResumo['status']): string {
    const classes: Record<OcorrenciaResumo['status'], string> = {
      em_analise: 'text-bg-warning',
      confirmada: 'text-bg-info',
      resolvida: 'text-bg-success',
    };
    return classes[status];
  }
}

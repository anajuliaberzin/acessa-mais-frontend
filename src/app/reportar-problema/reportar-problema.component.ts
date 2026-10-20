import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { OcorrenciaService } from '../services/ocorrencia.service';
import { TIPOS_PROBLEMA } from '../models/ocorrencia.model';

@Component({
  selector: 'app-reportar-problema',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './reportar-problema.component.html',
  styleUrls: ['./reportar-problema.component.css'],
})
export class ReportarProblemaComponent {
  readonly tiposProblema = TIPOS_PROBLEMA;

  /** Estado da tela: 'formulario' | 'enviando' | 'sucesso' | 'erro' */
  readonly estado = signal<'formulario' | 'enviando' | 'sucesso' | 'erro'>('formulario');
  readonly obtendoLocalizacao = signal(false);
  readonly previaFoto = signal<string | null>(null);
  readonly protocolo = signal('');
  readonly erroFoto = signal('');
  readonly erroEnvio = signal('');

  form!: FormGroup;

  private arquivoFoto: File | null = null;

  constructor(
    private readonly fb: FormBuilder,
    private readonly ocorrenciaService: OcorrenciaService,
  ) {
    // Criado no construtor (e não como inicializador de campo) porque `fb`
    // só fica disponível depois que o Angular injeta as dependências.
    this.form = this.fb.group({
      confirmadoSorocaba: [false, Validators.requiredTrue],
      endereco: ['', [Validators.required, Validators.minLength(5)]],
      latitude: this.fb.control<number | null>(null),
      longitude: this.fb.control<number | null>(null),
      tipoProblema: ['', Validators.required],
      descricao: ['', [Validators.required, Validators.minLength(10)]],
    });
  }

  /** Tipado como `any` de propósito: o template acessa os controles por
   * nome (f.endereco, f.tipoProblema...) e `FormGroup.controls` tem
   * assinatura de índice, que o compilador de templates do Angular recusa
   * em modo estrito sem esse relaxamento. */
  get f(): any {
    return this.form.controls;
  }

  usarLocalizacaoAtual(): void {
    if (!('geolocation' in navigator)) {
      alert('Seu navegador não suporta geolocalização. Digite o endereço manualmente.');
      return;
    }

    this.obtendoLocalizacao.set(true);
    navigator.geolocation.getCurrentPosition(
      (posicao) => {
        const { latitude, longitude } = posicao.coords;
        this.form.patchValue({ latitude, longitude });

        this.ocorrenciaService.obterEnderecoPorCoordenadas(latitude, longitude).subscribe({
          next: (resultado) => {
            this.form.patchValue({ endereco: resultado.display_name });
            this.obtendoLocalizacao.set(false);
          },
          error: () => {
            // Mesmo sem o endereço textual, as coordenadas já foram capturadas.
            this.obtendoLocalizacao.set(false);
          },
        });
      },
      () => {
        this.obtendoLocalizacao.set(false);
        alert('Não foi possível obter sua localização. Verifique a permissão do navegador ou digite o endereço.');
      },
    );
  }

  limparCoordenadas(): void {
    this.form.patchValue({ latitude: null, longitude: null });
  }

  aoSelecionarFoto(evento: Event): void {
    const input = evento.target as HTMLInputElement;
    const arquivo = input.files?.[0] ?? null;
    this.erroFoto.set('');
    if (arquivo && (!['image/jpeg', 'image/png', 'image/webp'].includes(arquivo.type) || arquivo.size > 5 * 1024 * 1024)) {
      this.erroFoto.set('Envie JPEG, PNG ou WebP de até 5 MB.');
      this.arquivoFoto = null;
      this.previaFoto.set(null);
      input.value = '';
      return;
    }
    this.arquivoFoto = arquivo;

    if (!arquivo) {
      this.previaFoto.set(null);
      return;
    }

    const leitor = new FileReader();
    leitor.onload = () => this.previaFoto.set(leitor.result as string);
    leitor.readAsDataURL(arquivo);
  }

  removerFoto(inputFoto: HTMLInputElement): void {
    this.arquivoFoto = null;
    this.previaFoto.set(null);
    inputFoto.value = '';
  }

  enviar(): void {
    if (this.estado() === 'enviando') return;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.estado.set('enviando');
    this.erroEnvio.set('');
    const valores = this.form.getRawValue();

    this.ocorrenciaService
      .enviarOcorrencia({
        confirmadoSorocaba: valores.confirmadoSorocaba === true,
        endereco: valores.endereco ?? '',
        latitude: valores.latitude ?? null,
        longitude: valores.longitude ?? null,
        tipoProblema: (valores.tipoProblema as any) ?? '',
        descricao: valores.descricao ?? '',
        foto: this.arquivoFoto,
      })
      .subscribe({
        next: (ocorrencia) => { this.protocolo.set(ocorrencia.protocolo); this.estado.set('sucesso'); },
        error: (erro) => {
          this.erroEnvio.set(erro.status === 400 ? 'Confira os campos e a foto enviada. ' + Object.values(erro.error ?? {}).flat().join(' ') : 'Não foi possível enviar. Tente novamente.');
          this.estado.set('erro');
        },
      });
  }

  novoReporte(): void {
    this.protocolo.set('');
    this.erroFoto.set('');
    this.form.reset();
    this.arquivoFoto = null;
    this.previaFoto.set(null);
    this.estado.set('formulario');
  }
}

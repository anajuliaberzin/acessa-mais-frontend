import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../auth/api.config';
import { NovaOcorrencia, Ocorrencia } from '../models/ocorrencia.model';

/**
 * Serviço responsável por enviar reportes de problemas de acessibilidade
 * para a API e por obter um endereço aproximado a partir de coordenadas
 * (reverse geocoding via Nominatim/OpenStreetMap).
 *
 * Usa o mesmo API_BASE_URL configurado em `auth/api.config.ts` (o mesmo
 * backend usado pelo login). O endpoint POST /ocorrencias/ ainda precisa
 * ser implementado no backend; este serviço já está pronto para consumi-lo
 * assim que existir.
 */
@Injectable({ providedIn: 'root' })
export class OcorrenciaService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);
  private readonly nominatimUrl = 'https://nominatim.openstreetmap.org/reverse';

  enviarOcorrencia(novaOcorrencia: NovaOcorrencia): Observable<Ocorrencia> {
    const formData = new FormData();
    formData.append('endereco', novaOcorrencia.endereco);
    formData.append('tipoProblema', novaOcorrencia.tipoProblema);
    formData.append('descricao', novaOcorrencia.descricao);
    if (novaOcorrencia.latitude != null) {
      formData.append('latitude', String(novaOcorrencia.latitude));
    }
    if (novaOcorrencia.longitude != null) {
      formData.append('longitude', String(novaOcorrencia.longitude));
    }
    if (novaOcorrencia.foto) {
      formData.append('foto', novaOcorrencia.foto);
    }
    return this.http.post<Ocorrencia>(this.baseUrl + '/ocorrencias/', formData);
  }

  /** Retorna um endereço legível a partir de latitude/longitude (OpenStreetMap Nominatim). */
  obterEnderecoPorCoordenadas(latitude: number, longitude: number): Observable<{ display_name: string }> {
    const params = new URLSearchParams({
      format: 'json',
      lat: String(latitude),
      lon: String(longitude),
    });
    return this.http.get<{ display_name: string }>(`${this.nominatimUrl}?${params.toString()}`);
  }
}

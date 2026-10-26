import { TestBed } from '@angular/core/testing';
import { NavigationStart, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { SpeechService } from './speech.service';
describe('Leitura por voz',()=>{
  const events = new Subject<NavigationStart>();
  let container: HTMLElement;
  let synth: {getVoices:ReturnType<typeof vi.fn>;speak:ReturnType<typeof vi.fn>;cancel:ReturnType<typeof vi.fn>;pause:ReturnType<typeof vi.fn>;resume:ReturnType<typeof vi.fn>;addEventListener:ReturnType<typeof vi.fn>;removeEventListener:ReturnType<typeof vi.fn>};
  beforeEach(()=>{
    synth={getVoices:vi.fn(()=>[{lang:'pt-BR',localService:true}]),speak:vi.fn(),cancel:vi.fn(),pause:vi.fn(),resume:vi.fn(),addEventListener:vi.fn(),removeEventListener:vi.fn()};
    vi.stubGlobal('speechSynthesis',synth);
    vi.stubGlobal('SpeechSynthesisUtterance',class{constructor(public text:string){} });
    TestBed.configureTestingModule({providers:[{provide:Router,useValue:{events}}]});
    container=document.createElement('main');container.innerHTML='<h1>Locais acessíveis</h1><p data-read-aloud>Entrada sem degraus.</p><form><p data-read-aloud>Conteúdo privado do formulário</p><input value="segredo" /></form>';document.body.append(container);
    vi.spyOn(HTMLElement.prototype,'getClientRects').mockReturnValue({length:1} as DOMRectList);
  });
  afterEach(()=>{TestBed.resetTestingModule();container.remove();vi.restoreAllMocks();vi.unstubAllGlobals();});
  it('lê somente conteúdo selecionado, sem campos, e cancela ao navegar',()=>{
    const service=TestBed.inject(SpeechService);service.read();
    const utterance=synth.speak.mock.calls[0][0];expect(utterance.text).toContain('Entrada sem degraus');expect(utterance.text).not.toContain('privado');expect(utterance.text).not.toContain('segredo');
    service.pause();expect(service.state()).toBe('paused');service.resume();expect(service.state()).toBe('reading');
    events.next(new NavigationStart(1,'/login'));expect(service.state()).toBe('idle');expect(synth.cancel).toHaveBeenCalled();
  });
  it('não usa voz remota quando não há voz local',()=>{
    synth.getVoices.mockReturnValue([{lang:'pt-BR',localService:false}]);const service=TestBed.inject(SpeechService);service.read();expect(synth.speak).not.toHaveBeenCalled();expect(service.message()).toContain('voz local');
  });
});

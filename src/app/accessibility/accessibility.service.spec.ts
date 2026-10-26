import { TestBed } from '@angular/core/testing';
import { AccessibilityService } from './accessibility.service';
describe('Preferências de acessibilidade',()=>{
  beforeEach(()=>{localStorage.removeItem('acessa.accessibility.v1');TestBed.configureTestingModule({});});
  afterEach(()=>{localStorage.removeItem('acessa.accessibility.v1');localStorage.removeItem('outra-chave');document.documentElement.style.fontSize='';delete document.documentElement.dataset['contrast'];});
  it('limita a escala e restaura sem apagar outros dados',()=>{localStorage.setItem('outra-chave','valor');const service=TestBed.inject(AccessibilityService);for(let i=0;i<10;i++)service.resize(25);expect(service.scale()).toBe(200);service.toggleContrast();expect(document.documentElement.dataset['contrast']).toBe('high');service.reset();expect(service.scale()).toBe(100);expect(localStorage.getItem('outra-chave')).toBe('valor');expect(localStorage.getItem('acessa.accessibility.v1')).toBeNull();});
  it('ignora preferências inválidas',()=>{localStorage.setItem('acessa.accessibility.v1','{"scale":999,"contrast":"true"}');const service=TestBed.inject(AccessibilityService);expect(service.scale()).toBe(100);expect(service.contrast()).toBe(false);});
  it('mantém os controles funcionando sem acesso ao armazenamento',()=>{vi.spyOn(Storage.prototype,'setItem').mockImplementation(()=>{throw new Error('bloqueado');});const service=TestBed.inject(AccessibilityService);expect(()=>service.resize(25)).not.toThrow();expect(service.scale()).toBe(125);vi.restoreAllMocks();});
});

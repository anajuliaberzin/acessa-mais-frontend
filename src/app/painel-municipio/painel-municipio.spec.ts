import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PainelMunicipio } from './painel-municipio';

describe('PainelMunicipio', () => {
  let component: PainelMunicipio;
  let fixture: ComponentFixture<PainelMunicipio>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PainelMunicipio],
    }).compileComponents();

    fixture = TestBed.createComponent(PainelMunicipio);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

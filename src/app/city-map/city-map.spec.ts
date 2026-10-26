import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CityMap } from './city-map';

describe('CityMap', () => {
  let component: CityMap;
  let fixture: ComponentFixture<CityMap>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CityMap],
    }).compileComponents();

    fixture = TestBed.createComponent(CityMap);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

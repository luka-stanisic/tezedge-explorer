import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChainBakingComponent } from './chain-baking.component';

describe('ChainBakingComponent', () => {
  let component: ChainBakingComponent;
  let fixture: ComponentFixture<ChainBakingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChainBakingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChainBakingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

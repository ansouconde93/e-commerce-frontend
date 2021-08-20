import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApprobationComponent } from './approbation.component';

describe('ApprobationComponent', () => {
  let component: ApprobationComponent;
  let fixture: ComponentFixture<ApprobationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ApprobationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ApprobationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

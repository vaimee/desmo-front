import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TddManagerComponent } from './tdd-manager.component';

describe('TddManagerComponent', () => {
  let component: TddManagerComponent;
  let fixture: ComponentFixture<TddManagerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TddManagerComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TddManagerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TddEventsTableComponent } from './tdd-events-table.component';

describe('TddEventsTableComponent', () => {
  let component: TddEventsTableComponent;
  let fixture: ComponentFixture<TddEventsTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TddEventsTableComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TddEventsTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

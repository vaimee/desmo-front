import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TddEventsListTableComponent } from './tdd-events-list-table.component';

describe('TddEventsListTableComponent', () => {
  let component: TddEventsListTableComponent;
  let fixture: ComponentFixture<TddEventsListTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TddEventsListTableComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TddEventsListTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

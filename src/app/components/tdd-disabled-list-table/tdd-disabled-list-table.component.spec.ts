import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TddDisabledListTableComponent } from './tdd-disabled-list-table.component';

describe('TddDisabledListTableComponent', () => {
  let component: TddDisabledListTableComponent;
  let fixture: ComponentFixture<TddDisabledListTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TddDisabledListTableComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TddDisabledListTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

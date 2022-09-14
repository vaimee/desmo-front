import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TddEnabledListTableComponent } from './tdd-enabled-list-table.component';

describe('TddEnabledListTableComponent', () => {
  let component: TddEnabledListTableComponent;
  let fixture: ComponentFixture<TddEnabledListTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TddEnabledListTableComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TddEnabledListTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

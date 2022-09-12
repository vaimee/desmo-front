import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TddListTableComponent } from './tdd-list-table.component';

describe('TddListTableComponent', () => {
  let component: TddListTableComponent;
  let fixture: ComponentFixture<TddListTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TddListTableComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TddListTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

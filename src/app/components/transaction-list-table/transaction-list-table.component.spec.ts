import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TransactionListTableComponent } from './transaction-list-table.component';

describe('TransactionListTableComponent', () => {
  let component: TransactionListTableComponent;
  let fixture: ComponentFixture<TransactionListTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TransactionListTableComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TransactionListTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

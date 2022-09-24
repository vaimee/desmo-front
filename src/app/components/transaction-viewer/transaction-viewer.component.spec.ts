import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TransactionViewerComponent } from './transaction-viewer.component';

describe('TransactionViewerComponent', () => {
  let component: TransactionViewerComponent;
  let fixture: ComponentFixture<TransactionViewerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TransactionViewerComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TransactionViewerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

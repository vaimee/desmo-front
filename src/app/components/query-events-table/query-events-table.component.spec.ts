import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QueryEventsTableComponent } from './query-events-table.component';

describe('QueryEventsTableComponent', () => {
  let component: QueryEventsTableComponent;
  let fixture: ComponentFixture<QueryEventsTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [QueryEventsTableComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(QueryEventsTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

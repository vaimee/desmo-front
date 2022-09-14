import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QueryListTableComponent } from './query-list-table.component';

describe('QueryListTableComponent', () => {
  let component: QueryListTableComponent;
  let fixture: ComponentFixture<QueryListTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ QueryListTableComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(QueryListTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

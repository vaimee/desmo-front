import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TddCreatedListTableComponent } from './tdd-created-list-table.component';

describe('TddCreatedListTableComponent', () => {
  let component: TddCreatedListTableComponent;
  let fixture: ComponentFixture<TddCreatedListTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TddCreatedListTableComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TddCreatedListTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

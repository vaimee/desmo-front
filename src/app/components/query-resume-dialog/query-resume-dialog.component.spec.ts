import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QueryResumeDialogComponent } from './query-resume-dialog.component';

describe('QueryResumeDialogComponent', () => {
  let component: QueryResumeDialogComponent;
  let fixture: ComponentFixture<QueryResumeDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [QueryResumeDialogComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(QueryResumeDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

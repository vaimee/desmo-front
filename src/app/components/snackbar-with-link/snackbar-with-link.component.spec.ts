import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SnackbarWithLinkComponent } from './snackbar-with-link.component';

describe('SnackbarWithLinkComponent', () => {
  let component: SnackbarWithLinkComponent;
  let fixture: ComponentFixture<SnackbarWithLinkComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SnackbarWithLinkComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SnackbarWithLinkComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

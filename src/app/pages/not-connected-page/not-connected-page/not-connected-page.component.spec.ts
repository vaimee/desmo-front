import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NotConnectedPageComponent } from './not-connected-page.component';

describe('NotConnectedPageComponent', () => {
  let component: NotConnectedPageComponent;
  let fixture: ComponentFixture<NotConnectedPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [NotConnectedPageComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NotConnectedPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

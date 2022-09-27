import { TestBed } from '@angular/core/testing';

import { HasMetamaskGuard } from './has-metamask.guard';

describe('HasMetamaskGuard', () => {
  let guard: HasMetamaskGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(HasMetamaskGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});

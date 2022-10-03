import { TestBed } from '@angular/core/testing';

import { IsVivianiChainGuard } from './is-viviani-chain.guard';

describe('IsVivianiChainGuard', () => {
  let guard: IsVivianiChainGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(IsVivianiChainGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});

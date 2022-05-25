import { TestBed } from '@angular/core/testing';

import { OracleDappService } from './oracle-dapp.service';

describe('OracleDappService', () => {
  let service: OracleDappService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OracleDappService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

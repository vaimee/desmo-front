import { TestBed } from '@angular/core/testing';

import { DesmoldSDKService } from './desmold-sdk.service';

describe('DesmoldSDKService', () => {
  let service: DesmoldSDKService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DesmoldSDKService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

import { TestBed } from '@angular/core/testing';

import { DesmoHubService } from './desmo-hub.service';

describe('DesmoHubService', () => {
  let service: DesmoHubService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DesmoHubService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

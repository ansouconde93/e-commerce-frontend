import { TestBed } from '@angular/core/testing';

import { ProductManipulationService } from './product-manipulation.service';

describe('ProductManipulationService', () => {
  let service: ProductManipulationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProductManipulationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

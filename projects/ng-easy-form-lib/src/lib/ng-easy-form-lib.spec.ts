import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NgEasyFormLib } from './ng-easy-form-lib';

describe('NgFormLib', () => {
  let component: NgEasyFormLib;
  let fixture: ComponentFixture<NgEasyFormLib>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NgEasyFormLib]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NgEasyFormLib);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

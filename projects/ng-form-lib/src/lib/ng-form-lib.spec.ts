import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NgFormLib } from './ng-form-lib';

describe('NgFormLib', () => {
  let component: NgFormLib;
  let fixture: ComponentFixture<NgFormLib>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NgFormLib]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NgFormLib);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

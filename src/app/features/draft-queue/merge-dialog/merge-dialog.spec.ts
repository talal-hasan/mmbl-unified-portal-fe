import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MergeDialog } from './merge-dialog';

describe('MergeDialog', () => {
  let component: MergeDialog;
  let fixture: ComponentFixture<MergeDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MergeDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MergeDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

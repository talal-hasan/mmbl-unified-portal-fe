import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DraftQueue } from './draft-queue';

describe('DraftQueue', () => {
  let component: DraftQueue;
  let fixture: ComponentFixture<DraftQueue>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DraftQueue]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DraftQueue);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

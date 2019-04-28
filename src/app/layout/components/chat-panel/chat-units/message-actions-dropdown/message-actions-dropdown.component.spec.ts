import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MessageActionsDropdownComponent } from './message-actions-dropdown.component';

describe('MessageActionsDropdownComponent', () => {
  let component: MessageActionsDropdownComponent;
  let fixture: ComponentFixture<MessageActionsDropdownComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MessageActionsDropdownComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MessageActionsDropdownComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

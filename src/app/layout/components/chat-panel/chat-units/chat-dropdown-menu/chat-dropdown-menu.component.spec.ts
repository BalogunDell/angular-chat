import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatDropdownMenuComponent } from './chat-dropdown-menu.component';

describe('ChatDropdownMenuComponent', () => {
  let component: ChatDropdownMenuComponent;
  let fixture: ComponentFixture<ChatDropdownMenuComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChatDropdownMenuComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChatDropdownMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

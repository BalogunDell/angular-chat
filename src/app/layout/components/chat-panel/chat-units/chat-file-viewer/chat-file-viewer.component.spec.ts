import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatFileViewerComponent } from './chat-file-viewer.component';

describe('ChatFileViewerComponent', () => {
  let component: ChatFileViewerComponent;
  let fixture: ComponentFixture<ChatFileViewerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChatFileViewerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChatFileViewerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

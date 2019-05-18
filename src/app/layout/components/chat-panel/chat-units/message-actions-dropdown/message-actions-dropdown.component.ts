import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-message-actions-dropdown',
  templateUrl: './message-actions-dropdown.component.html',
  styleUrls: ['./message-actions-dropdown.component.scss']
})
export class MessageActionsDropdownComponent implements OnInit {

  @Input()
  messageType;

  @Input()
  enableInputSelector;

  @Output() emitButtonValue = new EventEmitter<boolean>();

  constructor() { }

  ngOnInit(): void {
    
  }
  emitValue = (showInputSelector, showReplyForm, action): any => {
    this.enableInputSelector(showInputSelector, showReplyForm);
    this.emitButtonValue.emit(action);
  }
}

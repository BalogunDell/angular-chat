import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { saveAs } from 'file-saver';

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

  @Input()
  content;

  @Output() emitButtonValue = new EventEmitter<boolean>();

  constructor() { }

  ngOnInit(): void {
    
  }
  emitValue = (showInputSelector, showReplyForm, action): any => {
    this.enableInputSelector(showInputSelector, showReplyForm);
    this.emitButtonValue.emit(action);
  }

  downloadFile = () => {
    
    document.getElementById('downloadLink').click();
    // const file = new File(['meeee'], this.content, {type: 'text/plain;charset=utf-8'});
    // console.log(file);
    // saveAs(file);
  //   const element = document.createElement('a');
  //  element.href = this.content;
  //  element.download = this.messageType;
  //  element.click();
  }
}

import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-message-actions-dropdown',
  templateUrl: './message-actions-dropdown.component.html',
  styleUrls: ['./message-actions-dropdown.component.scss']
})
export class MessageActionsDropdownComponent implements OnInit {

  @Input()
  messageType: '';
  
  constructor() { }

  ngOnInit() {
  }

}

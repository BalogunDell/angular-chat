import { Component, OnInit, Input } from '@angular/core';
import { ChatHelperService } from '../../chat-panel-helper';
import { FuseSidebarService } from '@fuse/components/sidebar/sidebar.service';

@Component({
  selector: 'app-chat-dropdown-menu',
  templateUrl: './chat-dropdown-menu.component.html',
  styleUrls: ['./chat-dropdown-menu.component.scss']
})
export class ChatDropdownMenuComponent implements OnInit {

  constructor(
    private _fuseSidebarService: FuseSidebarService,
  ) { }

  @Input() selectedUser;
  @Input() messagesList;
  @Input() attachFile;
  @Input() addNewGroup;
  @Input() deleteGroup;
  @Input() closeChatBar;
  @Input() sendFile;
  @Input() showContactInfo;
  @Input() selectContact;
  @Input() resetChatScreen;

  ngOnInit(): void {
  }
   
}

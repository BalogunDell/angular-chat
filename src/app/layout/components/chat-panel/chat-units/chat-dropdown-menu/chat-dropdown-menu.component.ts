import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { ChatHelperService } from '../../chat-panel-helper';
import { FuseSidebarService } from '@fuse/components/sidebar/sidebar.service';
import { ChatPanelService } from '../../chat-panel.service';

@Component({
  selector: 'app-chat-dropdown-menu',
  templateUrl: './chat-dropdown-menu.component.html',
  styleUrls: ['./chat-dropdown-menu.component.scss']
})
export class ChatDropdownMenuComponent implements OnInit, OnChanges {

  constructor(
    private _fuseSidebarService: FuseSidebarService,
    private chatHelperService: ChatHelperService,
    private chatPanelService: ChatPanelService,
  ) { }

  blocked;

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
  @Input() showMinimizeChat;
  @Input() exitGroup;
  @Input() clearChat;
  @Input() exportChat;
  @Input() blockContact;
  @Input() isActionFromChatPanel;
  @Input() addNewGroupAdmin;


  showNotification;

  ngOnInit(): void {
    console.log(this.selectedUser);
    this.chatPanelService.disableNotification.subscribe(({ enableNotification }) => {
        this.showNotification = enableNotification;
    });
  }

  ngOnChanges(simpleChanges: SimpleChanges): void {
    const { selectedUser } = simpleChanges;
    if (selectedUser) {
      const { currentValue: { userContacts = []} } = selectedUser;

      this.blocked = userContacts.length !== 0 && userContacts[0].isBlocked;

    }
  }

  enableNotification = () => {
    this.chatPanelService.disableNotification.next({ enableNotification : true });
  }

  disableNotification = () => {
    this.chatPanelService.disableNotification.next({ enableNotification : false });
  }
}

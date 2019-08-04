import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { ChatPanelService } from '../../chat-panel.service';
 
@Component({
  selector: 'app-chat-modal',
  templateUrl: './chat-modal.component.html',
  styleUrls: ['./chat-modal.component.scss']
})
export class ChatModalComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<ChatModalComponent>,
    
    @Inject(MAT_DIALOG_DATA)
    
    public data: any,
    private chatPanelService: ChatPanelService,
  ) { }

  ngOnInit(): void {
  }

  setSelectedContact = (selectedContact, index): void => {
    let openSideBar = true;
    if ( this.data.location === 'chat-view') {
      openSideBar = false;
    }
    this.chatPanelService.selectecdContactFromModal.next({selectedContact, index, openSideBar});
    this.dialogRef.close();
  }

  setFileType = (fileType) => {
    this.chatPanelService.selectecdFileType.next(fileType);
    this.dialogRef.close();
  }

  setSelectedAdmin = (selectedAdmin, index): void => {
    this.chatPanelService.newAdmin.next({selectedAdmin, index, selectedGroupId: this.data.selectedGroupId });
  }
}

import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'app-chat-file-viewer',
  templateUrl: './chat-file-viewer.component.html',
  styleUrls: ['./chat-file-viewer.component.scss']
})
export class ChatFileViewerComponent {

  constructor(
    public dialogRef: MatDialogRef<ChatFileViewerComponent>,
    
    @Inject(MAT_DIALOG_DATA)
    
    public data: any,
    ) {}

  onNoClick(): void {
    this.dialogRef.close();
  }

}

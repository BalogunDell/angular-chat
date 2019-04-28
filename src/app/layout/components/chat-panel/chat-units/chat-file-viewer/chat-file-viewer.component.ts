import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-chat-file-viewer',
  templateUrl: './chat-file-viewer.component.html',
  styleUrls: ['./chat-file-viewer.component.scss']
})
export class ChatFileViewerComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<ChatFileViewerComponent>,
    
    @Inject(MAT_DIALOG_DATA)
    
    public data: any,
    private domSanitizer: DomSanitizer,
    ) {}

  onNoClick(): void {
    this.dialogRef.close();
  }

  ngOnInit() {
  
  }

}

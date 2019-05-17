import { NgModule } from '@angular/core';

import { MessageActionsDropdownComponent } from 'app/layout/components/chat-panel/chat-units/message-actions-dropdown/message-actions-dropdown.component';
import { ChatDropdownMenuComponent } from 'app/layout/components/chat-panel/chat-units/chat-dropdown-menu/chat-dropdown-menu.component';
import {
  MatMenuModule,
  MatIconModule,
  MatButtonModule,
  MatCardModule,
  MatFormFieldModule,
  MatInputModule,
  MatListModule,
  MatRadioModule,
  MatSidenavModule,
  MatToolbarModule, 
  MatSelectModule,
  MatSnackBarModule,
  MatTooltipModule,
  MatRippleModule} from '@angular/material';
import { FuseSharedModule } from '@fuse/shared.module';

@NgModule({
    declarations: [
      ChatDropdownMenuComponent,
      MessageActionsDropdownComponent
    ],
    imports: [
      MatMenuModule,
      MatIconModule,
      MatButtonModule,
      MatCardModule,
      MatFormFieldModule,
      MatInputModule,
      MatListModule,
      MatMenuModule,
      MatRadioModule,
      MatTooltipModule,
      MatRippleModule,
      MatSidenavModule,
      MatToolbarModule,
      MatSelectModule,
      MatSnackBarModule,
      FuseSharedModule,
    ],

    exports: [ 
      MessageActionsDropdownComponent,
      ChatDropdownMenuComponent,
      MatMenuModule,
      MatIconModule,
      MatButtonModule,
      MatCardModule,
      MatFormFieldModule,
      MatInputModule,
      MatListModule,
      MatMenuModule,
      MatRadioModule,
      MatSidenavModule,
      MatToolbarModule,
      MatSelectModule,
      MatSnackBarModule,
      MatTooltipModule,
      MatRippleModule,
      FuseSharedModule,
    ],
})
export class SharedModule
{
}

import { NgModule } from '@angular/core';
import { MatButtonModule, MatFormFieldModule, MatIconModule, MatInputModule, MatRippleModule, MatTabsModule, MatTooltipModule, MatMenuModule } from '@angular/material';

import { FuseSharedModule } from '@fuse/shared.module';
import { ChatPanelComponent } from 'app/layout/components/chat-panel/chat-panel.component';
import { ChatPanelService } from 'app/layout/components/chat-panel/chat-panel.service';
import { EmojiModule } from 'angular-emoji/dist';

@NgModule({
    declarations: [
        ChatPanelComponent
    ],
    providers   : [
        ChatPanelService
    ],
    imports     : [
        MatButtonModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatTabsModule,
        MatTooltipModule,
        MatRippleModule,
        EmojiModule,
        MatMenuModule,

        FuseSharedModule
    ],
    exports     : [
        ChatPanelComponent
    ]
})
export class ChatPanelModule
{
}

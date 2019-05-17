import { NgModule } from '@angular/core';
import { ChatPanelComponent } from 'app/layout/components/chat-panel/chat-panel.component';
import { ChatPanelService } from 'app/layout/components/chat-panel/chat-panel.service';
import { ChatHelperService } from './chat-panel-helper';
import { SharedModule } from 'app/shared/shared.module';

@NgModule({
    declarations: [
        ChatPanelComponent,
    ],
    providers   : [
        ChatPanelService,
        ChatHelperService,
    ],
    imports     : [ SharedModule ],
    exports     : [
        ChatPanelComponent,
        

    ]
})
export class ChatPanelModule
{
}

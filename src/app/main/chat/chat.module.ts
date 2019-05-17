import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ChatService } from 'app/main/chat/chat.service';
import { ChatComponent } from 'app/main/chat/chat.component';
import { ChatStartComponent } from 'app/main/chat/chat-start/chat-start.component';
import { ChatViewComponent } from 'app/main/chat/chat-view/chat-view.component';
import { ChatChatsSidenavComponent } from 'app/main/chat/sidenavs/left/chats/chats.component';
import { ChatUserSidenavComponent } from 'app/main/chat/sidenavs/left/user/user.component';
import { ChatLeftSidenavComponent } from 'app/main/chat/sidenavs/left/left.component';
import { ChatRightSidenavComponent } from 'app/main/chat/sidenavs/right/right.component';
import { ChatContactSidenavComponent } from 'app/main/chat/sidenavs/right/contact/contact.component';
import { SharedModule } from 'app/shared/shared.module';

const routes: Routes = [
    {
        path: '**',
        component: ChatComponent,
        children: [],
        resolve: {
            chat: ChatService
        }
    }
];

@NgModule({
    declarations: [
        ChatComponent,
        ChatViewComponent,
        ChatStartComponent,
        ChatChatsSidenavComponent,
        ChatUserSidenavComponent,
        ChatLeftSidenavComponent,
        ChatRightSidenavComponent,
        ChatContactSidenavComponent,
    ],
    imports     : [
        RouterModule.forChild(routes),

        SharedModule
    ],
    providers   : [
        ChatService
    ],

})
export class ChatModule
{
}

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import {
    MatButtonModule, MatCardModule, MatFormFieldModule, MatIconModule, MatInputModule, MatListModule, MatMenuModule, MatRadioModule, MatSidenavModule, MatToolbarModule
} from '@angular/material';

import { FuseSharedModule } from '@fuse/shared.module';

import { ChatService } from 'app/main/chat/chat.service';
import { ChatComponent } from 'app/main/chat/chat.component';
import { ChatStartComponent } from 'app/main/chat/chat-start/chat-start.component';
import { ChatViewComponent } from 'app/main/chat/chat-view/chat-view.component';
import { ChatChatsSidenavComponent } from 'app/main/chat/sidenavs/left/chats/chats.component';
import { ChatUserSidenavComponent } from 'app/main/chat/sidenavs/left/user/user.component';
import { ChatLeftSidenavComponent } from 'app/main/chat/sidenavs/left/left.component';
import { ChatRightSidenavComponent } from 'app/main/chat/sidenavs/right/right.component';
import { ChatContactSidenavComponent } from 'app/main/chat/sidenavs/right/contact/contact.component';

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
        ChatContactSidenavComponent
    ],
    imports     : [
        RouterModule.forChild(routes),

        MatButtonModule,
        MatCardModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatListModule,
        MatMenuModule,
        MatRadioModule,
        MatSidenavModule,
        MatToolbarModule,

        FuseSharedModule
    ],
    providers   : [
        ChatService
    ]
})
export class ChatModule
{
}

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import {
    MatButtonModule, MatCardModule, MatFormFieldModule, MatIconModule, MatInputModule, MatListModule, MatMenuModule, MatRadioModule, MatSidenavModule, MatToolbarModule
} from '@angular/material';

import { FuseSharedModule } from '@fuse/shared.module';
import { ChatComponent } from './chat.component';
import { ChatService } from './chat.service';


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

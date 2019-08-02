import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { ObservableMedia } from '@angular/flex-layout';
import { Subject, Observable } from 'rxjs';

import { fuseAnimations } from '@fuse/animations';
import { FuseMatSidenavHelperService } from '@fuse/directives/fuse-mat-sidenav/fuse-mat-sidenav.service';

import { ChatService } from 'app/main/chat/chat.service';
import { ChatPanelService } from 'app/layout/components/chat-panel/chat-panel.service';

import { NgRedux, select } from '@angular-redux/store';
import { setSelectedUser, setChatLocation } from 'app/redux/actions';
import { AppStateI } from 'app/interfaces';

import { AllEnums } from 'app/enums';
import { ChatHelperService } from 'app/layout/components/chat-panel/chat-panel-helper';
@Component({
    selector     : 'chat-chats-sidenav',
    templateUrl  : './chats.component.html',
    styleUrls    : ['./chats.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations   : fuseAnimations
})
export class ChatChatsSidenavComponent implements OnInit, OnDestroy
{
    chats: any[];
    chatSearch: any;
    allContacts = [];
    searchText = '';
    user: any;
    page = 1;
    pageLimit = 20;
    token = null;
    messagesList = [];
    chatList = [];
    selectedUser = null;
    chatConnection = null;

    @select('contacts') allContacts$: Observable<any[]>;
    @select('currentUser') currentUser$: Observable<any[]>;
    // Private
    private _unsubscribeAll: Subject<any>;

    /**
     * Constructor
     *
     */
    constructor(
        private _chatService: ChatService,
        public _observableMedia: ObservableMedia,
        private ngRedux: NgRedux<AppStateI>,
        private chatHelperService: ChatHelperService,
    )
    {
        // Set the defaults
        this.chatSearch = {
            name: ''
        };
        this.searchText = '';

        // Set the private defaults
        this._unsubscribeAll = new Subject();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void
    {
        this.token =  localStorage.getItem('chatToken');
        this.currentUser$.subscribe(user => {
        this.user = user;
        
       });


        this.allContacts$.subscribe(data => {
           this.allContacts = data && data.filter(contact => contact.messages.length === 0);
          this.chatList = data && data.filter(contact => contact.messages.length > 0);
        });   
    }
    /**
     * On destroy
     */
    ngOnDestroy(): void
    {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
       
    }


    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Get chat
     *
     * @param contact
     */
    getUser = (user) => 
    {
        this.ngRedux.dispatch(setSelectedUser(user, AllEnums.MAIN_CHAT_PANEL ));
        this.messagesList = user.messages;
    }

    getLastMessage = (messages) => {
        const lastMessage = messages[messages.length - 1];

        if (['img', 'doc', 'aud'].includes(lastMessage.messageType)) {
            return { 
                lastMessage: lastMessage.displayName.substr(0, 25) || lastMessage.displayName,
                timeOfLastMessage: lastMessage.timeSent,
            };
        }
        return {
            lastMessage: lastMessage.content,
            timeOfLastMessage: lastMessage.timeSent,
        };
    }

    /**
     * Set user status
     *
     * @param status
     */
    setUserStatus(status): void
    {
        const state = this.ngRedux.getState();
        this.chatConnection = state['connection'];
        const { updateUserStatus } = this.chatHelperService.socketConnections(this);
        return updateUserStatus(status);
    }

    /**
     * Change left sidenav view
     *
     * @param view
     */
    changeLeftSidenavView(view): void
    {
        this._chatService.onLeftSidenavViewChanged.next(view);
    }
}

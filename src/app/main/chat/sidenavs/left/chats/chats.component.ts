import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { ObservableMedia } from '@angular/flex-layout';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { fuseAnimations } from '@fuse/animations';
import { FuseMatSidenavHelperService } from '@fuse/directives/fuse-mat-sidenav/fuse-mat-sidenav.service';

import { ChatService } from 'app/main/chat/chat.service';
import { ChatPanelService } from 'app/layout/components/chat-panel/chat-panel.service';

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
    allContacts: any[];
    searchText: string;
    user: any;
    page = 1;
    pageLimit = 20;
    token = null;
    messagesList = [];

    // Private
    private _unsubscribeAll: Subject<any>;

    /**
     * Constructor
     *
     * @param {ChatService} _chatService
     * @param {FuseMatSidenavHelperService} _fuseMatSidenavHelperService
     * @param {ObservableMedia} _observableMedia
     */
    constructor(
        private _chatService: ChatService,
        private chatPanelService: ChatPanelService,
        private _fuseMatSidenavHelperService: FuseMatSidenavHelperService,
        public _observableMedia: ObservableMedia
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
        const userEmail = localStorage.getItem('currentUser');
        this.token =  localStorage.getItem('chatToken');
        this.user = {
            avatar: 'https://avatars3.githubusercontent.com/u/24609423?s=460&v=4',
            name: 'Tosmak',
            email: userEmail,
            status: 'online',
            chatList: [],
        };
        this.chats = [];
        this.fetchContacts(this.token);
        // this._chatService.onChatsUpdated
        //     .pipe(takeUntil(this._unsubscribeAll))
        //     .subscribe(updatedChats => {
        //         this.chats = updatedChats;
        //     });

        // this._chatService.onUserUpdated
        //     .pipe(takeUntil(this._unsubscribeAll))
        //     .subscribe(updatedUser => {
        //         this.user = updatedUser;
        //     });
    }

    /**
     * Fetch all contacts
     *
     */
    fetchContacts = (token) => {
        return this.chatPanelService.fetchContacts(token)
            .subscribe((contacts) => {
                contacts.data.map(contact => {
                    contact.name = contact.username;
                    contact.avatar = 'https://avatars3.githubusercontent.com/u/24609423?s=460&v=4';
                    return contact;
                });
                this.allContacts = contacts.data;
                console.log(this.allContacts);
            });                
    }

     /**
     * Fetch private messages history
     *
     */

    fetchChatHistory = (token, recipientUserName) => {
        return this.chatPanelService.fetchChatHistory(token, recipientUserName, this.page, this.pageLimit)
            .subscribe(response => {
                const {message} = response;
                message.map(msg => {
                    msg['chatTime'] = this.chatPanelService.formatChatTime(msg.timeSent);
                });
                this.messagesList = message.reverse();
                console.log(this.messagesList);
                // if (this.messagesList.length === 0 ) {
                //     this.setPlaceHolderVisibility('Start a conversation by typing below', true);
                // } else {
                //     this.setPlaceHolderVisibility('', false);
                // }
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
    getChat = (username): void => 
    {
        this.fetchChatHistory(this.token, username);
    }

    /**
     * Set user status
     *
     * @param status
     */
    setUserStatus(status): void
    {
        this._chatService.setUserStatus(status);
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

    /**
     * Logout
     */
    logout(): void
    {
        console.log('logout triggered');
    }
}

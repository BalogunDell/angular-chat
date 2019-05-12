import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { ObservableMedia } from '@angular/flex-layout';
import { Subject, Observable } from 'rxjs';

import { fuseAnimations } from '@fuse/animations';
import { FuseMatSidenavHelperService } from '@fuse/directives/fuse-mat-sidenav/fuse-mat-sidenav.service';

import { ChatService } from 'app/main/chat/chat.service';
import { ChatPanelService } from 'app/layout/components/chat-panel/chat-panel.service';

import { NgRedux, select } from '@angular-redux/store';
import { setSelectedUser } from 'app/redux/actions';
import { AppStateI } from 'app/interfaces';

import { AllEnums } from 'app/enums';
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
    searchText = '';
    user: any;
    page = 1;
    pageLimit = 20;
    token = null;
    messagesList = [];

    @select(['contacts'])
    contactsFromStore$: Observable<any[]>;

    @select(['user'])
    selectedUser$: Observable<any[]>;
    // isGroupSelected$: Observable<Boolean>;

    // Private
    private _unsubscribeAll: Subject<any>;

    /**
     * Constructor
     *
     */
    constructor(
        private _chatService: ChatService,
        private chatPanelService: ChatPanelService,
        private _fuseMatSidenavHelperService: FuseMatSidenavHelperService,
        public _observableMedia: ObservableMedia,
        private ngRedux: NgRedux<AppStateI>,
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
        this.contactsFromStore$.subscribe(data => {
           this.allContacts = data;
        });
       

        // this.fetchContacts(this.token);
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

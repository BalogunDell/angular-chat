import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Subject, Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';

import { ChatService } from 'app/main/chat/chat.service';
import { select, NgRedux } from '@angular-redux/store';
import { ChatHelperService } from 'app/layout/components/chat-panel/chat-panel-helper';
import { AppStateI } from 'app/interfaces';
import { ChatPanelService } from 'app/layout/components/chat-panel/chat-panel.service';

@Component({
    selector     : 'chat-user-sidenav',
    templateUrl  : './user.component.html',
    styleUrls    : ['./user.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class ChatUserSidenavComponent implements OnInit, OnDestroy
{
    user: any;
    userForm: FormGroup;
    token = null;
    userId = null;
    chatConnection = null;

    @select('currentUser') currentUser$: Observable<any[]>;
    @select('userCredentials') userCredentials$: Observable<any[]>;

    // Private
    private _unsubscribeAll: Subject<any>;

    /**
     * Constructor
     *
     * @param {ChatService} _chatService
     */
    constructor(
        private _chatService: ChatService,
        private chatHelperService: ChatHelperService,
        private chatPanelService: ChatPanelService,
        public ngRedux: NgRedux<AppStateI>
    )
    {
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
        
        this.currentUser$.subscribe(user => {
        this.user = user;
        });

        this.userCredentials$.subscribe(userCredentials => {
            this.token = userCredentials['token'];
            this.user.id = userCredentials['userId'];
            });

        this.userForm = new FormGroup({
            mood  : new FormControl(this.user.mood),
            status: new FormControl(this.user.status)
        });

        this.userForm.valueChanges
            .pipe(
                takeUntil(this._unsubscribeAll),
                debounceTime(500),
                distinctUntilChanged()
            )
            .subscribe(data => {
                
               if (data.status !== this.user.status) {
                this.user.status = data.status;
                const { updateUserStatus } = this.chatHelperService.socketConnections(this.token, this);
              return  updateUserStatus(data.status);
               }

               if (data.mood !== this.user.mood) {
                this.user.mood = data.mood;
                const { updateUserMood } = this.chatHelperService.socketConnections(this.token, this);
                updateUserMood(data.mood);
                
               }
            });

            const state = this.ngRedux.getState();
            const connection = state['connection'];
            
                this.chatConnection = connection;
                connection.on('UpdateStatus', (username, status) => {
                const { onStatusUpdateCompleted } = this.chatHelperService.socketConnections(this.token, this);
                onStatusUpdateCompleted(username, status);
    
            });
    
            connection.on('UpdateMood', (username, mood) => {
                const { onMoodUpdateCompleted } = this.chatHelperService.socketConnections(this.token, this);
                onMoodUpdateCompleted(username, mood);
    
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
     * Change left sidenav view
     *
     * @param view
     */
    changeLeftSidenavView(view): void
    {
        this._chatService.onLeftSidenavViewChanged.next(view);
    }

}

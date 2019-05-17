import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { fuseAnimations } from '@fuse/animations';

import { ChatPanelService } from 'app/layout/components/chat-panel/chat-panel.service';
import { NgRedux, select } from '@angular-redux/store';
import { AppStateI } from 'app/interfaces';

@Component({
    selector     : 'chat',
    templateUrl  : './chat.component.html',
    styleUrls    : ['./chat.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations   : fuseAnimations
})
export class ChatComponent implements OnInit, OnDestroy
{
    @select(['selectedUser'])
    selectedUser$: Observable<object>;
    selectedUser;

    @select(['contacts'])
    allContacts$: Observable<object>;
    allContacts;

    // Private
    private _unsubscribeAll: Subject<any>;

    /**
     * Constructor
     *
     * @param {ChatService} _chatService
     */
    constructor(
        private chatPanelService: ChatPanelService,
        private ngRedux: NgRedux<AppStateI>,
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
        this.selectedUser$.subscribe(user => {
          this.selectedUser = user;
       });
        this.allContacts$.subscribe(allContacts => {
          this.allContacts = allContacts;
       });
       
    }

             /**
     * Send file in chat
     *
     */
    attachFile = (): void => {
        const inputElement = document.getElementById('chatFile');
        inputElement.click();
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
}

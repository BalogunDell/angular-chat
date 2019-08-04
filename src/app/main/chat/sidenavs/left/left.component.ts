import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { fuseAnimations } from '@fuse/animations';

import { ChatHelperService } from 'app/layout/components/chat-panel/chat-panel-helper';

@Component({
    selector     : 'chat-left-sidenav',
    templateUrl  : './left.component.html',
    styleUrls    : ['./left.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations   : fuseAnimations
})
export class ChatLeftSidenavComponent implements OnInit, OnDestroy
{
    view;

    // Private
    private _unsubscribeAll: Subject<any>;

    /**
     * Constructor
     *
     */
    constructor(
        private chatHelperService: ChatHelperService
    )
    {
        // Set the defaults
        this.view = 'chats';

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
        this.chatHelperService.onLeftSidenavViewChanged
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(view => {
                this.view = view;
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
}

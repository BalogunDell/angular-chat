import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { fuseAnimations } from '@fuse/animations';

import { ChatHelperService } from 'app/layout/components/chat-panel/chat-panel-helper';

@Component({
    selector     : 'chat-right-sidenav',
    templateUrl  : './right.component.html',
    styleUrls    : ['./right.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations   : fuseAnimations
})
export class ChatRightSidenavComponent implements OnInit, OnDestroy
{
    view;

    // Private
    private _unsubscribeAll: Subject<any>;

    constructor(
        private chatHelperService: ChatHelperService
    )
    {
        // Set the defaults
        this.view = 'contact';

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
        this.chatHelperService.onRightSidenavViewChanged
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

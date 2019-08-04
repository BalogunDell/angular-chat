import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { Subject, Observable } from 'rxjs';

import { select } from '@angular-redux/store';

@Component({
    selector     : 'chat-contact-sidenav',
    templateUrl  : './contact.component.html',
    styleUrls    : ['./contact.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class ChatContactSidenavComponent implements OnInit, OnDestroy
{
    contact: any;

    // Private
    private _unsubscribeAll: Subject<any>;

    @select('selectedUser') selectSelectedUser$: Observable<any>;
    /**
     * Constructor
     *
     */
    constructor(
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
        this.selectSelectedUser$.subscribe(contact => {
            this.contact = contact;
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

import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { FuseConfigService } from '@fuse/services/config.service';
import { FuseSplashScreenService } from '@fuse/services/splash-screen.service';
import { ChatPanelService } from './layout/components/chat-panel/chat-panel.service';


@Component({
    selector   : 'app',
    templateUrl: './app.component.html',
    styleUrls  : ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy
{
    fuseConfig: any;
    loggedInUser = null;
    userToken = '';
    allContacts = [];

    // Private
    private _unsubscribeAll: Subject<any>;

    constructor(@Inject(DOCUMENT) private document: any,
        private _fuseConfigService: FuseConfigService,
        private _fuseSplashScreenService: FuseSplashScreenService,
        private chatPanelService: ChatPanelService ) {
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

        this.loggedInUser = localStorage.getItem('currentUser');
        this.userToken = localStorage.getItem('chatToken');
        // Subscribe to config changes
        this._fuseConfigService.config
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((config) => {

                this.fuseConfig = config;

                // Boxed
                if (this.fuseConfig.layout.width === 'boxed') {
                    this.document.body.classList.add('boxed');
                }
                else {
                    this.document.body.classList.remove('boxed');
                }

                // Color theme - Use normal for loop for IE11 compatibility
                for (let i = 0; i < this.document.body.classList.length; i++) {
                    const className = this.document.body.classList[i];

                    if (className.startsWith('theme-')) {
                        this.document.body.classList.remove(className);
                    }
                }

                this.document.body.classList.add(this.fuseConfig.colorTheme);
            });
    }

    /**
     * On destroy
     */
    ngOnDestroy(): void
    {
        
    }
}

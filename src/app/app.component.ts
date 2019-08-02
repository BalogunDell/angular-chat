import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { FuseConfigService } from '@fuse/services/config.service';
import { FuseSplashScreenService } from '@fuse/services/splash-screen.service';
import { ChatPanelService } from './layout/components/chat-panel/chat-panel.service';
import { AppStateI } from './interfaces';
import { NgRedux } from '@angular-redux/store';
import { setUserEmail } from './redux/actions';
import { Router } from '@angular/router';


@Component({
    selector   : 'app',
    templateUrl: './app.component.html',
    styleUrls  : ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy
{
    fuseConfig: any;

    // Private
    private _unsubscribeAll: Subject<any>;

    constructor(@Inject(DOCUMENT) private document: any,
        private _fuseConfigService: FuseConfigService,
        private _fuseSplashScreenService: FuseSplashScreenService,
        private chatPanelService: ChatPanelService,
        private router: Router,
        public ngRedux: NgRedux<AppStateI>, ) {
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

            if (localStorage.getItem('id_token')) {
                // get the details of the user and save the email to state so it can be used for
                // start chat
                this.ngRedux.dispatch(setUserEmail('sample@gmail.com'));
            } else {
                this.router.navigate(['account/login']);
            }
        
    }

    /**
     * On destroy
     */
    ngOnDestroy(): void
    {
        
    }
}

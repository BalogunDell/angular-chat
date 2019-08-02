import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { LocationStrategy, HashLocationStrategy } from '@angular/common';
import { AppRoutingModule } from './app.routing';
import { MatMomentDateModule } from '@angular/material-moment-adapter';
import { MatButtonModule, MatIconModule, MatSelectModule, MatTooltipModule } from '@angular/material';
import { TranslateModule } from '@ngx-translate/core';
import 'hammerjs';

import { FuseModule } from '@fuse/fuse.module';
import { FuseSharedModule } from '@fuse/shared.module';
import { FuseProgressBarModule, FuseSidebarModule, FuseThemeOptionsModule } from '@fuse/components';

import { fuseConfig } from 'app/fuse-config';

import { AppComponent } from 'app/app.component';
import { LayoutModule } from 'app/layout/layout.module';
import { SampleModule } from 'app/main/sample/sample.module';
import { SampleModuleOne } from 'app/main/sample-1/sample.module';
import { SharedModule } from './shared/shared.module';
import { JwtModule, JwtHelperService } from '@auth0/angular-jwt';
import { FullLayoutComponent } from './layouts/full-layout.component';
import { SimpleLayoutComponent } from './layouts/simple-layout.component';
import { AuthGuard } from './shared/utils/auth.guard';
import { AuthenticationService } from './shared/services/authentication.service';
import { ConfigService } from './shared/utils/config.service';
import { MenuPageComponent } from './main/menu-page/menu-page.component';
import { ChatModule } from './main/chat/chat.module';
import { ChatFileViewerComponent } from './layout/components/chat-panel/chat-units/chat-file-viewer/chat-file-viewer.component';
import { ChatModalComponent } from './layout/components/chat-panel/chat-units/chat-modal/chat-modal.component';

// Redux
import { NgRedux, NgReduxModule, DevToolsExtension } from '@angular-redux/store';
import { rootReducer } from './redux/reducers';
import { AppStateI } from './interfaces'; 
import { applyMiddleware, createStore, Store } from 'redux';
import { createLogger } from 'redux-logger';
import { ChatDropdownMenuComponent } from './layout/components/chat-panel/chat-units/chat-dropdown-menu/chat-dropdown-menu.component';
import { MessageActionsDropdownComponent } from './layout/components/chat-panel/chat-units/message-actions-dropdown/message-actions-dropdown.component';
import { initialState } from './store';
import { RequestInterceptor } from './interceptors';
// const appRoutes: Routes = [
//     {
//         path      : '**',
//         redirectTo: 'sample'
//     }
// ];

@NgModule({
    declarations: [
        AppComponent,
        FullLayoutComponent,
        SimpleLayoutComponent,
        MenuPageComponent,
        ChatFileViewerComponent,
        ChatModalComponent,
       
    ],
    entryComponents: [
        ChatFileViewerComponent,
        ChatModalComponent,
        ChatDropdownMenuComponent,
        MessageActionsDropdownComponent,
    ],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        FormsModule,
        AppRoutingModule,
        HttpModule,
        HttpClientModule,
        MatSelectModule,
        NgReduxModule,

        TranslateModule.forRoot(),

        // Material moment date module
        MatMomentDateModule,

        // Material
        MatButtonModule,
        MatIconModule,


        // Fuse modules
        FuseModule.forRoot(fuseConfig),
        FuseProgressBarModule,
        FuseSharedModule,
        FuseSidebarModule,
        FuseThemeOptionsModule,

        // App modules
        LayoutModule,
        SampleModule,
        SampleModuleOne,
        ChatModule,
        SharedModule,
        JwtModule.forRoot({
            config: {
                tokenGetter: jwtTokenGetter,
                whitelistedDomains: ['localhost:5000'],
            }
        })
    ],
    providers: [
        { provide: LocationStrategy, useClass: HashLocationStrategy },
        { provide: HTTP_INTERCEPTORS, useClass: RequestInterceptor, multi: true },
        JwtHelperService,
        ConfigService,
        AuthenticationService,
        AuthGuard
    ],
    bootstrap: [
        AppComponent
    ]
})

export class AppModule
{
    constructor(store: NgRedux<AppStateI>, devTool: DevToolsExtension) {
        // const store: Store = createStore(rootReducer, applyMiddleware(devTool.isEnabled() ? devTool.enhancer() : f => f)));
        // ngRedux.provideStore(store);
        store.configureStore(rootReducer, initialState, [], devTool.isEnabled ? [devTool.enhancer()] : []);
    }
}
// this.ngRedux.configureStore(rootReducer, {}, [], [ devTool.isEnabled() ? devTool.enhancer() : f => f]);  }

// export const store: Store = createStore(rootReducer, applyMiddleware(devTool.isEnabled() ? devTool.enhancer() : f => f])));

export function jwtTokenGetter() {
    return localStorage.getItem('id_token');
}

import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Components
import { LoginComponent } from './login.component';

// Configs Routing
import { AccountRoutingModule } from './account-routing.module';
// import { LaddaModule } from 'angular-ladda';

// Services
import { ReactiveFormsModule } from '@angular/forms';

import { MatButtonModule, MatCheckboxModule, MatIconModule, MatFormFieldModule, MatInputModule } from '@angular/material';


import { FuseSharedModule } from '@fuse/shared.module';

@NgModule({
    imports: [
        CommonModule,
        AccountRoutingModule,
        ReactiveFormsModule,
        FormsModule,
        MatButtonModule,
        MatCheckboxModule,
        MatFormFieldModule,
        MatInputModule,
        MatIconModule,

        FuseSharedModule
    ],
    declarations: [
        LoginComponent
    ]
})
export class AccountModule { }

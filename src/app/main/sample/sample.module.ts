import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

import { FuseSharedModule } from '@fuse/shared.module';

import { SampleComponent } from './sample.component';
import { MatButtonModule, MatFormFieldModule, MatInputModule, MatIconModule, MatDatepickerModule, MatDialogModule, MatTableModule, MatPaginatorModule } from '@angular/material';
import { BaseWindowbuttons } from './buttons.component';
import { MenuPageComponent } from '../menu-page/menu-page.component';

const routes = [
    {
        path     : 'sample',
        component: MenuPageComponent
    },

    {
        path     : 'sample/:id',
        component: SampleComponent
    }
];

@NgModule({
    declarations: [
        SampleComponent,
        BaseWindowbuttons,
    ],
    imports     : [
        RouterModule.forChild(routes),

        TranslateModule,

        FuseSharedModule,
        MatButtonModule, 
        MatFormFieldModule, 
        MatInputModule,
        MatDatepickerModule,
        MatDialogModule,
        MatTableModule,
        MatPaginatorModule,
        MatIconModule
    ],
    exports     : [
        SampleComponent
    ]
})

export class SampleModule
{
}

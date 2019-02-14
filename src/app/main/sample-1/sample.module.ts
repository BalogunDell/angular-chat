import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

import { FuseSharedModule } from '@fuse/shared.module';
import { SampleComponentOne } from './sample.component';
import { MatButtonModule, MatFormFieldModule, MatInputModule, MatIconModule, MatDatepickerModule, MatDialogModule, MatTableModule, MatPaginatorModule } from '@angular/material';
import { MenuPageComponent } from '../menu-page/menu-page.component';

const routes = [
    {
        path     : 'sample-1',
        component: MenuPageComponent
    },
    {
        path     : 'sample-1/:id',
        component: SampleComponentOne
    }
];


@NgModule({
    declarations: [
        SampleComponentOne,
    ],
    imports     : [
        RouterModule.forChild(routes),
        TranslateModule,
        FuseSharedModule,
        MatIconModule
    ],
    exports     : [
        SampleComponentOne
    ]
})

export class SampleModuleOne
{
}

import {Routes, RouterModule, PreloadAllModules} from '@angular/router';
import {ModuleWithProviders, NgModule} from '@angular/core';
import { SimpleLayoutComponent } from './layouts/simple-layout.component';
import { FullLayoutComponent } from './layouts/full-layout.component';
import { AuthGuard } from './shared/utils/auth.guard';
import { SampleComponent } from './main/sample/sample.component';
import { SampleComponentOne } from './main/sample-1/sample.component';
import { MenuPageComponent } from './main/menu-page/menu-page.component';
import { ChatComponent } from './main/chat/chat.component';

export const routes: Routes = [
    {
        path: '',
        redirectTo: '/sample-1',
        pathMatch: 'full',
    }
    
    , {
        path: '',
        component: SimpleLayoutComponent,
        data: { title: 'Account' },
        children: [
            {
                path: '',
                loadChildren: './account/account.module#AccountModule'
            }
        ]
    },   
    {
        path: '',
        component: FullLayoutComponent,
        canActivate: [AuthGuard],
        data: { title: 'Home' },
        children: [
            { path: 'home', component: MenuPageComponent },
            { path: 'chat', component: ChatComponent },
            {path: 'sample-1', component: SampleComponentOne},
            {path: 'sample-1/:id', component: SampleComponentOne},     
            {path: 'sample', component: SampleComponent}, 
            {path: 'sample/:id', component: SampleComponent},   
              
        ]
    },
];

// export const AppRoutes: ModuleWithProviders = RouterModule.forRoot(routes);

@NgModule({
    imports: [RouterModule.forRoot(routes,
        { 
            preloadingStrategy: PreloadAllModules 
          })],
    exports: [RouterModule]
})
export class AppRoutingModule { }

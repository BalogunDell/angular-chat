import { Component, Inject, OnInit } from '@angular/core';


@Component({
    selector: 'app-simple',
    template: `<router-outlet></router-outlet>`,
    styleUrls: ['./simple-layout.component.scss']
})
export class SimpleLayoutComponent implements OnInit {
    
    constructor(
        ) {
    }

    ngOnInit(): void {
       
    }
}

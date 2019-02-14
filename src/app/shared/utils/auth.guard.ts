import { Injectable,Inject } from '@angular/core';
import { Router, CanActivate } from '@angular/router';
import { AuthenticationService } from '../services/authentication.service';
import { JwtHelperService } from '@auth0/angular-jwt';

@Injectable()
export class AuthGuard implements CanActivate {

    constructor(
        private router: Router,
        private authenticationService: AuthenticationService,
        private jwtHelperService: JwtHelperService        
    )
    { }

    canActivate(route) {        
        if (this.authenticationService.loggedIn()) {
            if (route.data.Module != undefined && route.data.Permission != undefined) {
                if (!this.authenticationService.loggedIn()) {
                    // not authorized redirect to unauthorize page                    
                    this.router.navigate(['unauthorize']);
                    return false;
                }
            }
            return true;
        }
        else {
            this.authenticationService.logout();
            this.router.navigateByUrl('account/login');
            return false;
        }        
    }
}
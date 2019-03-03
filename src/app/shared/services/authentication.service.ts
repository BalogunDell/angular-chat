import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { ConfigService } from '../utils/config.service';
import { JwtHelperService } from '@auth0/angular-jwt';
import { Http, Headers, RequestOptions, Response, HttpModule } from '@angular/http';

@Injectable()
export class AuthenticationService {
    _baseUrl = '';
    authHeader: any;

    constructor(private http: Http, private jwtHelperService: JwtHelperService, private configService: ConfigService) {
        // set token if saved in local storage
        this._baseUrl = configService.getApiURI();
        this.authHeader = configService.getAuthHeaders();
    }

    private options() {

        const headers = new Headers({
          'Content-Type': 'application/json; charset=utf-8;'
          , 'Accept': '*/*'
        });
        const options = new RequestOptions({ headers: headers });
        return options;
      }


    login(user): Observable<boolean> {
        return this.http.post(this._baseUrl + 'Users/Authenticate', { UserID: user.email, Password: user.password })
        .pipe(map(response => {
            let user = response.json();
            if (user && user.token) {
                localStorage.setItem('id_token', user['token']);
            }
            return user;
        }));      
    }

  
    logout(): void {
        localStorage.removeItem('id_token');    
    }

    loggedIn() {
        // const token: string = this.jwtHelperService.tokenGetter();
        // if (!token) { return false; }
        // const tokenExpired: boolean = this.jwtHelperService.isTokenExpired(token);
        // return !tokenExpired;
        return true;
    }

    getMenu2(): Observable<any>{ 
        //   alert("here");
        // let authToken = localStorage.getItem('access_token');
        // if (!localStorage.getItem('access_token'))
        // {  
             
            // if(  this.loginparm("shijiles","1"))
            // { 
            return this.http.get(  "http://epromis.selfip.net:446/epromisapi/api/UserData/Menu",  this.options())
            .pipe(map((response: Response) => <any[]>response.json()));
            // }
         } 
     
}
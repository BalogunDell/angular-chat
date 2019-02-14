import { Injectable } from '@angular/core';
import { Http, Headers, Response } from '@angular/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable()
export class ConfigService {

    _apiURI: string;

    constructor(private http: Http) {
        var host = window.location.host;
        if (environment.production) {
            if (host.indexOf('localhost') > -1) {
                this._apiURI = 'http://localhost:49339/';
            }
            else {
                this._apiURI = 'http://' + host + '/api/api/';
            }
        } else {
            this._apiURI = 'http://localhost:49339/';
        }
     }

    getApiURI() {
        return this._apiURI;
    }

    getApiHost() {
        return this._apiURI.replace('api/', '');
    }

    getAuthHeaders() {
        let headers = new Headers();
        let authToken = localStorage.getItem('id_token');
        if (authToken)
            headers.append('Authorization', `Bearer ${authToken}`);
        return headers;
    } 

    handleError(error: any) {
        if (error.status == 401) {
            window.location.href =  '/#/account/login';
        }
        else if (error.status == 400){
            if (error.error && error.error.value){               
                return Observable.throw(error.error.value)   
            }
        }
        else {
            var applicationError = error.headers.get('Application-Error');
            var modelStateErrors: string = '';  
           
    
            modelStateErrors = modelStateErrors = '' ? null : modelStateErrors;
            return Observable.throw(applicationError || modelStateErrors || 'Server error');
        }       
    }   
}

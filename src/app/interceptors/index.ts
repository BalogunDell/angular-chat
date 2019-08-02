import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()

export class RequestInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
      const request = req.clone({
        setHeaders: {
          'Content-Type':  'application/json',
                'Authorization': `Bearer ${localStorage.getItem('chatToken')}`,
        }
      });
      return next.handle(request);

  }
}

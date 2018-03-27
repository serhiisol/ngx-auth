import { Injectable, Injector } from '@angular/core';
import {
  HttpClient,
  HttpEvent,
  HttpInterceptor,
  HttpHandler,
  HttpRequest,
  HttpErrorResponse
} from '@angular/common/http';

import { Observable, Subject, throwError } from 'rxjs';
import { map, switchMap, first, catchError } from 'rxjs/operators';

import { AuthService } from './auth.service';
import { AUTH_SERVICE } from './tokens';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  /**
   * Is refresh token is being executed
   *
   * @private
   *
   * @type {boolean}
   */
  private refreshInProgress = false;

  /**
   * Notify all outstanding requests through this subject
   *
   * @private
   *
   * @type {Subject<boolean>}
   */
  private refreshSubject: Subject<boolean> = new Subject<boolean>();

  constructor(private injector: Injector) {}

  /**
   * Intercept an outgoing `HttpRequest`
   *
   * @param {HttpRequest<*>} req
   * @param {HttpHandler} delegate
   *
   * @returns {Observable<HttpEvent<*>>}
   */
  public intercept(
    req: HttpRequest<any>,
    delegate: HttpHandler
  ): Observable<HttpEvent<any>> {
    const authService: AuthService =
      this.injector.get<AuthService>(AUTH_SERVICE);

    if (authService.verifyTokenRequest(req.url)) {
      return delegate.handle(req);
    }

    return this.processIntercept(req, delegate);
  }

  /**
   * Process all the requests via custom interceptors.
   *
   * @private
   *
   * @param {HttpRequest<*>} original
   * @param {HttpHandler} delegate
   *
   * @returns {Observable<HttpEvent<*>>}
   */
  private processIntercept(
    original: HttpRequest<any>,
    delegate: HttpHandler
  ): Observable<HttpEvent<any>> {
    const clone: HttpRequest<any> = original.clone();

    return this.request(clone).pipe(
      switchMap(
        (req: HttpRequest<any>) =>
          delegate.handle(req) as Observable<HttpEvent<any>>
      ),
      catchError((res: HttpErrorResponse) => this.responseError(clone, res))
    );
  }

  /**
   * Request interceptor. Delays request if refresh is in progress
   * otherwise adds token to the headers
   *
   * @private
   *
   * @param {HttpRequest<*>} req
   *
   * @returns {Observable}
   */
  private request(req: HttpRequest<any>): Observable<HttpRequest<any>|HttpEvent<any>> {
    if (this.refreshInProgress) {
      return this.delayRequest(req);
    }

    return this.addToken(req);
  }

  /**
   * Failed request interceptor, check if it has to be processed with refresh
   *
   * @private
   *
   * @param {HttpRequest<*>} req
   * @param {HttpErrorResponse} res
   *
   * @returns {Observable<HttpRequest<*>>}
   */
  private responseError(
    req: HttpRequest<any>,
    res: HttpErrorResponse
  ): Observable<HttpEvent<any>> {
    const authService: AuthService =
      this.injector.get<AuthService>(AUTH_SERVICE);
    const refreshShouldHappen: boolean =
      authService.refreshShouldHappen(res);

    if (refreshShouldHappen && !this.refreshInProgress) {
      this.refreshInProgress = true;

      authService
        .refreshToken()
        .subscribe(
          () => {
            this.refreshInProgress = false;
            this.refreshSubject.next(true);
          },
          () => {
            this.refreshInProgress = false;
            this.refreshSubject.next(false)
          }
        );
    }

    if (refreshShouldHappen && this.refreshInProgress) {
      return this.delayRequest(req, res);
    }

    return throwError(res);
  }

  /**
   * Add access token to headers or the request
   *
   * @private
   *
   * @param {HttpRequest<*>} req
   *
   * @returns {Observable<HttpRequest<*>>}
   */
  private addToken(req: HttpRequest<any>): Observable<HttpRequest<any>> {
    const authService: AuthService =
      this.injector.get<AuthService>(AUTH_SERVICE);

    return authService.getAccessToken().pipe(
      map((token: string) => {
        if (token) {
          let headers: { [name: string]: string | string[] };
          if (typeof authService.getHeaders === 'function') {
            headers = authService.getHeaders(token);
          } else {
            headers = { Authorization: `Bearer ${token}` };
          }

          return req.clone({
            setHeaders: headers
          });
        }

        return req;
      }),
      first(),
    );
  }

  /**
   * Delay request, by subscribing on refresh event, once it finished, process it
   * otherwise throw error
   *
   * @private
   *
   * @param {HttpRequest<*>} req
   * @param {HttpErrorResponse} [res]
   *
   * @returns {Observable<HttpRequest<*>>}
   */
  private delayRequest(
    req: HttpRequest<any>,
    res?: HttpErrorResponse
  ): Observable<HttpEvent<any>> {
    const http: HttpClient =
      this.injector.get<HttpClient>(HttpClient);

    return this.refreshSubject.pipe(
      first(),
      switchMap((status: boolean) => {
        if (status) {
          return http.request(req);
        }

        return throwError(res || req);
      })
    );
  }
}

import { Injectable, Injector } from '@angular/core';
import {
  HttpClient,
  HttpEvent,
  HttpInterceptor,
  HttpHandler,
  HttpRequest,
  HttpErrorResponse
} from '@angular/common/http';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';

import {
  map,
  first,
  switchMap,
  _throw,
  _catch
} from './rxjs.util';

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
   * @param {HttpHandler} next
   *
   * @returns {Observable<HttpEvent<*>>}
   */
  public intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    console.log('intercept', req.url);
    const authService: AuthService =
      this.injector.get<AuthService>(AUTH_SERVICE);

    if (authService.verifyTokenRequest(req.url)) {
      return next.handle(req);
    }

    return this.processIntercept(req, next);
  }

  /**
   * Process all the requests via custom interceptors.
   *
   * @private
   *
   * @param {HttpRequest<*>} original
   * @param {HttpHandler} next
   *
   * @returns {Observable<HttpEvent<*>>}
   */
  private processIntercept(
    original: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    console.log('processIntercept', original.url);
    const clone: HttpRequest<any> = original.clone();

    return _catch(
      switchMap(
        this.request(clone),
        (req: HttpRequest<any>) => next.handle(req)
      ),
      (res: HttpErrorResponse) => this.responseError(clone, res)
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
  private request(req: HttpRequest<any>): Observable<HttpRequest<any>> {
    console.log('request', req.url);
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
    console.log('responseError', req.url);
    const http: HttpClient =
      this.injector.get<HttpClient>(HttpClient);
    const authService: AuthService =
      this.injector.get<AuthService>(AUTH_SERVICE);

    const refreshShouldHappen: boolean =
      authService.refreshShouldHappen(res);

    const delayed$ = switchMap(
      this.delayRequest(req, res),
      (_req: HttpRequest<any>) => {
        return http.request(_req);
      }
    );
    console.log('refreshShouldHappen', refreshShouldHappen && !this.refreshInProgress);
    if (refreshShouldHappen && !this.refreshInProgress) {
      this.refreshInProgress = true;

      authService
        .refreshToken()
        .subscribe(
          () => {
            console.log('successfully refreshed');
            this.refreshInProgress = false;
            this.refreshSubject.next(true);
          },
          () => {
            console.log('error refreshed');
            this.refreshInProgress = false;
            this.refreshSubject.next(false)
          }
        );
    }

    if (refreshShouldHappen && this.refreshInProgress) {
      return delayed$;
    }

    return _throw(res);
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
    console.log('addToken', req.url);
    const authService: AuthService =
      this.injector.get<AuthService>(AUTH_SERVICE);

    return map(
      authService.getAccessToken(),
      (token: string) => {
        if (token) {
          return req.clone({
            setHeaders: { Authorization: `Bearer ${token}` }
          });
        }

        return req;
      }
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
  ): Observable<HttpRequest<any>> {
    console.log('delayRequest', req.url);
    return switchMap(
      first(this.refreshSubject),
      (status: boolean) => {
        console.log('delayRequest exec', req.url);
        if (status) {
          return this.addToken(req)
        }

        return _throw(res || req)
      }
    );
  }
}

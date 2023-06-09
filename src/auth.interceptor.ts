import {
  HttpClient,
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Observable, Subject, throwError } from 'rxjs';
import { catchError, first, map, switchMap } from 'rxjs/operators';

import { AuthService } from './auth.service';
import { AUTH_SERVICE } from './tokens';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  /**
   * Is refresh token is being executed
   */
  private refreshInProgress = false;

  /**
   * Notify all outstanding requests through this subject
   */
  private refreshSubject: Subject<boolean> = new Subject<boolean>();

  constructor(
    @Inject(AUTH_SERVICE) private authService: AuthService,
    private http: HttpClient,
  ) { }

  /**
   * Intercept an outgoing `HttpRequest`
   */
  intercept(
    req: HttpRequest<any>,
    delegate: HttpHandler
  ): Observable<HttpEvent<any>> {
    if (this.skipRequest(req)) {
      return delegate.handle(req);
    }

    return this.processIntercept(req, delegate);
  }

  /**
   * Process all the requests via custom interceptors.
   */
  private processIntercept(
    original: HttpRequest<any>,
    delegate: HttpHandler
  ): Observable<HttpEvent<any>> {
    const clone: HttpRequest<any> = original.clone();

    return this.request(clone)
      .pipe(
        switchMap((req: HttpRequest<any>) => delegate.handle(req)),
        catchError((res: HttpErrorResponse) => this.responseError(clone, res))
      );
  }

  /**
   * Request interceptor. Delays request if refresh is in progress
   * otherwise adds token to the headers
   */
  private request(req: HttpRequest<any>): Observable<HttpRequest<any>> {
    if (this.refreshInProgress) {
      return this.delayRequest(req);
    }

    return this.addToken(req);
  }

  /**
   * Failed request interceptor, check if it has to be processed with refresh
   */
  private responseError(
    req: HttpRequest<any>,
    res: HttpErrorResponse
  ): Observable<HttpEvent<any>> {
    const refreshShouldHappen: boolean =
      this.authService.refreshShouldHappen(res, req);

    if (refreshShouldHappen && !this.refreshInProgress) {
      this.refreshInProgress = true;

      this.authService.refreshToken()
        .subscribe({
          next: () => {
            this.refreshInProgress = false;
            this.refreshSubject.next(true);
          },
          error: () => {
            this.refreshInProgress = false;
            this.refreshSubject.next(false);
          },
        });
    }

    if (refreshShouldHappen && this.refreshInProgress) {
      return this.retryRequest(req, res);
    }

    return throwError(() => res);
  }

  /**
   * Add access token to headers or the request
   */
  private addToken(req: HttpRequest<any>): Observable<HttpRequest<any>> {
    return this.authService.getAccessToken()
      .pipe(
        first(),
        map((token: string | null) => {
          if (token) {
            return req.clone({
              setHeaders: this.authService.getHeaders?.(token) ?? { Authorization: `Bearer ${token}` },
            });
          }

          return req;
        }),
      );
  }

  /**
   * Delay request, by subscribing on refresh event, once it finished, process it
   * otherwise throw error
   */
  private delayRequest(req: HttpRequest<any>): Observable<HttpRequest<any>> {
    return this.refreshSubject.pipe(
      first(),
      switchMap((status: boolean) =>
        status ? this.addToken(req) : throwError(() => req)
      )
    );
  }

  /**
   * Retry request, by subscribing on refresh event, once it finished, process it
   * otherwise throw error
   */
  private retryRequest(
    req: HttpRequest<any>,
    res: HttpErrorResponse
  ): Observable<HttpEvent<any>> {
    return this.refreshSubject.pipe(
      first(),
      switchMap((status: boolean) =>
        status ? this.http.request(req) : throwError(() => res || req)
      )
    );
  }

  /**
   * Checks if request must be skipped by interceptor.
   */
  private skipRequest(req: HttpRequest<any>,) {
    return this.authService.skipRequest?.(req) || this.authService.verifyRefreshToken?.(req);
  }
}

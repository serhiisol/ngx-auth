import { HttpClient, type HttpErrorResponse, type HttpHandlerFn, type HttpInterceptorFn, type HttpRequest } from '@angular/common/http';
import { inject, signal } from '@angular/core';
import { catchError, first, from, map, Subject, switchMap, throwError } from 'rxjs';

import { AUTH_SERVICE, type NgxAuthService } from './auth.service';

export const NgxRefreshInProgress = signal(false);
const delay$ = new Subject<boolean>();

export const ngxAuthInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
  const authService = inject(AUTH_SERVICE);
  const http = inject(HttpClient);

  if (authService.skipRequest(req)) {
    return next(req);
  }

  const request$ = NgxRefreshInProgress()
    ? delayRequest(authService, req)
    : addToken(authService, req);

  return request$.pipe(
    switchMap(req => next(req)),
    catchError(res => responseError(authService, http, req, res)),
  );
};

/**
 * Add access token to headers or the request
 */
function addToken(authService: NgxAuthService, req: HttpRequest<any>) {
  return from(authService.getAccessToken())
    .pipe(
      first(),
      map(token => {
        if (token) {
          return req.clone({
            setHeaders: authService.getHeaders?.(token) ?? { Authorization: `Bearer ${token}` },
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
function delayRequest(authService: NgxAuthService, req: HttpRequest<any>) {
  return delay$.pipe(
    first(),
    switchMap(canDelay => canDelay
      ? addToken(authService, req)
      : throwError(() => req),
    ),
  );
}

/**
 * Failed request interceptor, check if it has to be processed with refresh
 */
function responseError(
  authService: NgxAuthService,
  http: HttpClient,
  req: HttpRequest<any>,
  res: HttpErrorResponse,
) {
  const refreshShouldHappen = authService.refreshShouldHappen(res, req);

  if (refreshShouldHappen && !NgxRefreshInProgress()) {
    NgxRefreshInProgress.set(true);

    from(authService.refreshToken())
      .subscribe({
        error: () => {
          NgxRefreshInProgress.set(false);
          delay$.next(false);
        },
        next: () => {
          NgxRefreshInProgress.set(false);
          delay$.next(true);
        },
      });
  }

  if (refreshShouldHappen && NgxRefreshInProgress()) {
    return delay$.pipe(
      first(),
      switchMap(canRetry => canRetry
        ? http.request(req)
        : throwError(() => res || req),
      ),
    );
  }

  return throwError(() => res);
}

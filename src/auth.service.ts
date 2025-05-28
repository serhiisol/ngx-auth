import { type HttpErrorResponse, type HttpRequest } from '@angular/common/http';
import { InjectionToken } from '@angular/core';
import { type Observable } from 'rxjs';

/**
 * Essential service for authentication
 */
export abstract class NgxAuthService {
  /**
   * Get access token
   * Should return access token in Observable from e.g.
   * localStorage
   */
  abstract getAccessToken(): Promise<string | null> | Observable<string | null>;

  /**
   * Add token to headers, dependent on server
   * set-up, by default adds a bearer token.
   * Called by interceptor.
   * To change behavior, override this method.
   */
  abstract getHeaders?(token: string): Record<string, string | string[]>;

  /**
   * Check, if user already authorized.
   * Should return Observable with true or false values
   */
  abstract isAuthenticated(): Promise<boolean> | Observable<boolean>;

  /**
   * Function, checks response of failed request to determine,
   * whether token be refreshed or not.
   *
   * Essentially checks status
   */
  abstract refreshShouldHappen(response: HttpErrorResponse, request?: HttpRequest<any>): boolean;

  /**
   * Function, that should perform refresh token
   * Should be successfully completed so interceptor
   * can execute pending requests or retry original one
   */
  abstract refreshToken(): Promise<any> | Observable<any>;

  /**
   * Saves last interrupted url inside of the service for further reusage,
   * e.g. restoring interrupted page after logging in
   */
  abstract setInterruptedUrl?(url: string): void;

  /**
   * Checks if request must be skipped by interceptor.
   * Useful for requests such as request token which doesn't require token in headers
   */
  abstract skipRequest(request: HttpRequest<any>): boolean;
}

export const AUTH_SERVICE = new InjectionToken<NgxAuthService>('ngx-auth--service');

import { HttpErrorResponse, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';

/**
 * Essential service for authentication
 */
export abstract class AuthService {

  /**
   * Check, if user already authorized.
   * Should return Observable with true or false values
   */
  abstract isAuthorized(): Observable<boolean>;

  /**
   * Get access token
   * Should return access token in Observable from e.g.
   * localStorage
   */
  abstract getAccessToken(): Observable<string | null>;

  /**
   * Function, that should perform refresh token
   * Should be successfully completed so interceptor
   * can execute pending requests or retry original one
   */
  abstract refreshToken(): Observable<any>;

  /**
   * Function, checks response of failed request to determine,
   * whether token be refreshed or not.
   *
   * Essentially checks status
   */
  abstract refreshShouldHappen(response: HttpErrorResponse, request?: HttpRequest<any>): boolean;

  /**
   * Verify that outgoing request is refresh-token,
   * so interceptor won't intercept this request
   */
  abstract verifyRefreshToken?(request: HttpRequest<any>): boolean;

  /**
   * Checks if request must be skipped by interceptor.
   * Useful for requests such as request token which doesn't require token in headers
   */
  abstract skipRequest?(request: HttpRequest<any>): boolean;

  /**
   * Add token to headers, dependent on server
   * set-up, by default adds a bearer token.
   * Called by interceptor.
   * To change behavior, override this method.
   */
  abstract getHeaders?(token: string): { [name: string]: string | string[]; };

  /**
   * Saves last interrupted url inside of the service for further reusage,
   * e.g. restoring interrupted page after logging in
   */
  abstract setInterruptedUrl?(url: string): void;
}

import { HttpRequest, HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

/**
 * Essential service for authentication
 */
export abstract class AuthService {

  /**
   * Check, if user already authorized.
   * Should return Observable with true or false values
   */
  public abstract isAuthorized(): Observable<boolean>;

  /**
   * Get access token
   * Should return access token in Observable from e.g.
   * localStorage
   */
  public abstract getAccessToken(): Observable<string>;

  /**
   * Function, that should perform refresh token
   * Should be successfully completed so interceptor
   * can execute pending requests or retry original one
   */
  public abstract refreshToken(): Observable<any>;

  /**
   * Function, checks response of failed request to determine,
   * whether token be refreshed or not.
   *
   * Essentially checks status
   */
  public abstract refreshShouldHappen(response: HttpErrorResponse, request: HttpRequest<any>): boolean;

  /**
   * Verify that outgoing request is refresh-token,
   * so interceptor won't intercept this request
   */
  public abstract verifyRefreshToken?(request: HttpRequest<any>): boolean;

  /**
   * Checks if request must be skipped by interceptor.
   * Useful for requests such as request token which doesn't require token in headers
   */
  public abstract skipRequest?(request: HttpRequest<any>): boolean;

  /**
   * Add token to headers, dependent on server
   * set-up, by default adds a bearer token.
   * Called by interceptor.
   * To change behavior, override this method.
   */
  public abstract getHeaders?(token: string): { [name: string]: string | string[] };

  /**
   * Saves last interrupted url inside of the service for further reusage,
   * e.g. restoring interrupted page after logging in
   */
  public abstract setInterruptedUrl?(url: string): void;

  /**
   * Verify that outgoing request is refresh-token,
   * so interceptor won't intercept this request
   * @deprecated Due to illogical meaning/functionality this method is deprecated
   * @see verifyRefreshToken
   */
  public abstract verifyTokenRequest?(url: string): boolean;
}

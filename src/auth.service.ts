import { HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';

/**
 * Essential service for authentication
 * @export
 * @interface AuthService
 */
export abstract class AuthService {

  /**
   * Check, if user already authorized.
   *
   * Should return Observable with true or false values
   *
   * @public
   *
   * @returns {Observable<boolean>}
   */
  public abstract isAuthorized(): Observable<boolean>;

  /**
   * Get access token
   *
   * Should return access token in Observable from e.g.
   * localStorage
   *
   * @public
   *
   * @returns {Observable<string>}
   */
  public abstract getAccessToken(): Observable<string>;

  /**
   * Function, that should perform refresh token verifyTokenRequest
   *
   * Should be successfully completed so interceptor
   * can execute pending requests or retry original one
   *
   * @public
   *
   * @returns {Observable<*>}
   */
  public abstract refreshToken(): Observable<any>;

  /**
   * Function, checks response of failed request to determine,
   * whether token be refreshed or not.
   *
   * Essentially checks status
   *
   * @public
   *
   * @param {HttpErrorResponse} response
   *
   * @returns {Observable<boolean>}
   */
  public abstract refreshShouldHappen(response: HttpErrorResponse): boolean;

  /**
   * Verify that outgoing request is refresh-token,
   * so interceptor won't intercept this request
   *
   * @public
   *
   * @param {string} url
   *
   * @returns {Observable<boolean>}
   */
  public abstract verifyTokenRequest(url: string): boolean;


  /**
   * Add token to headers, dependent on server
   * set-up, by default adds a bearer token.
   * Called by interceptor.
   *
   * To change behavior, override this method.
   *
   * @public
   *
   * @param {string} token
   *
   * @returns {[name: string]: string | string[]}
   */
  public getHeaders(token: string) : { [name: string]: string | string[] } {
    return { Authorization: `Bearer ${token}` };
  }
}

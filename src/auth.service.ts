import { Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';

/**
 * Essential service for authentication
 * @export
 * @interface AuthService
 */
export interface AuthService {

  /**
   * Check, if user already authorized.
   * @description Should return Observable with true or false values
   * @returns {Observable<boolean>}
   * @memberOf AuthService
   */
  isAuthorized(): Observable<boolean>;

  /**
   * Get access token
   * @description Should return access token in Observable from e.g.
   * localStorage
   * @returns {Observable<string>}
   * @memberOf AuthService
   */
  getAccessToken(): Observable<string>;

  /**
   * Function, that should perform refresh token verifyTokenRequest
   * @description Should be successfully completed so interceptor
   * can execute pending requests or retry original one
   * @returns {Observable<any>}
   * @memberOf AuthService
   */
  refreshToken(): Observable<any>;

  /**
   * Function, checks response of failed request to determine,
   * whether token be refreshed or not.
   * @description Essentialy checks status
   * @param {Response} response
   * @returns {boolean}
   * @memberOf AuthService
   */
  refreshShouldHappen(response: Response): boolean;

  /**
   * Verify that outgoing request is refresh-token,
   * so interceptor won't intercept this request
   * @param {string} url
   * @returns {boolean}
   * @memberOf AuthService
   */
  verifyTokenRequest(url: string): boolean;

}

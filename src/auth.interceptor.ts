import { Injectable, Inject } from '@angular/core';
import { Request } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { of as ObservableOf } from 'rxjs/observable/of';
import { first } from 'rxjs/operator/first';
import { Subject } from 'rxjs/Subject';

import {
  Interceptor,
  Http,
  RequestInterceptorOptions,
  ResponseInterceptorOptions
} from '../http';

import { AuthService } from './auth.service';
import { AUTH_SERVICE } from './tokens';

@Injectable()
export class AuthInterceptor implements Interceptor {

  /**
   * Is refresh token is being executed, postpone incoming requests
   * @type {boolean}
   * @private
   */
  private refreshTokenInProgress = false;

  /**
   * Is refresh token is being executed, notify all incoming requests through this subject
   * @type {Subject<boolean>}
   * @private
   */
  private refreshSubject: Subject<boolean> = new Subject<boolean>();

  constructor(
    @Inject(AUTH_SERVICE) private authService: AuthService,
    private http: Http,
  ) {}

  /**
   * Request interceptor. Delays request if refresh is in progress
   * otherwise adds token to the headers
   * @param {Request|string} url
   * @param {RequestOptionsArgs} options
   * @returns {Observable}
   */
  public request({ url, options }: RequestInterceptorOptions): Observable<RequestInterceptorOptions> {
    const urlString = url instanceof Request ? (<Request>url).url : url;

    if (this.refreshTokenInProgress && !this.authService.verifyTokenRequest(<string>urlString)) {
      return this.delayRequest({ url, options });
    }

    return this.addToken({ url, options });
  }

  /**
   * Failed request interceptor, check if it has to be processed with refresh
   * @param {Request|string} url
   * @param {RequestOptionsArgs} options
   * @param {Response} response
   * @returns {Observable}
   */
  public responseError({ url, options, response }: ResponseInterceptorOptions): Observable<ResponseInterceptorOptions> {
    if (!this.refreshTokenInProgress && this.authService.refreshShouldHappen(response)) {
      this.refreshTokenInProgress = true;

      this.authService
        .refreshToken()
        .subscribe(
          () => {
            this.refreshTokenInProgress = false;
            this.refreshSubject.next(true);
          },
          () => this.refreshSubject.next(false)
        );
    }

    if (this.refreshTokenInProgress && this.authService.refreshShouldHappen(response)) {
      return this.delayRequest({ url, options })
        .switchMap(({ url, options }) => {
          return this.http.request(url, options);
        });
    }

    return Observable.throw({ url, options, response });
  }

  /**
   * Add access token to headers or the request
   * @private
   * @param {Request|string} url
   * @param {RequestOptionsArgs} options
   * @returns {Observable}
   */
  private addToken({ url, options }: RequestInterceptorOptions): Observable<RequestInterceptorOptions> {
    const accessObservable: Observable<string> = this.authService.getAccessToken();

    if (!accessObservable) {
      return ObservableOf({ url, options });
    }

    return this.authService.getAccessToken()
      .map((token: string) => {
        if (token && url instanceof Request) {
          (<Request>url).headers.set('Authorization', `Bearer ${token}`);
        }

        return { url, options };
      });
  }

  /**
   * Delay request, by subscribing on refresh event, once it finished, process it
   * otherwise throw error
   * @param {Request|string} url
   * @param {RequestOptionsArgs} options
   * @returns {Observable}
   */
  private delayRequest(options: RequestInterceptorOptions) {
    return first.call(this.refreshSubject.asObservable())
      .switchMap((refreshStatus: boolean) => {
        if (refreshStatus) {
          return this.addToken(options);
        }
        return Observable.throw(options);
      });
  }
}

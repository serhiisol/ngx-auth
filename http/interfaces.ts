import { Request, Response, RequestOptionsArgs } from '@angular/http';
import { Observable } from 'rxjs/Observable';

/**
 * Request intereceptor options
 * @public
 * @export
 * @interface RequestInterceptorOptions
 */
export interface RequestInterceptorOptions {
  url: string | Request;
  options?: RequestOptionsArgs;
}

/**
 * Response intereceptor options
 * @private
 * @export
 * @interface ResponseInterceptorOptions
 * @extends {RequestInterceptorOptions}
 */
export interface ResponseInterceptorOptions extends RequestInterceptorOptions {
  response: Response;
}

/**
 * Interceptor interface
 * @public
 * @export
 * @interface Interceptor
 */
export interface Interceptor {
  request?(options: RequestInterceptorOptions): Observable<RequestInterceptorOptions> | RequestInterceptorOptions;
  requestError?(options: RequestInterceptorOptions): Observable<RequestInterceptorOptions> | RequestInterceptorOptions;

  response?(options: ResponseInterceptorOptions): Observable<ResponseInterceptorOptions> | ResponseInterceptorOptions;
  responseError?(options: ResponseInterceptorOptions): Observable<ResponseInterceptorOptions> | ResponseInterceptorOptions;
}

/**
 * Store interface
 * @private
 * @export
 * @interface Store
 */
export interface Store {
  interceptors: Interceptor[];
}

/**
 * Interceptor map interface
 * @private
 */
export const MAP = [
  {
    success: 'request',
    fail: 'requestError'
  },
  {
    success: 'response',
    fail: 'responseError'
  }
];

/**
 * Interceptor types enum
 * @private
 * @export
 * @enum {number}
 */
export enum InterceptorType {
  REQUEST,
  RESPONSE
};

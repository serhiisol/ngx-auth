import { Injectable } from '@angular/core';
import {
  Http as _Http,
  Request,
  Response,
  RequestOptionsArgs,
  RequestOptions,
  XHRBackend
} from '@angular/http';
import { Observable } from 'rxjs/Observable';

import {
  Interceptor,
  Store,
  RequestInterceptorOptions,
  InterceptorType,
  MAP
} from '../interfaces';

@Injectable()
export class Http extends _Http {

  constructor(backend: XHRBackend, defaultOptions: RequestOptions, private interceptorStore: Store) {
    super(backend, defaultOptions);
  }

  /**
   * Performs any type of http request. First argument is required, and can either be a url or
   * a {@link Request} instance. If the first argument is a url, an optional {@link RequestOptions}
   * object can be provided as the 2nd argument. The options object will be merged with the values
   * of {@link BaseRequestOptions} before performing the request.
   *
   * @param {(string | Request)} url
   * @param {RequestOptionsArgs} [options]
   * @returns {Observable<Response>}
   */
  public request(url: string | Request, options?: RequestOptionsArgs): Observable<Response> {
    return this.iterate(InterceptorType.REQUEST, { url, options })
      .switchMap(({url, options}: RequestInterceptorOptions) => {
        return super.request(url, options)
          .map(value => ({ successful: true, value }))
          .catch(value => Observable.of({ successful: false, value }));
      })
      .switchMap(({successful, value}) => {
        const opts = { url, options, response: value };
        return this.iterate(InterceptorType.RESPONSE, opts, successful);
      });
  }

  /**
   * Get interceptors by type
   * @param {Interceptors} type
   */
  private getInterceptors(type: InterceptorType): Interceptor[] {
    return type === InterceptorType.REQUEST ?
      this.interceptorStore.interceptors :
      [...this.interceptorStore.interceptors].reverse();
  }

  /**
   * Iterating over registered interceptors
   * @param type
   * @param value
   */
  private iterate(type: InterceptorType, initialValue: any, initialStatus = true) {
    const interceptors = this.getInterceptors(type);
    const typed = MAP[type];

    return interceptors
      .reduce((stream, interceptor) => {
        return stream
          .switchMap(result => {
            let method = result.successful ? interceptor[typed.success] : interceptor[typed.fail];

            if (typeof method === 'function') {
              return method.call(interceptor, result.value);
            }

            if (result.successful) {
              return Observable.of(result.value);
            }

            throw result.value;
          })
          .map(value => {
            return { successful: true, value };
          })
          .catch(value => {
            return Observable.of({ successful: false, value });
          });
      }, Observable.of({ successful: initialStatus, value: initialValue }))
      .map(item => {
        if (item.successful) {
          return item.value.response || item.value;
        }
        throw item.value.response || item.value;
      });
  }

}

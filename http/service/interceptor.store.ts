import { Injectable } from '@angular/core';

import { Interceptor, Store } from '../interfaces';

@Injectable()
export class InterceptorStore implements Store {

  /**
   * All registered interceptors
   * @type {Interceptor[]}
   * @memberOf InterceptorStore
   */
  public interceptors: Interceptor[] = [];

  /**
   * Register new interceptor
   * @param {Interceptor} interceptor
   * @returns {InterceptorStore}
   * @memberOf InterceptorStore
   */
  public register(interceptor: Interceptor): InterceptorStore {
    this.interceptors.push(interceptor);

    return this;
  }

}

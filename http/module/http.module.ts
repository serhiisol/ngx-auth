import { NgModule } from '@angular/core';
import {
  HttpModule as _HttpModule,
  RequestOptions,
  XHRBackend
} from '@angular/http';

import { Http, InterceptorStore } from '../service';
import { httpFactory } from './http.factory';

@NgModule({
  imports: [ _HttpModule ],
  providers: [
    InterceptorStore,
    {
      provide: Http,
      deps: [
        XHRBackend,
        RequestOptions,
        InterceptorStore
      ],
      useFactory: httpFactory
    }
  ]
})
export class HttpModule {}

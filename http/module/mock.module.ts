import { NgModule } from '@angular/core';
import { BaseRequestOptions } from '@angular/http';
import { MockBackend } from '@angular/http/testing';

import { InterceptorStore, Http } from '../service';
import { httpFactory } from './http.factory';

@NgModule({
  providers: [
    MockBackend,
    BaseRequestOptions,
    InterceptorStore,
    {
      provide: Http,
      deps: [ MockBackend, BaseRequestOptions, InterceptorStore ],
      useFactory: httpFactory
    }
  ]
})
export class MockHttpModule {}

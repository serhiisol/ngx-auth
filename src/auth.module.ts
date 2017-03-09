import { NgModule } from '@angular/core';
import { InterceptorStore } from 'ng4-http';

import { PublicGuard } from './public.guard';
import { ProtectedGuard } from './protected.guard';
import { AuthInterceptor } from './auth.interceptor';

@NgModule({
  providers: [
    PublicGuard,
    ProtectedGuard,
    AuthInterceptor,
  ]
})
export class AuthModule {
  constructor(interceptorStore: InterceptorStore, authInterceptor: AuthInterceptor) {
    interceptorStore.register(authInterceptor);
  }
}

import { NgModule } from '@angular/core';
import { HTTP_INTERCEPTORS } from '@angular/common/http';

import { PublicGuard } from './public.guard';
import { ProtectedGuard } from './protected.guard';
import { AuthInterceptor } from './auth.interceptor';

@NgModule({
  providers: [
    PublicGuard,
    ProtectedGuard,
    AuthInterceptor,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true,
    }
  ]
})
export class AuthModule { }

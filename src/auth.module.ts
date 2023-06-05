import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgModule } from '@angular/core';

import { AuthInterceptor } from './auth.interceptor';
import { ProtectedGuard } from './protected.guard';
import { PublicGuard } from './public.guard';

@NgModule({
  providers: [
    PublicGuard,
    ProtectedGuard,
    AuthInterceptor,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true,
    },
  ],
})
export class AuthModule { }

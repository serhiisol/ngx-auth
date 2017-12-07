import { NgModule } from '@angular/core';
import { HTTP_INTERCEPTORS } from '@angular/common/http';

import { AuthGuard } from './guards/auth.guard';
import { PublicGuard } from './guards/public.guard';
import { ProtectedGuard } from './guards/protected.guard';
import { AuthInterceptor } from './auth.interceptor';

@NgModule({
  providers: [
    AuthGuard,
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

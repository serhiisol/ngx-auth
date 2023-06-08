import { NgModule } from '@angular/core';
import {
  AUTH_SERVICE,
  AuthModule,
  PROTECTED_FALLBACK_PAGE_URI,
  PUBLIC_FALLBACK_PAGE_URI,
} from 'ngx-auth';

import { AuthenticationService } from './authentication.service';
import { TokenStorage } from './token-storage.service';

@NgModule({
  imports: [AuthModule],
  providers: [
    TokenStorage,
    { provide: PROTECTED_FALLBACK_PAGE_URI, useValue: '/' },
    { provide: PUBLIC_FALLBACK_PAGE_URI, useValue: '/login' },
    AuthenticationService,
    {
      provide: AUTH_SERVICE,
      useExisting: AuthenticationService,
    },
  ],
})
export class AuthenticationModule { }

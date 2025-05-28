import { makeEnvironmentProviders, type Type } from '@angular/core';

import { AUTH_SERVICE, type NgxAuthService } from './auth.service';
import { PUBLIC_REDIRECT_URI } from './protected.guard';
import { PROTECTED_REDIRECT_URI } from './public.guard';

export function provideNgxAuthProviders(options: {
  authService: Type<NgxAuthService>;
  protectedRedirectUri: string;
  publicRedirectUri: string;
}) {
  return makeEnvironmentProviders([
    {
      provide: AUTH_SERVICE,
      useExisting: options.authService,
    },
    {
      provide: PROTECTED_REDIRECT_URI,
      useValue: options.protectedRedirectUri,
    },
    {
      provide: PUBLIC_REDIRECT_URI,
      useValue: options.publicRedirectUri,
    },
  ]);
}

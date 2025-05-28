import { inject, InjectionToken } from '@angular/core';
import { type CanActivateFn, Router } from '@angular/router';
import { from, map, tap } from 'rxjs';

import { AUTH_SERVICE } from './auth.service';

export const PROTECTED_REDIRECT_URI = new InjectionToken<string>('ngx-auth--protected-redirect-uri');

/**
 * Guard, checks access token availability and allows or disallows access to page,
 * and redirects out
 */
export const ngxPublicGuard: CanActivateFn = () => {
  const authService = inject(AUTH_SERVICE);
  const protectedUri = inject(PROTECTED_REDIRECT_URI);
  const router = inject(Router);

  return from(authService.isAuthenticated()).pipe(
    map(isAuthenticated => !isAuthenticated),
    tap(async isAllowed => {
      if (isAllowed) {
        return;
      }

      await router.navigateByUrl(protectedUri);
    }),
  );
};

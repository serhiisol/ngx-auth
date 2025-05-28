import { inject, InjectionToken } from '@angular/core';
import { type ActivatedRouteSnapshot, type CanActivateFn, Router, type RouterStateSnapshot } from '@angular/router';
import { from, tap } from 'rxjs';

import { AUTH_SERVICE } from './auth.service';

export const PUBLIC_REDIRECT_URI = new InjectionToken<string>('ngx-auth--public-redirect-uri');

/**
 * Guard, checks access token availability and allows or disallows access to page,
 * and redirects out
 */
export const ngxProtectedGuard: CanActivateFn = (_: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
  const authService = inject(AUTH_SERVICE);
  const publicUri = inject(PUBLIC_REDIRECT_URI);
  const router = inject(Router);

  return from(authService.isAuthenticated()).pipe(
    tap(async isAllowed => {
      if (isAllowed) {
        return;
      }

      authService.setInterruptedUrl?.(state.url);
      await router.navigateByUrl(publicUri);
    }),
  );
};

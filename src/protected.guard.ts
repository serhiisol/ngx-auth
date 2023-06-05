import { DOCUMENT } from '@angular/common';
import { Inject, inject, Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { AuthService } from './auth.service';
import { AUTH_SERVICE, PUBLIC_FALLBACK_PAGE_URI } from './tokens';

/**
 * Guard, checks access token availability and allows or disallows access to page,
 * and redirects out
 *
 * @deprecated see protectedGuard function
 */
@Injectable()
export class ProtectedGuard {
  constructor(
    @Inject(AUTH_SERVICE) private authService: AuthService,
    @Inject(PUBLIC_FALLBACK_PAGE_URI) private publicFallbackPageUri: string,
    @Inject(DOCUMENT) private readonly document: Document,
    private router: Router
  ) { }

  /**
   * CanActivate handler
   */
  canActivate(state: RouterStateSnapshot): Observable<boolean> {
    return this.authService.isAuthorized()
      .pipe(map((isAuthorized: boolean) => {
        if (!isAuthorized && !this.isPublicPage(state)) {
          this.authService.setInterruptedUrl?.(state.url);

          this.navigate(this.publicFallbackPageUri);

          return false;
        }

        return true;
      }));
  }

  /**
   * Check, if current page is fallback page
   */
  private isPublicPage(state: RouterStateSnapshot): boolean {
    return state.url === this.publicFallbackPageUri;
  }

  /**
   * Navigate away from the app / path
   */
  private navigate(url: string): void {
    if (url.startsWith('http')) {
      this.document.location.href = url;
    } else {
      this.router.navigateByUrl(url);
    }
  }
}

export const protectedGuard: CanActivateFn = (_route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
  const guard = inject(ProtectedGuard);

  return guard.canActivate(state);
};

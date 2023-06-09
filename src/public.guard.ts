import { DOCUMENT } from '@angular/common';
import { Inject, inject, Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { AuthService } from './auth.service';
import { AUTH_SERVICE, PROTECTED_FALLBACK_PAGE_URI } from './tokens';

/**
 * Guard, checks access token availability and allows or disallows access to page,
 * and redirects out
 */
@Injectable()
export class PublicGuard {
  constructor(
    @Inject(AUTH_SERVICE) private authService: AuthService,
    @Inject(PROTECTED_FALLBACK_PAGE_URI) private protectedFallbackPageUri: string,
    @Inject(DOCUMENT) private readonly document: Document,
    private router: Router
  ) { }

  /**
   * CanActivate handler
   */
  canActivate(state: RouterStateSnapshot): Observable<boolean> {
    return this.authService.isAuthorized()
      .pipe(map((isAuthorized: boolean) => {
        if (isAuthorized && !this.isProtectedPage(state)) {
          this.navigate(this.protectedFallbackPageUri);

          return false;
        }

        return true;
      }));
  }

  /**
   * Check, if current page is protected fallback page
   */
  private isProtectedPage(state: RouterStateSnapshot): boolean {
    return state.url === this.protectedFallbackPageUri;
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

export const publicGuard: CanActivateFn = (_route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
  const guard = inject(PublicGuard);

  return guard.canActivate(state);
};

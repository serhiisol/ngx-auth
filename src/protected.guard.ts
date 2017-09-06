import { Injectable, Inject } from '@angular/core';
import {
  Router,
  CanActivate,
  CanActivateChild,
  ActivatedRouteSnapshot,
  RouterStateSnapshot
} from '@angular/router';
import { Observable } from 'rxjs/Observable';

import { map } from './rxjs.util';

import { AuthService } from './auth.service';
import { AUTH_SERVICE, PUBLIC_FALLBACK_PAGE_URI } from './tokens';

/**
 * Guard, checks access token availability and allows or disallows access to page,
 * and redirects out
 *
 * usage: { path: 'test', component: TestComponent, canActivate: [ AuthGuard ] }
 *
 * @export
 *
 * @class ProtectedGuard
 *
 * @implements {CanActivate}
 * @implements {CanActivateChild}
 */
@Injectable()
export class ProtectedGuard implements CanActivate, CanActivateChild {

  constructor(
    @Inject(AUTH_SERVICE)private authService: AuthService,
    @Inject(PUBLIC_FALLBACK_PAGE_URI) private publicFallbackPageUri: string,
    private router: Router
  ) {}

  /**
   * CanActivate handler
   *
   * @param {ActivatedRouteSnapshot} _route
   * @param {RouterStateSnapshot} state
   *
   * @returns {Observable<boolean>}
   */
  public canActivate(
    _route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    return map(
      this.authService .isAuthorized(),
      (isAuthorized: boolean) => {

        if (!isAuthorized && !this.isPublicPage(state)) {
          this.navigate(this.publicFallbackPageUri);

          return false;
        }

        return true;
      }
    );
  }

  /**
   * CanActivateChild handler
   *
   * @param {ActivatedRouteSnapshot} route
   * @param {RouterStateSnapshot} state
   *
   * @returns {Observable<boolean>}
   */
  public canActivateChild(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    return this.canActivate(route, state);
  }

  /**
   * Check, if current page is public fallback page
   *
   * @private
   *
   * @param {RouterStateSnapshot} state
   *
   * @returns {boolean}
   */
  private isPublicPage(state: RouterStateSnapshot): boolean {
    return state.url === this.publicFallbackPageUri;
  }

  /**
   * Navigate away from the app / path
   *
   * @private
   * @param {string} url
   */
  private navigate(url: string): void {
    if (url.startsWith('http')) {
      window.location.href = url;
    } else {
      this.router.navigateByUrl(url);
    }
  }

}

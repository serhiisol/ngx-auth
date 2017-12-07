import { Injectable, Inject } from '@angular/core';
import { Router, CanActivate, CanActivateChild, ActivatedRouteSnapshot } from '@angular/router';
import { Observable } from 'rxjs/Observable';

import { AuthService } from '../auth.service';
import { AUTH_SERVICE, LOGIN_PAGE_URI } from '../tokens';

/**
 * Guard, checks access token availability and allows or disallows access to page,
 * and redirects out
 *
 * usage: { path: 'test', component: TestComponent, canActivate: [ AuthGuard ] }
 *
 * @export
 *
 * @class AuthGuard
 *
 * @implements {CanActivate}
 * @implements {CanActivateChild}
 */
@Injectable()
export class AuthGuard implements CanActivate, CanActivateChild {

  constructor(
    @Inject(AUTH_SERVICE) private authService: AuthService,
    @Inject(LOGIN_PAGE_URI) private loginPageUri: string,
    private router: Router
  ) { }

  /**
   * CanActivate handler
   *
   * @param {ActivatedRouteSnapshot} _route
   * @param {RouterStateSnapshot} state
   *
   * @returns {Observable<boolean>}
   */
  public canActivate(_route: ActivatedRouteSnapshot): Observable<boolean> {
    return this.authService.isAuthorized()
      .map(isAuthorized => {
        if (!isAuthorized) {
          this.navigate(this.loginPageUri);
          return false;
        }
        return true;
      });
  }

  /**
   * CanActivateChild handler
   *
   * @param {ActivatedRouteSnapshot} route
   * @param {RouterStateSnapshot} state
   *
   * @returns {Observable<boolean>}
   */
  public canActivateChild(route: ActivatedRouteSnapshot): Observable<boolean> {
    return this.canActivate(route);
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

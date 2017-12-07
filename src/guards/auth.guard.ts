import { Injectable, Inject } from '@angular/core';
import { CanActivate, CanActivateChild, ActivatedRouteSnapshot } from '@angular/router';
import { Observable } from 'rxjs/Observable';

import { AuthService } from '../auth.service';
import { AUTH_SERVICE } from '../tokens';

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

  constructor(@Inject(AUTH_SERVICE) private authService: AuthService) { }

  /**
   * CanActivate handler
   *
   * @param {ActivatedRouteSnapshot} _route
   * @param {RouterStateSnapshot} state
   *
   * @returns {Observable<boolean>}
   */
  public canActivate(route: ActivatedRouteSnapshot): Observable<boolean> {
    return this.authService.isAuthorized()
      .map(isAuthorized => {
        if (!isAuthorized) {
          this.authService.goToLoginPage();
          return false;
        }
        if (route.data && route.data['roles'] && route.data['roles'].length > 0) {
          let requiredRoles: string[] = route.data['roles'];
          if (!this.checkRoles(requiredRoles)) {
            // handleAccessDenied()
            this.authService.goToLoginPage();
            return false;
          }
        }
        if (route.data && route.data['fn'] && route.data['fn'] instanceof Function) {
          let fn: () => boolean = <() => boolean>route.data['fn'];
          if (!fn()) {
            // handleAccessDenied()
            this.authService.goToLoginPage();
            return false;
          }
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

  private checkRoles(requiredRoles: string[]) {
    for (const role in requiredRoles) {
      if (this.authService.userHasRole(role)) {
        return true;
      }
    }
    return false;
  }

}

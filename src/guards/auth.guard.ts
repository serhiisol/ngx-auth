import { Injectable, Inject } from '@angular/core';
import { CanActivate, CanActivateChild, ActivatedRouteSnapshot } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/forkJoin';

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
      .switchMap(isAuthorized => {
        if (!isAuthorized) {
          this.authService.goToLoginPage();
          return Observable.of(false);
        }
        if (route.data && route.data['roles'] && route.data['roles'].length > 0) {
          let requiredRoles: string[] = route.data['roles'];
          return this.checkRoles(requiredRoles)
            .map(res => {
              if (!res) {
                // handleAccessDenied()
                this.authService.goToLoginPage();
                return false;
              }
              return true;
            });
        }
        if (route.data && route.data['fn'] && route.data['fn'] instanceof Function) {
          let fn: () => Observable<boolean> = <() => Observable<boolean>>route.data['fn'];
          return fn().map(res => {
            if (!res) {
              // handleAccessDenied()
              this.authService.goToLoginPage();
              return false;
            }
            return true;
          });
        }
        return Observable.of(true);
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

  private checkRoles(requiredRoles: string[]): Observable<boolean> {
    return Observable.forkJoin(
        requiredRoles.map(role => this.authService.userHasRole(role))
      ).map(x => x.indexOf(true) !== -1);
  }

}
